-- CreateEnum
CREATE TYPE "ExamScheduleStatus" AS ENUM ('DRAFT', 'OPEN', 'PAUSED', 'CLOSED');

-- CreateTable
CREATE TABLE "exam_schedules" (
    "id" BIGSERIAL NOT NULL,
    "package_id" BIGINT NOT NULL,
    "rombel_id" BIGINT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "window_minutes" INTEGER NOT NULL DEFAULT 0,
    "status" "ExamScheduleStatus" NOT NULL DEFAULT 'DRAFT',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_schedules_token_key" ON "exam_schedules"("token");

-- CreateIndex
CREATE INDEX "exam_schedules_teacher_id_status_idx" ON "exam_schedules"("teacher_id", "status");

-- CreateIndex
CREATE INDEX "exam_schedules_token_idx" ON "exam_schedules"("token");

-- AddForeignKey
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "exam_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "class_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "gtk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
