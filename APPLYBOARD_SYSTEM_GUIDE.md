# ApplyBoard-Style Application System

## 🎯 Overview

This is a complete ApplyBoard-style scholarship/program application system that automatically matches users to programs based on their uploaded documents and qualifications.

### How It Works

1. **User uploads documents** → System stores them
2. **User completes academic profile** → System analyzes qualifications
3. **System calculates eligibility** → Matches user to programs
4. **User sees matched programs** → One-click apply with auto-filled data
5. **Admin reviews applications** → Verifies documents and approves

---

## 📚 System Components

### Database Models

#### 1. **UserAcademicProfile**
Stores user's complete academic information and preferences.

```typescript
{
  userId: string
  currentEducationLevel: EducationLevel
  highestEducationLevel: EducationLevel
  intendedStudyLevel: EducationLevel
  fieldOfStudy: string
  preferredCountries: string[]
  studyPreferences: object
}
```

#### 2. **UserEducationHistory**
Stores all education history (JHS, SHS, University, etc.)

```typescript
{
  userId: string
  institutionName: string
  institutionCountry: string
  educationLevel: EducationLevel
  fieldOfStudy: string
  startDate: Date
  endDate: Date
  isCurrent: boolean
  grade: string
  gradingSystem: GradingSystem
  graduated: boolean
  certificateUrl: string
  transcriptUrl: string
}
```

#### 3. **UserDocument**
Document library for all uploaded files

```typescript
{
  userId: string
  documentType: DocumentType
  documentName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  issueDate: Date
  expiryDate: Date
  issuingAuthority: string
  documentNumber: string
  isVerified: boolean
  verifiedAt: Date
  verifiedBy: string
  notes: string
}
```

#### 4. **UserTestScore**
Standardized test scores (TOEFL, IELTS, SAT, GRE, etc.)

```typescript
{
  userId: string
  testType: TestType
  testDate: Date
  overallScore: string
  readingScore: string
  writingScore: string
  listeningScore: string
  speakingScore: string
  analyticalWriting: string
  quantitativeScore: string
  verbalScore: string
  scoreDocumentUrl: string
  isVerified: boolean
  expiryDate: Date
}
```

#### 5. **ProgramRequirement**
Admin-defined requirements for each program

```typescript
{
  programId: string
  educationLevel: EducationLevel
  minimumGpa: decimal
  gradingSystem: GradingSystem
  requiredDocuments: DocumentType[]
  toeflMinimum: number
  ieltsMinimum: decimal
  duolingoMinimum: number
  pteMinimum: number
  satMinimum: number
  actMinimum: number
  greMinimum: number
  gmatMinimum: number
  workExperienceRequired: boolean
  minimumWorkExperienceYears: number
  ageRequirement: { min: number, max: number }
  requiredPrerequisites: object
  additionalRequirements: string
}
```

#### 6. **ProgramEligibility**
Calculated eligibility scores for each user-program pair

```typescript
{
  userId: string
  programId: string
  eligibilityScore: number (0-100)
  isEligible: boolean
  missingRequirements: string[]
  metRequirements: string[]
  recommendationNotes: string
  lastCalculatedAt: Date
}
```

---

## 🔌 API Endpoints

### User APIs

#### 1. Academic Profile
```
GET    /api/user/academic-profile
PATCH  /api/user/academic-profile
```

**Example Request (PATCH):**
```json
{
  "currentEducationLevel": "UNDERGRADUATE",
  "highestEducationLevel": "HIGH_SCHOOL",
  "intendedStudyLevel": "MASTERS",
  "fieldOfStudy": "Computer Science",
  "preferredCountries": ["USA", "Canada", "UK"]
}
```

#### 2. Education History
```
GET   /api/user/education-history
POST  /api/user/education-history
```

**Example Request (POST):**
```json
{
  "institutionName": "University of Ghana",
  "institutionCountry": "Ghana",
  "educationLevel": "UNDERGRADUATE",
  "fieldOfStudy": "Computer Science",
  "startDate": "2019-09-01",
  "endDate": "2023-06-30",
  "isCurrent": false,
  "grade": "3.5",
  "gradingSystem": "GPA_4",
  "graduated": true
}
```

#### 3. Documents
```
GET    /api/user/documents
POST   /api/user/documents
DELETE /api/user/documents?id=xxx
```

**Example Request (POST):**
```json
{
  "documentType": "WASSCE_RESULT",
  "documentName": "WASSCE Certificate 2019",
  "fileUrl": "https://storage.example.com/documents/wassce-2019.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf",
  "issueDate": "2019-08-01",
  "issuingAuthority": "WAEC"
}
```

