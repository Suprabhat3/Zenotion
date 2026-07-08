import { prisma } from "@/lib/db";
import type { NoteDetail, NoteSummary, SidebarData } from "@/lib/types";

const noteListSelect = {
  id: true,
  title: true,
  content: true,
  icon: true,
  coverImage: true,
  isPublic: true,
  isFavorite: true,
  shareSlug: true,
  folderId: true,
  isSecret: true,
  secretSalt: true,
  secretIv: true,
  secretVerifier: true,
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

/** Id of the user's secret note, or null when the credit is unused. */
export async function getUserSecretNoteId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { secretNoteId: true },
  });
  return user?.secretNoteId ?? null;
}

export async function getSidebarData(userId: string): Promise<SidebarData> {
  const [folders, tags, notes] = await Promise.all([
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
    prisma.note.findMany({
      where: { userId },
      orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
      select: { id: true, title: true, icon: true, isFavorite: true, isSecret: true },
    }),
  ]);

  return {
    notes,
    folders: folders.map((f) => ({
      id: f.id,
      name: f.name,
      noteCount: f._count.notes,
    })),
    tags,
  };
}

/**
 * Case-insensitive search across the user's note titles and content.
 * An empty query returns the most recently edited notes instead.
 */
export async function searchUserNotes(userId: string, query: string, limit = 20) {
  const trimmed = query.trim();

  return prisma.note.findMany({
    where: {
      userId,
      ...(trimmed
        ? {
            OR: [
              { title: { contains: trimmed, mode: "insensitive" } },
              // The secret note's content is ciphertext — matching against it
              // would be meaningless, so content search skips it. Its
              // placeholder title above keeps it reachable.
              { content: { contains: trimmed, mode: "insensitive" }, isSecret: false },
            ],
          }
        : {}),
    },
    orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: {
      id: true,
      title: true,
      content: true,
      isFavorite: true,
      isSecret: true,
      updatedAt: true,
      folder: { select: { name: true } },
    },
  });
}

export async function getPublicNoteBySlug(slug: string) {
  return prisma.note.findFirst({
    // `isSecret: false` is belt-and-braces: secret notes can never be public,
    // but a secret note must never leak through the share route regardless.
    where: { shareSlug: slug, isPublic: true, isSecret: false },
    select: {
      id: true,
      title: true,
      content: true,
      icon: true,
      coverImage: true,
      updatedAt: true,
      user: { select: { name: true } },
    },
  });
}
