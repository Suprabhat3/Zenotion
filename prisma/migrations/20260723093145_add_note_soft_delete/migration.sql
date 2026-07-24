-- AlterTable
ALTER TABLE "note" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "note_userId_deletedAt_idx" ON "note"("userId", "deletedAt");
