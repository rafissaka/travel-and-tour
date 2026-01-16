-- ApplyBoard System Migration with Multi-Select Education Levels
-- This creates all the necessary tables for the document-first application system

-- Add Education Level and Document Type Enums
DO $$ BEGIN
  CREATE TYPE "EducationLevel" AS ENUM (
    'HIGH_SCHOOL',
    'FOUNDATION',
    'DIPLOMA',
    'UNDERGRADUATE',
    'POSTGRADUATE_DIPLOMA',
    'MASTERS',
    'DOCTORATE',
    'CERTIFICATE',
    'PROFESSIONAL'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "DocumentType" AS ENUM (
    'WASSCE_RESULT',
    'BECE_RESULT',
    'JHS_TRANSCRIPT',
    'SHS_TRANSCRIPT',
    'UNIVERSITY_TRANSCRIPT',
    'DEGREE_CERTIFICATE',
    'DIPLOMA_CERTIFICATE',
    'ACADEMIC_REFERENCE_LETTER',
    'PASSPORT_COPY',
    'BIRTH_CERTIFICATE',
    'NATIONAL_ID',
    'PASSPORT_PHOTO',
    'TOEFL_SCORE',
    'IELTS_SCORE',
    'DUOLINGO_SCORE',
    'PTE_SCORE',
    'SAT_SCORE',
    'ACT_SCORE',
    'GRE_SCORE',
    'GMAT_SCORE',
    'STATEMENT_OF_PURPOSE',
    'PERSONAL_STATEMENT',
    'MOTIVATION_LETTER',
    'CV_RESUME',
    'PORTFOLIO',
    'RESEARCH_PROPOSAL',
    'BANK_STATEMENT',
    'SPONSOR_LETTER',
    'SCHOLARSHIP_LETTER',
    'FINANCIAL_GUARANTEE',
    'MEDICAL_CERTIFICATE',
    'VACCINATION_RECORD',
    'POLICE_CLEARANCE',
    'CHARACTER_REFERENCE',
    'WORK_EXPERIENCE_LETTER',
    'INTERNSHIP_CERTIFICATE',
    'EXTRACURRICULAR_CERTIFICATE',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TestType" AS ENUM (
    'TOEFL',
    'IELTS',
    'DUOLINGO',
    'PTE',
    'SAT',
    'ACT',
    'GRE',
    'GMAT',
    'MCAT',
    'LSAT'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "GradingSystem" AS ENUM (
    'PERCENTAGE',
    'GPA_4',
    'GPA_5',
    'CGPA_10',
    'LETTER',
    'WASSCE',
    'FIRST_CLASS',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- User Academic Profile
CREATE TABLE IF NOT EXISTS "user_academic_profiles" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL UNIQUE,
  "current_education_level" "EducationLevel",
  "highest_education_level" "EducationLevel",
  "intended_study_level" "EducationLevel",
  "field_of_study" VARCHAR(200),
  "preferred_countries" JSONB,
  "study_preferences" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),

  CONSTRAINT "fk_user_academic_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Education History
CREATE TABLE IF NOT EXISTS "user_education_history" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "institution_name" VARCHAR(300) NOT NULL,
  "institution_country" VARCHAR(100),
  "education_level" "EducationLevel" NOT NULL,
  "field_of_study" VARCHAR(200),
  "start_date" DATE,
  "end_date" DATE,
  "is_current" BOOLEAN DEFAULT FALSE,
  "grade" VARCHAR(20),
  "grading_system" "GradingSystem",
  "graduated" BOOLEAN DEFAULT FALSE,
  "certificate_url" TEXT,
  "transcript_url" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),

  CONSTRAINT "fk_education_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- User Documents with Institutional Information
CREATE TABLE IF NOT EXISTS "user_documents" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "document_type" "DocumentType" NOT NULL,
  "document_name" VARCHAR(300) NOT NULL,
  "file_url" TEXT NOT NULL,
  "file_size" INTEGER,
  "mime_type" VARCHAR(100),
  "issue_date" DATE,
  "expiry_date" DATE,
  "issuing_authority" VARCHAR(200),
  "document_number" VARCHAR(100),
  "is_verified" BOOLEAN DEFAULT FALSE,
  "verified_at" TIMESTAMP,
  "verified_by" TEXT,
  "notes" TEXT,
  -- Institutional Information (for educational documents)
  "institution_name" VARCHAR(300),
  "course_of_study" VARCHAR(300),
  "start_date" DATE,
  "end_date" DATE,
  "completion_date" DATE,
  "funding_type" VARCHAR(50),
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),

  CONSTRAINT "fk_document_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- User Test Scores
