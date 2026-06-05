import { prisma } from "@/lib/db";
import type { NoteDetail, NoteSummary, SidebarData } from "@/lib/types";

const noteListSelect = {
  id: true,
  title: true,
  content: true,
  isPublic: true,
  shareSlug: true,
  folderId: true,
  updatedAt: true,
  tags: {
    select: {
      tagId: true,
      tag: { select: { id: true, name: true, color: true } },
    },
  },
} as const;

export async function getUserNotes(userId: string): Promise<NoteSummary[]> {
  return prisma.note.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: noteListSelect,
  });
}

export async function getUserNote(
  userId: string,
  noteId: string,
): Promise<NoteDetail | null> {
  return prisma.note.findFirst({
    where: { id: noteId, userId },
    select: {
      ...noteListSelect,
      createdAt: true,
    },
  });
}

export async function getSidebarData(userId: string): Promise<SidebarData> {
  const [folders, tags] = await Promise.all([
    prisma.folder.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        _count: { select: { notes: true } },
      },
    }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
  ]);

  return {
    folders: folders.map((f) => ({
      id: f.id,
      name: f.name,
      noteCount: f._count.notes,
    })),
    tags,
  };
}

export async function getPublicNoteBySlug(slug: string) {
  return prisma.note.findFirst({
    where: { shareSlug: slug, isPublic: true },
    select: {
      id: true,
      title: true,
      content: true,
      updatedAt: true,
      user: { select: { name: true } },
    },
  });
}
