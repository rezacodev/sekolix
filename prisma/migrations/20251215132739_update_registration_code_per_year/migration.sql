/*
  Warnings:

  - A unique constraint covering the columns `[tahunAjaranId]` on the table `admission_registration_code_settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tahunAjaranId` to the `admission_registration_code_settings` table without a default value. This is not possible if the table is not empty.

*/

-- Get active academic year or create one if not exists
-- First, add the column as nullable
ALTER TABLE "admission_registration_code_settings" ADD COLUMN "tahunAjaranId" TEXT;

-- Get the active academic year ID
-- If no active year exists, use the most recent one
UPDATE "admission_registration_code_settings" 
SET "tahunAjaranId" = (
  SELECT "id" FROM "tahun_ajaran" 
  WHERE "isActive" = true 
  ORDER BY "startDate" DESC 
  LIMIT 1
);

-- If still NULL (no active year), use any recent one
UPDATE "admission_registration_code_settings" 
SET "tahunAjaranId" = (
  SELECT "id" FROM "tahun_ajaran" 
  ORDER BY "startDate" DESC 
  LIMIT 1
)
WHERE "tahunAjaranId" IS NULL;

-- Now make the column NOT NULL
ALTER TABLE "admission_registration_code_settings" ALTER COLUMN "tahunAjaranId" SET NOT NULL;

-- Add the landing setting column
ALTER TABLE "admission_landing_settings" ADD COLUMN "isApplyFormEnabled" BOOLEAN NOT NULL DEFAULT true;

-- Create unique index
CREATE UNIQUE INDEX "admission_registration_code_settings_tahunAjaranId_key" ON "admission_registration_code_settings"("tahunAjaranId");

-- Create index
CREATE INDEX "admission_registration_code_settings_tahunAjaranId_idx" ON "admission_registration_code_settings"("tahunAjaranId");

-- AddForeignKey
ALTER TABLE "admission_registration_code_settings" ADD CONSTRAINT "admission_registration_code_settings_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahun_ajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;
