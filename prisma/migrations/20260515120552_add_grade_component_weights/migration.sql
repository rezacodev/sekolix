-- CreateTable
CREATE TABLE "grade_component_weights" (
    "id" SERIAL NOT NULL,
    "component" "AssessmentType" NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_component_weights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grade_component_weights_component_key" ON "grade_component_weights"("component");
