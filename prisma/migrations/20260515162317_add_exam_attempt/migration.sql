-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'GRADED');

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" BIGSERIAL NOT NULL,
    "schedule_id" BIGINT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" DECIMAL(65,30),
    "auto_score" DECIMAL(65,30),
    "essay_score" DECIMAL(65,30),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "graded_at" TIMESTAMP(3),
    "graded_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_answer_records" (
    "id" BIGSERIAL NOT NULL,
    "attempt_id" BIGINT NOT NULL,
    "question_id" BIGINT NOT NULL,
    "answer" TEXT NOT NULL,
    "is_correct" BOOLEAN,
    "score" DECIMAL(65,30),
    "essay_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_answer_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_attempts_schedule_id_status_idx" ON "exam_attempts"("schedule_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempts_schedule_id_student_id_key" ON "exam_attempts"("schedule_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_answer_records_attempt_id_question_id_key" ON "exam_answer_records"("attempt_id", "question_id");

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "exam_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_answer_records" ADD CONSTRAINT "exam_answer_records_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_answer_records" ADD CONSTRAINT "exam_answer_records_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question_banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
