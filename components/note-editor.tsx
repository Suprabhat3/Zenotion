"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { Editor } from "@tiptap/react";
import {
  Check,
  Download,
  History,
  ListTree,
  Loader2,
  Lock,
  LockOpen,
  MoreHorizontal,
  Printer,
  Star,
  Trash2,
  TriangleAlert,
  Type,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import type { AiAction } from "@/lib/validators";
import type { ApiResponse } from "@/lib/api";
import type { NoteDetail, TagSummary, EditorSelection } from "@/lib/types";
import type { NoteBacklink } from "@/lib/notes";
import {
  assignNoteTags,
  deleteNote,
  moveNote,
  toggleNoteFavorite,
  unmarkNoteSecret,
} from "@/app/(app)/notes/actions";
import { encryptPayload } from "@/lib/secret-crypto";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SecretNoteDialog } from "@/components/secret-note-dialog";
import { NoteHeaderDecorations } from "@/components/note-header-decorations";
import { NoteIconPicker } from "@/components/note-icon-picker";
import { ShareDialog } from "@/components/share-dialog";
import { AiCommandPalette } from "@/components/ai-command-palette";
import { InlineAiToolbar } from "@/components/inline-ai-toolbar";
import { NoteVersionHistory } from "@/components/note-version-history";
import { CopyButton } from "@/components/copy-button";
import {
  EditorModeToggle,
  type EditorMode,
} from "@/components/editor-mode-toggle";
import { MarkdownCodeEditor } from "@/components/markdown-code-editor";
import { NoteFontPicker } from "@/components/note-font-picker";
import { MarkdownPreview } from "@/components/markdown-preview";
import { NoteBacklinks } from "@/components/note-backlinks";
import { NoteOutline } from "@/components/note-outline";
import { RichEditorToolbar } from "@/components/rich-editor-toolbar";
import { RichTextEditor } from "@/components/rich-text-editor";
import { extractHeadings } from "@/lib/note-outline";
import { getNoteFontOption, NOTE_FONT_OPTIONS, setNoteFont, useNoteFont } from "@/lib/note-font";
import { captureEvent } from "@/lib/analytics";
import {
  navigateWithNoteGuard,
  registerNoteNavGuard,
} from "@/lib/note-navigation-guard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EDITOR_MODE_KEY = "zenotion-editor-mode";
const NOTE_PANEL_KEY = "zenotion-note-panel-open";

type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";
type MarkdownMobilePane = "edit" | "preview";

/** In-memory key material for an unlocked secret note. Never persisted. */
export type NoteEditorSecret = {
  encKey: CryptoKey;
  verifier: string;
};

type NoteEditorProps = {
  note: NoteDetail;
  folders: { id: string; name: string }[];
  tags: TagSummary[];
  /** Present while editing an unlocked secret note. */
  secret?: NoteEditorSecret | null;
  /** Drops the in-memory key and returns to the unlock gate. */
  onLock?: () => void;
  /** Id of the user's existing secret note (null when the credit is unused). */
  existingSecretNoteId?: string | null;
  /** Notes that link to this note ("linked references"). */
  backlinks?: NoteBacklink[];
};

type NotePatch = {
  title?: string;
  content?: string;
  secretIv?: string;
};

type PendingSave = {
  patch: NotePatch;
  snapshot: { title: string; content: string };
  saveTrigger: "autosave" | "manual";
};

function getStoredEditorMode(): EditorMode {
  if (typeof window === "undefined") return "rich";
  const stored = localStorage.getItem(EDITOR_MODE_KEY);
  return stored === "markdown" ? "markdown" : "rich";
}

