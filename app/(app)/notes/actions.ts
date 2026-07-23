"use server";

import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { generateShareSlug } from "@/lib/utils";
import {
  assignTagsSchema,
  createNoteSchema,
  folderIdSchema,
  folderSchema,
  markNoteSecretSchema,
  moveNoteSchema,
  noteIdSchema,
  parseOrThrow,
  renameFolderSchema,
  renameNoteSchema,
  renameTagSchema,
  tagIdSchema,
  tagSchema,
  toggleNoteFavoriteSchema,
  toggleNotePublicSchema,
  unmarkNoteSecretSchema,
  updateNoteSchema,
} from "@/lib/validators";

const SECRET_NOTE_TITLE = "Secret note";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/** Constant-time comparison of the client-supplied passphrase verifier. */
function verifierMatches(stored: string | null, provided: string): boolean {
  if (!stored) return false;
  const a = Buffer.from(stored);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

function revalidateApp() {
  revalidatePath("/dashboard");
  revalidatePath("/notes", "layout");
}

async function assertNoteOwnership(userId: string, noteId: string) {
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId },
    select: { id: true },
  });
  if (!note) {
    throw new Error("Note not found.");
  }
}

async function assertFolderOwnership(userId: string, folderId: string | null) {
  if (!folderId) return;
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId },
    select: { id: true },
  });
  if (!folder) {
    throw new Error("Folder not found.");
  }
}

export async function createNote(formData: FormData) {
  const user = await requireUser();
  const input = parseOrThrow(createNoteSchema, {
    title: formData.get("title") || undefined,
    content: formData.get("content") || undefined,
    folderId: formData.get("folderId") || undefined,
  });

  await assertFolderOwnership(user.id, input.folderId ?? null);

  const note = await prisma.note.create({
    data: {
      title: input.title ?? "Untitled",
      content: input.content ?? "",
      userId: user.id,
      folderId: input.folderId ?? null,
    },
    select: { id: true },
  });

  revalidateApp();
  redirect(`/notes/${note.id}`);
}

async function assertEditableNote(userId: string, noteId: string) {
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId },
    select: { isSecret: true },
  });
  if (!note) {
    throw new Error("Note not found.");
  }
  if (note.isSecret) {
    throw new Error("This note is encrypted. Unlock it in the editor to change it.");
  }
}

export async function renameNote(formData: FormData) {
  const user = await requireUser();
  const input = parseOrThrow(renameNoteSchema, {
    noteId: formData.get("noteId"),
    title: formData.get("title"),
  });

  await assertEditableNote(user.id, input.noteId);

  await prisma.note.update({
    where: { id: input.noteId },
    data: { title: input.title },
  });

  revalidateApp();
  revalidatePath(`/notes/${input.noteId}`);
}

export async function updateNoteContent(formData: FormData) {
  const user = await requireUser();
  const input = parseOrThrow(updateNoteSchema, {
    title: formData.get("title") || undefined,
    content: formData.get("content") || undefined,
  });
  const { noteId } = parseOrThrow(noteIdSchema, {
    noteId: formData.get("noteId"),
  });

  await assertEditableNote(user.id, noteId);

  await prisma.note.update({
    where: { id: noteId },
    data: { title: input.title, content: input.content },
  });

  revalidateApp();
  revalidatePath(`/notes/${noteId}`);
}

export async function moveNote(formData: FormData) {
  const user = await requireUser();
  const input = parseOrThrow(moveNoteSchema, {
    noteId: formData.get("noteId"),
    folderId: formData.get("folderId") === "" ? null : formData.get("folderId"),
  });

  await Promise.all([
    assertNoteOwnership(user.id, input.noteId),
    assertFolderOwnership(user.id, input.folderId),
  ]);

  await prisma.note.update({
    where: { id: input.noteId },
    data: { folderId: input.folderId },
  });

  revalidateApp();
  revalidatePath(`/notes/${input.noteId}`);
}

export async function toggleNotePublic(
  formData: FormData,
): Promise<{ isPublic: boolean; shareSlug: string | null }> {
  const user = await requireUser();
  const input = parseOrThrow(toggleNotePublicSchema, {
    noteId: formData.get("noteId"),
    isPublic: formData.get("isPublic") === "true",
  });

  const note = await prisma.note.findFirst({
    where: { id: input.noteId, userId: user.id },
    select: { id: true, shareSlug: true, isSecret: true },
  });
  if (!note) {
    throw new Error("Note not found.");
  }
  if (note.isSecret) {
    throw new Error("Secret notes cannot be shared.");
  }

  const shareSlug =
    input.isPublic && !note.shareSlug ? generateShareSlug() : note.shareSlug;

  const updated = await prisma.note.update({
    where: { id: input.noteId },
    data: {
      isPublic: input.isPublic,
      shareSlug: input.isPublic ? shareSlug : null,
    },
    select: { isPublic: true, shareSlug: true },
  });

  revalidateApp();
  revalidatePath(`/notes/${input.noteId}`);

  return updated;
}

