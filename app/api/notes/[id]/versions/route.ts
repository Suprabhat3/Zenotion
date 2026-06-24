import { prisma } from "@/lib/db";
import { ApiError, ok, handleApiError } from "@/lib/api";
import { requireUser } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

async function getOwnedNoteId(userId: string, noteId: string) {
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId },
    select: { id: true },
  });
  if (!note) {
    throw new ApiError("NOT_FOUND", "Note not found.");
  }
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    await getOwnedNoteId(user.id, id);

    const versions = await prisma.noteVersion.findMany({
      where: { noteId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
    });

    return ok(
      versions.map((version) => ({
        ...version,
        createdAt: version.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
