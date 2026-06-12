"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { generateShareSlug } from "@/lib/utils";
import {
  assignTagsSchema,
  createNoteSchema,
  folderIdSchema,
  folderSchema,
  moveNoteSchema,
  noteIdSchema,
  parseOrThrow,
  renameFolderSchema,
  renameNoteSchema,
  tagIdSchema,
  tagSchema,
  toggleNoteFavoriteSchema,
  toggleNotePublicSchema,
  updateNoteSchema,
} from "@/lib/validators";

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

export async function renameNote(formData: FormData) {
  const user = await requireUser();
  const input = parseOrThrow(renameNoteSchema, {
    noteId: formData.get("noteId"),
    title: formData.get("title"),
  });

  await assertNoteOwnership(user.id, input.noteId);

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

  await assertNoteOwnership(user.id, noteId);

  await prisma.note.update({
    where: { id: noteId },
    data: input,
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

  await assertNoteOwnership(user.id, input.noteId);
  await assertFolderOwnership(user.id, input.folderId);

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
    select: { id: true, shareSlug: true },
  });
  if (!note) {
    throw new Error("Note not found.");
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

  await prisma.note.delete({ where: { id: noteId } });

  revalidateApp();
  redirect("/dashboard");
}

export async function createFolder(formData: FormData) {
  const user = await requireUser();
  const input = parseOrThrow(folderSchema, {
    name: formData.get("name"),
  });

  await prisma.folder.create({
    data: { name: input.name, userId: user.id },
  });

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

  await prisma.folder.update({
    where: { id: input.folderId },
    data: { name: input.name },
  });

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

  await prisma.tag.create({
    data: {
      name: input.name,
      color: input.color ?? null,
      userId: user.id,
    },
  });

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
    where: { shareSlug, isPublic: true },
    select: { title: true, content: true },
  });
  if (!source) {
    throw new Error("Shared note not found or is no longer public.");
  }

  const copy = await prisma.note.create({
    data: {
      title: `${source.title} (copy)`,
      content: source.content,
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

  await assertNoteOwnership(user.id, input.noteId);

  const ownedTags = await prisma.tag.findMany({
    where: { userId: user.id, id: { in: input.tagIds } },
    select: { id: true },
  });
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