CREATE TABLE IF NOT EXISTS "user_test_scores" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "test_type" "TestType" NOT NULL,
  "test_date" DATE,
  "overall_score" VARCHAR(20),
  "reading_score" VARCHAR(20),
  "writing_score" VARCHAR(20),
  "listening_score" VARCHAR(20),
  "speaking_score" VARCHAR(20),
  "analytical_writing" VARCHAR(20),
  "quantitative_score" VARCHAR(20),
  "verbal_score" VARCHAR(20),
  "score_document_url" TEXT,
  "is_verified" BOOLEAN DEFAULT FALSE,
  "expiry_date" DATE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),

  CONSTRAINT "fk_test_score_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Program Requirements with Multi-Select Education Levels and Institutional Requirements
CREATE TABLE IF NOT EXISTS "program_requirements" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "program_id" TEXT NOT NULL,
  -- Multi-select education levels (array stored as JSONB)
  "accepted_education_levels" JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Academic Requirements
  "minimum_gpa" DECIMAL(3,2),
  "grading_system" "GradingSystem",
  "required_documents" JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Test Score Requirements
  "toefl_minimum" INTEGER,
  "ielts_minimum" DECIMAL(2,1),
  "duolingo_minimum" INTEGER,
  "pte_minimum" INTEGER,
  "sat_minimum" INTEGER,
  "act_minimum" INTEGER,
  "gre_minimum" INTEGER,
  "gmat_minimum" INTEGER,

  -- Work Experience
  "work_experience_required" BOOLEAN DEFAULT FALSE,
  "minimum_work_experience_years" INTEGER,
  
  -- Other Requirements
  "age_requirement" JSONB,
  "required_prerequisites" JSONB,
  "additional_requirements" TEXT,

  -- Institutional Requirements (matching user document upload fields)
  "accepted_institutions" JSONB,
  "accepted_courses" JSONB,
  "accepted_funding_types" JSONB,
  "require_completion_date" BOOLEAN DEFAULT FALSE,
  "minimum_study_duration_months" INTEGER,

  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),

  CONSTRAINT "fk_requirement_program" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE
);

-- Program Eligibility
CREATE TABLE IF NOT EXISTS "program_eligibility" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "program_id" TEXT NOT NULL,
  "eligibility_score" INTEGER DEFAULT 0,
  "is_eligible" BOOLEAN DEFAULT FALSE,
  "missing_requirements" JSONB,
  "met_requirements" JSONB,
  "recommendation_notes" TEXT,
  "last_calculated_at" TIMESTAMP DEFAULT NOW(),
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),

  CONSTRAINT "fk_eligibility_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_eligibility_program" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE,
  CONSTRAINT "unique_user_program_eligibility" UNIQUE("user_id", "program_id")
);

-- Document Templates
CREATE TABLE IF NOT EXISTS "document_templates" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "education_level" "EducationLevel" NOT NULL,
  "required_documents" JSONB NOT NULL,
  "optional_documents" JSONB,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_user_documents_user_id" ON "user_documents"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_documents_type" ON "user_documents"("document_type");
CREATE INDEX IF NOT EXISTS "idx_user_education_user_id" ON "user_education_history"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_test_scores_user_id" ON "user_test_scores"("user_id");
CREATE INDEX IF NOT EXISTS "idx_program_requirements_program_id" ON "program_requirements"("program_id");
CREATE INDEX IF NOT EXISTS "idx_program_eligibility_user_id" ON "program_eligibility"("user_id");
CREATE INDEX IF NOT EXISTS "idx_program_eligibility_program_id" ON "program_eligibility"("program_id");
CREATE INDEX IF NOT EXISTS "idx_program_eligibility_eligible" ON "program_eligibility"("user_id", "is_eligible");
