import Link from "next/link";
import { FileText, Globe, Plus, Star } from "lucide-react";
import type { NoteSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createNote } from "@/app/(app)/notes/actions";
import { Button } from "@/components/ui/button";

type NoteListProps = {
  notes: NoteSummary[];
  emptyTitle?: string;
  emptyMessage?: string;
  /** When set, the empty-state CTA creates the note inside this folder. */
  createFolderId?: string | null;
  /** Label for the empty-state CTA button. */
  createLabel?: string;
};

function excerpt(content: string, max = 120): string {
  const line = content.split("\n").find((l) => l.trim()) ?? "";
  return line.length > max ? `${line.slice(0, max)}…` : line || "No content yet";
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function NoteList({
  notes,
  emptyTitle,
  emptyMessage,
  createFolderId,
  createLabel = "Create your first note",
}: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 px-6 py-16 text-center clay-surface">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <FileText className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold">
          {emptyTitle ?? "Nothing here yet"}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {emptyMessage ??
            "Your notes will show up here. Start writing and they'll be saved automatically."}
        </p>
        <form action={createNote} className="mt-5">
          {createFolderId && (
            <input type="hidden" name="folderId" value={createFolderId} />
          )}
          <Button type="submit" className="gap-2">
            <Plus className="h-4 w-4" />
            {createLabel}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {notes.map((note) => (
        <li key={note.id}>
          <Link
            href={`/notes/${note.id}`}
            className={cn(
              "block rounded-xl p-4 transition-all hover:-translate-y-0.5 clay-surface",
            )}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="font-medium leading-snug">{note.title}</h3>
              <span className="flex shrink-0 items-center gap-1.5">
                {note.isFavorite && (
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                )}
                {note.isPublic && (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
            </div>
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {excerpt(note.content)}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatDate(note.updatedAt)}
              </span>
              {note.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-secondary px-2 py-0.5 text-xs"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
