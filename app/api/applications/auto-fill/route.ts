import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { any } from 'zod';

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      profile: {
        select: {
          dateOfBirth: true,
        },
      },
    },
  });

  return dbUser;
}

/**
 * GET /api/applications/auto-fill?programId=xxx
 * Auto-fill application data from user profile and academic profile
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    if (!programId) {
      return NextResponse.json(
        { error: 'Program ID is required' },
        { status: 400 }
      );
    }

    // Fetch program details
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        service: {
          select: {
            title: true,
            description: true,
          },
        },
        programRequirements: true,
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Fetch user's academic profile
    const academicProfile = await prisma.userAcademicProfile.findUnique({
      where: { userId: user.id },
      include: {
        userEducationHistory: {
          orderBy: { startDate: 'desc' },
        },
        userDocuments: true,
        userTestScores: true,
      },
    });

    // Fetch eligibility for this program
    const eligibility = await prisma.programEligibility.findUnique({
      where: {
        userId_programId: {
          userId: user.id,
          programId,
        },
      },
    });

    // Build auto-filled application data
    const autoFillData: any = {
      // Program information
      programName: program.title,
      programCountry: program.country,
      institutionName: program.university,
      programDuration: program.duration,
      programStartDate: program.startDate,
      programEndDate: program.endDate,

      // Personal information from user profile
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phone: user.phone || '',
      dateOfBirth: user.profile?.dateOfBirth || null,

      // Academic information
      educationHistory: academicProfile?.userEducationHistory || [],
      currentEducationLevel: academicProfile?.currentEducationLevel || null,
      highestEducationLevel: academicProfile?.highestEducationLevel || null,
      intendedStudyLevel: academicProfile?.intendedStudyLevel || null,
      fieldOfStudy: academicProfile?.fieldOfStudy || '',

      // Documents
      uploadedDocuments: academicProfile?.userDocuments.map(doc => ({
        id: doc.id,
        type: doc.documentType,
        name: doc.documentName,
        url: doc.fileUrl,
        verified: doc.isVerified,
      })) || [],

      // Test scores
      testScores: academicProfile?.userTestScores.map(score => ({
        type: score.testType,
        overall: score.overallScore,
        date: score.testDate,
        details: {
          reading: score.readingScore,
          writing: score.writingScore,
          listening: score.listeningScore,
          speaking: score.speakingScore,
        },
      })) || [],

      // Program requirements
      requirements: program.programRequirements[0] || null,

      // Eligibility information
      eligibility: eligibility ? {
        isEligible: eligibility.isEligible,
        score: eligibility.eligibilityScore,
        metRequirements: eligibility.metRequirements,
        missingRequirements: eligibility.missingRequirements,
        notes: eligibility.recommendationNotes,
      } : null,
    };

    // Extract latest education for quick reference
    if (academicProfile?.userEducationHistory && academicProfile.userEducationHistory.length > 0) {
      const latestEducation = academicProfile.userEducationHistory[0];
      autoFillData.latestEducation = {
        institution: latestEducation.institutionName,
        country: latestEducation.institutionCountry,
        level: latestEducation.educationLevel,
        field: latestEducation.fieldOfStudy,
        grade: latestEducation.grade,
        graduated: latestEducation.graduated,
        startDate: latestEducation.startDate,
        endDate: latestEducation.endDate,
        isCurrent: latestEducation.isCurrent,
      };
    }

    // Extract passport from documents
    const passportDoc = academicProfile?.userDocuments.find(
      doc => doc.documentType === 'PASSPORT_COPY'
    );
    if (passportDoc) {
      autoFillData.passportNumber = passportDoc.documentNumber || '';
      autoFillData.passportIssueDate = passportDoc.issueDate;
      autoFillData.passportExpiryDate = passportDoc.expiryDate;
    }

    // Extract English proficiency scores
    const toefl = academicProfile?.userTestScores.find(s => s.testType === 'TOEFL');
    const ielts = academicProfile?.userTestScores.find(s => s.testType === 'IELTS');
    const duolingo = academicProfile?.userTestScores.find(s => s.testType === 'DUOLINGO');

    if (toefl) {
      autoFillData.englishProficiency = {
        type: 'TOEFL',
        score: toefl.overallScore,
        date: toefl.testDate,
      };
    } else if (ielts) {
      autoFillData.englishProficiency = {
        type: 'IELTS',
        score: ielts.overallScore,
        date: ielts.testDate,
      };
    } else if (duolingo) {
      autoFillData.englishProficiency = {
        type: 'Duolingo',
        score: duolingo.overallScore,
        date: duolingo.testDate,
      };
    }

    // Calculate completion percentage
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'dateOfBirth',
    ];

    const documentFields = Array.isArray(program.programRequirements[0]?.requiredDocuments)
      ? program.programRequirements[0]?.requiredDocuments as string[]
      : [];
    const uploadedDocTypes = new Set(
      academicProfile?.userDocuments.map(d => d.documentType) || []
    );

    const profileCompletion = {
      personalInfo: requiredFields.filter(f => autoFillData[f]).length / requiredFields.length * 100,
      educationInfo: (academicProfile?.userEducationHistory.length || 0) > 0 ? 100 : 0,
      documents: documentFields.length > 0
        ? (Array.from(uploadedDocTypes).filter(t => documentFields.includes(t)).length / documentFields.length * 100)
        : 100,
      testScores: (academicProfile?.userTestScores.length || 0) > 0 ? 100 : 0,
    };

    const overallCompletion = Math.round(
      (profileCompletion.personalInfo +
        profileCompletion.educationInfo +
        profileCompletion.documents +
        profileCompletion.testScores) / 4
    );

    return NextResponse.json({
      program: {
        id: program.id,
        name: program.title,
        country: program.country,
        institution: program.university,
        duration: program.duration,
      },
      autoFillData,
      profileCompletion: {
        ...profileCompletion,
        overall: overallCompletion,
      },
      canApply: eligibility?.isEligible || false,
      recommendation: eligibility?.recommendationNotes || 'Complete your profile to see if you qualify for this program.',
    });
  } catch (error) {
    console.error('Error auto-filling application:', error);
    return NextResponse.json(
      { error: 'Failed to auto-fill application' },
      { status: 500 }
    );
  }
}
