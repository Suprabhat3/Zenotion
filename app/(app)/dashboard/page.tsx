import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { getUserNotes } from "@/lib/notes";
import { NoteList } from "@/components/note-list";
import { createNote } from "@/app/(app)/notes/actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

type PageProps = {
  searchParams: Promise<{ folder?: string; tag?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { folder, tag } = await searchParams;
  let notes = await getUserNotes(user.id);

  if (folder) {
    notes = notes.filter((n) => n.folderId === folder);
  }
  if (tag) {
    notes = notes.filter((n) => n.tags.some((t) => t.tagId === tag));
  }

  const filterLabel = folder
    ? "in this folder"
    : tag
      ? "with this tag"
      : undefined;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your notes</h1>
          {filterLabel && (
            <p className="text-sm text-muted-foreground">
              Showing notes {filterLabel}
            </p>
          )}
        </div>
        <form action={createNote}>
          <Button type="submit" className="gap-2">
            <Plus className="h-4 w-4" />
            New note
          </Button>
        </form>
      </div>
      <NoteList
        notes={notes}
        emptyMessage={
          filterLabel
            ? `No notes ${filterLabel}.`
            : undefined
        }
      />
    </div>
  );
}
