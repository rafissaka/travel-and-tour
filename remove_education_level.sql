-- Remove old educationLevel column if it exists
ALTER TABLE program_requirements DROP COLUMN IF EXISTS education_level;
