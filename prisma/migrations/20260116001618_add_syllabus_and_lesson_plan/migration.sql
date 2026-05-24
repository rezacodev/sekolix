-- CreateTable
CREATE TABLE "syllabuses" (
    "id" BIGSERIAL NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "class_id" BIGINT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "core_competencies" TEXT,
    "basic_competencies" TEXT,
    "subject_matter" TEXT,
    "learning_activities" TEXT,
    "assessment" TEXT,
    "time_allocation" TEXT,
    "learning_resources" TEXT,
    "notes" TEXT,
    "file_url" TEXT,
    "file_name" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "syllabuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_plans" (
    "id" BIGSERIAL NOT NULL,
    "syllabus_id" BIGINT,
    "teacher_id" TEXT NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "class_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "meeting_number" INTEGER,
    "time_allocation" TEXT,
    "learning_objectives" TEXT NOT NULL,
    "indicators" TEXT,
    "subject_matter" TEXT,
    "teaching_method" TEXT,
    "media_and_tools" TEXT,
    "learning_resources" TEXT,
    "opening_activities" TEXT,
    "core_activities" TEXT,
    "closing_activities" TEXT,
    "assessment_technique" TEXT,
    "assessment_instrument" TEXT,
    "notes" TEXT,
    "file_url" TEXT,
    "file_name" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "scheduled_date" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "syllabuses_teacher_id_idx" ON "syllabuses"("teacher_id");

-- CreateIndex
CREATE INDEX "syllabuses_subject_id_idx" ON "syllabuses"("subject_id");

-- CreateIndex
CREATE INDEX "syllabuses_class_id_idx" ON "syllabuses"("class_id");

-- CreateIndex
CREATE INDEX "syllabuses_academic_year_semester_idx" ON "syllabuses"("academic_year", "semester");

-- CreateIndex
CREATE INDEX "lesson_plans_teacher_id_idx" ON "lesson_plans"("teacher_id");

-- CreateIndex
CREATE INDEX "lesson_plans_subject_id_idx" ON "lesson_plans"("subject_id");

-- CreateIndex
CREATE INDEX "lesson_plans_class_id_idx" ON "lesson_plans"("class_id");

-- CreateIndex
CREATE INDEX "lesson_plans_syllabus_id_idx" ON "lesson_plans"("syllabus_id");

-- CreateIndex
CREATE INDEX "lesson_plans_scheduled_date_idx" ON "lesson_plans"("scheduled_date");

-- AddForeignKey
ALTER TABLE "syllabuses" ADD CONSTRAINT "syllabuses_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "gtk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllabuses" ADD CONSTRAINT "syllabuses_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllabuses" ADD CONSTRAINT "syllabuses_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllabuses" ADD CONSTRAINT "syllabuses_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_syllabus_id_fkey" FOREIGN KEY ("syllabus_id") REFERENCES "syllabuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "gtk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
