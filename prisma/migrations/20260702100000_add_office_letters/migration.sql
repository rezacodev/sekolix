-- CreateTable
CREATE TABLE "tu_number_sequences" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "current_number" INTEGER NOT NULL DEFAULT 0,
    "padding" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tu_number_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "letter_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'GENERAL',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "letter_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incoming_letters" (
    "id" TEXT NOT NULL,
    "agenda_number" TEXT NOT NULL,
    "letter_number" TEXT,
    "received_at" DATE NOT NULL,
    "letter_date" DATE,
    "sender" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "summary" TEXT,
    "file_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "classification" TEXT,
    "received_by" TEXT,
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incoming_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outgoing_letters" (
    "id" TEXT NOT NULL,
    "letter_number" TEXT NOT NULL,
    "agenda_number" TEXT,
    "template_id" TEXT,
    "recipient" TEXT NOT NULL,
    "recipient_type" TEXT NOT NULL DEFAULT 'GENERAL',
    "subject" TEXT NOT NULL,
    "body" TEXT,
    "letter_date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "file_url" TEXT,
    "qr_code" TEXT,
    "validation_code" TEXT NOT NULL,
    "created_by" TEXT,
    "signed_by" TEXT,
    "sent_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outgoing_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "letter_dispositions" (
    "id" TEXT NOT NULL,
    "incoming_letter_id" TEXT,
    "outgoing_letter_id" TEXT,
    "assigned_to" TEXT NOT NULL,
    "from_staff_id" TEXT,
    "instruction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "due_date" DATE,
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "letter_dispositions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_letters" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "outgoing_letter_id" TEXT,
    "student_id" TEXT,
    "staff_id" TEXT,
    "subject_name" TEXT NOT NULL,
    "subject_identifier" TEXT,
    "variables" JSONB,
    "content" TEXT NOT NULL,
    "file_url" TEXT,
    "qr_code" TEXT,
    "validation_code" TEXT NOT NULL,
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "letter_approvals" (
    "id" TEXT NOT NULL,
    "outgoing_letter_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requested_by" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "notes" TEXT,
    "approval_request_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "letter_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archive_records" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
    "incoming_letter_id" TEXT,
    "outgoing_letter_id" TEXT,
    "generated_letter_id" TEXT,
    "file_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "archived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "archive_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tu_number_sequences_scope_key" ON "tu_number_sequences"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "letter_templates_code_key" ON "letter_templates"("code");

-- CreateIndex
CREATE INDEX "letter_templates_audience_is_active_idx" ON "letter_templates"("audience", "is_active");

-- CreateIndex
CREATE INDEX "letter_templates_created_by_idx" ON "letter_templates"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "incoming_letters_agenda_number_key" ON "incoming_letters"("agenda_number");

-- CreateIndex
CREATE INDEX "incoming_letters_received_at_status_idx" ON "incoming_letters"("received_at", "status");

-- CreateIndex
CREATE INDEX "incoming_letters_received_by_idx" ON "incoming_letters"("received_by");

-- CreateIndex
CREATE INDEX "incoming_letters_created_by_idx" ON "incoming_letters"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "outgoing_letters_letter_number_key" ON "outgoing_letters"("letter_number");

-- CreateIndex
CREATE UNIQUE INDEX "outgoing_letters_agenda_number_key" ON "outgoing_letters"("agenda_number");

-- CreateIndex
CREATE UNIQUE INDEX "outgoing_letters_validation_code_key" ON "outgoing_letters"("validation_code");

-- CreateIndex
CREATE INDEX "outgoing_letters_letter_date_status_idx" ON "outgoing_letters"("letter_date", "status");

-- CreateIndex
CREATE INDEX "outgoing_letters_template_id_idx" ON "outgoing_letters"("template_id");

-- CreateIndex
CREATE INDEX "outgoing_letters_created_by_idx" ON "outgoing_letters"("created_by");

-- CreateIndex
CREATE INDEX "outgoing_letters_signed_by_idx" ON "outgoing_letters"("signed_by");

-- CreateIndex
CREATE INDEX "letter_dispositions_incoming_letter_id_idx" ON "letter_dispositions"("incoming_letter_id");

-- CreateIndex
CREATE INDEX "letter_dispositions_outgoing_letter_id_idx" ON "letter_dispositions"("outgoing_letter_id");

-- CreateIndex
CREATE INDEX "letter_dispositions_assigned_to_status_idx" ON "letter_dispositions"("assigned_to", "status");

-- CreateIndex
CREATE INDEX "letter_dispositions_due_date_idx" ON "letter_dispositions"("due_date");

-- CreateIndex
CREATE UNIQUE INDEX "generated_letters_validation_code_key" ON "generated_letters"("validation_code");

-- CreateIndex
CREATE INDEX "generated_letters_template_id_idx" ON "generated_letters"("template_id");

-- CreateIndex
CREATE INDEX "generated_letters_student_id_idx" ON "generated_letters"("student_id");

-- CreateIndex
CREATE INDEX "generated_letters_staff_id_idx" ON "generated_letters"("staff_id");

-- CreateIndex
CREATE INDEX "generated_letters_created_by_idx" ON "generated_letters"("created_by");

-- CreateIndex
CREATE INDEX "letter_approvals_outgoing_letter_id_status_idx" ON "letter_approvals"("outgoing_letter_id", "status");

-- CreateIndex
CREATE INDEX "letter_approvals_requested_by_idx" ON "letter_approvals"("requested_by");

-- CreateIndex
CREATE INDEX "letter_approvals_reviewed_by_idx" ON "letter_approvals"("reviewed_by");

-- CreateIndex
CREATE UNIQUE INDEX "archive_records_code_key" ON "archive_records"("code");

-- CreateIndex
CREATE INDEX "archive_records_category_visibility_idx" ON "archive_records"("category", "visibility");

-- CreateIndex
CREATE INDEX "archive_records_incoming_letter_id_idx" ON "archive_records"("incoming_letter_id");

-- CreateIndex
CREATE INDEX "archive_records_outgoing_letter_id_idx" ON "archive_records"("outgoing_letter_id");

-- CreateIndex
CREATE INDEX "archive_records_generated_letter_id_idx" ON "archive_records"("generated_letter_id");

-- CreateIndex
CREATE INDEX "archive_records_created_by_idx" ON "archive_records"("created_by");

-- AddForeignKey
ALTER TABLE "letter_templates" ADD CONSTRAINT "letter_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incoming_letters" ADD CONSTRAINT "incoming_letters_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incoming_letters" ADD CONSTRAINT "incoming_letters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "letter_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_signed_by_fkey" FOREIGN KEY ("signed_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter_dispositions" ADD CONSTRAINT "letter_dispositions_incoming_letter_id_fkey" FOREIGN KEY ("incoming_letter_id") REFERENCES "incoming_letters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter_dispositions" ADD CONSTRAINT "letter_dispositions_outgoing_letter_id_fkey" FOREIGN KEY ("outgoing_letter_id") REFERENCES "outgoing_letters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter_dispositions" ADD CONSTRAINT "letter_dispositions_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "gtk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter_dispositions" ADD CONSTRAINT "letter_dispositions_from_staff_id_fkey" FOREIGN KEY ("from_staff_id") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_letters" ADD CONSTRAINT "generated_letters_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "letter_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_letters" ADD CONSTRAINT "generated_letters_outgoing_letter_id_fkey" FOREIGN KEY ("outgoing_letter_id") REFERENCES "outgoing_letters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_letters" ADD CONSTRAINT "generated_letters_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_letters" ADD CONSTRAINT "generated_letters_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_letters" ADD CONSTRAINT "generated_letters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter_approvals" ADD CONSTRAINT "letter_approvals_outgoing_letter_id_fkey" FOREIGN KEY ("outgoing_letter_id") REFERENCES "outgoing_letters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter_approvals" ADD CONSTRAINT "letter_approvals_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter_approvals" ADD CONSTRAINT "letter_approvals_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_incoming_letter_id_fkey" FOREIGN KEY ("incoming_letter_id") REFERENCES "incoming_letters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_outgoing_letter_id_fkey" FOREIGN KEY ("outgoing_letter_id") REFERENCES "outgoing_letters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_generated_letter_id_fkey" FOREIGN KEY ("generated_letter_id") REFERENCES "generated_letters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

