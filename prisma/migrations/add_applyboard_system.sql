-- Add Education Level and Document Type Enums
CREATE TYPE "EducationLevel" AS ENUM (
  'HIGH_SCHOOL',          -- SHS/Secondary School
  'FOUNDATION',           -- Foundation/Preparatory Year
  'DIPLOMA',              -- Diploma programs
  'UNDERGRADUATE',        -- Bachelor's degree
  'POSTGRADUATE_DIPLOMA', -- PG Diploma
  'MASTERS',              -- Master's degree
  'DOCTORATE',            -- PhD
  'CERTIFICATE',          -- Short certificate programs
  'PROFESSIONAL'          -- Professional certifications
);

CREATE TYPE "DocumentType" AS ENUM (
  -- Educational Documents
  'WASSCE_RESULT',
  'BECE_RESULT',
  'JHS_TRANSCRIPT',
  'SHS_TRANSCRIPT',
  'UNIVERSITY_TRANSCRIPT',
  'DEGREE_CERTIFICATE',
  'DIPLOMA_CERTIFICATE',
  'ACADEMIC_REFERENCE_LETTER',

  -- Identity Documents
  'PASSPORT_COPY',
  'BIRTH_CERTIFICATE',
  'NATIONAL_ID',
  'PASSPORT_PHOTO',

  -- Test Scores
  'TOEFL_SCORE',
  'IELTS_SCORE',
  'DUOLINGO_SCORE',
  'PTE_SCORE',
  'SAT_SCORE',
  'ACT_SCORE',
  'GRE_SCORE',
  'GMAT_SCORE',

  -- Application Documents
  'STATEMENT_OF_PURPOSE',
  'PERSONAL_STATEMENT',
  'MOTIVATION_LETTER',
  'CV_RESUME',
  'PORTFOLIO',
  'RESEARCH_PROPOSAL',

  -- Financial Documents
  'BANK_STATEMENT',
  'SPONSOR_LETTER',
  'SCHOLARSHIP_LETTER',
  'FINANCIAL_GUARANTEE',

  -- Medical & Legal
  'MEDICAL_CERTIFICATE',
  'VACCINATION_RECORD',
  'POLICE_CLEARANCE',
  'CHARACTER_REFERENCE',

  -- Other
  'WORK_EXPERIENCE_LETTER',
  'INTERNSHIP_CERTIFICATE',
  'EXTRACURRICULAR_CERTIFICATE',
  'OTHER'
);

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

CREATE TYPE "GradingSystem" AS ENUM (
  'PERCENTAGE',      -- 0-100%
  'GPA_4',          -- 0.0-4.0
  'GPA_5',          -- 0.0-5.0
  'CGPA_10',        -- 0.0-10.0
  'LETTER',         -- A, B, C, D, F
  'WASSCE',         -- A1, B2, C3, etc.
  'FIRST_CLASS',    -- First Class, Second Upper, etc.
  'OTHER'
);

-- User Academic Profile (Education History)
CREATE TABLE "user_academic_profiles" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL UNIQUE,
  "current_education_level" "EducationLevel",
  "highest_education_level" "EducationLevel",
  "intended_study_level" "EducationLevel",
  "field_of_study" VARCHAR(200),
  "preferred_countries" JSONB, -- Array of country codes
  "study_preferences" JSONB,   -- Study preferences like campus/online, full-time/part-time
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),

  CONSTRAINT "fk_user_academic_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Education History Entries
CREATE TABLE "user_education_history" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- User Document Library
CREATE TABLE "user_documents" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
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
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),

  CONSTRAINT "fk_document_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- User Test Scores
CREATE TABLE "user_test_scores" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Program Requirements (Detailed requirements for each program)
CREATE TABLE "program_requirements" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "program_id" TEXT NOT NULL,
  "education_level" "EducationLevel" NOT NULL,

  -- Academic Requirements
  "minimum_gpa" DECIMAL(3,2),
  "grading_system" "GradingSystem",
  "required_documents" JSONB NOT NULL, -- Array of DocumentType

  -- Test Score Requirements
  "toefl_minimum" INTEGER,
  "ielts_minimum" DECIMAL(2,1),
  "duolingo_minimum" INTEGER,
  "pte_minimum" INTEGER,
  "sat_minimum" INTEGER,
  "act_minimum" INTEGER,
  "gre_minimum" INTEGER,
  "gmat_minimum" INTEGER,

  -- Other Requirements
  "work_experience_required" BOOLEAN DEFAULT FALSE,
  "minimum_work_experience_years" INTEGER,
  "age_requirement" JSONB, -- {min: 18, max: 35}
  "required_prerequisites" JSONB, -- Specific courses or qualifications
  "additional_requirements" TEXT,

  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),

  CONSTRAINT "fk_requirement_program" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE
);

-- Program Eligibility Matching
CREATE TABLE "program_eligibility" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "program_id" TEXT NOT NULL,
  "eligibility_score" INTEGER DEFAULT 0, -- 0-100
  "is_eligible" BOOLEAN DEFAULT FALSE,
  "missing_requirements" JSONB, -- Array of missing items
  "met_requirements" JSONB,     -- Array of met items
  "recommendation_notes" TEXT,
  "last_calculated_at" TIMESTAMP DEFAULT NOW(),
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),

  CONSTRAINT "fk_eligibility_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_eligibility_program" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE,
  CONSTRAINT "unique_user_program_eligibility" UNIQUE("user_id", "program_id")
);

-- Document Templates (What documents are needed for different program types)
CREATE TABLE "document_templates" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "education_level" "EducationLevel" NOT NULL,
  "required_documents" JSONB NOT NULL, -- Array of DocumentType
  "optional_documents" JSONB,          -- Array of DocumentType
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX "idx_user_documents_user_id" ON "user_documents"("user_id");
CREATE INDEX "idx_user_documents_type" ON "user_documents"("document_type");
CREATE INDEX "idx_user_education_user_id" ON "user_education_history"("user_id");
CREATE INDEX "idx_user_test_scores_user_id" ON "user_test_scores"("user_id");
CREATE INDEX "idx_program_requirements_program_id" ON "program_requirements"("program_id");
CREATE INDEX "idx_program_eligibility_user_id" ON "program_eligibility"("user_id");
CREATE INDEX "idx_program_eligibility_program_id" ON "program_eligibility"("program_id");
CREATE INDEX "idx_program_eligibility_eligible" ON "program_eligibility"("user_id", "is_eligible");
