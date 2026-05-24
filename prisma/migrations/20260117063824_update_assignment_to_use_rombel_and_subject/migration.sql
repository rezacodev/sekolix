/*
  Warnings:

  - You are about to drop the column `online_class_id` on the `assignments` table. All the data in the column will be lost.
  - Added the required column `academic_year` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rombel_id` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_id` to the `assignments` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns with nullable first
ALTER TABLE "assignments" 
ADD COLUMN "academic_year" TEXT,
ADD COLUMN "rombel_id" BIGINT,
ADD COLUMN "semester" INTEGER,
ADD COLUMN "subject_id" BIGINT;

-- Step 2: Migrate data from online_class to new structure
-- Get active tahun ajaran
DO $$
DECLARE
  active_year TEXT;
  current_sem INTEGER;
BEGIN
  -- Get active academic year
  SELECT label INTO active_year FROM tahun_ajaran WHERE "isActive" = true LIMIT 1;
  
  -- Determine current semester (default to 1 if no active year)
  current_sem := 1;
  
  -- If we have an active year, determine semester based on date
  IF active_year IS NOT NULL THEN
    SELECT CASE 
      WHEN CURRENT_DATE < ("startDate" + ("endDate" - "startDate") / 2) THEN 1
      ELSE 2
    END INTO current_sem
    FROM tahun_ajaran WHERE "isActive" = true LIMIT 1;
  END IF;
  
  -- Set default academic year if none exists
  IF active_year IS NULL THEN
    active_year := '2025/2026';
  END IF;
  
  -- Migrate data: match online_class to first available rombel with same class and subject
  UPDATE assignments a
  SET 
    subject_id = oc.subject_id,
    academic_year = active_year,
    semester = current_sem,
    rombel_id = COALESCE(
      (SELECT r.id FROM class_groups r 
       WHERE r.class_id = oc.class_id 
       AND r.deleted_at IS NULL 
       ORDER BY r.id LIMIT 1),
      1 -- fallback to ID 1 if no rombel found
    )
  FROM online_classes oc
  WHERE a.online_class_id = oc.id;
END $$;

-- Step 3: Make columns NOT NULL after migration
ALTER TABLE "assignments" 
ALTER COLUMN "academic_year" SET NOT NULL,
ALTER COLUMN "rombel_id" SET NOT NULL,
ALTER COLUMN "semester" SET NOT NULL,
ALTER COLUMN "subject_id" SET NOT NULL;

-- Step 4: Drop old foreign key and column
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_online_class_id_fkey";
ALTER TABLE "assignments" DROP COLUMN "online_class_id";

-- Step 5: Add new foreign keys
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_rombel_id_fkey" FOREIGN KEY ("rombel_id") REFERENCES "class_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
