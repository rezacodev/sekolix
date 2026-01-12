/*
  Warnings:

  - You are about to drop the column `curriculum_id` on the `subjects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_curriculum_id_fkey";

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "curriculum_id";

-- CreateTable
CREATE TABLE "subject_curriculums" (
    "id" BIGSERIAL NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "curriculum_id" BIGINT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_curriculums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_classes" (
    "id" BIGSERIAL NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "class_id" BIGINT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_classes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subject_curriculums_subject_id_curriculum_id_key" ON "subject_curriculums"("subject_id", "curriculum_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_classes_subject_id_class_id_key" ON "subject_classes"("subject_id", "class_id");

-- AddForeignKey
ALTER TABLE "subject_curriculums" ADD CONSTRAINT "subject_curriculums_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_curriculums" ADD CONSTRAINT "subject_curriculums_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curriculums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_classes" ADD CONSTRAINT "subject_classes_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_classes" ADD CONSTRAINT "subject_classes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
