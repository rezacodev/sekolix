/*
  Warnings:

  - Added the required column `academic_year` to the `lesson_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `lesson_plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lesson_plans" ADD COLUMN     "academic_year" TEXT NOT NULL,
ADD COLUMN     "semester" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "lesson_plans_academic_year_semester_idx" ON "lesson_plans"("academic_year", "semester");
