import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserNote, getSidebarData } from "@/lib/notes";
import { NoteEditor } from "@/components/note-editor";

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
  const [note, sidebar] = await Promise.all([
    getUserNote(user.id, id),
    getSidebarData(user.id),
  ]);

  if (!note) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <NoteEditor
        note={note}
        folders={sidebar.folders.map((f) => ({ id: f.id, name: f.name }))}
        tags={sidebar.tags}
      />
    </div>
  );
}
