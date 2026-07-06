import { prisma } from "@/lib/db";
import { createNoteVersionSnapshot } from "@/lib/note-versions";
import { ApiError, ok, handleApiError } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { parseOrThrow, updateNoteSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

async function getOwnedNote(userId: string, noteId: string) {
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId },
    select: {
      id: true,
      title: true,
      content: true,
      icon: true,
      coverImage: true,
      isPublic: true,
      isFavorite: true,
      shareSlug: true,
      folderId: true,
      createdAt: true,
      updatedAt: true,
      tags: {
        select: {
          tagId: true,
          tag: { select: { id: true, name: true, color: true } },
        },
      },
    },
  });
  if (!note) {
    throw new ApiError("NOT_FOUND", "Note not found.");
  }
  return note;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const note = await getOwnedNote(user.id, id);
    return ok(note);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    await getOwnedNote(user.id, id);

    const body: unknown = await request.json();
    const input = parseOrThrow(updateNoteSchema, body);

    const existing = await prisma.note.findFirst({
      where: { id, userId: user.id },
      select: { title: true, content: true },
    });
    if (!existing) {
      throw new ApiError("NOT_FOUND", "Note not found.");
    }

    const contentChanging =
      input.content !== undefined && input.content !== existing.content;
    const titleChanging =
      input.title !== undefined && input.title !== existing.title;

    if (contentChanging || titleChanging) {
      await createNoteVersionSnapshot({
        noteId: id,
        title: existing.title,
        content: existing.content,
      });
    }

    if (input.folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: input.folderId, userId: user.id },
        select: { id: true },
      });
      if (!folder) {
        throw new ApiError("NOT_FOUND", "Folder not found.");
      }
    }

    if (input.tagIds) {
      const ownedTags = await prisma.tag.findMany({
        where: { userId: user.id, id: { in: input.tagIds } },
        select: { id: true },
      });
      if (ownedTags.length !== input.tagIds.length) {
        throw new ApiError("NOT_FOUND", "One or more tags not found.");
      }

      await prisma.$transaction([
        prisma.noteTag.deleteMany({ where: { noteId: id } }),
        ...input.tagIds.map((tagId) =>
          prisma.noteTag.create({ data: { noteId: id, tagId } }),
        ),
      ]);
    }

    const hasNoteFields =
      input.title !== undefined ||
      input.content !== undefined ||
      input.icon !== undefined ||
      input.coverImage !== undefined ||
      input.folderId !== undefined;

    const note = hasNoteFields
      ? await prisma.note.update({
          where: { id },
          data: {
            ...(input.title !== undefined ? { title: input.title } : {}),
            ...(input.content !== undefined ? { content: input.content } : {}),
            ...(input.icon !== undefined ? { icon: input.icon } : {}),
            ...(input.coverImage !== undefined
              ? { coverImage: input.coverImage }
              : {}),
            ...(input.folderId !== undefined ? { folderId: input.folderId } : {}),
          },
          select: {
            id: true,
            title: true,
            content: true,
            icon: true,
            coverImage: true,
            isPublic: true,
            isFavorite: true,
            shareSlug: true,
            folderId: true,
            createdAt: true,
            updatedAt: true,
            tags: {
              select: {
                tagId: true,
                tag: { select: { id: true, name: true, color: true } },
              },
            },
          },
        })
      : await getOwnedNote(user.id, id);

    return ok(note, { message: "Note updated." });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    await getOwnedNote(user.id, id);

    await prisma.note.delete({ where: { id } });

    return ok({ id }, { message: "Note deleted." });
  } catch (error) {
    return handleApiError(error);
  }
}