// "Is the component mounted on the client?" without a setState-in-effect —
// false during SSR/hydration, true on the client afterwards.
const emptySubscribe = () => () => {};
function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function NoteEditor({
  note,
  folders,
  tags,
  secret = null,
  onLock,
  existingSecretNoteId = null,
  backlinks = [],
}: NoteEditorProps) {
  const router = useRouter();
  const [secretDialogOpen, setSecretDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [removeSecretOpen, setRemoveSecretOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [editorMode, setEditorMode] = useState<EditorMode>(() => {
    if (typeof window === "undefined") return "rich";
    return getStoredEditorMode();
  });
  const [selectedTagIds, setSelectedTagIds] = useState(
    note.tags.map((t) => t.tagId),
  );
  const [icon, setIcon] = useState(note.icon);
  const [coverImage, setCoverImage] = useState(note.coverImage);
  const [isFavorite, setIsFavorite] = useState(note.isFavorite);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [richKey, setRichKey] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef({ title: note.title, content: note.content });
  const saveInFlight = useRef(false);
  const pendingSave = useRef<PendingSave | null>(null);
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const replaceSelectionRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    titleRef.current = title;
    contentRef.current = content;
  }, [title, content]);
  const [editorSelection, setEditorSelection] = useState<EditorSelection | null>(
    null,
  );
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [richEditor, setRichEditor] = useState<Editor | null>(null);
  const printPortalReady = useIsMounted();
  const [markdownMobilePane, setMarkdownMobilePane] =
    useState<MarkdownMobilePane>("edit");
  const noteFont = useNoteFont();
  const noteFontClass = getNoteFontOption(noteFont).className;
  // The outline/backlinks panel is a floating overlay that is closed by default,
  // so the note content always has the full width until the user opens it.
  const [panelOpen, setPanelOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(NOTE_PANEL_KEY) === "true";
  });
  const headings = useMemo(() => extractHeadings(content), [content]);
  const hasPanelContent = headings.length > 0 || backlinks.length > 0;
  const showPanel = panelOpen && hasPanelContent;

  function togglePanel() {
    setPanelOpen((current) => {
      const next = !current;
      localStorage.setItem(NOTE_PANEL_KEY, String(next));
      return next;
    });
  }

  // Escape closes the overlay panel when it is open.
  useEffect(() => {
    if (!showPanel) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPanelOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showPanel]);

  const handleRichEditorReady = useCallback((editor: Editor) => {
    setRichEditor(editor);
  }, []);

  // The rich editor instance is stale as soon as its mount key changes —
  // clear it during render so the toolbar never touches a destroyed editor.
  const editorInstanceKey = `${editorMode}-${richKey}-${note.id}`;
  const [prevInstanceKey, setPrevInstanceKey] = useState(editorInstanceKey);
  if (prevInstanceKey !== editorInstanceKey) {
    setPrevInstanceKey(editorInstanceKey);
    setRichEditor(null);
  }

  function handleModeChange(mode: EditorMode) {
    setEditorMode(mode);
    localStorage.setItem(EDITOR_MODE_KEY, mode);
    captureEvent("editor_mode_changed", { mode });
    setEditorSelection(null);
    setSelectionRect(null);
    setMarkdownMobilePane("edit");
    if (mode === "rich") {
      setRichKey((k) => k + 1);
    }
  }

  const markSavedIdle = useCallback(() => {
    if (savedIdleTimer.current) clearTimeout(savedIdleTimer.current);
    savedIdleTimer.current = setTimeout(() => {
      setSaveStatus((current) => (current === "saved" ? "idle" : current));
    }, 2500);
  }, []);

  const saveNote = useCallback(
    async (
      patch: NotePatch,
      snapshot: { title: string; content: string },
      saveTrigger: "autosave" | "manual",
    ): Promise<boolean> => {
      // Serialize saves so overlapping PATCHes cannot land out of order.
      if (saveInFlight.current) {
        pendingSave.current = { patch, snapshot, saveTrigger };
        return false;
      }

      saveInFlight.current = true;
      if (savedIdleTimer.current) clearTimeout(savedIdleTimer.current);
      setSaveStatus("saving");

      let latest: PendingSave = { patch, snapshot, saveTrigger };
      let succeeded = false;

      try {
        while (true) {
          const { patch: nextPatch, snapshot: nextSnapshot, saveTrigger: trigger } =
            latest;

          // Secret notes are re-encrypted client-side before every save: the
          // whole { title, content } payload travels as ciphertext + fresh IV.
          const body: NotePatch = secret
            ? await encryptPayload(secret.encKey, nextSnapshot).then(
                (envelope) => ({
                  content: envelope.ciphertext,
                  secretIv: envelope.iv,
                }),
              )
            : nextPatch;

          const res = await fetch(`/api/notes/${note.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "X-Requested-With": "Zenotion",
            },
            body: JSON.stringify(body),
          });
          const json = (await res.json()) as ApiResponse<NoteDetail>;
          if (!json.success) {
            setSaveStatus("error");
            succeeded = false;
            break;
          }

          // For secret notes the response holds ciphertext — track the
          // plaintext snapshot we just encrypted instead.
          lastSaved.current = secret
            ? nextSnapshot
            : { title: json.data.title, content: json.data.content };
          captureEvent("note_saved", { save_trigger: trigger });
          succeeded = true;

          if (pendingSave.current) {
            latest = pendingSave.current;
            pendingSave.current = null;
            continue;
          }

          setSaveStatus("saved");
          markSavedIdle();
          break;
        }
      } catch {
        setSaveStatus("error");
        succeeded = false;
      } finally {
        saveInFlight.current = false;
        if (pendingSave.current) {
          const queued = pendingSave.current;
          pendingSave.current = null;
          void saveNote(queued.patch, queued.snapshot, queued.saveTrigger);
        }
      }

      return succeeded;
    },
    [note.id, secret, markSavedIdle],
  );

  useEffect(() => {
    const titleChanged = title !== lastSaved.current.title;
    const contentChanged = content !== lastSaved.current.content;
    if (!titleChanged && !contentChanged) return;

    setSaveStatus((current) => (current === "saving" ? current : "unsaved"));

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const patch: NotePatch = {};
      if (title !== lastSaved.current.title) patch.title = title;
      if (content !== lastSaved.current.content) patch.content = content;
      if (Object.keys(patch).length === 0 && !secret) return;
      void saveNote(patch, { title, content }, "autosave");
    }, 1000);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, content, saveNote, secret]);

  // Flush the pending autosave immediately (used by Cmd/Ctrl+S and nav guards).
  const flushSave = useCallback((): Promise<boolean> => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const titleChanged = title !== lastSaved.current.title;
    const contentChanged = content !== lastSaved.current.content;
    if (!titleChanged && !contentChanged) {
      return Promise.resolve(saveStatus !== "error" && saveStatus !== "saving");
    }
    const patch: NotePatch = {};
    if (titleChanged) patch.title = title;
    if (contentChanged) patch.content = content;
    return saveNote(patch, { title, content }, "manual");
  }, [title, content, saveNote, saveStatus]);

  // Cmd/Ctrl+S forces an immediate save instead of waiting for the debounce.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void flushSave();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flushSave]);

  // Warn before leaving with unsaved or in-flight changes (tab close/refresh).
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      const dirty =
        title !== lastSaved.current.title ||
        content !== lastSaved.current.content;
      if (dirty || saveStatus === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [title, content, saveStatus]);

  useEffect(() => {
    registerNoteNavGuard({
      isDirty: () =>
        titleRef.current !== lastSaved.current.title ||
        contentRef.current !== lastSaved.current.content ||
        saveInFlight.current,
      flush: flushSave,
    });
    return () => registerNoteNavGuard(null);
  }, [flushSave]);

  // Soft-nav guard: flush dirty edits before in-app link navigations.
  useEffect(() => {
    function isInternalPath(href: string): boolean {
      return href.startsWith("/") && !href.startsWith("//");
    }

    function isDirty(): boolean {
      return (
        titleRef.current !== lastSaved.current.title ||
        contentRef.current !== lastSaved.current.content ||
        saveInFlight.current
      );
    }

    function onDocumentClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || !isInternalPath(href)) return;
      if (!isDirty()) return;

      e.preventDefault();
      e.stopPropagation();

      void navigateWithNoteGuard(href, router.push);
    }

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [router]);

  useEffect(() => {
    return () => {
      if (savedIdleTimer.current) clearTimeout(savedIdleTimer.current);
    };
  }, []);

  // Icon/cover changes save immediately (no debounce) — they're single clicks,
  // not keystrokes. `router.refresh()` keeps the sidebar/list icons in sync.
  const saveDecoration = useCallback(
    async (patch: {
      icon?: string | null;
      coverImage?: string | null;
    }): Promise<boolean> => {
      try {
        const res = await fetch(`/api/notes/${note.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "Zenotion",
          },
          body: JSON.stringify(patch),
        });
        const json = (await res.json()) as ApiResponse<NoteDetail>;
        if (!json.success) return false;
        router.refresh();
        return true;
      } catch {
        return false;
      }
    },
    [note.id, router],
  );

  function handleIconChange(next: string | null) {
    const previous = icon;
    setIcon(next);
    void saveDecoration({ icon: next }).then((saved) => {
      if (!saved) {
        setIcon(previous);
        toast.error("Could not update the note icon.");
      }
    });
  }

  function handleCoverChange(next: string | null) {
    const previous = coverImage;
    setCoverImage(next);
    void saveDecoration({ coverImage: next }).then((saved) => {
      if (!saved) {
        setCoverImage(previous);
        toast.error("Could not update the cover image.");
      }
    });
  }

  async function handleMove(folderId: string | null) {
    const formData = new FormData();
    formData.set("noteId", note.id);
    formData.set("folderId", folderId ?? "");
    try {
      await moveNote(formData);
      toast.success("Note moved.");
      router.refresh();
    } catch {
      toast.error("Could not move note.");
    }
  }

  async function handleTagToggle(tagId: string, checked: boolean) {
    const next = checked
      ? [...selectedTagIds, tagId]
      : selectedTagIds.filter((id) => id !== tagId);
    setSelectedTagIds(next);

    const formData = new FormData();
    formData.set("noteId", note.id);
    next.forEach((id) => formData.append("tagIds", id));
    try {
      await assignNoteTags(formData);
      router.refresh();
    } catch {
      toast.error("Could not update tags.");
      setSelectedTagIds(selectedTagIds);
    }
  }

  async function handleDelete() {
    setDeleteOpen(false);
    const formData = new FormData();
    formData.set("noteId", note.id);
    captureEvent("note_deleted");
    await deleteNote(formData);
  }

  function handleLockNow() {
    void flushSave().then(() => onLock?.());
  }

  async function handleRemoveSecret() {
    if (!secret) return;
    const formData = new FormData();
    formData.set("noteId", note.id);
    formData.set("verifier", secret.verifier);
    formData.set("title", title.trim() || "Untitled");
    formData.set("content", content);
    try {
      await unmarkNoteSecret(formData);
      setRemoveSecretOpen(false);
      toast.success("Note is no longer secret.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not convert the note.",
      );
    }
  }

  async function handleFavoriteToggle() {
    const next = !isFavorite;
    setIsFavorite(next);
    const formData = new FormData();
    formData.set("noteId", note.id);
    formData.set("isFavorite", String(next));
    try {
      await toggleNoteFavorite(formData);
      captureEvent("note_favorited", { is_favorite: next });
      router.refresh();
    } catch {
      setIsFavorite(!next);
      toast.error("Could not update favorite.");
    }
  }

  function handleExport() {
    const safeTitle = (title.trim() || "untitled").replace(/[\\/:*?"<>|]/g, "-");
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeTitle}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    captureEvent("note_exported");
    toast.success("Note exported as Markdown.");
  }

  // Browser print dialog → "Save as PDF". Print CSS isolates #note-print-area.
  function handlePrint() {
    window.print();
  }

  function handleAiApply(result: string, action: AiAction) {
    captureEvent("note_ai_applied", { action });
    if (action === "generate-title") {
      const previous = title;
      setTitle(result.replace(/^#+\s*/, "").trim());
      toast.success("Title updated", {
        duration: 10_000,
        action: {
          label: "Undo",
          onClick: () => setTitle(previous),
        },
      });
    } else if (action === "continue") {
      const previous = content;
      setContent((c) => (c.endsWith("\n") ? c + result : `${c}\n\n${result}`));
      toast.success("AI text appended", {
        duration: 10_000,
        action: {
          label: "Undo",
          onClick: () => {
            setContent(previous);
            if (editorMode === "rich") setRichKey((k) => k + 1);
          },
        },
      });
    } else {
      const previous = content;
      setContent(result);
      if (previous.trim()) {
        toast.success("AI result applied", {
          duration: 10_000,
          action: {
            label: "Undo",
            onClick: () => {
              setContent(previous);
              if (editorMode === "rich") setRichKey((k) => k + 1);
            },
          },
        });
      }
    }
    if (editorMode === "rich") {
      setRichKey((k) => k + 1);
    }
  }

  function handleSelectionChange(
    selection: EditorSelection | null,
    rect: DOMRect | null,
  ) {
    setEditorSelection(selection);
    setSelectionRect(rect);
  }

  function handleDismissSelection() {
    setEditorSelection(null);
    setSelectionRect(null);
  }

  function handleInlineReplace(text: string) {
    if (replaceSelectionRef.current) {
      replaceSelectionRef.current(text);
      return;
    }
    if (!editorSelection) return;
    setContent(
      (current) =>
        current.slice(0, editorSelection.from) +
        text +
        current.slice(editorSelection.to),
    );
    if (editorMode === "rich") {
      setRichKey((k) => k + 1);
    }
  }

  function handleVersionRestore(restored: NoteDetail) {
    setTitle(restored.title);
    setContent(restored.content);
    lastSaved.current = {
      title: restored.title,
      content: restored.content,
    };
    setSaveStatus("saved");
    if (editorMode === "rich") {
      setRichKey((k) => k + 1);
    }
  }

  function handleRetrySave() {
    flushSave();
  }

  const statusLabel: Record<SaveStatus, string> = {
    idle: "",
    unsaved: "Unsaved changes…",
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed",
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const printSurface = (
    <div id="note-print-area" aria-hidden="true">
      <article className="note-print-document">
        <header className="note-print-header">
          <p className="note-print-brand">
            {siteConfig.printBranding}{" "}
            <strong className="note-print-brand-name">{siteConfig.name}</strong>
          </p>
          <h1 className="note-print-title">{title.trim() || "Untitled"}</h1>
          <p className="note-print-meta">
            Exported{" "}
            {new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(
              new Date(),
            )}
          </p>
        </header>
        <MarkdownPreview content={content} forPrint className="note-print-body" />
      </article>
    </div>
  );

  return (
    <>
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      <div className="note-editor-panel grid min-h-0 min-w-0 flex-1 grid-rows-[auto_1fr] overflow-hidden">
        <div className="note-editor-header min-h-0 shrink-0">
        {/* In rich mode the cover/icon/title scroll with the note body so the
            writing area keeps the full height; in markdown (source) mode the
            title lives in a compact fixed row instead. */}
        {editorMode === "markdown" && (
          <div className="note-editor-title flex items-center gap-2.5 px-4 py-3 sm:px-6">
            {icon && (
              <span className="shrink-0 text-2xl leading-none" aria-hidden>
                {icon}
              </span>
            )}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground sm:text-3xl"
              placeholder="Untitled"
              aria-label="Note title"
            />
          </div>
        )}

        {/* Actions — stays visible; only the note body scrolls below */}
        <div className="note-editor-toolbar z-10 flex shrink-0 items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <EditorModeToggle mode={editorMode} onChange={handleModeChange} />

          <div className="note-editor-toolbar-actions flex items-center gap-1.5">
          <span className="mr-1 hidden text-xs tabular-nums text-muted-foreground lg:inline">
            {wordCount === 1 ? "1 word" : `${wordCount} words`}
          </span>
          {saveStatus !== "idle" && (
            <span
              className={`mr-1 flex shrink-0 items-center gap-1 text-xs transition-colors ${
                saveStatus === "error"
                  ? "text-destructive"
                  : saveStatus === "saved"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
              }`}
              role="status"
              aria-live="polite"
            >
              {saveStatus === "saving" && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              {saveStatus === "saved" && <Check className="h-3 w-3" />}
              {saveStatus === "error" && <TriangleAlert className="h-3 w-3" />}
              {saveStatus === "unsaved" && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
              )}
              <span
                className={
                  saveStatus === "error" || saveStatus === "unsaved"
                    ? undefined
                    : "max-sm:sr-only"
                }
              >
                {statusLabel[saveStatus]}
              </span>
              {saveStatus === "error" && (
                <button
                  type="button"
                  onClick={handleRetrySave}
                  className="ml-1 underline underline-offset-2 hover:no-underline"
                >
                  Retry
                </button>
              )}
            </span>
          )}

          {!secret && (
            <AiCommandPalette content={content} onApply={handleAiApply} />
          )}

          {!secret && (
            <ShareDialog
              noteId={note.id}
              initialIsPublic={note.isPublic}
              initialShareSlug={note.shareSlug}
            />
          )}

          {secret && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 shrink-0 gap-0 px-0 sm:h-8 sm:w-auto sm:gap-1.5 sm:px-3"
              onClick={handleLockNow}
              title="Lock this note now"
              aria-label="Lock this note now"
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Lock</span>
            </Button>
          )}

          {!secret && (
            <NoteVersionHistory
              noteId={note.id}
              onRestore={handleVersionRestore}
              open={historyOpen}
              onOpenChange={setHistoryOpen}
              triggerClassName="hidden md:inline-flex"
            />
          )}

          <div className="hidden items-center gap-1.5 md:flex">
            <NoteFontPicker />
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePanel}
              disabled={!hasPanelContent}
              className={cn(showPanel && "text-foreground")}
              title={showPanel ? "Hide outline" : "Show outline"}
              aria-label={showPanel ? "Hide outline" : "Show outline"}
              aria-pressed={showPanel}
            >
              <ListTree className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteToggle}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star
                className={`h-4 w-4 ${
                  isFavorite ? "fill-amber-400 text-amber-400" : ""
                }`}
              />
            </Button>
            <CopyButton text={content} label="Copy" />
          </div>

          <DropdownMenu open={actionsOpen} onOpenChange={setActionsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <MoreHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="md:hidden">
                {wordCount === 1 ? "1 word" : `${wordCount} words`}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuLabel>Folder</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleMove(null)}>
                No folder
              </DropdownMenuItem>
              {folders.map((f) => (
                <DropdownMenuItem key={f.id} onClick={() => handleMove(f.id)}>
                  {f.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Tags</DropdownMenuLabel>
              {tags.length === 0 ? (
                <DropdownMenuItem disabled>No tags yet</DropdownMenuItem>
              ) : (
                tags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag.id}
                    checked={selectedTagIds.includes(tag.id)}
                    onCheckedChange={(checked) =>
                      handleTagToggle(tag.id, checked === true)
                    }
                  >
                    {tag.name}
                  </DropdownMenuCheckboxItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="md:hidden"
                onClick={handleFavoriteToggle}
              >
                <Star
                  className={`h-4 w-4 ${
                    isFavorite ? "fill-amber-400 text-amber-400" : ""
                  }`}
                />
                {isFavorite ? "Unfavorite" : "Favorite"}
              </DropdownMenuItem>
              {!secret && (
                <DropdownMenuItem
                  className="md:hidden"
                  onClick={() => setSecretDialogOpen(true)}
                >
                  <Lock className="h-4 w-4" />
                  Make secret note
                </DropdownMenuItem>
              )}
              {secret ? (
                <DropdownMenuItem onClick={() => setRemoveSecretOpen(true)}>
                  <LockOpen className="h-4 w-4" />
                  Remove secret protection
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              {!secret ? (
                <DropdownMenuItem
                  className="md:hidden"
                  onClick={() => setHistoryOpen(true)}
                >
                  <History className="h-4 w-4" />
                  Version history
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuLabel className="md:hidden">Note font</DropdownMenuLabel>
              {NOTE_FONT_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.id}
                  className="md:hidden"
                  checked={noteFont === option.id}
                  onCheckedChange={() => setNoteFont(option.id)}
                >
                  <Type className="h-4 w-4" />
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                Print / Save as PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setActionsOpen(false);
                  setDeleteOpen(true);
                }}
                className="text-destructive focus:text-destructive"
                aria-label="Delete note"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>
        </div>

        <div className={cn("flex min-h-0 flex-col overflow-hidden", noteFontClass)}>
        {!secret && (
          <InlineAiToolbar
            selection={editorSelection}
            anchorRect={selectionRect}
            onReplaceSelection={handleInlineReplace}
            onDismiss={handleDismissSelection}
          />
        )}

        {editorMode === "rich" ? (
          <div className="note-editor-body min-h-0 flex-1">
            {richEditor && (
              <div className="note-editor-format-bar px-2 sm:px-4">
                <div className="mx-auto w-full max-w-6xl">
                  <RichEditorToolbar
                    editor={richEditor}
                    className="border-b-0 bg-transparent"
                  />
                </div>
              </div>
            )}
            {/* Cover + icon scroll away with the content, Notion-style. */}
            <NoteHeaderDecorations
              icon={icon}
              coverImage={coverImage}
              onIconChange={handleIconChange}
              onCoverChange={handleCoverChange}
            />
            <div className="mx-auto w-full max-w-6xl px-2 sm:px-4">
              <div className="flex items-center gap-2 px-2 pt-2">
                {icon && (
                  <NoteIconPicker icon={icon} onSelect={handleIconChange}>
                    <button
                      type="button"
                      title="Change icon"
                      aria-label="Change note icon"
                      className="shrink-0 rounded-lg p-1 text-3xl leading-none transition-colors hover:bg-accent/70 sm:text-4xl"
                    >
                      <span aria-hidden>{icon}</span>
                    </button>
                  </NoteIconPicker>
                )}
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-3xl font-bold tracking-tight outline-none placeholder:text-muted-foreground sm:text-4xl"
                  placeholder="Untitled"
                  aria-label="Note title"
                />
              </div>
            </div>
            <div className="mx-auto w-full max-w-6xl px-2 pb-8 pt-1 sm:px-4">
              <RichTextEditor
                key={`rich-${note.id}-${richKey}`}
                content={content}
                onChange={setContent}
                hideToolbar
                noteId={note.id}
                onEditorReady={handleRichEditorReady}
                onSelectionChange={handleSelectionChange}
                replaceSelectionRef={replaceSelectionRef}
              />
            </div>
          </div>
        ) : (
          <div className="editor-split flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-2">
            <div
              className="editor-markdown-tabs"
              role="tablist"
              aria-label="Markdown editor panes"
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  setMarkdownMobilePane((current) =>
                    current === "edit" ? "preview" : "edit",
                  );
                }
              }}
            >
              <button
                type="button"
                role="tab"
                id="markdown-tab-edit"
                aria-controls="markdown-panel-edit"
                aria-selected={markdownMobilePane === "edit"}
                tabIndex={markdownMobilePane === "edit" ? 0 : -1}
                className={cn(
                  "editor-markdown-tab",
                  markdownMobilePane === "edit" && "editor-markdown-tab-active",
                )}
                onClick={() => setMarkdownMobilePane("edit")}
              >
                Markdown
              </button>
              <button
                type="button"
                role="tab"
                id="markdown-tab-preview"
                aria-controls="markdown-panel-preview"
                aria-selected={markdownMobilePane === "preview"}
                tabIndex={markdownMobilePane === "preview" ? 0 : -1}
                className={cn(
                  "editor-markdown-tab",
                  markdownMobilePane === "preview" && "editor-markdown-tab-active",
                )}
                onClick={() => setMarkdownMobilePane("preview")}
              >
                Preview
              </button>
            </div>
            <div
              className={cn(
                "editor-pane flex min-h-0 flex-1 flex-col overflow-hidden border-b lg:border-b-0 lg:border-r lg:border-border/50",
                markdownMobilePane !== "edit" && "hidden lg:flex",
              )}
            >
              <div className="editor-pane-header hidden shrink-0 items-center justify-between px-4 py-2.5 lg:flex">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Markdown
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden bg-background">
                <MarkdownCodeEditor
                  value={content}
                  onChange={setContent}
                  noteId={note.id}
                  onSelectionChange={handleSelectionChange}
                  replaceSelectionRef={replaceSelectionRef}
                />
              </div>
            </div>
            <div
              className={cn(
                "editor-pane flex min-h-0 flex-1 flex-col overflow-hidden",
                markdownMobilePane !== "preview" && "hidden lg:flex",
              )}
            >
              <div className="editor-pane-header hidden shrink-0 items-center justify-between px-4 py-2.5 lg:flex">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preview
                </span>
                <CopyButton text={content} label="Copy all" />
              </div>
              <div className="note-editor-body min-h-0 flex-1 bg-muted/20 px-4 py-4 sm:px-6 lg:px-10">
                <MarkdownPreview content={content} />
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {showPanel && (
        <div className="absolute right-0 top-0 z-20 flex h-full w-64 flex-col overflow-y-auto border-l border-border/50 bg-card shadow-xl duration-200 animate-in slide-in-from-right-4">
          <button
            type="button"
            onClick={togglePanel}
            className="absolute right-2 top-2.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close outline"
          >
            <X className="h-4 w-4" />
          </button>
          {headings.length > 0 && <NoteOutline headings={headings} />}
          {backlinks.length > 0 && (
            <NoteBacklinks
              backlinks={backlinks}
              className={headings.length > 0 ? "border-t border-border/50" : ""}
            />
          )}
        </div>
      )}
    </div>
    <ConfirmDialog
      open={deleteOpen}
      onOpenChange={setDeleteOpen}
      title="Delete note"
      description={
        secret
          ? "Delete this secret note? It is removed permanently and cannot be recovered."
          : "Move this note to the trash? You can restore it from there later."
      }
      confirmLabel={secret ? "Delete note" : "Move to trash"}
      destructive
      onConfirm={handleDelete}
    />
    <ConfirmDialog
      open={removeSecretOpen}
      onOpenChange={setRemoveSecretOpen}
      title="Remove secret protection"
      description="Convert this back to a normal note? Its content will be stored unencrypted again and your secret-note credit is freed."
      confirmLabel="Remove protection"
      destructive
      onConfirm={handleRemoveSecret}
    />
    {!secret && (
      <SecretNoteDialog
        noteId={note.id}
        title={title}
        content={content}
        isPublic={note.isPublic}
        existingSecretNoteId={existingSecretNoteId}
        open={secretDialogOpen}
        onOpenChange={setSecretDialogOpen}
      />
    )}
    {printPortalReady ? createPortal(printSurface, document.body) : null}
    </>
  );
}
