import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

// Calculate eligibility score for a program (0-100)
async function calculateEligibilityScore(
  userId: string,
  programRequirement: any
): Promise<{ score: number; missingRequirements: string[]; metRequirements: string[] }> {
  const missingRequirements: string[] = [];
  const metRequirements: string[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  // Get user's academic profile
  const profile = await prisma.userAcademicProfile.findUnique({
    where: { userId },
    include: {
      userEducationHistory: true,
      userTestScores: true,
    },
  });

  // Get user's documents
  const documents = await prisma.userDocument.findMany({
    where: { userId },
  });

  if (!profile) {
    return { score: 0, missingRequirements: ['Academic profile not completed'], metRequirements: [] };
  }

  // Check education level
  totalChecks++;
  if (profile.highestEducationLevel === programRequirement.educationLevel) {
    passedChecks++;
    metRequirements.push('Education level requirement met');
  } else {
    missingRequirements.push(`Requires ${programRequirement.educationLevel} education level`);
  }

  // Check GPA requirement
  if (programRequirement.minimumGpa) {
    totalChecks++;
    const hasValidGPA = profile.userEducationHistory.some((edu: any) => {
      if (!edu.grade) return false;
      const gpa = parseFloat(edu.grade);
      return !isNaN(gpa) && gpa >= programRequirement.minimumGpa;
    });

    if (hasValidGPA) {
      passedChecks++;
      metRequirements.push(`Minimum GPA of ${programRequirement.minimumGpa} met`);
    } else {
      missingRequirements.push(`Minimum GPA of ${programRequirement.minimumGpa} required`);
    }
  }

  // Check required documents
  if (programRequirement.requiredDocuments) {
    const requiredDocs = Array.isArray(programRequirement.requiredDocuments)
      ? programRequirement.requiredDocuments
      : [];

    requiredDocs.forEach((docType: string) => {
      totalChecks++;
      const hasDocument = documents.some((doc: any) => doc.documentType === docType);

      if (hasDocument) {
        passedChecks++;
        metRequirements.push(`${docType} document provided`);
      } else {
        missingRequirements.push(`${docType} document required`);
      }
    });
  }

  // Check test scores
  const testChecks = [
    { type: 'TOEFL', minimum: programRequirement.toeflMinimum, field: 'overallScore' },
    { type: 'IELTS', minimum: programRequirement.ieltsMinimum, field: 'overallScore' },
    { type: 'DUOLINGO', minimum: programRequirement.duolingoMinimum, field: 'overallScore' },
    { type: 'PTE', minimum: programRequirement.pteMinimum, field: 'overallScore' },
    { type: 'SAT', minimum: programRequirement.satMinimum, field: 'overallScore' },
    { type: 'ACT', minimum: programRequirement.actMinimum, field: 'overallScore' },
    { type: 'GRE', minimum: programRequirement.greMinimum, field: 'overallScore' },
    { type: 'GMAT', minimum: programRequirement.gmatMinimum, field: 'overallScore' },
  ];

  testChecks.forEach((check) => {
    if (check.minimum) {
      totalChecks++;
      const hasValidScore = profile.userTestScores?.some((score: any) => {
        if (score.testType !== check.type) return false;
        const scoreValue = parseFloat(score[check.field]);
        return !isNaN(scoreValue) && scoreValue >= check.minimum;
      });

      if (hasValidScore) {
        passedChecks++;
        metRequirements.push(`${check.type} score of ${check.minimum}+ met`);
      } else {
        missingRequirements.push(`${check.type} score of ${check.minimum}+ required`);
      }
    }
  });

  // Check work experience
  if (programRequirement.workExperienceRequired) {
    totalChecks++;
    const workExperience = (profile as any).work_experience;

    if (workExperience && Array.isArray(workExperience) && workExperience.length > 0) {
      passedChecks++;
      metRequirements.push('Work experience requirement met');
    } else {
      missingRequirements.push(
        `${programRequirement.minimumWorkExperienceYears || 'Work'} experience required`
      );
    }
  }

  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return { score, missingRequirements, metRequirements };
}

// GET - Check eligibility for a program or get all eligible programs
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    if (programId) {
      // Check eligibility for a specific program
      const requirement = await prisma.programRequirement.findFirst({
        where: { programId },
        include: {
          program: {
            select: {
              id: true,
              title: true,
              slug: true,
              tagline: true,
              description: true,
            },
          },
        },
      });

      if (!requirement) {
        return NextResponse.json(
          { error: 'Program requirements not found' },
          { status: 404 }
        );
      }

      const eligibility = await calculateEligibilityScore(user.id, requirement);

      // Save/update eligibility record
      await prisma.programEligibility.upsert({
        where: {
          userId_programId: {
            userId: user.id,
            programId,
          },
        },
        update: {
          eligibilityScore: eligibility.score,
          isEligible: eligibility.score >= 70, // 70% threshold
          missingRequirements: eligibility.missingRequirements,
          metRequirements: eligibility.metRequirements,
          lastCalculatedAt: new Date(),
        },
        create: {
          userId: user.id,
          programId,
          eligibilityScore: eligibility.score,
          isEligible: eligibility.score >= 70,
          missingRequirements: eligibility.missingRequirements,
          metRequirements: eligibility.metRequirements,
          lastCalculatedAt: new Date(),
        },
      });

      return NextResponse.json({
        program: requirement.program,
        requirement,
        eligibility: {
          score: eligibility.score,
          isEligible: eligibility.score >= 70,
          missingRequirements: eligibility.missingRequirements,
          metRequirements: eligibility.metRequirements,
        },
      });
    }

    // Get all eligible programs for the user
    const allRequirements = await prisma.programRequirement.findMany({
      include: {
        program: {
          select: {
            id: true,
            title: true,
            slug: true,
            tagline: true,
            description: true,
            country: true,
            tuitionFee: true,
            duration: true,
          },
        },
      },
    });

    const eligibilityResults = await Promise.all(
      allRequirements.map(async (req) => {
        const eligibility = await calculateEligibilityScore(user.id, req);

        // Save/update eligibility record
        await prisma.programEligibility.upsert({
          where: {
            userId_programId: {
              userId: user.id,
              programId: req.programId,
            },
          },
          update: {
            eligibilityScore: eligibility.score,
            isEligible: eligibility.score >= 70,
            missingRequirements: eligibility.missingRequirements,
            metRequirements: eligibility.metRequirements,
            lastCalculatedAt: new Date(),
          },
          create: {
            userId: user.id,
            programId: req.programId,
            eligibilityScore: eligibility.score,
            isEligible: eligibility.score >= 70,
            missingRequirements: eligibility.missingRequirements,
            metRequirements: eligibility.metRequirements,
            lastCalculatedAt: new Date(),
          },
        });

        return {
          program: req.program,
          eligibilityScore: eligibility.score,
          isEligible: eligibility.score >= 70,
          missingRequirements: eligibility.missingRequirements,
          metRequirements: eligibility.metRequirements,
        };
      })
    );

    // Sort by eligibility score
    eligibilityResults.sort((a, b) => b.eligibilityScore - a.eligibilityScore);

    return NextResponse.json({
      totalPrograms: eligibilityResults.length,
      eligiblePrograms: eligibilityResults.filter((r) => r.isEligible).length,
      programs: eligibilityResults,
    });
  } catch (error) {
    console.error('Error checking program eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check program eligibility' },
      { status: 500 }
    );
  }
}
