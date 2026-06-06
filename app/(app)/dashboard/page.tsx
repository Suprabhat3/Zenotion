import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getSidebarData, getUserNotes } from "@/lib/notes";
import { NoteList } from "@/components/note-list";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard",
};

type PageProps = {
  searchParams: Promise<{ folder?: string; tag?: string }>;
};

function noteCountLabel(count: number): string {
  return count === 1 ? "1 note" : `${count} notes`;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { folder, tag } = await searchParams;
  const [notes, sidebar] = await Promise.all([
    getUserNotes(user.id),
    getSidebarData(user.id),
  ]);

  let filteredNotes = notes;

  if (folder) {
    filteredNotes = filteredNotes.filter((n) => n.folderId === folder);
  }
  if (tag) {
    filteredNotes = filteredNotes.filter((n) => n.tags.some((t) => t.tagId === tag));
  }

  const activeFolder = folder
    ? sidebar.folders.find((item) => item.id === folder)
    : undefined;
  const activeTag = tag ? sidebar.tags.find((item) => item.id === tag) : undefined;
  const hasFilter = Boolean(activeFolder || activeTag);

  const pageTitle = activeFolder
    ? activeFolder.name
    : activeTag
      ? activeTag.name
      : "Your notes";

  const pageDescription = hasFilter
    ? noteCountLabel(filteredNotes.length)
    : "All notes in your workspace";

  const emptyMessage = activeFolder
    ? `No notes in "${activeFolder.name}" yet. Create one or move an existing note here.`
    : activeTag
      ? `No notes tagged "${activeTag.name}" yet.`
      : undefined;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{pageTitle}</h1>
            {activeTag?.color && (
              <span
                className="h-2.5 w-2.5 rounded-full ring-1 ring-border/60"
                style={{ backgroundColor: activeTag.color }}
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
      </div>

      <NoteList notes={filteredNotes} emptyMessage={emptyMessage} />
    </div>
  );
}
