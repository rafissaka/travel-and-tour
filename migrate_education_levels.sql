-- Migration: Change from single education_level to accepted_education_levels array
-- This allows programs to accept multiple education levels (e.g., Masters program accepting both Undergraduate and Postgraduate Diploma holders)

-- Step 1: Add new column as JSONB array
ALTER TABLE program_requirements 
ADD COLUMN IF NOT EXISTS accepted_education_levels JSONB;

-- Step 2: Migrate existing data - convert single educationLevel to array
UPDATE program_requirements 
SET accepted_education_levels = jsonb_build_array(education_level::text)
WHERE accepted_education_levels IS NULL AND education_level IS NOT NULL;

-- Step 3: Set default for any null values (empty array)
UPDATE program_requirements 
SET accepted_education_levels = '[]'::jsonb
WHERE accepted_education_levels IS NULL;

-- Step 4: Make the new column NOT NULL
ALTER TABLE program_requirements 
ALTER COLUMN accepted_education_levels SET NOT NULL;

-- Step 5: Drop the old column
ALTER TABLE program_requirements 
DROP COLUMN IF EXISTS education_level;

-- Step 6: Add institutional requirement columns if they don't exist
ALTER TABLE program_requirements 
ADD COLUMN IF NOT EXISTS accepted_institutions JSONB;

ALTER TABLE program_requirements 
ADD COLUMN IF NOT EXISTS accepted_courses JSONB;

ALTER TABLE program_requirements 
ADD COLUMN IF NOT EXISTS accepted_funding_types JSONB;

ALTER TABLE program_requirements 
ADD COLUMN IF NOT EXISTS require_completion_date BOOLEAN DEFAULT FALSE;

ALTER TABLE program_requirements 
ADD COLUMN IF NOT EXISTS minimum_study_duration_months INTEGER;

-- Step 7: Add course_of_study to user_documents if it doesn't exist
ALTER TABLE user_documents 
ADD COLUMN IF NOT EXISTS course_of_study VARCHAR(300);
