-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_rombel_id_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_subject_id_fkey";

-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "online_class_id" BIGINT,
ALTER COLUMN "academic_year" DROP NOT NULL,
ALTER COLUMN "rombel_id" DROP NOT NULL,
ALTER COLUMN "semester" DROP NOT NULL,
ALTER COLUMN "subject_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "kkm" INTEGER;

-- CreateTable
CREATE TABLE "assessment_rubrics" (
    "id" BIGSERIAL NOT NULL,
    "subject_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "AssessmentType" NOT NULL DEFAULT 'TUGAS',
    "weight" INTEGER NOT NULL DEFAULT 1,
    "max_score" DECIMAL(65,30) NOT NULL DEFAULT 100,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_criteria" (
    "id" BIGSERIAL NOT NULL,
    "rubric_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "max_score" DECIMAL(65,30) NOT NULL DEFAULT 25,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rubric_criteria_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "assessment_rubrics" ADD CONSTRAINT "assessment_rubrics_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_criteria" ADD CONSTRAINT "rubric_criteria_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "assessment_rubrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_online_class_id_fkey" FOREIGN KEY ("online_class_id") REFERENCES "online_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "class_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
