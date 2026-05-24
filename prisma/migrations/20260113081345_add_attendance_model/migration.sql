-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('HADIR', 'SAKIT', 'IZIN', 'ALPHA');

-- CreateTable
CREATE TABLE "attendances" (
    "id" BIGSERIAL NOT NULL,
    "student_id" TEXT NOT NULL,
    "teacher_subject_id" BIGINT NOT NULL,
    "rombel_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "meeting_number" INTEGER NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "notes" TEXT,
    "recorded_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendances_date_idx" ON "attendances"("date");

-- CreateIndex
CREATE INDEX "attendances_rombel_id_date_idx" ON "attendances"("rombel_id", "date");

-- CreateIndex
CREATE INDEX "attendances_teacher_subject_id_date_idx" ON "attendances"("teacher_subject_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_student_id_teacher_subject_id_date_meeting_numb_key" ON "attendances"("student_id", "teacher_subject_id", "date", "meeting_number");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_teacher_subject_id_fkey" FOREIGN KEY ("teacher_subject_id") REFERENCES "teacher_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "class_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
