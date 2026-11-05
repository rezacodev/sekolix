-- Sprint 4: Perpustakaan

CREATE TABLE "library_categories" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "library_books" (
    "id" TEXT NOT NULL,
    "category_id" TEXT,
    "isbn" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "author" TEXT,
    "publisher" TEXT,
    "publication_year" INTEGER,
    "language" TEXT NOT NULL DEFAULT 'id',
    "pages" INTEGER,
    "description" TEXT,
    "cover_url" TEXT,
    "location" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_books_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "library_copies" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "qr_code" TEXT,
    "acquisition_date" DATE,
    "source" TEXT,
    "price" DECIMAL(14,2),
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_copies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "library_members" (
    "id" TEXT NOT NULL,
    "member_code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "student_id" TEXT,
    "staff_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "joined_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "library_loans" (
    "id" TEXT NOT NULL,
    "copy_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "borrowed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMP(3) NOT NULL,
    "returned_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "condition_on_borrow" TEXT NOT NULL DEFAULT 'GOOD',
    "condition_on_return" TEXT,
    "notes" TEXT,
    "processed_by" TEXT,
    "returned_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_loans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "library_fines" (
    "id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "paid_at" TIMESTAMP(3),
    "waived_at" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_fines_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "library_categories_code_key" ON "library_categories"("code");
CREATE UNIQUE INDEX "library_books_isbn_key" ON "library_books"("isbn");
CREATE UNIQUE INDEX "library_copies_barcode_key" ON "library_copies"("barcode");
CREATE UNIQUE INDEX "library_members_member_code_key" ON "library_members"("member_code");

CREATE INDEX "library_books_category_id_idx" ON "library_books"("category_id");
CREATE INDEX "library_books_title_idx" ON "library_books"("title");
CREATE INDEX "library_copies_book_id_status_idx" ON "library_copies"("book_id", "status");
CREATE INDEX "library_copies_status_condition_idx" ON "library_copies"("status", "condition");
CREATE INDEX "library_members_type_status_idx" ON "library_members"("type", "status");
CREATE INDEX "library_members_student_id_idx" ON "library_members"("student_id");
CREATE INDEX "library_members_staff_id_idx" ON "library_members"("staff_id");
CREATE INDEX "library_loans_member_id_status_idx" ON "library_loans"("member_id", "status");
CREATE INDEX "library_loans_copy_id_status_idx" ON "library_loans"("copy_id", "status");
CREATE INDEX "library_loans_due_at_status_idx" ON "library_loans"("due_at", "status");
CREATE INDEX "library_fines_loan_id_idx" ON "library_fines"("loan_id");
CREATE INDEX "library_fines_status_idx" ON "library_fines"("status");

ALTER TABLE "library_books" ADD CONSTRAINT "library_books_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "library_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "library_copies" ADD CONSTRAINT "library_copies_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "library_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "library_members" ADD CONSTRAINT "library_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "peserta_didik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "library_members" ADD CONSTRAINT "library_members_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "gtk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "library_loans" ADD CONSTRAINT "library_loans_copy_id_fkey" FOREIGN KEY ("copy_id") REFERENCES "library_copies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "library_loans" ADD CONSTRAINT "library_loans_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "library_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "library_loans" ADD CONSTRAINT "library_loans_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "library_loans" ADD CONSTRAINT "library_loans_returned_by_fkey" FOREIGN KEY ("returned_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "library_fines" ADD CONSTRAINT "library_fines_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "library_loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
