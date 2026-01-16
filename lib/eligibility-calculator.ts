/**
 * ELIGIBILITY CALCULATION ENGINE
 * 
 * This module calculates user eligibility for programs based on:
 * - Academic qualifications
 * - Test scores
 * - Required documents
 * - Work experience
 * - Age requirements
 */

import { prisma } from '@/lib/prisma';
import {
  EducationLevel,
  DocumentType,
  TestType,
  GradingSystem,
} from '@prisma/client';

interface EligibilityResult {
  isEligible: boolean;
  eligibilityScore: number; // 0-100
  metRequirements: string[];
  missingRequirements: string[];
  recommendationNotes: string;
}

interface ProgramRequirementData {
  acceptedEducationLevels: EducationLevel[];
  minimumGpa?: number;
  gradingSystem?: GradingSystem;
  requiredDocuments: DocumentType[];
  toeflMinimum?: number;
  ieltsMinimum?: number;
  duolingoMinimum?: number;
  pteMinimum?: number;
  satMinimum?: number;
  actMinimum?: number;
  greMinimum?: number;
  gmatMinimum?: number;
  workExperienceRequired: boolean;
  minimumWorkExperienceYears?: number;
  ageRequirement?: { min?: number; max?: number };
  additionalRequirements?: string;
}

/**
 * Calculate eligibility for a specific program
 */
