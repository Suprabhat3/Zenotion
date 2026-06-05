"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Globe,
  Loader2,
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
import { MarkdownPreview } from "@/components/markdown-preview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export function NoteEditor({ note, folders, tags }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isPublic, setIsPublic] = useState(note.isPublic);
  const [shareSlug, setShareSlug] = useState(note.shareSlug);
  const [selectedTagIds, setSelectedTagIds] = useState(
    note.tags.map((t) => t.tagId),
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef({ title: note.title, content: note.content });

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
  }

  const statusLabel: Record<SaveStatus, string> = {
    idle: "",
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed",
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-xl font-semibold outline-none placeholder:text-muted-foreground"
          placeholder="Untitled"
        />
        <div className="flex items-center gap-2">
          {saveStatus !== "idle" && (
            <span
              className={`flex items-center gap-1 text-xs ${
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

          <AiCommandPalette content={content} onApply={handleAiApply} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Folder
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Move to folder</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMove(null)}>
                No folder
              </DropdownMenuItem>
              {folders.map((f) => (
                <DropdownMenuItem key={f.id} onClick={() => handleMove(f.id)}>
                  {f.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Tags
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Assign tags</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
              Copy link
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

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col border-b lg:border-b-0 lg:border-r">
          <div className="border-b px-4 py-2 text-xs font-medium text-muted-foreground">
            Editor
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[50vh] flex-1 resize-none rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0 lg:min-h-0"
            placeholder="Write markdown here…"
          />
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="border-b px-4 py-2 text-xs font-medium text-muted-foreground">
            Preview
          </div>
          <div className="flex-1 overflow-y-auto p-4 clay-inset m-4 rounded-lg">
            <MarkdownPreview content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}
