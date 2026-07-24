-- CreateTable
CREATE TABLE "note_link" (
    "sourceNoteId" TEXT NOT NULL,
    "targetNoteId" TEXT NOT NULL,

    CONSTRAINT "note_link_pkey" PRIMARY KEY ("sourceNoteId","targetNoteId")
);

-- CreateIndex
CREATE INDEX "note_link_targetNoteId_idx" ON "note_link"("targetNoteId");

-- AddForeignKey
ALTER TABLE "note_link" ADD CONSTRAINT "note_link_sourceNoteId_fkey" FOREIGN KEY ("sourceNoteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_link" ADD CONSTRAINT "note_link_targetNoteId_fkey" FOREIGN KEY ("targetNoteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