export async function calculateProgramEligibility(
  userId: string,
  programId: string
): Promise<EligibilityResult> {
  // Fetch user's academic profile with all related data
  const userProfile = await prisma.userAcademicProfile.findUnique({
    where: { userId },
    include: {
      userEducationHistory: {
        orderBy: { endDate: 'desc' },
      },
      userDocuments: true,
      userTestScores: true,
    },
  });

  // Fetch program requirements
  const programRequirement = await prisma.programRequirement.findFirst({
    where: { programId },
  });

  if (!programRequirement || !userProfile) {
    return {
      isEligible: false,
      eligibilityScore: 0,
      metRequirements: [],
      missingRequirements: ['Unable to fetch data'],
      recommendationNotes: 'Please complete your profile and try again.',
    };
  }

  const metRequirements: string[] = [];
  const missingRequirements: string[] = [];
  let totalPoints = 0;
  let maxPoints = 0;

  // 1. CHECK EDUCATION LEVEL (30 points)
  maxPoints += 30;
  const acceptedLevels = Array.isArray(programRequirement.acceptedEducationLevels)
    ? programRequirement.acceptedEducationLevels as EducationLevel[]
    : (programRequirement.acceptedEducationLevels as any) || [];
  
  const hasRequiredEducation = checkEducationLevel(
    userProfile,
    userProfile.userEducationHistory,
    acceptedLevels
  );
  if (hasRequiredEducation) {
    totalPoints += 30;
    const levelsStr = acceptedLevels.length > 0 ? acceptedLevels.join(', ') : 'Any';
    metRequirements.push(`✅ Education level: ${levelsStr}`);
  } else {
    const levelsStr = acceptedLevels.length > 0 ? acceptedLevels.join(' OR ') : 'Not specified';
    missingRequirements.push(`❌ Required education: ${levelsStr}`);
  }

  // 2. CHECK GPA REQUIREMENT (20 points)
  if (programRequirement.minimumGpa) {
    maxPoints += 20;
    const gpaCheck = checkGpaRequirement(
      userProfile,
      userProfile.userEducationHistory,
      Number(programRequirement.minimumGpa),
      programRequirement.gradingSystem
    );
    if (gpaCheck.meets) {
      totalPoints += 20;
      metRequirements.push(`✅ GPA: ${gpaCheck.userGpa} (Required: ${programRequirement.minimumGpa})`);
    } else {
      missingRequirements.push(`❌ GPA: ${gpaCheck.userGpa || 'Not provided'} (Required: ${programRequirement.minimumGpa})`);
    }
  }

  // 3. CHECK REQUIRED DOCUMENTS (25 points)
  maxPoints += 25;
  const requiredDocs = Array.isArray(programRequirement.requiredDocuments)
    ? programRequirement.requiredDocuments
    : (programRequirement.requiredDocuments as any);
  
  const docCheck = checkRequiredDocuments(
    userProfile.userDocuments,
    requiredDocs
  );
  
  if (docCheck.allPresent) {
    totalPoints += 25;
    metRequirements.push(`✅ All required documents uploaded (${docCheck.presentCount}/${docCheck.totalRequired})`);
  } else {
    const points = Math.floor((docCheck.presentCount / docCheck.totalRequired) * 25);
    totalPoints += points;
    missingRequirements.push(`⚠️ Documents: ${docCheck.presentCount}/${docCheck.totalRequired} uploaded`);
    docCheck.missingDocs.forEach(doc => {
      missingRequirements.push(`   - Missing: ${formatDocumentType(doc)}`);
    });
  }

  // 4. CHECK TEST SCORES (15 points)
  maxPoints += 15;
  const testCheck = checkTestScores(userProfile.userTestScores, {
    toeflMinimum: programRequirement.toeflMinimum,
    ieltsMinimum: programRequirement.ieltsMinimum ? Number(programRequirement.ieltsMinimum) : undefined,
    duolingoMinimum: programRequirement.duolingoMinimum,
    pteMinimum: programRequirement.pteMinimum,
    satMinimum: programRequirement.satMinimum,
    actMinimum: programRequirement.actMinimum,
    greMinimum: programRequirement.greMinimum,
    gmatMinimum: programRequirement.gmatMinimum,
  });

  if (testCheck.meets) {
    totalPoints += 15;
    testCheck.passedTests.forEach(test => {
      metRequirements.push(`✅ ${test}`);
    });
  } else if (testCheck.hasAnyTests) {
    totalPoints += 8;
    testCheck.passedTests.forEach(test => {
      metRequirements.push(`✅ ${test}`);
    });
    testCheck.failedTests.forEach(test => {
      missingRequirements.push(`⚠️ ${test}`);
    });
  } else {
    missingRequirements.push('❌ No test scores uploaded');
  }

  // 5. CHECK WORK EXPERIENCE (10 points)
  if (programRequirement.workExperienceRequired) {
    maxPoints += 10;
    const workExpCheck = checkWorkExperience(
      userProfile.userDocuments,
      programRequirement.minimumWorkExperienceYears || 0
    );
    if (workExpCheck.meets) {
      totalPoints += 10;
      metRequirements.push(`✅ Work experience provided`);
    } else {
      missingRequirements.push(`❌ Work experience letter required (${programRequirement.minimumWorkExperienceYears || 0} years)`);
    }
  }

  // Calculate final score
  const eligibilityScore = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
  const isEligible = eligibilityScore >= 70; // 70% threshold for eligibility

  // Generate recommendation notes
  let recommendationNotes = '';
  if (isEligible) {
    recommendationNotes = '🎉 Congratulations! You meet the requirements for this program. You can proceed with your application.';
  } else if (eligibilityScore >= 50) {
    recommendationNotes = '⚠️ You partially meet the requirements. Please upload missing documents to improve your eligibility.';
  } else {
    recommendationNotes = '❌ You do not currently meet the minimum requirements. Please complete your profile and upload required documents.';
  }

  return {
    isEligible,
    eligibilityScore,
    metRequirements,
    missingRequirements,
    recommendationNotes,
  };
}

/**
 * Check if user has any of the accepted education levels
 */
