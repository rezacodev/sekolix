-- CreateTable
CREATE TABLE "extracurriculars" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "location" TEXT,
    "capacity" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extracurriculars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracurricular_coaches" (
    "id" TEXT NOT NULL,
    "extracurricular_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PEMBINA',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extracurricular_coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracurricular_members" (
    "id" TEXT NOT NULL,
    "extracurricular_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "joined_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extracurricular_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracurricular_schedules" (
    "id" TEXT NOT NULL,
    "extracurricular_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TRAINING',
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3),
    "location" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_event_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extracurricular_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracurricular_attendances" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "member_id" TEXT,
    "student_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "recorded_by" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extracurricular_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracurricular_achievements" (
    "id" TEXT NOT NULL,
    "extracurricular_id" TEXT NOT NULL,
    "student_id" TEXT,
    "title" TEXT NOT NULL,
    "level" TEXT,
    "organizer" TEXT,
    "achieved_at" DATE,
    "rank" TEXT,
    "description" TEXT,
    "certificate_url" TEXT,
    "portfolio_visible" BOOLEAN NOT NULL DEFAULT true,
    "verified_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extracurricular_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracurricular_registrations" (
    "id" TEXT NOT NULL,
    "extracurricular_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "motivation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extracurricular_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "extracurriculars_code_key" ON "extracurriculars"("code");

-- CreateIndex
CREATE INDEX "extracurriculars_category_is_active_idx" ON "extracurriculars"("category", "is_active");

-- CreateIndex
CREATE INDEX "extracurriculars_created_by_idx" ON "extracurriculars"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "extracurricular_coaches_extracurricular_id_staff_id_key" ON "extracurricular_coaches"("extracurricular_id", "staff_id");

-- CreateIndex
CREATE INDEX "extracurricular_coaches_staff_id_idx" ON "extracurricular_coaches"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "extracurricular_members_extracurricular_id_student_id_key" ON "extracurricular_members"("extracurricular_id", "student_id");

-- CreateIndex
CREATE INDEX "extracurricular_members_student_id_status_idx" ON "extracurricular_members"("student_id", "status");

-- CreateIndex
CREATE INDEX "extracurricular_schedules_extracurricular_id_start_at_idx" ON "extracurricular_schedules"("extracurricular_id", "start_at");

-- CreateIndex
CREATE INDEX "extracurricular_schedules_status_start_at_idx" ON "extracurricular_schedules"("status", "start_at");

-- CreateIndex
CREATE UNIQUE INDEX "extracurricular_attendances_schedule_id_student_id_key" ON "extracurricular_attendances"("schedule_id", "student_id");

-- CreateIndex
CREATE INDEX "extracurricular_attendances_student_id_status_idx" ON "extracurricular_attendances"("student_id", "status");

-- CreateIndex
CREATE INDEX "extracurricular_attendances_recorded_by_idx" ON "extracurricular_attendances"("recorded_by");

-- CreateIndex
CREATE INDEX "extracurricular_achievements_extracurricular_id_achieved_at_idx" ON "extracurricular_achievements"("extracurricular_id", "achieved_at");

-- CreateIndex
CREATE INDEX "extracurricular_achievements_student_id_portfolio_visible_idx" ON "extracurricular_achievements"("student_id", "portfolio_visible");

-- CreateIndex
CREATE INDEX "extracurricular_achievements_verified_by_idx" ON "extracurricular_achievements"("verified_by");

-- CreateIndex
CREATE UNIQUE INDEX "extracurricular_registrations_extracurricular_id_student_id_key" ON "extracurricular_registrations"("extracurricular_id", "student_id");

-- CreateIndex
CREATE INDEX "extracurricular_registrations_student_id_status_idx" ON "extracurricular_registrations"("student_id", "status");

-- CreateIndex
CREATE INDEX "extracurricular_registrations_reviewed_by_idx" ON "extracurricular_registrations"("reviewed_by");

-- AddForeignKey
ALTER TABLE "extracurriculars" ADD CONSTRAINT "extracurriculars_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_coaches" ADD CONSTRAINT "extracurricular_coaches_extracurricular_id_fkey" FOREIGN KEY ("extracurricular_id") REFERENCES "extracurriculars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_coaches" ADD CONSTRAINT "extracurricular_coaches_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "gtk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_members" ADD CONSTRAINT "extracurricular_members_extracurricular_id_fkey" FOREIGN KEY ("extracurricular_id") REFERENCES "extracurriculars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_members" ADD CONSTRAINT "extracurricular_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_schedules" ADD CONSTRAINT "extracurricular_schedules_extracurricular_id_fkey" FOREIGN KEY ("extracurricular_id") REFERENCES "extracurriculars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_attendances" ADD CONSTRAINT "extracurricular_attendances_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "extracurricular_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_attendances" ADD CONSTRAINT "extracurricular_attendances_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "extracurricular_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_attendances" ADD CONSTRAINT "extracurricular_attendances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_attendances" ADD CONSTRAINT "extracurricular_attendances_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_achievements" ADD CONSTRAINT "extracurricular_achievements_extracurricular_id_fkey" FOREIGN KEY ("extracurricular_id") REFERENCES "extracurriculars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_achievements" ADD CONSTRAINT "extracurricular_achievements_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_achievements" ADD CONSTRAINT "extracurricular_achievements_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_registrations" ADD CONSTRAINT "extracurricular_registrations_extracurricular_id_fkey" FOREIGN KEY ("extracurricular_id") REFERENCES "extracurriculars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_registrations" ADD CONSTRAINT "extracurricular_registrations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_registrations" ADD CONSTRAINT "extracurricular_registrations_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

