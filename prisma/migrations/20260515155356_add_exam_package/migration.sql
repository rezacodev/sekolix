-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('KUIS', 'UTS', 'UAS', 'ULANGAN_HARIAN', 'LATIHAN');

-- CreateTable
CREATE TABLE "exam_packages" (
    "id" BIGSERIAL NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "exam_type" "ExamType" NOT NULL DEFAULT 'KUIS',
    "duration" INTEGER NOT NULL DEFAULT 60,
    "passing_grade" INTEGER NOT NULL DEFAULT 70,
    "randomize" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_package_questions" (
    "id" BIGSERIAL NOT NULL,
    "package_id" BIGINT NOT NULL,
    "question_id" BIGINT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_package_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_package_questions_package_id_question_id_key" ON "exam_package_questions"("package_id", "question_id");

-- AddForeignKey
ALTER TABLE "exam_packages" ADD CONSTRAINT "exam_packages_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "gtk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_packages" ADD CONSTRAINT "exam_packages_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_package_questions" ADD CONSTRAINT "exam_package_questions_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "exam_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_package_questions" ADD CONSTRAINT "exam_package_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
