/*
  Warnings:

  - You are about to drop the column `scheduled_date` on the `lesson_plans` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "lesson_plans_scheduled_date_idx";

-- AlterTable
ALTER TABLE "lesson_plans" DROP COLUMN "scheduled_date";

-- AlterTable
ALTER TABLE "syllabuses" ADD COLUMN     "indicators" TEXT;
