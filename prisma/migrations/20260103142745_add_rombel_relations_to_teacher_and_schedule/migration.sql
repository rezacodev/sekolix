/*
  Warnings:

  - A unique constraint covering the columns `[teacher_id,subject_id,rombel_id]` on the table `teacher_subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "class_schedules" ADD COLUMN     "rombel_id" BIGINT;

-- AlterTable
ALTER TABLE "teacher_subjects" ADD COLUMN     "rombel_id" BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "teacher_subjects_teacher_id_subject_id_rombel_id_key" ON "teacher_subjects"("teacher_id", "subject_id", "rombel_id");

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "class_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "class_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
