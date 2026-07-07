"use client";

import {
  useCallback,
  useEffect,
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
  Loader2,
  Lock,
  LockOpen,
  MoreHorizontal,
  Printer,
  Star,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AiAction } from "@/lib/validators";
import type { ApiResponse } from "@/lib/api";
import type { NoteDetail, TagSummary, EditorSelection } from "@/lib/types";
import {
  assignNoteTags,
  deleteNote,
  moveNote,
  toggleNoteFavorite,
  unmarkNoteSecret,
} from "@/app/(app)/notes/actions";
import { encryptPayload } from "@/lib/secret-crypto";
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
import { RichEditorToolbar } from "@/components/rich-editor-toolbar";
import { RichTextEditor } from "@/components/rich-text-editor";
import { getNoteFontOption, useNoteFont } from "@/lib/note-font";
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

type SaveStatus = "idle" | "saving" | "saved" | "error";
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
};

type NotePatch = {
  title?: string;
  content?: string;
  secretIv?: string;
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
}: NoteEditorProps) {
  const router = useRouter();
  const [secretDialogOpen, setSecretDialogOpen] = useState(false);
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
  const lastSaved = useRef({ title: note.title, content: note.content });
  const replaceSelectionRef = useRef<((text: string) => void) | null>(null);
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
    setEditorSelection(null);
    setSelectionRect(null);
    setMarkdownMobilePane("edit");
    if (mode === "rich") {
      setRichKey((k) => k + 1);
    }
  }

  const saveNote = useCallback(
    async (patch: NotePatch, snapshot: { title: string; content: string }) => {
      setSaveStatus("saving");
      try {
        // Secret notes are re-encrypted client-side before every save: the
        // whole { title, content } payload travels as ciphertext + fresh IV.
        const body: NotePatch = secret
          ? await encryptPayload(secret.encKey, snapshot).then((envelope) => ({
              content: envelope.ciphertext,
              secretIv: envelope.iv,
            }))
          : patch;
        const res = await fetch(`/api/notes/${note.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = (await res.json()) as ApiResponse<NoteDetail>;
        if (!json.success) {
          setSaveStatus("error");
          return;
        }
        // For secret notes the response holds ciphertext — track the
        // plaintext snapshot we just encrypted instead.
        lastSaved.current = secret
          ? snapshot
          : { title: json.data.title, content: json.data.content };
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    },
    [note.id, secret],
  );

  useEffect(() => {
    const titleChanged = title !== lastSaved.current.title;
    const contentChanged = content !== lastSaved.current.content;
    if (!titleChanged && !contentChanged) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const patch: NotePatch = {};
      if (titleChanged) patch.title = title;
      if (contentChanged) patch.content = content;
      void saveNote(patch, { title, content });
    }, 1000);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, content, saveNote]);

  // Flush the pending autosave immediately (used by Cmd/Ctrl+S).
  const flushSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const titleChanged = title !== lastSaved.current.title;
    const contentChanged = content !== lastSaved.current.content;
    if (!titleChanged && !contentChanged) return;
    const patch: NotePatch = {};
    if (titleChanged) patch.title = title;
    if (contentChanged) patch.content = content;
    void saveNote(patch, { title, content });
  }, [title, content, saveNote]);

  // Cmd/Ctrl+S forces an immediate save instead of waiting for the debounce.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        flushSave();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flushSave]);

  // Warn before leaving with unsaved or in-flight changes.
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
          headers: { "Content-Type": "application/json" },
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
    if (!confirm("Delete this note? This cannot be undone.")) return;
    const formData = new FormData();
    formData.set("noteId", note.id);
    await deleteNote(formData);
  }

  function handleLockNow() {
    flushSave();
    onLock?.();
  }

  async function handleRemoveSecret() {
    if (!secret) return;
    if (
      !confirm(
        "Convert this back to a normal note? Its content will be stored unencrypted again and your secret-note credit is freed.",
      )
    ) {
      return;
    }
    const formData = new FormData();
    formData.set("noteId", note.id);
    formData.set("verifier", secret.verifier);
    formData.set("title", title.trim() || "Untitled");
    formData.set("content", content);
    try {
      await unmarkNoteSecret(formData);
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
    toast.success("Note exported as Markdown.");
  }

  // Browser print dialog → "Save as PDF". Print CSS isolates #note-print-area.
  function handlePrint() {
    window.print();
  }

  function handleAiApply(result: string, action: AiAction) {
    if (action === "generate-title") {
      setTitle(result.replace(/^#+\s*/, "").trim());
    } else if (action === "continue") {
      setContent((c) => (c.endsWith("\n") ? c + result : `${c}\n\n${result}`));
    } else {
      setContent(result);
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
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed",
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const printSurface = (
    <div id="note-print-area" aria-hidden="true">
      <article className="note-print-document">
        <header className="note-print-header">
          <p className="note-print-brand">Zenotion</p>
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="note-editor-panel grid min-h-0 flex-1 grid-rows-[auto_1fr] overflow-hidden">
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
            >
              {saveStatus === "saving" && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              {saveStatus === "saved" && <Check className="h-3 w-3" />}
              {saveStatus === "error" && <TriangleAlert className="h-3 w-3" />}
              <span className="max-sm:sr-only">{statusLabel[saveStatus]}</span>
              {saveStatus === "error" && (
                <button
                  type="button"
                  onClick={handleRetrySave}
                  className="ml-1 underline underline-offset-2 hover:no-underline max-sm:sr-only"
                >
                  Retry
                </button>
              )}
            </span>
          )}

          {secret && (
            <span
              className="mr-1 hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex"
              title="Encrypted on this device — the server only stores ciphertext"
            >
              <Lock className="h-3 w-3" />
              Secret
            </span>
          )}

          <NoteFontPicker />

          {!secret && (
            <NoteVersionHistory noteId={note.id} onRestore={handleVersionRestore} />
          )}

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

          <CopyButton text={content} label="Copy" className="hidden sm:inline-flex" />

          {!secret && (
            <AiCommandPalette content={content} onApply={handleAiApply} />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <MoreHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Organize</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
              {secret ? (
                <DropdownMenuItem onClick={handleRemoveSecret}>
                  <LockOpen className="h-4 w-4" />
                  Remove secret protection
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setSecretDialogOpen(true)}>
                  <Lock className="h-4 w-4" />
                  Make secret note
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExport} className="sm:hidden">
                <Download className="h-4 w-4" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint} className="sm:hidden">
                <Printer className="h-4 w-4" />
                Print / Save as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive sm:hidden">
                <Trash2 className="h-4 w-4" />
                Delete note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport} className="hidden sm:flex">
                <Download className="h-4 w-4" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint} className="hidden sm:flex">
                <Printer className="h-4 w-4" />
                Print / Save as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {secret ? (
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
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 shrink-0 gap-0 px-0 sm:h-8 sm:w-auto sm:gap-1.5 sm:px-3"
                onClick={() => setSecretDialogOpen(true)}
                title="Make this your secret note — encrypted so only you can read it"
                aria-label="Make secret note"
              >
                <Lock className="h-4 w-4" />
                <span className="hidden lg:inline">Secret</span>
              </Button>
              <ShareDialog
                noteId={note.id}
                initialIsPublic={note.isPublic}
                initialShareSlug={note.shareSlug}
              />
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="hidden text-destructive hover:text-destructive sm:inline-flex"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
                <div className="mx-auto w-full max-w-3xl">
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
            <div className="mx-auto w-full max-w-3xl px-2 sm:px-4">
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
                />
              </div>
            </div>
            <div className="mx-auto w-full max-w-3xl px-2 pb-8 pt-1 sm:px-4">
              <RichTextEditor
                key={`rich-${note.id}-${richKey}`}
                content={content}
                onChange={setContent}
                hideToolbar
                onEditorReady={handleRichEditorReady}
                onSelectionChange={handleSelectionChange}
                replaceSelectionRef={replaceSelectionRef}
              />
            </div>
          </div>
        ) : (
          <div className="editor-split flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-2">
            <div className="editor-markdown-tabs">
              <button
                type="button"
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

    </div>
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
