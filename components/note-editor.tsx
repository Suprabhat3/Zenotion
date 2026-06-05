"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Globe,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { AiAction } from "@/lib/validators";
import type { ApiResponse } from "@/lib/api";
import type { NoteDetail, TagSummary } from "@/lib/types";
import {
  assignNoteTags,
  deleteNote,
  moveNote,
  toggleNotePublic,
} from "@/app/(app)/notes/actions";
import { AiCommandPalette } from "@/components/ai-command-palette";
import { CopyButton } from "@/components/copy-button";
import {
  EditorModeToggle,
  type EditorMode,
} from "@/components/editor-mode-toggle";
import { MarkdownCodeEditor } from "@/components/markdown-code-editor";
import { MarkdownPreview } from "@/components/markdown-preview";
import { RichTextEditor } from "@/components/rich-text-editor";
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

type NoteEditorProps = {
  note: NoteDetail;
  folders: { id: string; name: string }[];
  tags: TagSummary[];
};

type NotePatch = {
  title?: string;
  content?: string;
};

function getStoredEditorMode(): EditorMode {
  if (typeof window === "undefined") return "rich";
  const stored = localStorage.getItem(EDITOR_MODE_KEY);
  return stored === "markdown" ? "markdown" : "rich";
}

export function NoteEditor({ note, folders, tags }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [editorMode, setEditorMode] = useState<EditorMode>(() => {
    if (typeof window === "undefined") return "rich";
    return getStoredEditorMode();
  });
  const [isPublic, setIsPublic] = useState(note.isPublic);
  const [shareSlug, setShareSlug] = useState(note.shareSlug);
  const [selectedTagIds, setSelectedTagIds] = useState(
    note.tags.map((t) => t.tagId),
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [richKey, setRichKey] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef({ title: note.title, content: note.content });

  function handleModeChange(mode: EditorMode) {
    setEditorMode(mode);
    localStorage.setItem(EDITOR_MODE_KEY, mode);
    if (mode === "rich") {
      setRichKey((k) => k + 1);
    }
  }

  const saveNote = useCallback(
    async (patch: NotePatch) => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/notes/${note.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        const json = (await res.json()) as ApiResponse<NoteDetail>;
        if (!json.success) {
          setSaveStatus("error");
          return;
        }
        lastSaved.current = {
          title: json.data.title,
          content: json.data.content,
        };
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    },
    [note.id],
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
      void saveNote(patch);
    }, 1000);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, content, saveNote]);

  async function handleTogglePublic() {
    const next = !isPublic;
    const formData = new FormData();
    formData.set("noteId", note.id);
    formData.set("isPublic", String(next));
    try {
      const updated = await toggleNotePublic(formData);
      setIsPublic(updated.isPublic);
      setShareSlug(updated.shareSlug);
      toast.success(next ? "Note is now public." : "Note is now private.");
      router.refresh();
    } catch {
      toast.error("Could not update sharing.");
    }
  }

  async function handleCopyShareLink() {
    if (!shareSlug) return;
    const url = `${window.location.origin}/share/${shareSlug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied.");
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

  const statusLabel: Record<SaveStatus, string> = {
    idle: "",
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed",
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      {/* Title bar */}
      <div className="border-b px-4 py-4 sm:px-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground sm:text-3xl"
          placeholder="Untitled"
        />
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b bg-background/95 px-4 py-2.5 backdrop-blur sm:px-6">
        <EditorModeToggle mode={editorMode} onChange={handleModeChange} />

        <div className="flex flex-wrap items-center gap-1.5">
          {saveStatus !== "idle" && (
            <span
              className={`mr-1 flex items-center gap-1 text-xs ${
                saveStatus === "error"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {saveStatus === "saving" && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              {saveStatus === "saved" && <Check className="h-3 w-3" />}
              {statusLabel[saveStatus]}
            </span>
          )}

          <CopyButton text={content} label="Copy" />

          <AiCommandPalette content={content} onApply={handleAiApply} />

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
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={isPublic ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={handleTogglePublic}
          >
            <Globe className="h-4 w-4" />
            {isPublic ? "Public" : "Share"}
          </Button>

          {isPublic && shareSlug && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={handleCopyShareLink}
            >
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Link</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor body */}
      {editorMode === "rich" ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-2 sm:px-8">
            <RichTextEditor
              key={`rich-${note.id}-${richKey}`}
              content={content}
              onChange={setContent}
            />
          </div>
        </div>
      ) : (
        <div className="editor-split grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
          <div className="editor-pane flex min-h-0 flex-col border-b lg:border-b-0 lg:border-r">
            <div className="editor-pane-header flex items-center justify-between px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Markdown
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden bg-background">
              <MarkdownCodeEditor value={content} onChange={setContent} />
            </div>
          </div>
          <div className="editor-pane flex min-h-0 flex-col">
            <div className="editor-pane-header flex items-center justify-between px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Preview
              </span>
              <CopyButton text={content} label="Copy all" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 px-6 py-6 lg:px-10">
              <MarkdownPreview content={content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