**Document Types Available:**
- Educational: `WASSCE_RESULT`, `BECE_RESULT`, `JHS_TRANSCRIPT`, `SHS_TRANSCRIPT`, `UNIVERSITY_TRANSCRIPT`, `DEGREE_CERTIFICATE`, `DIPLOMA_CERTIFICATE`, `ACADEMIC_REFERENCE_LETTER`
- Identity: `PASSPORT_COPY`, `BIRTH_CERTIFICATE`, `NATIONAL_ID`, `PASSPORT_PHOTO`
- Test Scores: `TOEFL_SCORE`, `IELTS_SCORE`, `DUOLINGO_SCORE`, `PTE_SCORE`, `SAT_SCORE`, `ACT_SCORE`, `GRE_SCORE`, `GMAT_SCORE`
- Application: `STATEMENT_OF_PURPOSE`, `PERSONAL_STATEMENT`, `MOTIVATION_LETTER`, `CV_RESUME`, `PORTFOLIO`, `RESEARCH_PROPOSAL`
- Financial: `BANK_STATEMENT`, `SPONSOR_LETTER`, `SCHOLARSHIP_LETTER`, `FINANCIAL_GUARANTEE`
- Medical/Legal: `MEDICAL_CERTIFICATE`, `VACCINATION_RECORD`, `POLICE_CLEARANCE`, `CHARACTER_REFERENCE`
- Other: `WORK_EXPERIENCE_LETTER`, `INTERNSHIP_CERTIFICATE`, `EXTRACURRICULAR_CERTIFICATE`, `OTHER`

#### 4. Test Scores
```
GET    /api/user/test-scores
POST   /api/user/test-scores
DELETE /api/user/test-scores?id=xxx
```

**Example Request (POST):**
```json
{
  "testType": "IELTS",
  "testDate": "2024-11-15",
  "overallScore": "7.5",
  "readingScore": "8.0",
  "writingScore": "7.0",
  "listeningScore": "7.5",
  "speakingScore": "7.5",
  "expiryDate": "2026-11-15"
}
```

#### 5. Eligible Programs (Program Discovery)
```
GET  /api/user/eligible-programs
POST /api/user/eligible-programs
```

**Query Parameters:**
- `minScore`: Minimum eligibility score (0-100)
- `onlyEligible`: Filter to only show eligible programs (true/false)
- `recalculate`: Force recalculation (true/false)

**Example Response:**
```json
{
  "eligibility": [
    {
      "id": "uuid",
      "eligibilityScore": 85,
      "isEligible": true,
      "metRequirements": [
        "✅ Education level: UNDERGRADUATE",
        "✅ GPA: 3.5 (Required: 3.0)",
        "✅ All required documents uploaded (8/8)",
        "✅ IELTS: 7.5 (Required: 6.5)"
      ],
      "missingRequirements": [],
      "recommendationNotes": "🎉 Congratulations! You meet the requirements...",
      "program": {
        "id": "uuid",
        "programName": "Computer Science MSc",
        "programCountry": "Canada",
        "institutionName": "University of Toronto"
      }
    }
  ],
  "summary": {
    "total": 15,
    "eligible": 8,
    "highMatch": 3,
    "mediumMatch": 5,
    "lowMatch": 7
  }
}
```

#### 6. Auto-Fill Application
```
GET /api/applications/auto-fill?programId=xxx
```

Returns pre-filled application data from user's profile.

**Example Response:**
```json
{
  "program": {
    "id": "uuid",
    "name": "Computer Science MSc",
    "country": "Canada",
    "institution": "University of Toronto"
  },
  "autoFillData": {
    "programName": "Computer Science MSc",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "educationHistory": [...],
    "uploadedDocuments": [...],
    "testScores": [...],
    "latestEducation": {...},
    "passportNumber": "G1234567",
    "englishProficiency": {
      "type": "IELTS",
      "score": "7.5"
    }
  },
  "profileCompletion": {
    "personalInfo": 100,
    "educationInfo": 100,
    "documents": 88,
    "testScores": 100,
    "overall": 97
  },
  "canApply": true,
  "recommendation": "You qualify for this program!"
}
```

### Admin APIs

#### 1. Program Requirements
```
GET    /api/programs/[programId]/requirements
POST   /api/programs/[programId]/requirements
PATCH  /api/programs/[programId]/requirements
DELETE /api/programs/[programId]/requirements
```

