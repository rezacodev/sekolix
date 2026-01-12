/*
  Warnings:

  - You are about to drop the column `subject_id` on the `class_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `teacher_id` on the `class_schedules` table. All the data in the column will be lost.
  - Added the required column `teacher_subject_id` to the `class_schedules` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns as nullable first
ALTER TABLE "class_schedules" 
  ADD COLUMN "period" INTEGER,
  ADD COLUMN "teacher_subject_id" BIGINT,
  ALTER COLUMN "start_time" DROP NOT NULL,
  ALTER COLUMN "end_time" DROP NOT NULL;

-- Step 2: Migrate existing data
-- Create or find TeacherSubject records for existing schedules and link them
DO $$
DECLARE
  schedule_record RECORD;
  teacher_subject_id_val BIGINT;
BEGIN
  FOR schedule_record IN 
    SELECT id, class_id, rombel_id, subject_id, teacher_id 
    FROM class_schedules 
    WHERE teacher_id IS NOT NULL AND subject_id IS NOT NULL
  LOOP
    -- Try to find existing TeacherSubject
    -- Check for rombel-specific mapping first
    IF schedule_record.rombel_id IS NOT NULL THEN
      SELECT id INTO teacher_subject_id_val
      FROM teacher_subjects
      WHERE teacher_id = schedule_record.teacher_id
        AND subject_id = schedule_record.subject_id
        AND rombel_id = schedule_record.rombel_id
      LIMIT 1;
    END IF;
    
    -- If not found and rombel_id exists, create rombel-specific mapping
    IF teacher_subject_id_val IS NULL AND schedule_record.rombel_id IS NOT NULL THEN
      -- Check if we can create it (unique constraint check)
      IF NOT EXISTS (
        SELECT 1 FROM teacher_subjects 
        WHERE teacher_id = schedule_record.teacher_id 
          AND subject_id = schedule_record.subject_id 
          AND rombel_id = schedule_record.rombel_id
      ) THEN
        INSERT INTO teacher_subjects (teacher_id, subject_id, class_id, rombel_id, created_at, updated_at)
        VALUES (schedule_record.teacher_id, schedule_record.subject_id, schedule_record.class_id, schedule_record.rombel_id, NOW(), NOW())
        ON CONFLICT (teacher_id, subject_id, rombel_id) DO NOTHING
        RETURNING id INTO teacher_subject_id_val;
        
        -- If insert failed due to conflict, fetch the existing one
        IF teacher_subject_id_val IS NULL THEN
          SELECT id INTO teacher_subject_id_val
          FROM teacher_subjects
          WHERE teacher_id = schedule_record.teacher_id
            AND subject_id = schedule_record.subject_id
            AND rombel_id = schedule_record.rombel_id
          LIMIT 1;
        END IF;
      END IF;
    END IF;
    
    -- If still not found, try class-level mapping
    IF teacher_subject_id_val IS NULL THEN
      SELECT id INTO teacher_subject_id_val
      FROM teacher_subjects
      WHERE teacher_id = schedule_record.teacher_id
        AND subject_id = schedule_record.subject_id
        AND class_id = schedule_record.class_id
        AND rombel_id IS NULL
      LIMIT 1;
    END IF;
    
    -- If not found, create class-level mapping
    IF teacher_subject_id_val IS NULL THEN
      INSERT INTO teacher_subjects (teacher_id, subject_id, class_id, rombel_id, created_at, updated_at)
      VALUES (schedule_record.teacher_id, schedule_record.subject_id, schedule_record.class_id, NULL, NOW(), NOW())
      ON CONFLICT (teacher_id, subject_id, class_id) DO NOTHING
      RETURNING id INTO teacher_subject_id_val;
      
      -- If insert failed due to conflict, fetch the existing one
      IF teacher_subject_id_val IS NULL THEN
        SELECT id INTO teacher_subject_id_val
        FROM teacher_subjects
        WHERE teacher_id = schedule_record.teacher_id
          AND subject_id = schedule_record.subject_id
          AND class_id = schedule_record.class_id
          AND rombel_id IS NULL
        LIMIT 1;
      END IF;
    END IF;
    
    -- Update the schedule with the teacher_subject_id
    IF teacher_subject_id_val IS NOT NULL THEN
      UPDATE class_schedules
      SET teacher_subject_id = teacher_subject_id_val
      WHERE id = schedule_record.id;
    END IF;
  END LOOP;
END $$;

-- Step 3: Make teacher_subject_id NOT NULL
ALTER TABLE "class_schedules" 
  ALTER COLUMN "teacher_subject_id" SET NOT NULL;

-- Step 4: Drop old foreign keys and columns
ALTER TABLE "class_schedules" DROP CONSTRAINT "class_schedules_subject_id_fkey";
ALTER TABLE "class_schedules" DROP CONSTRAINT "class_schedules_teacher_id_fkey";

ALTER TABLE "class_schedules" 
  DROP COLUMN "subject_id",
  DROP COLUMN "teacher_id";

-- Step 5: Add new foreign key
ALTER TABLE "class_schedules" 
  ADD CONSTRAINT "class_schedules_teacher_subject_id_fkey" 
  FOREIGN KEY ("teacher_subject_id") REFERENCES "teacher_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
