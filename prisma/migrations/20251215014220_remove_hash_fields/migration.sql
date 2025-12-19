/*
  Warnings:

  - You are about to drop the column `nikHash` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `nikMasked` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `phoneHash` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `phoneMasked` on the `Applicant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nik]` on the table `Applicant` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nik` on table `Applicant` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Applicant` required. This step will fail if there are existing NULL values in that column.

*/
-- Set default values for NULL nik and phone
UPDATE "Applicant" SET "nik" = CONCAT('NIK', id) WHERE "nik" IS NULL;
UPDATE "Applicant" SET "phone" = CONCAT('08', id) WHERE "phone" IS NULL;

-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "nikHash",
DROP COLUMN "nikMasked",
DROP COLUMN "phoneHash",
DROP COLUMN "phoneMasked",
ALTER COLUMN "nik" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_nik_key" ON "Applicant"("nik");
