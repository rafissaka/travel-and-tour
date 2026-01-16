import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { EducationLevel, GradingSystem } from '@prisma/client';
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
 * GET /api/user/education-history
 * Get user's education history
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const educationHistory = await prisma.userEducationHistory.findMany({
      where: { userId: user.id },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(educationHistory);
  } catch (error) {
    console.error('Error fetching education history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch education history' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/education-history
 * Add education history entry
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Ensure academic profile exists
    await prisma.userAcademicProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    // Validate required fields
    if (!body.institutionName || !body.educationLevel) {
      return NextResponse.json(
        { error: 'Institution name and education level are required' },
        { status: 400 }
      );
    }

    if (!Object.values(EducationLevel).includes(body.educationLevel)) {
      return NextResponse.json(
        { error: 'Invalid education level' },
        { status: 400 }
      );
    }

    const education = await prisma.userEducationHistory.create({
      data: {
        userId: user.id,
        institutionName: body.institutionName,
        institutionCountry: body.institutionCountry,
        educationLevel: body.educationLevel,
        fieldOfStudy: body.fieldOfStudy,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isCurrent: body.isCurrent || false,
        grade: body.grade || null,
        gradingSystem: body.gradingSystem || null,
        graduated: body.graduated || false,
        certificateUrl: body.certificateUrl || null,
        transcriptUrl: body.transcriptUrl || null,
      },
    });

    // Recalculate eligibility
    await calculateAllProgramsEligibility(user.id);

    return NextResponse.json(education, { status: 201 });
  } catch (error) {
    console.error('Error creating education history:', error);
    return NextResponse.json(
      { error: 'Failed to create education history' },
      { status: 500 }
    );
  }
}
