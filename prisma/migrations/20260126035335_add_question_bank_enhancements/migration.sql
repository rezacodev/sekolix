/*
  Warnings:

  - You are about to drop the column `answer` on the `question_banks` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `question_banks` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `question_banks` table. All the data in the column will be lost.
  - The `difficulty` column on the `question_banks` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `correct_answer` to the `question_banks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_text` to the `question_banks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_type` to the `question_banks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_id` to the `question_banks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('MUDAH', 'SEDANG', 'SULIT');

-- CreateEnum
CREATE TYPE "CognitiveLevel" AS ENUM ('MENGINGAT', 'MEMAHAMI', 'MENERAPKAN', 'MENGANALISIS', 'MENGEVALUASI', 'MENCIPTAKAN');

-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'MATCHING';

-- AlterTable
ALTER TABLE "question_banks" DROP COLUMN "answer",
DROP COLUMN "question",
DROP COLUMN "type",
ADD COLUMN     "cognitive_level" "CognitiveLevel" NOT NULL DEFAULT 'MEMAHAMI',
ADD COLUMN     "correct_answer" TEXT NOT NULL,
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_used_at" TIMESTAMP(3),
ADD COLUMN     "question_text" TEXT NOT NULL,
ADD COLUMN     "question_type" "QuestionType" NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "teacher_id" TEXT NOT NULL,
ADD COLUMN     "topic" TEXT,
ADD COLUMN     "usage_count" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'SEDANG';

-- AddForeignKey
ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "gtk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