**Example Request (POST):**
```json
{
  "educationLevel": "UNDERGRADUATE",
  "minimumGpa": 3.0,
  "gradingSystem": "GPA_4",
  "requiredDocuments": [
    "WASSCE_RESULT",
    "SHS_TRANSCRIPT",
    "PASSPORT_COPY",
    "STATEMENT_OF_PURPOSE",
    "CV_RESUME",
    "ACADEMIC_REFERENCE_LETTER"
  ],
  "ieltsMinimum": 6.5,
  "toeflMinimum": 80,
  "workExperienceRequired": false,
  "additionalRequirements": "Two reference letters required"
}
```

#### 2. Document Verification
```
GET   /api/admin/documents
PATCH /api/admin/documents?id=xxx
```

**Query Parameters for GET:**
- `verified`: Filter by verification status (true/false)
- `type`: Filter by document type
- `userId`: Filter by user

**Example Request (PATCH):**
```json
{
  "isVerified": true,
  "notes": "Document verified. Valid WASSCE certificate."
}
```

#### 3. Academic Profiles
```
GET /api/admin/academic-profiles
```

**Query Parameters:**
- `userId`: Filter by user
- `educationLevel`: Filter by education level

**Example Response:**
```json
{
  "profiles": [
    {
      "id": "uuid",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "currentEducationLevel": "UNDERGRADUATE",
      "educationHistory": [...],
      "documents": [...],
      "testScores": [...],
      "eligibility": [...]
    }
  ],
  "stats": {
    "total": 150,
    "withEducation": 145,
    "withDocuments": 132,
    "withTestScores": 98,
    "eligible": 76,
    "documentsVerified": 543,
    "documentsPending": 89
  }
}
```

---

## 🧮 Eligibility Calculation Algorithm

The system automatically calculates eligibility scores (0-100) based on:

### Scoring Breakdown

| Requirement | Points | Description |
|-------------|--------|-------------|
| Education Level | 30 | User has completed required education level |
| GPA | 20 | User meets minimum GPA requirement |
| Documents | 25 | All required documents uploaded |
| Test Scores | 15 | English proficiency and other test scores |
| Work Experience | 10 | If required by program |
| **Total** | **100** | |

### Eligibility Threshold

- **70%+ = Eligible** ✅ User can apply
- **50-69% = Partially Eligible** ⚠️ Some requirements missing
- **<50% = Not Eligible** ❌ Major requirements missing

### Auto-Recalculation Triggers

Eligibility is automatically recalculated when:
1. User uploads a new document
2. User adds education history
3. User adds test scores
4. User updates academic profile
5. Admin verifies a document

---

## 📋 Complete User Flow

### Step 1: User Completes Profile

```bash
# 1. Update basic academic info
PATCH /api/user/academic-profile
{
  "currentEducationLevel": "UNDERGRADUATE",
  "intendedStudyLevel": "MASTERS",
  "fieldOfStudy": "Computer Science"
}

# 2. Add education history
POST /api/user/education-history
{
  "institutionName": "University of Ghana",
  "educationLevel": "UNDERGRADUATE",
  "grade": "3.5",
  "graduated": true
}

# 3. Upload documents
POST /api/user/documents
{
  "documentType": "WASSCE_RESULT",
  "documentName": "WASSCE 2019",
  "fileUrl": "..."
}

POST /api/user/documents
{
  "documentType": "PASSPORT_COPY",
  "documentName": "Passport",
  "fileUrl": "..."
}

# 4. Add test scores
POST /api/user/test-scores
{
  "testType": "IELTS",
  "overallScore": "7.5"
}
```

### Step 2: System Calculates Eligibility

Automatically happens after each update. User can also manually trigger:

```bash
POST /api/user/eligible-programs
{
  "programId": "specific-program" # Optional
}
```

### Step 3: User Discovers Programs

```bash
# View all eligible programs
GET /api/user/eligible-programs?onlyEligible=true

# View all programs with scores
GET /api/user/eligible-programs?minScore=60
```

### Step 4: User Applies with Auto-Fill

```bash
# Get pre-filled data
GET /api/applications/auto-fill?programId=xxx

# Submit application (existing endpoint)
POST /api/applications
{
  # Data from auto-fill endpoint
  ...
}
```

### Step 5: Admin Reviews

```bash
# View all pending documents
GET /api/admin/documents?verified=false

# Verify document
PATCH /api/admin/documents?id=xxx
{
  "isVerified": true,
  "notes": "Verified"
}

# View user's complete profile
GET /api/admin/academic-profiles?userId=xxx
```

---

## 🎓 Education Levels