function checkEducationLevel(
  userProfile: any,
  educationHistory: any[],
  acceptedLevels: EducationLevel[]
): boolean {
  const educationLevelHierarchy: Record<EducationLevel, number> = {
    HIGH_SCHOOL: 1,
    CERTIFICATE: 2,
    FOUNDATION: 2,
    DIPLOMA: 3,
    UNDERGRADUATE: 4,
    POSTGRADUATE_DIPLOMA: 5,
    MASTERS: 6,
    DOCTORATE: 7,
    PROFESSIONAL: 3,
  };

  if (!acceptedLevels || acceptedLevels.length === 0) {
    // If no levels specified, check if user has any education level
    if (userProfile.currentEducationLevel || userProfile.highestEducationLevel) {
      return true;
    }
    return educationHistory.some(edu => edu.graduated);
  }

  // First, check the academic profile's education levels
  const profileLevels = [
    userProfile.currentEducationLevel,
    userProfile.highestEducationLevel,
  ].filter(Boolean);

  for (const level of profileLevels) {
    const userLevelValue = educationLevelHierarchy[level as EducationLevel];
    if (userLevelValue) {
      // Check if user's level meets or exceeds any of the accepted levels
      const meetsRequirement = acceptedLevels.some(acceptedLevel => {
        const acceptedLevelValue = educationLevelHierarchy[acceptedLevel];
        return userLevelValue >= acceptedLevelValue;
      });
      if (meetsRequirement) return true;
    }
  }

  // Fallback: Check if user has completed any of the accepted levels in education history
  return educationHistory.some(edu => {
    if (!edu.graduated) return false;

    const userLevelValue = educationLevelHierarchy[edu.educationLevel as EducationLevel];

    // Check if user's level meets or exceeds any of the accepted levels
    return acceptedLevels.some(acceptedLevel => {
      const acceptedLevelValue = educationLevelHierarchy[acceptedLevel];
      return userLevelValue >= acceptedLevelValue;
    });
  });
}

/**
 * Check if user meets GPA requirement
 */
function checkGpaRequirement(
  userProfile: any,
  educationHistory: any[],
  minimumGpa: number,
  gradingSystem?: GradingSystem | null
): { meets: boolean; userGpa?: string } {
  // First, check if GPA is in the academic profile
  if (userProfile.gpa) {
    const userGpa = parseFloat(userProfile.gpa);

    if (!isNaN(userGpa)) {
      return {
        meets: userGpa >= minimumGpa,
        userGpa: userProfile.gpa,
      };
    }
    // If not a number, return it as is
    return { meets: false, userGpa: userProfile.gpa };
  }

  // Fallback: Get most recent completed education
  const latestEducation = educationHistory.find(edu => edu.graduated && edu.grade);

  if (!latestEducation || !latestEducation.grade) {
    return { meets: false };
  }

  // For now, we'll do a simple comparison
  // In production, you'd convert between grading systems
  const userGpa = parseFloat(latestEducation.grade);

  if (isNaN(userGpa)) {
    return { meets: false, userGpa: latestEducation.grade };
  }

  return {
    meets: userGpa >= minimumGpa,
    userGpa: latestEducation.grade,
  };
}

/**
 * Check if user has uploaded all required documents
 */
function checkRequiredDocuments(
  userDocuments: any[],
  requiredDocuments: DocumentType[]
): {
  allPresent: boolean;
  presentCount: number;
  totalRequired: number;
  missingDocs: DocumentType[];
} {
  const uploadedDocTypes = new Set(userDocuments.map(doc => doc.documentType));
  const missingDocs = requiredDocuments.filter(reqDoc => !uploadedDocTypes.has(reqDoc));
  
  return {
    allPresent: missingDocs.length === 0,
    presentCount: requiredDocuments.length - missingDocs.length,
    totalRequired: requiredDocuments.length,
    missingDocs,
  };
}

/**
 * Check if user meets test score requirements
 */
