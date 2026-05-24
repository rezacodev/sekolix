-- CreateTable
CREATE TABLE "teaching_journals" (
    "id" BIGSERIAL NOT NULL,
    "teacher_subject_id" BIGINT NOT NULL,
    "rombel_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "time_start" TEXT,
    "time_end" TEXT,
    "period" INTEGER,
    "topic" TEXT NOT NULL,
    "teaching_method" TEXT,
    "media_used" TEXT,
    "obstacles" TEXT,
    "follow_up" TEXT,
    "notes" TEXT,
    "recorded_by" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teaching_journals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teaching_journals_date_idx" ON "teaching_journals"("date");

-- CreateIndex
CREATE INDEX "teaching_journals_rombel_id_date_idx" ON "teaching_journals"("rombel_id", "date");

-- CreateIndex
CREATE INDEX "teaching_journals_teacher_subject_id_date_idx" ON "teaching_journals"("teacher_subject_id", "date");

-- AddForeignKey
ALTER TABLE "teaching_journals" ADD CONSTRAINT "teaching_journals_teacher_subject_id_fkey" FOREIGN KEY ("teacher_subject_id") REFERENCES "teacher_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_journals" ADD CONSTRAINT "teaching_journals_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "class_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_journals" ADD CONSTRAINT "teaching_journals_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "gtk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
