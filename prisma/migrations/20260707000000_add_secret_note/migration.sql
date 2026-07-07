-- AlterTable
ALTER TABLE "note" ADD COLUMN     "isSecret" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "secretIv" TEXT,
ADD COLUMN     "secretSalt" TEXT,
ADD COLUMN     "secretVerifier" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "secretNoteId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_secretNoteId_key" ON "user"("secretNoteId");

