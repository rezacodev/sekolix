-- CreateTable
CREATE TABLE "teaching_materials" (
    "id" BIGSERIAL NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "class_id" BIGINT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_url" TEXT,
    "file_type" TEXT,
    "file_name" TEXT,
    "file_size" BIGINT,
    "external_link" TEXT,
    "chapter" TEXT,
    "tags" TEXT,
    "published_at" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teaching_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teaching_materials_teacher_id_idx" ON "teaching_materials"("teacher_id");

-- CreateIndex
CREATE INDEX "teaching_materials_subject_id_idx" ON "teaching_materials"("subject_id");

-- CreateIndex
CREATE INDEX "teaching_materials_class_id_idx" ON "teaching_materials"("class_id");

-- CreateIndex
CREATE INDEX "teaching_materials_published_at_idx" ON "teaching_materials"("published_at");

-- AddForeignKey
ALTER TABLE "teaching_materials" ADD CONSTRAINT "teaching_materials_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "gtk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_materials" ADD CONSTRAINT "teaching_materials_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_materials" ADD CONSTRAINT "teaching_materials_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
