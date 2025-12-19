-- AlterTable
ALTER TABLE "landing_galleries" ADD COLUMN     "album" TEXT;

-- CreateIndex
CREATE INDEX "landing_galleries_album_idx" ON "landing_galleries"("album");
