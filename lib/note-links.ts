import { prisma } from "@/lib/db";
import { extractNoteLinkTargets } from "@/lib/wiki-links";

/**
 * Rebuild the outgoing wiki-link rows for a note from its markdown content.
 * Only links to the user's own, non-deleted, non-self notes are kept, so the
 * backlink index can never point at notes the user doesn't own.
 */
export async function syncNoteLinks(
  userId: string,
  sourceNoteId: string,
  content: string,
): Promise<void> {
  const targetIds = extractNoteLinkTargets(content).filter(
    (id) => id !== sourceNoteId,
  );

  const validTargets =
    targetIds.length > 0
      ? await prisma.note.findMany({
          where: { id: { in: targetIds }, userId, deletedAt: null },
          select: { id: true },
        })
      : [];

  await prisma.$transaction([
    prisma.noteLink.deleteMany({ where: { sourceNoteId } }),
    ...(validTargets.length > 0
      ? [
          prisma.noteLink.createMany({
            data: validTargets.map((target) => ({
              sourceNoteId,
              targetNoteId: target.id,
            })),
            skipDuplicates: true,
          }),
        ]
      : []),
  ]);
}
