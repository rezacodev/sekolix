/*
  Warnings:

  - A unique constraint covering the columns `[registrationCode]` on the table `Applicant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN     "registrationCode" TEXT;

-- AlterTable
ALTER TABLE "tahun_ajaran" ADD COLUMN     "yearCode" TEXT;

-- CreateTable
CREATE TABLE "admission_registration_code_settings" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT 'DAFTAR',
    "suffix" TEXT NOT NULL DEFAULT '',
    "padLength" INTEGER NOT NULL DEFAULT 4,
    "includeYearCode" BOOLEAN NOT NULL DEFAULT true,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_registration_code_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_registrationCode_key" ON "Applicant"("registrationCode");
