import { prisma } from "@/lib/db";
import { ApiError, ok, handleApiError } from "@/lib/api";
import { assertSameOriginMutation } from "@/lib/request-origin";
import { requireUser } from "@/lib/session";
import { createNoteSchema, parseOrThrow } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireUser();

    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
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
        updatedAt: true,
        tags: {
          select: {
            tagId: true,
            tag: { select: { id: true, name: true, color: true } },
          },
        },
      },
    });

    const data = notes.map((note) => ({
      ...note,
      content:
        note.content.length > 280
          ? `${note.content.slice(0, 280)}…`
          : note.content,
    }));

    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOriginMutation(request);
    const user = await requireUser();
    const body: unknown = await request.json();
    const input = parseOrThrow(createNoteSchema, body);

    if (input.folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: input.folderId, userId: user.id },
        select: { id: true },
      });
      if (!folder) {
        throw new ApiError("NOT_FOUND", "Folder not found.");
      }
    }

    const note = await prisma.note.create({
      data: {
        title: input.title ?? "Untitled",
        content: input.content ?? "",
        userId: user.id,
        folderId: input.folderId ?? null,
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
        updatedAt: true,
        tags: {
          select: {
            tagId: true,
            tag: { select: { id: true, name: true, color: true } },
          },
        },
      },
    });

    return ok(note, { status: 201, message: "Note created." });
  } catch (error) {
    return handleApiError(error);
  }
}
