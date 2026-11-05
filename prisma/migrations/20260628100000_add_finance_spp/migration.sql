-- Sprint 2: Keuangan/SPP MVP

CREATE TABLE "financial_billing_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'ONE_TIME',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_billing_types_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "billing_type_id" TEXT NOT NULL,
    "academic_year_id" TEXT,
    "rombel_id" BIGINT,
    "period_month" INTEGER,
    "period_year" INTEGER,
    "due_date" DATE NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "late_fee_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "paid_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "notes" TEXT,
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_payments" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "payment_number" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "method" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VALIDATED',
    "received_by" TEXT,
    "validated_by" TEXT,
    "proof_url" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_invoice_discounts" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "reason" TEXT,
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_invoice_discounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_invoice_late_fees" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "reason" TEXT,
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_invoice_late_fees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "parent_payment_proofs" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "transfer_date" DATE NOT NULL,
    "proof_url" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_payment_proofs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "financial_billing_types_code_key" ON "financial_billing_types"("code");
CREATE UNIQUE INDEX "student_invoices_invoice_number_key" ON "student_invoices"("invoice_number");
CREATE UNIQUE INDEX "student_payments_payment_number_key" ON "student_payments"("payment_number");

CREATE INDEX "student_invoices_student_id_status_idx" ON "student_invoices"("student_id", "status");
CREATE INDEX "student_invoices_billing_type_id_idx" ON "student_invoices"("billing_type_id");
CREATE INDEX "student_invoices_academic_year_id_idx" ON "student_invoices"("academic_year_id");
CREATE INDEX "student_invoices_rombel_id_idx" ON "student_invoices"("rombel_id");
CREATE INDEX "student_invoices_due_date_status_idx" ON "student_invoices"("due_date", "status");
CREATE INDEX "student_payments_invoice_id_idx" ON "student_payments"("invoice_id");
CREATE INDEX "student_payments_paid_at_status_idx" ON "student_payments"("paid_at", "status");
CREATE INDEX "student_invoice_discounts_invoice_id_idx" ON "student_invoice_discounts"("invoice_id");
CREATE INDEX "student_invoice_late_fees_invoice_id_idx" ON "student_invoice_late_fees"("invoice_id");
CREATE INDEX "parent_payment_proofs_invoice_id_idx" ON "parent_payment_proofs"("invoice_id");
CREATE INDEX "parent_payment_proofs_parent_id_status_idx" ON "parent_payment_proofs"("parent_id", "status");

ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_billing_type_id_fkey" FOREIGN KEY ("billing_type_id") REFERENCES "financial_billing_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "tahun_ajaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "class_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "student_payments" ADD CONSTRAINT "student_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "student_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_invoice_discounts" ADD CONSTRAINT "student_invoice_discounts_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "student_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_invoice_late_fees" ADD CONSTRAINT "student_invoice_late_fees_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "student_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "parent_payment_proofs" ADD CONSTRAINT "parent_payment_proofs_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "student_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "parent_payment_proofs" ADD CONSTRAINT "parent_payment_proofs_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_guardians"("id") ON DELETE CASCADE ON UPDATE CASCADE;
