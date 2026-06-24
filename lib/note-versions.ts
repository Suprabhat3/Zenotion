import { prisma } from "@/lib/db";

const MAX_VERSIONS_PER_NOTE = 20;

type SnapshotInput = {
  noteId: string;
  title: string;
  content: string;
};

/** Persist a snapshot before overwriting note content, skipping duplicate consecutive versions. */
export async function createNoteVersionSnapshot({
  noteId,
  title,
  content,
}: SnapshotInput): Promise<void> {
  const latest = await prisma.noteVersion.findFirst({
    where: { noteId },
    orderBy: { createdAt: "desc" },
    select: { title: true, content: true },
  });

  if (latest && latest.title === title && latest.content === content) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.noteVersion.create({
      data: { noteId, title, content },
    });

    const versions = await tx.noteVersion.findMany({
      where: { noteId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
      skip: MAX_VERSIONS_PER_NOTE,
    });

    if (versions.length > 0) {
      await tx.noteVersion.deleteMany({
        where: { id: { in: versions.map((v) => v.id) } },
      });
    }
  });
}
