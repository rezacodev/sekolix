-- Sprint 3: BK, Kedisiplinan, Prestasi, dan Catatan Perkembangan

CREATE TABLE "student_counseling_cases" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "counselor_id" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE_BK',
    "parent_visible" BOOLEAN NOT NULL DEFAULT false,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_counseling_cases_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "counseling_sessions" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "counselor_id" TEXT,
    "session_date" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "follow_up_plan" TEXT,
    "next_session_at" TIMESTAMP(3),
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE_BK',
    "parent_visible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counseling_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "discipline_rules" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "severity" TEXT NOT NULL DEFAULT 'LOW',
    "points" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discipline_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "discipline_records" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "rule_id" TEXT,
    "case_id" TEXT,
    "recorded_by" TEXT,
    "incident_date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "action_taken" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "parent_visible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discipline_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_achievements" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "verified_by" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'ACADEMIC',
    "level" TEXT NOT NULL DEFAULT 'SCHOOL',
    "organizer" TEXT,
    "achievement_date" DATE NOT NULL,
    "description" TEXT,
    "certificate_url" TEXT,
    "parent_visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_achievements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_development_notes" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "case_id" TEXT,
    "author_id" TEXT,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "title" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE_BK',
    "parent_visible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_development_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "counseling_referrals" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "case_id" TEXT,
    "referred_by" TEXT,
    "assigned_to" TEXT,
    "source" TEXT NOT NULL DEFAULT 'TEACHER',
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counseling_referrals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "parent_summon_letters" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_by" TEXT,
    "letter_number" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "agenda" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "pdf_url" TEXT,
    "parent_visible" BOOLEAN NOT NULL DEFAULT true,
    "attended_at" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_summon_letters_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "discipline_rules_code_key" ON "discipline_rules"("code");
CREATE UNIQUE INDEX "parent_summon_letters_letter_number_key" ON "parent_summon_letters"("letter_number");

CREATE INDEX "student_counseling_cases_student_id_status_idx" ON "student_counseling_cases"("student_id", "status");
CREATE INDEX "student_counseling_cases_counselor_id_status_idx" ON "student_counseling_cases"("counselor_id", "status");
CREATE INDEX "student_counseling_cases_parent_visible_status_idx" ON "student_counseling_cases"("parent_visible", "status");
CREATE INDEX "counseling_sessions_case_id_session_date_idx" ON "counseling_sessions"("case_id", "session_date");
CREATE INDEX "counseling_sessions_student_id_session_date_idx" ON "counseling_sessions"("student_id", "session_date");
CREATE INDEX "discipline_rules_category_severity_idx" ON "discipline_rules"("category", "severity");
CREATE INDEX "discipline_records_student_id_incident_date_idx" ON "discipline_records"("student_id", "incident_date");
CREATE INDEX "discipline_records_rule_id_idx" ON "discipline_records"("rule_id");
CREATE INDEX "discipline_records_case_id_idx" ON "discipline_records"("case_id");
CREATE INDEX "discipline_records_parent_visible_status_idx" ON "discipline_records"("parent_visible", "status");
CREATE INDEX "student_achievements_student_id_achievement_date_idx" ON "student_achievements"("student_id", "achievement_date");
CREATE INDEX "student_achievements_category_level_idx" ON "student_achievements"("category", "level");
CREATE INDEX "student_achievements_parent_visible_idx" ON "student_achievements"("parent_visible");
CREATE INDEX "student_development_notes_student_id_createdAt_idx" ON "student_development_notes"("student_id", "createdAt");
CREATE INDEX "student_development_notes_case_id_idx" ON "student_development_notes"("case_id");
CREATE INDEX "student_development_notes_parent_visible_visibility_idx" ON "student_development_notes"("parent_visible", "visibility");
CREATE INDEX "counseling_referrals_student_id_status_idx" ON "counseling_referrals"("student_id", "status");
CREATE INDEX "counseling_referrals_assigned_to_status_idx" ON "counseling_referrals"("assigned_to", "status");
CREATE INDEX "counseling_referrals_case_id_idx" ON "counseling_referrals"("case_id");
CREATE INDEX "parent_summon_letters_case_id_idx" ON "parent_summon_letters"("case_id");
CREATE INDEX "parent_summon_letters_student_id_scheduled_at_idx" ON "parent_summon_letters"("student_id", "scheduled_at");
CREATE INDEX "parent_summon_letters_parent_id_parent_visible_idx" ON "parent_summon_letters"("parent_id", "parent_visible");

ALTER TABLE "student_counseling_cases" ADD CONSTRAINT "student_counseling_cases_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_counseling_cases" ADD CONSTRAINT "student_counseling_cases_counselor_id_fkey" FOREIGN KEY ("counselor_id") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "counseling_sessions" ADD CONSTRAINT "counseling_sessions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "student_counseling_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "counseling_sessions" ADD CONSTRAINT "counseling_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "counseling_sessions" ADD CONSTRAINT "counseling_sessions_counselor_id_fkey" FOREIGN KEY ("counselor_id") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "discipline_records" ADD CONSTRAINT "discipline_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "discipline_records" ADD CONSTRAINT "discipline_records_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "discipline_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "discipline_records" ADD CONSTRAINT "discipline_records_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "student_counseling_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "discipline_records" ADD CONSTRAINT "discipline_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "student_achievements" ADD CONSTRAINT "student_achievements_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_achievements" ADD CONSTRAINT "student_achievements_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "student_development_notes" ADD CONSTRAINT "student_development_notes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_development_notes" ADD CONSTRAINT "student_development_notes_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "student_counseling_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "student_development_notes" ADD CONSTRAINT "student_development_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "counseling_referrals" ADD CONSTRAINT "counseling_referrals_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "counseling_referrals" ADD CONSTRAINT "counseling_referrals_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "student_counseling_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "counseling_referrals" ADD CONSTRAINT "counseling_referrals_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "counseling_referrals" ADD CONSTRAINT "counseling_referrals_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "parent_summon_letters" ADD CONSTRAINT "parent_summon_letters_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "student_counseling_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "parent_summon_letters" ADD CONSTRAINT "parent_summon_letters_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "parent_summon_letters" ADD CONSTRAINT "parent_summon_letters_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_guardians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "parent_summon_letters" ADD CONSTRAINT "parent_summon_letters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
