import { prisma } from "@/lib/db";
import { ApiError, ok, handleApiError } from "@/lib/api";
import { assertSameOriginMutation } from "@/lib/request-origin";
import { requireUser } from "@/lib/session";
import { createNoteVersionSnapshot } from "@/lib/note-versions";

type RouteContext = { params: Promise<{ id: string; versionId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    assertSameOriginMutation(request);
    const user = await requireUser();
    const { id, versionId } = await context.params;

    const note = await prisma.note.findFirst({
      where: { id, userId: user.id, deletedAt: null },
      select: { id: true, title: true, content: true, isSecret: true },
    });
    if (!note) {
      throw new ApiError("NOT_FOUND", "Note not found.");
    }
    if (note.isSecret) {
      throw new ApiError(
        "FORBIDDEN",
        "Secret notes do not keep version history.",
      );
    }

    const version = await prisma.noteVersion.findFirst({
      where: { id: versionId, noteId: id },
      select: { title: true, content: true },
    });
    if (!version) {
      throw new ApiError("NOT_FOUND", "Version not found.");
    }

    if (note.title !== version.title || note.content !== version.content) {
      await createNoteVersionSnapshot({
        noteId: id,
        title: note.title,
        content: note.content,
      });
    }

    const updated = await prisma.note.update({
      where: { id },
      data: {
        title: version.title,
        content: version.content,
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
    });

    return ok(updated, { message: "Version restored." });
  } catch (error) {
    return handleApiError(error);
  }
}