export async function toggleNoteFavorite(
  formData: FormData,
): Promise<{ isFavorite: boolean }> {
  const user = await requireUser();
  const input = parseOrThrow(toggleNoteFavoriteSchema, {
    noteId: formData.get("noteId"),
    isFavorite: formData.get("isFavorite") === "true",
  });

  await assertNoteOwnership(user.id, input.noteId);

  const updated = await prisma.note.update({
    where: { id: input.noteId },
    data: { isFavorite: input.isFavorite },
    select: { isFavorite: true },
  });

  revalidateApp();
  revalidatePath(`/notes/${input.noteId}`);

  return updated;
}

export async function deleteNote(formData: FormData) {
  const user = await requireUser();
  const { noteId } = parseOrThrow(noteIdSchema, {
    noteId: formData.get("noteId"),
  });

  await assertNoteOwnership(user.id, noteId);

  // Deleting the secret note frees the user's secret-note credit.
  await prisma.$transaction([
    prisma.user.updateMany({
      where: { id: user.id, secretNoteId: noteId },
      data: { secretNoteId: null },
    }),
    prisma.note.delete({ where: { id: noteId } }),
  ]);

  revalidateApp();
  redirect("/dashboard");
}

/**
 * Mark a note as the user's single secret note. The client encrypts
 * `{ title, content }` with a passphrase-derived key before calling this;
 * the server never sees the plaintext or the passphrase.
 */
export async function markNoteSecret(formData: FormData) {
  const user = await requireUser();
  const input = parseOrThrow(markNoteSecretSchema, {
    noteId: formData.get("noteId"),
    ciphertext: formData.get("ciphertext"),
    iv: formData.get("iv"),
    salt: formData.get("salt"),
    verifier: formData.get("verifier"),
  });

  await prisma.$transaction(async (tx) => {
    const note = await tx.note.findFirst({
      where: { id: input.noteId, userId: user.id },
      select: { id: true, isSecret: true },
    });
    if (!note) {
      throw new Error("Note not found.");
    }
    if (note.isSecret) {
      throw new Error("This note is already secret.");
    }

    // Atomic credit claim — only one concurrent mark can succeed.
    const claimed = await tx.user.updateMany({
      where: { id: user.id, secretNoteId: null },
      data: { secretNoteId: input.noteId },
    });
    if (claimed.count === 0) {
      throw new Error(
        "You have already used your secret-note credit. Convert your current secret note back to a normal note first.",
      );
    }

    // Plaintext version history would defeat the encryption — remove it.
    await tx.noteVersion.deleteMany({ where: { noteId: input.noteId } });
    await tx.note.update({
      where: { id: input.noteId },
      data: {
        isSecret: true,
        title: SECRET_NOTE_TITLE,
        content: input.ciphertext,
        secretSalt: input.salt,
        secretIv: input.iv,
        secretVerifier: input.verifier,
        // A secret note can never stay publicly shared.
        isPublic: false,
        shareSlug: null,
      },
    });
  });

  revalidateApp();
  revalidatePath(`/notes/${input.noteId}`);
}

/**
 * Convert the secret note back to a normal note, freeing the credit. The
 * client decrypts locally and sends the plaintext plus the passphrase
 * verifier as proof it knew the passphrase.
 */
