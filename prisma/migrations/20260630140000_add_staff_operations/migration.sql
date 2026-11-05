-- CreateTable
CREATE TABLE "staff_attendances" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "recorded_by" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_leave_requests" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'LEAVE',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "total_days" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "attachment_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_duty_schedules" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "duty_date" DATE NOT NULL,
    "shift" TEXT,
    "location" TEXT,
    "task" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_by" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_duty_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_documents" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "issued_at" DATE,
    "expires_at" DATE,
    "uploaded_by" TEXT,
    "is_sensitive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_contracts" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "contract_number" TEXT,
    "title" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "reminder_date" DATE,
    "file_url" TEXT,
    "created_by" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_assignment_letters" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "letter_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assignment_type" TEXT NOT NULL DEFAULT 'SURAT_TUGAS',
    "issued_at" DATE NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "file_url" TEXT,
    "module_source" TEXT NOT NULL DEFAULT 'PEGAWAI',
    "created_by" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_assignment_letters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_attendances_staff_id_date_key" ON "staff_attendances"("staff_id", "date");

-- CreateIndex
CREATE INDEX "staff_attendances_date_status_idx" ON "staff_attendances"("date", "status");

-- CreateIndex
CREATE INDEX "staff_attendances_recorded_by_idx" ON "staff_attendances"("recorded_by");

-- CreateIndex
CREATE INDEX "staff_leave_requests_staff_id_status_idx" ON "staff_leave_requests"("staff_id", "status");

-- CreateIndex
CREATE INDEX "staff_leave_requests_start_date_end_date_idx" ON "staff_leave_requests"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "staff_leave_requests_reviewed_by_idx" ON "staff_leave_requests"("reviewed_by");

-- CreateIndex
CREATE INDEX "staff_duty_schedules_duty_date_status_idx" ON "staff_duty_schedules"("duty_date", "status");

-- CreateIndex
CREATE INDEX "staff_duty_schedules_staff_id_duty_date_idx" ON "staff_duty_schedules"("staff_id", "duty_date");

-- CreateIndex
CREATE INDEX "staff_duty_schedules_created_by_idx" ON "staff_duty_schedules"("created_by");

-- CreateIndex
CREATE INDEX "staff_documents_staff_id_type_idx" ON "staff_documents"("staff_id", "type");

-- CreateIndex
CREATE INDEX "staff_documents_expires_at_idx" ON "staff_documents"("expires_at");

-- CreateIndex
CREATE INDEX "staff_documents_uploaded_by_idx" ON "staff_documents"("uploaded_by");

-- CreateIndex
CREATE INDEX "staff_contracts_staff_id_status_idx" ON "staff_contracts"("staff_id", "status");

-- CreateIndex
CREATE INDEX "staff_contracts_end_date_idx" ON "staff_contracts"("end_date");

-- CreateIndex
CREATE INDEX "staff_contracts_reminder_date_idx" ON "staff_contracts"("reminder_date");

-- CreateIndex
CREATE INDEX "staff_contracts_created_by_idx" ON "staff_contracts"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "staff_assignment_letters_letter_number_key" ON "staff_assignment_letters"("letter_number");

-- CreateIndex
CREATE INDEX "staff_assignment_letters_staff_id_issued_at_idx" ON "staff_assignment_letters"("staff_id", "issued_at");

-- CreateIndex
CREATE INDEX "staff_assignment_letters_created_by_idx" ON "staff_assignment_letters"("created_by");

-- AddForeignKey
ALTER TABLE "staff_attendances" ADD CONSTRAINT "staff_attendances_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "gtk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_attendances" ADD CONSTRAINT "staff_attendances_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_leave_requests" ADD CONSTRAINT "staff_leave_requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "gtk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_leave_requests" ADD CONSTRAINT "staff_leave_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_duty_schedules" ADD CONSTRAINT "staff_duty_schedules_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "gtk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_duty_schedules" ADD CONSTRAINT "staff_duty_schedules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_documents" ADD CONSTRAINT "staff_documents_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "gtk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_documents" ADD CONSTRAINT "staff_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_contracts" ADD CONSTRAINT "staff_contracts_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "gtk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_contracts" ADD CONSTRAINT "staff_contracts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_assignment_letters" ADD CONSTRAINT "staff_assignment_letters_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "gtk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_assignment_letters" ADD CONSTRAINT "staff_assignment_letters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

