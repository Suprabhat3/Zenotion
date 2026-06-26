import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { getSidebarData, getUserNotes } from "@/lib/notes";
import { DashboardMain } from "@/components/dashboard-main";

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

  const emptyTitle = activeFolder
    ? `"${activeFolder.name}" is empty`
    : activeTag
      ? `No notes tagged "${activeTag.name}"`
      : "Welcome to your workspace";

  const emptyMessage = activeFolder
    ? "Create a note here, or move an existing note into this folder."
    : activeTag
      ? "Notes you tag with this label will appear here."
      : "Your notes will show up here. Create your first one to get started — it autosaves as you write.";

  const emptyCreateLabel = activeFolder
    ? "Create a note here"
    : activeTag
      ? "New note"
      : "Create your first note";

  // Notes are already ordered by updatedAt desc. Show a recent strip only when
  // there are enough notes that splitting the view still leaves content below.
  const recentNotes =
    !hasFilter && filteredNotes.length > 4 ? filteredNotes.slice(0, 4) : [];
  const recentNoteIds = new Set(recentNotes.map((note) => note.id));
  const mainNotes =
    recentNotes.length > 0
      ? filteredNotes.filter((note) => !recentNoteIds.has(note.id))
      : filteredNotes;

  return (
    <DashboardMain
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      hasFilter={hasFilter}
      activeTagColor={activeTag?.color}
      recentNotes={recentNotes}
      mainNotes={mainNotes}
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
      createFolderId={activeFolder?.id ?? null}
      createLabel={emptyCreateLabel}
      showAllNotesHeading={recentNotes.length > 0}
    />
  );
}