export async function unmarkNoteSecret(formData: FormData) {
  const user = await requireUser();
  const input = parseOrThrow(unmarkNoteSecretSchema, {
    noteId: formData.get("noteId"),
    verifier: formData.get("verifier"),
    title: formData.get("title"),
    content: formData.get("content") ?? "",
  });

  const note = await prisma.note.findFirst({
    where: { id: input.noteId, userId: user.id },
    select: { isSecret: true, secretVerifier: true },
  });
  if (!note || !note.isSecret) {
    throw new Error("Secret note not found.");
  }
  if (!verifierMatches(note.secretVerifier, input.verifier)) {
    throw new Error("Wrong password.");
  }

  await prisma.$transaction([
    prisma.note.update({
      where: { id: input.noteId },
      data: {
        isSecret: false,
        title: input.title,
        content: input.content,
        secretSalt: null,
        secretIv: null,
        secretVerifier: null,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { secretNoteId: null },
    }),
  ]);

  revalidateApp();
  revalidatePath(`/notes/${input.noteId}`);
}

export async function createFolder(formData: FormData) {
  const user = await requireUser();
  const input = parseOrThrow(folderSchema, {
    name: formData.get("name"),
  });

  try {
    await prisma.folder.create({
      data: { name: input.name, userId: user.id },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("A folder with that name already exists.");
    }
    throw error;
  }

  revalidateApp();
}

export async function renameFolder(formData: FormData) {
  const user = await requireUser();
  const input = parseOrThrow(renameFolderSchema, {
    folderId: formData.get("folderId"),
    name: formData.get("name"),
  });

  const folder = await prisma.folder.findFirst({
    where: { id: input.folderId, userId: user.id },
    select: { id: true },
  });
  if (!folder) {
    throw new Error("Folder not found.");
  }

  try {
    await prisma.folder.update({
      where: { id: input.folderId },
      data: { name: input.name },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("A folder with that name already exists.");
    }
    throw error;
  }

  revalidateApp();
}

export async function deleteFolder(formData: FormData) {
  const user = await requireUser();
  const { folderId } = parseOrThrow(folderIdSchema, {
    folderId: formData.get("folderId"),
  });

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId: user.id },
    select: { id: true },
  });
  if (!folder) {
    throw new Error("Folder not found.");
  }

  await prisma.folder.delete({ where: { id: folderId } });

  revalidateApp();
}

export async function createTag(formData: FormData) {
  const user = await requireUser();
  const input = parseOrThrow(tagSchema, {
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });

  try {
    await prisma.tag.create({
      data: {
        name: input.name,
        color: input.color ?? null,
        userId: user.id,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("A tag with that name already exists.");
    }
    throw error;
  }

  revalidateApp();
}

export async function renameTag(formData: FormData) {
  const user = await requireUser();
  const input = parseOrThrow(renameTagSchema, {
    tagId: formData.get("tagId"),
    name: formData.get("name"),
  });

  const tag = await prisma.tag.findFirst({
    where: { id: input.tagId, userId: user.id },
    select: { id: true },
  });
  if (!tag) {
    throw new Error("Tag not found.");
  }

  try {
    await prisma.tag.update({
      where: { id: input.tagId },
      data: { name: input.name },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("A tag with that name already exists.");
    }
    throw error;
  }

  revalidateApp();
}

export async function deleteTag(formData: FormData) {
  const user = await requireUser();
  const { tagId } = parseOrThrow(tagIdSchema, {
    tagId: formData.get("tagId"),
  });

  const tag = await prisma.tag.findFirst({
    where: { id: tagId, userId: user.id },
    select: { id: true },
  });
  if (!tag) {
    throw new Error("Tag not found.");
  }

  await prisma.tag.delete({ where: { id: tagId } });

  revalidateApp();
}

export async function copySharedNote(formData: FormData): Promise<{ id: string }> {
  const user = await requireUser();

  const shareSlug = formData.get("shareSlug");
  if (!shareSlug || typeof shareSlug !== "string") {
    throw new Error("Invalid share link.");
  }

  const source = await prisma.note.findFirst({
    where: { shareSlug, isPublic: true, isSecret: false },
    select: { title: true, content: true, icon: true, coverImage: true },
  });
  if (!source) {
    throw new Error("Shared note not found or is no longer public.");
  }

  const copy = await prisma.note.create({
    data: {
      title: `${source.title} (copy)`,
      content: source.content,
      icon: source.icon,
      coverImage: source.coverImage,
      userId: user.id,
    },
    select: { id: true },
  });

  revalidateApp();
  return copy;
}

export async function assignNoteTags(formData: FormData) {
  const user = await requireUser();
  const input = parseOrThrow(assignTagsSchema, {
    noteId: formData.get("noteId"),
    tagIds: formData.getAll("tagIds"),
  });

  const [, ownedTags] = await Promise.all([
    assertNoteOwnership(user.id, input.noteId),
    prisma.tag.findMany({
      where: { userId: user.id, id: { in: input.tagIds } },
      select: { id: true },
    }),
  ]);
  if (ownedTags.length !== input.tagIds.length) {
    throw new Error("One or more tags not found.");
  }

  await prisma.$transaction([
    prisma.noteTag.deleteMany({ where: { noteId: input.noteId } }),
    ...input.tagIds.map((tagId) =>
      prisma.noteTag.create({
        data: { noteId: input.noteId, tagId },
      }),
    ),
  ]);

  revalidateApp();
  revalidatePath(`/notes/${input.noteId}`);
}
