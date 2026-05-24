-- AlterTable
ALTER TABLE "grades" ADD COLUMN     "rubric_id" BIGINT;

-- CreateTable
CREATE TABLE "rubric_scores" (
    "id" BIGSERIAL NOT NULL,
    "grade_id" BIGINT NOT NULL,
    "rubric_criterion_id" BIGINT NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rubric_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rubric_scores_grade_id_rubric_criterion_id_key" ON "rubric_scores"("grade_id", "rubric_criterion_id");

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "assessment_rubrics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_scores" ADD CONSTRAINT "rubric_scores_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_scores" ADD CONSTRAINT "rubric_scores_rubric_criterion_id_fkey" FOREIGN KEY ("rubric_criterion_id") REFERENCES "rubric_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
