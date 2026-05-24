/*
  Warnings:

  - A unique constraint covering the columns `[student_id,rubric_id]` on the table `grades` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "grades_student_id_rubric_id_key" ON "grades"("student_id", "rubric_id");
