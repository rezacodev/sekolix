-- Parent / Guardian portal foundation
CREATE TABLE "parent_guardians" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "parent_guardians_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "parent_students" (
  "id" TEXT NOT NULL,
  "parent_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "relationship" TEXT NOT NULL DEFAULT 'WALI',
  "is_primary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "parent_students_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "parent_leave_requests" (
  "id" TEXT NOT NULL,
  "parent_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "reason" TEXT NOT NULL,
  "attachment_url" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "reviewed_by" TEXT,
  "reviewed_at" TIMESTAMP(3),
  "response_note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "parent_leave_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "parent_teacher_messages" (
  "id" TEXT NOT NULL,
  "parent_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "teacher_id" TEXT,
  "subject" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "response" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "parent_teacher_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "parent_notifications" (
  "id" TEXT NOT NULL,
  "parent_id" TEXT NOT NULL,
  "student_id" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "href" TEXT,
  "read_at" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "parent_notifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "parent_guardians_user_id_key" ON "parent_guardians"("user_id");
CREATE UNIQUE INDEX "parent_students_parent_id_student_id_key" ON "parent_students"("parent_id", "student_id");
CREATE INDEX "parent_students_student_id_idx" ON "parent_students"("student_id");
CREATE INDEX "parent_leave_requests_parent_id_createdAt_idx" ON "parent_leave_requests"("parent_id", "createdAt");
CREATE INDEX "parent_leave_requests_student_id_start_date_idx" ON "parent_leave_requests"("student_id", "start_date");
CREATE INDEX "parent_teacher_messages_parent_id_createdAt_idx" ON "parent_teacher_messages"("parent_id", "createdAt");
CREATE INDEX "parent_teacher_messages_student_id_createdAt_idx" ON "parent_teacher_messages"("student_id", "createdAt");
CREATE INDEX "parent_notifications_parent_id_read_at_createdAt_idx" ON "parent_notifications"("parent_id", "read_at", "createdAt");

ALTER TABLE "parent_guardians"
  ADD CONSTRAINT "parent_guardians_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_students"
  ADD CONSTRAINT "parent_students_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "parent_guardians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_students"
  ADD CONSTRAINT "parent_students_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_leave_requests"
  ADD CONSTRAINT "parent_leave_requests_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "parent_guardians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_leave_requests"
  ADD CONSTRAINT "parent_leave_requests_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_leave_requests"
  ADD CONSTRAINT "parent_leave_requests_reviewed_by_fkey"
  FOREIGN KEY ("reviewed_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "parent_teacher_messages"
  ADD CONSTRAINT "parent_teacher_messages_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "parent_guardians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_teacher_messages"
  ADD CONSTRAINT "parent_teacher_messages_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_teacher_messages"
  ADD CONSTRAINT "parent_teacher_messages_teacher_id_fkey"
  FOREIGN KEY ("teacher_id") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "parent_notifications"
  ADD CONSTRAINT "parent_notifications_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "parent_guardians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_notifications"
  ADD CONSTRAINT "parent_notifications_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE SET NULL ON UPDATE CASCADE;
