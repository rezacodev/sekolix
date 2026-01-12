/*
  Warnings:

  - You are about to drop the column `level` on the `curriculums` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "curriculums" DROP COLUMN "level",
ADD COLUMN     "description" TEXT;
