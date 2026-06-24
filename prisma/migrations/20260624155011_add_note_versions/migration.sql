-- CreateTable
CREATE TABLE "note_version" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "noteId" TEXT NOT NULL,

    CONSTRAINT "note_version_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "note_version_noteId_createdAt_idx" ON "note_version"("noteId", "createdAt");

-- AddForeignKey
ALTER TABLE "note_version" ADD CONSTRAINT "note_version_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
