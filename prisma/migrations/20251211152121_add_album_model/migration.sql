/*
  Warnings:

  - You are about to drop the column `album` on the `landing_galleries` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "landing_galleries_album_idx";

-- AlterTable
ALTER TABLE "landing_galleries" DROP COLUMN "album",
ADD COLUMN     "albumId" TEXT;

-- CreateTable
CREATE TABLE "landing_albums" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_albums_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landing_albums_name_key" ON "landing_albums"("name");

-- CreateIndex
CREATE INDEX "landing_galleries_albumId_idx" ON "landing_galleries"("albumId");

-- AddForeignKey
ALTER TABLE "landing_galleries" ADD CONSTRAINT "landing_galleries_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "landing_albums"("id") ON DELETE SET NULL ON UPDATE CASCADE;
