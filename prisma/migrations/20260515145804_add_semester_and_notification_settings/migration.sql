-- CreateTable
CREATE TABLE "semesters" (
    "id" SERIAL NOT NULL,
    "tahunAjaranId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_notification_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "smtp_host" TEXT,
    "smtp_port" INTEGER DEFAULT 587,
    "smtp_user" TEXT,
    "smtp_pass" TEXT,
    "from_email" TEXT,
    "from_name" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_notification_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "in_app_notification_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "new_applicant" BOOLEAN NOT NULL DEFAULT true,
    "payment_received" BOOLEAN NOT NULL DEFAULT true,
    "grade_submitted" BOOLEAN NOT NULL DEFAULT false,
    "new_assignment" BOOLEAN NOT NULL DEFAULT false,
    "attendance_summary" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "in_app_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "semesters_tahunAjaranId_number_key" ON "semesters"("tahunAjaranId", "number");

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahun_ajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
