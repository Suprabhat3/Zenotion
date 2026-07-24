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
    where: { userId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    select: noteListSelect,
  });
}

export async function getUserNote(
  userId: string,
  noteId: string,
): Promise<NoteDetail | null> {
  return prisma.note.findFirst({
    where: { id: noteId, userId, deletedAt: null },
    select: {
      ...noteListSelect,
      createdAt: true,
    },
  });
}

export type TrashedNote = {
  id: string;
  title: string;
  icon: string | null;
  isSecret: boolean;
  deletedAt: Date;
  folderName: string | null;
};

/** Notes currently in the trash (soft-deleted), most recently deleted first. */
export async function getTrashedNotes(userId: string): Promise<TrashedNote[]> {
  const notes = await prisma.note.findMany({
    where: { userId, deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    select: {
      id: true,
      title: true,
      icon: true,
      isSecret: true,
      deletedAt: true,
      folder: { select: { name: true } },
    },
  });

  return notes.map((note) => ({
    id: note.id,
    title: note.title,
    icon: note.icon,
    isSecret: note.isSecret,
    // deletedAt is guaranteed non-null by the `not: null` filter above.
    deletedAt: note.deletedAt as Date,
    folderName: note.folder?.name ?? null,
  }));
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
        // Trashed notes must not inflate folder counts.
        _count: { select: { notes: { where: { deletedAt: null } } } },
      },
    }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
    prisma.note.findMany({
      where: { userId, deletedAt: null },
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
      deletedAt: null,
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

export type NoteBacklink = {
  id: string;
  title: string;
  icon: string | null;
};

/**
 * Notes that link TO the given note (its "linked references"). Restricted to
 * the user's own, non-deleted, non-secret notes.
 */
export async function getNoteBacklinks(
  userId: string,
  noteId: string,
): Promise<NoteBacklink[]> {
  const links = await prisma.noteLink.findMany({
    where: {
      targetNoteId: noteId,
      source: { userId, deletedAt: null, isSecret: false },
    },
    orderBy: { source: { updatedAt: "desc" } },
    select: {
      source: { select: { id: true, title: true, icon: true } },
    },
  });

  return links.map((link) => link.source);
}

export async function getPublicNoteBySlug(slug: string) {
  return prisma.note.findFirst({
    // `isSecret: false` is belt-and-braces: secret notes can never be public,
    // but a secret note must never leak through the share route regardless.
    // Trashed notes stop resolving publicly too.
    where: { shareSlug: slug, isPublic: true, isSecret: false, deletedAt: null },
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