function checkTestScores(
  testScores: any[],
  requirements: {
    toeflMinimum?: number | null;
    ieltsMinimum?: number | null;
    duolingoMinimum?: number | null;
    pteMinimum?: number | null;
    satMinimum?: number | null;
    actMinimum?: number | null;
    greMinimum?: number | null;
    gmatMinimum?: number | null;
  }
): {
  meets: boolean;
  hasAnyTests: boolean;
  passedTests: string[];
  failedTests: string[];
} {
  const passedTests: string[] = [];
  const failedTests: string[] = [];
  let hasAnyTests = testScores.length > 0;

  // Check each test type
  const checks = [
    {
      type: 'TOEFL' as TestType,
      min: requirements.toeflMinimum,
      label: 'TOEFL',
    },
    {
      type: 'IELTS' as TestType,
      min: requirements.ieltsMinimum,
      label: 'IELTS',
    },
    {
      type: 'DUOLINGO' as TestType,
      min: requirements.duolingoMinimum,
      label: 'Duolingo',
    },
    {
      type: 'PTE' as TestType,
      min: requirements.pteMinimum,
      label: 'PTE',
    },
    {
      type: 'SAT' as TestType,
      min: requirements.satMinimum,
      label: 'SAT',
    },
    {
      type: 'ACT' as TestType,
      min: requirements.actMinimum,
      label: 'ACT',
    },
    {
      type: 'GRE' as TestType,
      min: requirements.greMinimum,
      label: 'GRE',
    },
    {
      type: 'GMAT' as TestType,
      min: requirements.gmatMinimum,
      label: 'GMAT',
    },
  ];

  let hasRequiredTests = false;
  let meetsRequiredTests = false;

  for (const check of checks) {
    if (check.min) {
      hasRequiredTests = true;
      const userTest = testScores.find(t => t.testType === check.type);
      
      if (userTest && userTest.overallScore) {
        const score = parseFloat(userTest.overallScore);
        if (!isNaN(score) && score >= check.min) {
          passedTests.push(`${check.label}: ${userTest.overallScore} (Required: ${check.min})`);
          meetsRequiredTests = true;
        } else {
          failedTests.push(`${check.label}: ${userTest.overallScore || 'N/A'} (Required: ${check.min})`);
        }
      } else {
        failedTests.push(`${check.label}: Not provided (Required: ${check.min})`);
      }
    }
  }

  return {
    meets: !hasRequiredTests || meetsRequiredTests,
    hasAnyTests,
    passedTests,
    failedTests,
  };
}

/**
 * Check work experience
 */
function checkWorkExperience(
  documents: any[],
  requiredYears: number
): { meets: boolean } {
  const hasWorkExpLetter = documents.some(
    doc => doc.documentType === 'WORK_EXPERIENCE_LETTER'
  );
  
  // For now, just check if document exists
  // In production, you'd parse the document or have a separate work history model
  return { meets: hasWorkExpLetter };
}

/**
 * Calculate eligibility for all programs
 */
export async function calculateAllProgramsEligibility(userId: string) {
  const programs = await prisma.program.findMany({
    where: { isActive: true },
    include: {
      programRequirements: true,
    },
  });

  const results = [];

  for (const program of programs) {
    if (program.programRequirements.length > 0) {
      const eligibility = await calculateProgramEligibility(userId, program.id);
      
      // Store in database
      await prisma.programEligibility.upsert({
        where: {
          userId_programId: {
            userId,
            programId: program.id,
          },
        },
        create: {
          userId,
          programId: program.id,
          eligibilityScore: eligibility.eligibilityScore,
          isEligible: eligibility.isEligible,
          metRequirements: eligibility.metRequirements,
          missingRequirements: eligibility.missingRequirements,
          recommendationNotes: eligibility.recommendationNotes,
          lastCalculatedAt: new Date(),
        },
        update: {
          eligibilityScore: eligibility.eligibilityScore,
          isEligible: eligibility.isEligible,
          metRequirements: eligibility.metRequirements,
          missingRequirements: eligibility.missingRequirements,
          recommendationNotes: eligibility.recommendationNotes,
          lastCalculatedAt: new Date(),
        },
      });

      results.push({
        program,
        eligibility,
      });
    }
  }

  return results;
}

/**
 * Format document type for display
 */
function formatDocumentType(docType: DocumentType): string {
  return docType
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}