```typescript
enum EducationLevel {
  HIGH_SCHOOL          // SHS/Secondary School
  FOUNDATION           // Foundation/Preparatory Year
  DIPLOMA              // Diploma programs
  UNDERGRADUATE        // Bachelor's degree
  POSTGRADUATE_DIPLOMA // PG Diploma
  MASTERS              // Master's degree
  DOCTORATE            // PhD
  CERTIFICATE          // Short certificate programs
  PROFESSIONAL         // Professional certifications
}
```

---

## 📊 Admin Dashboard Integration

Add these sections to your admin dashboard:

### 1. Document Verification Queue
```typescript
// Fetch pending documents
const response = await fetch('/api/admin/documents?verified=false');
const { documents, stats } = await response.json();

// Show:
// - Documents awaiting verification
// - User information
// - Document preview
// - Verify/Reject buttons
```

### 2. Applicant Review System
```typescript
// Fetch all academic profiles
const response = await fetch('/api/admin/academic-profiles');
const { profiles, stats } = await response.json();

// Show:
// - List of all users
// - Education completion status
// - Document upload status
// - Eligible programs count
// - Quick actions (verify, contact, etc.)
```

### 3. Program Requirements Manager
```typescript
// For each program, admin can set:
await fetch(`/api/programs/${programId}/requirements`, {
  method: 'POST',
  body: JSON.stringify({
    educationLevel: 'UNDERGRADUATE',
    minimumGpa: 3.0,
    requiredDocuments: ['WASSCE_RESULT', 'PASSPORT_COPY'],
    ieltsMinimum: 6.5
  })
});
```

---

## 🚀 Implementation Checklist

- [x] Database schema created
- [x] Eligibility calculation algorithm built
- [x] User academic profile API
- [x] Education history API
- [x] Document upload API
- [x] Test scores API
- [x] Program discovery API
- [x] Auto-fill application API
- [x] Program requirements API (admin)
- [x] Document verification API (admin)
- [x] Academic profiles API (admin)
- [ ] Frontend: User profile page
- [ ] Frontend: Document upload interface
- [ ] Frontend: Program discovery page
- [ ] Frontend: Auto-fill application form
- [ ] Frontend: Admin document verification dashboard
- [ ] Frontend: Admin applicant review system
- [ ] Frontend: Admin program requirements editor

---

## 💡 Key Features

✅ **Automatic Matching**: System calculates which programs users qualify for
✅ **Document Library**: Centralized storage for all user documents
✅ **Smart Auto-Fill**: One-click application with pre-filled data
✅ **Real-Time Eligibility**: Updates as users add documents
✅ **Admin Verification**: Streamlined document verification workflow
✅ **Comprehensive Tracking**: Full academic history and qualifications
✅ **Multiple Test Types**: Supports TOEFL, IELTS, SAT, GRE, GMAT, etc.
✅ **Flexible Requirements**: Admin can set different requirements per program
✅ **Progress Tracking**: Users see profile completion percentage

---

## 🔐 Security & Privacy

- All endpoints require authentication
- Users can only access their own data
- Admin endpoints require ADMIN or SUPER_ADMIN role
- Document URLs should use signed/temporary URLs
- Sensitive data (passport numbers, etc.) should be encrypted at rest

---

## 📞 Next Steps

1. **Build Frontend Components**:
   - User profile management page
   - Document upload interface
   - Program discovery/matching page
   - Application form with auto-fill

2. **Add File Upload**:
   - Integrate with cloud storage (S3, Supabase Storage, etc.)
   - Generate signed URLs for secure document access

3. **Enhance Matching Algorithm**:
   - Add machine learning for better recommendations
   - Consider more factors (location preferences, budget, etc.)

4. **Add Notifications**:
   - Notify users when they become eligible for programs
   - Alert admins of pending document verifications

---

## ❓ FAQ

**Q: How does the system match users to programs?**
A: It compares user's education level, GPA, documents, and test scores against program requirements and calculates an eligibility score (0-100).

**Q: Can users apply to programs they're not eligible for?**
A: Frontend can restrict this, but API doesn't block it. Admins will review anyway.

**Q: How often is eligibility recalculated?**
A: Automatically after each profile update, or manually by calling the recalculation API.

**Q: What if a program doesn't have requirements set?**
A: Users won't see eligibility data for that program until admin sets requirements.

**Q: Can documents be verified in bulk?**
A: Yes, admin can verify multiple documents. Consider adding a bulk verification endpoint.

---

## 🎉 Success!

Your ApplyBoard-style system is now fully functional! Users can upload documents, the system will automatically match them to eligible programs, and admins can review everything from a centralized dashboard.
