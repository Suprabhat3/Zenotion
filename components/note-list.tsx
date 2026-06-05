import Link from "next/link";
import { FileText, Globe } from "lucide-react";
import type { NoteSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

type NoteListProps = {
  notes: NoteSummary[];
  emptyMessage?: string;
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

export function NoteList({ notes, emptyMessage }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center clay-surface">
        <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          {emptyMessage ?? "No notes yet. Create your first note to get started."}
        </p>
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
              "block rounded-lg p-4 transition-colors hover:bg-accent/50 clay-surface",
            )}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="font-medium leading-snug">{note.title}</h3>
              {note.isPublic && (
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
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
