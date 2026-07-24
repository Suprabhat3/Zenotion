"use client";

import Link from "next/link";
import { FileText, Link2 } from "lucide-react";
import type { NoteBacklink } from "@/lib/notes";
import { cn } from "@/lib/utils";

type NoteBacklinksProps = {
  backlinks: NoteBacklink[];
  className?: string;
};

/** "Linked references" — notes that link to the current note. */
export function NoteBacklinks({ backlinks, className }: NoteBacklinksProps) {
  if (backlinks.length === 0) return null;

  return (
    <div className={cn("shrink-0", className)}>
      <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Link2 className="h-3.5 w-3.5" />
        Linked references
        <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
          {backlinks.length}
        </span>
      </div>
      <ul className="px-2 pb-4">
        {backlinks.map((note) => (
          <li key={note.id}>
            <Link
              href={`/notes/${note.id}`}
              title={note.title || "Untitled"}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {note.icon ? (
                <span className="w-4 shrink-0 text-center leading-none" aria-hidden>
                  {note.icon}
                </span>
              ) : (
                <FileText className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">{note.title || "Untitled"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
