-- CreateTable
CREATE TABLE "grade_scales" (
    "id" SERIAL NOT NULL,
    "grade" TEXT NOT NULL,
    "min_score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "label" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_scales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grade_scales_grade_key" ON "grade_scales"("grade");
