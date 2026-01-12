-- DropForeignKey
ALTER TABLE "teacher_subjects" DROP CONSTRAINT "teacher_subjects_teacher_id_fkey";

-- AlterTable
ALTER TABLE "teacher_subjects" ALTER COLUMN "teacher_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
