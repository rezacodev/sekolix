/*
  Warnings:

  - Added the required column `rombel_id` to the `assessment_rubrics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assessment_rubrics" ADD COLUMN     "rombel_id" BIGINT NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "assessment_rubrics" ADD CONSTRAINT "assessment_rubrics_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "class_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
