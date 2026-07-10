"use client";

import Link from "next/link";
import { FileText, Globe, Lock, Plus, Star } from "lucide-react";
import type { NoteSummary } from "@/lib/types";
import type { NotesViewMode } from "@/components/note-view-toggle";
import { cn } from "@/lib/utils";
import { createNote } from "@/app/(app)/notes/actions";
import { Button } from "@/components/ui/button";

type NoteListProps = {
  notes: NoteSummary[];
  view?: NotesViewMode;
  emptyTitle?: string;
  emptyMessage?: string;
  /** When set, the empty-state CTA creates the note inside this folder. */
  createFolderId?: string | null;
  /** Label for the empty-state CTA button. */
  createLabel?: string;
};

function excerpt(note: NoteSummary, max = 120): string {
  // A secret note's content is ciphertext — never show it as a preview.
  if (note.isSecret) return "Encrypted — unlock with your password";
  const line = note.content.split("\n").find((l) => l.trim()) ?? "";
  return line.length > max ? `${line.slice(0, max)}…` : line || "No content yet";
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);

  const diffInSeconds = Math.floor(
    (now.getTime() - target.getTime()) / 1000
  );

  if (diffInSeconds < 60) return "Just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} hr ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays === 1) {
    return "Yesterday";
  }

  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return formatDate(date);
}

function NoteMeta({
  note,
  compact = false,
}: {
  note: NoteSummary;
  compact?: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{formatDate(note.updatedAt)}</span>
        <span>•</span>
        <span>{getReadingTime(note.content)}</span>
</div>
      {note.tags.length > 0 && (
        <div className={cn("flex flex-wrap gap-1.5", compact && "hidden sm:flex")}>
          {note.tags.map(({ tag }) => (
            <span
              className="text-xs text-muted-foreground"
              title={formatDate(note.updatedAt)}
            >
              {formatRelativeTime(note.updatedAt)}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function NoteStatusIcons({ note }: { note: NoteSummary }) {
  if (!note.isFavorite && !note.isPublic && !note.isSecret) return null;

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      {note.isFavorite && (
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-label="Favorite" />
      )}
      {note.isPublic && (
        <Globe className="h-4 w-4 text-muted-foreground" aria-label="Public" />
      )}
      {note.isSecret && (
        <Lock className="h-4 w-4 text-muted-foreground" aria-label="Encrypted" />
      )}
    </span>
  );
}

function NoteGridCard({ note }: { note: NoteSummary }) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className="clay-surface clay-lift-subtle flex h-full min-h-37 flex-col overflow-hidden rounded-xl transition-transform hover:-translate-y-0.5"
    >
      {note.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={note.coverImage}
          alt=""
          loading="lazy"
          className="h-20 w-full shrink-0 object-cover"
        />
      )}
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-medium leading-snug">
            {note.icon && (
              <span className="mr-1.5" aria-hidden>
                {note.icon}
              </span>
            )}
            {note.title || "Untitled"}
          </h3>
          <NoteStatusIcons note={note} />
        </div>
        <p className="mb-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {excerpt(note)}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <NoteMeta note={note} />
        </div>
      </div>
    </Link>
  );
}

function NoteListRow({ note }: { note: NoteSummary }) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className="clay-surface clay-lift-subtle flex items-center gap-3 rounded-xl p-3.5 transition-transform hover:-translate-y-0.5 sm:gap-4 sm:p-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/70">
        {note.icon ? (
          <span className="text-lg leading-none" aria-hidden>
            {note.icon}
          </span>
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-medium leading-snug">
            {note.title || "Untitled"}
          </h3>
          <NoteStatusIcons note={note} />
        </div>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
          {excerpt(note, 160)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
          <NoteMeta note={note} compact />
        </div>
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
        <NoteMeta note={note} />
      </div>
    </Link>
  );
}

export function NoteList({
  notes,
  view = "grid",
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

  if (view === "list") {
    return (
      <ul className="flex flex-col gap-2">
        {notes.map((note) => (
          <li key={note.id}>
            <NoteListRow note={note} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <li key={note.id} className="min-w-0">
          <NoteGridCard note={note} />
        </li>
      ))}
    </ul>
  );
}
