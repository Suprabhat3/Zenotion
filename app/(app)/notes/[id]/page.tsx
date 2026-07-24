import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import {
  getNoteBacklinks,
  getUserNote,
  getSidebarData,
  getUserSecretNoteId,
} from "@/lib/notes";
import { NoteEditor } from "@/components/note-editor";
import { SecretNoteUnlock } from "@/components/secret-note-unlock";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await getCurrentUser();
  if (!user) return { title: "Note" };

  const { id } = await params;
  const note = await getUserNote(user.id, id);
  return { title: note?.title ?? "Note" };
}

export default async function NotePage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { id } = await params;
  const [note, sidebar, secretNoteId, backlinks] = await Promise.all([
    getUserNote(user.id, id),
    getSidebarData(user.id),
    getUserSecretNoteId(user.id),
    getNoteBacklinks(user.id, id),
  ]);

  if (!note) notFound();

  const folders = sidebar.folders.map((f) => ({ id: f.id, name: f.name }));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {note.isSecret ? (
        <SecretNoteUnlock note={note} folders={folders} tags={sidebar.tags} />
      ) : (
        <NoteEditor
          note={note}
          folders={folders}
          tags={sidebar.tags}
          existingSecretNoteId={secretNoteId}
          backlinks={backlinks}
        />
      )}
    </div>
  );
}
