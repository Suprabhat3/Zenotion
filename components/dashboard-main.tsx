"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import { Clock, Plus, X } from "lucide-react";
import type { NoteSummary } from "@/lib/types";
import { createNote } from "@/app/(app)/notes/actions";
import { NoteList } from "@/components/note-list";
import { NoteViewToggle, type NotesViewMode } from "@/components/note-view-toggle";
import { Button } from "@/components/ui/button";

const NOTES_VIEW_KEY = "zenotion-notes-view";
const NOTES_VIEW_CHANGE_EVENT = "zenotion-notes-view-change";

type DashboardMainProps = {
  pageTitle: string;
  pageDescription: string;
  hasFilter: boolean;
  activeTagColor?: string | null;
  recentNotes: NoteSummary[];
  mainNotes: NoteSummary[];
  emptyTitle: string;
  emptyMessage: string;
  createFolderId: string | null;
  createLabel: string;
  showAllNotesHeading: boolean;
};

function subscribeToNotesView(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();

  window.addEventListener("storage", handler);
  window.addEventListener(NOTES_VIEW_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(NOTES_VIEW_CHANGE_EVENT, handler);
  };
}

function getNotesViewSnapshot(): NotesViewMode {
  const stored = localStorage.getItem(NOTES_VIEW_KEY);
  return stored === "list" ? "list" : "grid";
}

function getNotesViewServerSnapshot(): NotesViewMode {
  return "grid";
}

function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function DashboardMain({
  pageTitle,
  pageDescription,
  hasFilter,
  activeTagColor,
  recentNotes,
  mainNotes,
  emptyTitle,
  emptyMessage,
  createFolderId,
  createLabel,
  showAllNotesHeading,
}: DashboardMainProps) {
  const view = useSyncExternalStore(
    subscribeToNotesView,
    getNotesViewSnapshot,
    getNotesViewServerSnapshot,
  );

  const handleViewChange = useCallback((next: NotesViewMode) => {
    localStorage.setItem(NOTES_VIEW_KEY, next);
    window.dispatchEvent(new Event(NOTES_VIEW_CHANGE_EVENT));
  }, []);

  const hasNotes = recentNotes.length > 0 || mainNotes.length > 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{pageTitle}</h1>
              {activeTagColor && (
                <span
                  className="h-2.5 w-2.5 rounded-full ring-1 ring-border/60"
                  style={{ backgroundColor: activeTagColor }}
                  aria-hidden
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{pageDescription}</p>
            {hasFilter && (
              <Button variant="outline" size="sm" className="mt-2 h-8 gap-1.5" asChild>
                <Link href="/dashboard">
                  <X className="h-3.5 w-3.5" />
                  Clear filter
                </Link>
              </Button>
            )}
          </div>

          {hasNotes && (
            <div className="flex shrink-0 items-center gap-2 self-start">
              {createFolderId && (
                <form action={createNote}>
                  <input type="hidden" name="folderId" value={createFolderId} />
                  <Button type="submit" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {createLabel}
                  </Button>
                </form>
              )}
              <NoteViewToggle view={view} onChange={handleViewChange} />
            </div>
          )}
        </header>

        {recentNotes.length > 0 && (
          <section className="mb-8">
            <h2 className="clay-divider mb-4">
              <span className="inline-flex items-center gap-1.5 px-2">
                <Clock className="h-3.5 w-3.5" />
                Recently edited
              </span>
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentNotes.map((note) => (
                <li key={note.id} className="min-w-0">
                  <Link
                    href={`/notes/${note.id}`}
                    className="clay-surface clay-lift-subtle block h-full rounded-xl px-4 py-3.5 transition-transform hover:-translate-y-0.5"
                  >
                    <p className="truncate text-sm font-medium">
                      {note.title || "Untitled"}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatShortDate(note.updatedAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {showAllNotesHeading && mainNotes.length > 0 && (
          <h2 className="clay-divider mb-4">
            <span className="px-2"> All notes <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {mainNotes.length}
            </span>
          </span>
        </h2>
      )}

        <NoteList
          notes={mainNotes}
          view={view}
          emptyTitle={emptyTitle}
          emptyMessage={emptyMessage}
          createFolderId={createFolderId}
          createLabel={createLabel}
        />
      </div>
    </div>
  );
}
