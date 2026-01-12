-- CreateTable
CREATE TABLE "subject_programs" (
    "id" BIGSERIAL NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "program_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_programs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subject_programs_subject_id_program_id_key" ON "subject_programs"("subject_id", "program_id");

-- AddForeignKey
ALTER TABLE "subject_programs" ADD CONSTRAINT "subject_programs_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_programs" ADD CONSTRAINT "subject_programs_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
