-- Add GPA, grading system, and institution name to user_academic_profiles
ALTER TABLE user_academic_profiles
ADD COLUMN IF NOT EXISTS gpa VARCHAR(50),
ADD COLUMN IF NOT EXISTS grading_system VARCHAR(50),
ADD COLUMN IF NOT EXISTS institution_name VARCHAR(300);
