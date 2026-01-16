import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { EducationLevel } from '@prisma/client';
import { calculateAllProgramsEligibility } from '@/lib/eligibility-calculator';

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
      role: true,
      isActive: true,
    },
  });

  return dbUser;
}

/**
 * GET /api/user/academic-profile
 * Get user's academic profile with all related data
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch or create academic profile
    let profile = await prisma.userAcademicProfile.findUnique({
      where: { userId: user.id },
      include: {
        userEducationHistory: {
          orderBy: { startDate: 'desc' },
        },
        userDocuments: {
          orderBy: { createdAt: 'desc' },
        },
        userTestScores: {
          orderBy: { testDate: 'desc' },
        },
        programEligibility: {
          include: {
            program: {
              select: {
                id: true,
                title: true,
                country: true,
                university: true,
              },
            },
          },
          orderBy: { eligibilityScore: 'desc' },
        },
      },
    });

    // Create profile if doesn't exist
    if (!profile) {
      profile = await prisma.userAcademicProfile.create({
        data: {
          userId: user.id,
        },
        include: {
          userEducationHistory: true,
          userDocuments: true,
          userTestScores: true,
          programEligibility: {
            include: {
              program: {
                select: {
                  id: true,
                  title: true,
                  country: true,
                  university: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching academic profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/academic-profile
 * Update user's academic profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate education levels if provided
    if (body.currentEducationLevel && !Object.values(EducationLevel).includes(body.currentEducationLevel)) {
      return NextResponse.json(
        { error: 'Invalid current education level' },
        { status: 400 }
      );
    }

    if (body.highestEducationLevel && !Object.values(EducationLevel).includes(body.highestEducationLevel)) {
      return NextResponse.json(
        { error: 'Invalid highest education level' },
        { status: 400 }
      );
    }

    if (body.intendedStudyLevel && !Object.values(EducationLevel).includes(body.intendedStudyLevel)) {
      return NextResponse.json(
        { error: 'Invalid intended study level' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (body.currentEducationLevel !== undefined) updateData.currentEducationLevel = body.currentEducationLevel;
    if (body.highestEducationLevel !== undefined) updateData.highestEducationLevel = body.highestEducationLevel;
    if (body.intendedStudyLevel !== undefined) updateData.intendedStudyLevel = body.intendedStudyLevel;
    if (body.fieldOfStudy !== undefined) updateData.fieldOfStudy = body.fieldOfStudy;
    if (body.preferredCountries !== undefined) updateData.preferredCountries = body.preferredCountries;
    if (body.studyPreferences !== undefined) updateData.studyPreferences = body.studyPreferences;
    if (body.gpa !== undefined) updateData.gpa = body.gpa;
    if (body.gradingSystem !== undefined) updateData.gradingSystem = body.gradingSystem;
    if (body.institutionName !== undefined) updateData.institutionName = body.institutionName;

    // Update or create profile
    const profile = await prisma.userAcademicProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...updateData,
      },
      update: updateData,
      include: {
        userEducationHistory: {
          orderBy: { startDate: 'desc' },
        },
        userDocuments: {
          orderBy: { createdAt: 'desc' },
        },
        userTestScores: {
          orderBy: { testDate: 'desc' },
        },
        programEligibility: {
          include: {
            program: {
              select: {
                id: true,
                title: true,
                country: true,
                university: true,
              },
            },
          },
          orderBy: { eligibilityScore: 'desc' },
        },
      },
    });

    // Recalculate eligibility when profile is updated
    await calculateAllProgramsEligibility(user.id);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating academic profile:', error);
    return NextResponse.json(
      { error: 'Failed to update academic profile' },
      { status: 500 }
    );
  }
}
