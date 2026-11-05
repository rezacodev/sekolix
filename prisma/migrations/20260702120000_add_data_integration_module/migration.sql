-- CreateEnum
CREATE TYPE "IntegrationDirection" AS ENUM ('IMPORT', 'EXPORT', 'BOTH');

-- CreateEnum
CREATE TYPE "ImportBatchStatus" AS ENUM ('UPLOADED', 'VALIDATED', 'IMPORTED', 'FAILED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "ValidationSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR');

-- CreateTable
CREATE TABLE "data_integration_profiles" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target_system" TEXT NOT NULL,
    "school_level" TEXT NOT NULL DEFAULT 'GENERAL',
    "direction" "IntegrationDirection" NOT NULL DEFAULT 'BOTH',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_integration_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_field_mappings" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "internal_field" TEXT NOT NULL,
    "target_field" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "transform" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_field_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "file_name" TEXT,
    "source_url" TEXT,
    "status" "ImportBatchStatus" NOT NULL DEFAULT 'UPLOADED',
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "valid_rows" INTEGER NOT NULL DEFAULT 0,
    "error_rows" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT,
    "imported_at" TIMESTAMP(3),
    "rolled_back_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batch_rows" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "raw_data" JSONB NOT NULL,
    "mapped_data" JSONB,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "errors" JSONB,
    "created_record_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batch_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_batches" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'XLSX',
    "file_name" TEXT,
    "row_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "export_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_validation_rules" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT,
    "entity" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "severity" "ValidationSeverity" NOT NULL DEFAULT 'WARNING',
    "message" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_validation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_validation_issues" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "record_id" TEXT,
    "field" TEXT NOT NULL,
    "severity" "ValidationSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'SYSTEM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_validation_issues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "data_integration_profiles_code_key" ON "data_integration_profiles"("code");

-- CreateIndex
CREATE INDEX "data_integration_profiles_target_system_school_level_idx" ON "data_integration_profiles"("target_system", "school_level");

-- CreateIndex
CREATE INDEX "data_field_mappings_entity_idx" ON "data_field_mappings"("entity");

-- CreateIndex
CREATE UNIQUE INDEX "data_field_mappings_profile_id_entity_internal_field_target_f_key" ON "data_field_mappings"("profile_id", "entity", "internal_field", "target_field");

-- CreateIndex
CREATE INDEX "import_batches_profile_id_entity_idx" ON "import_batches"("profile_id", "entity");

-- CreateIndex
CREATE INDEX "import_batches_status_created_at_idx" ON "import_batches"("status", "created_at");

-- CreateIndex
CREATE INDEX "import_batch_rows_status_idx" ON "import_batch_rows"("status");

-- CreateIndex
CREATE INDEX "import_batch_rows_created_record_id_idx" ON "import_batch_rows"("created_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "import_batch_rows_batch_id_row_number_key" ON "import_batch_rows"("batch_id", "row_number");

-- CreateIndex
CREATE INDEX "export_batches_profile_id_entity_idx" ON "export_batches"("profile_id", "entity");

-- CreateIndex
CREATE INDEX "export_batches_created_at_idx" ON "export_batches"("created_at");

-- CreateIndex
CREATE INDEX "data_validation_rules_entity_field_idx" ON "data_validation_rules"("entity", "field");

-- CreateIndex
CREATE INDEX "data_validation_rules_profile_id_idx" ON "data_validation_rules"("profile_id");

-- CreateIndex
CREATE INDEX "data_validation_issues_entity_status_idx" ON "data_validation_issues"("entity", "status");

-- CreateIndex
CREATE INDEX "data_validation_issues_severity_created_at_idx" ON "data_validation_issues"("severity", "created_at");

-- CreateIndex
CREATE INDEX "data_validation_issues_record_id_idx" ON "data_validation_issues"("record_id");

-- AddForeignKey
ALTER TABLE "data_field_mappings" ADD CONSTRAINT "data_field_mappings_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "data_integration_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "data_integration_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batch_rows" ADD CONSTRAINT "import_batch_rows_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_batches" ADD CONSTRAINT "export_batches_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "data_integration_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_validation_rules" ADD CONSTRAINT "data_validation_rules_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "data_integration_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
