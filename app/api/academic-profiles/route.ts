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

// GET - Fetch user's academic profile
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.userAcademicProfile.findUnique({
      where: { userId: user.id },
      include: {
        userEducationHistory: {
          orderBy: { startDate: 'desc' },
        },
        userTestScores: {
          orderBy: { testDate: 'desc' },
        },
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching academic profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic profile' },
      { status: 500 }
    );
  }
}

// POST - Create or update user's academic profile
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      currentEducationLevel,
      highestEducationLevel,
      intendedStudyLevel,
      fieldOfStudy,
      preferredCountries,
      studyPreferences,
    } = body;

    // Upsert the profile
    const profile = await prisma.userAcademicProfile.upsert({
      where: { userId: user.id },
      update: {
        currentEducationLevel,
        highestEducationLevel,
        intendedStudyLevel,
        fieldOfStudy,
        preferredCountries,
        studyPreferences,
      },
      create: {
        userId: user.id,
        currentEducationLevel,
        highestEducationLevel,
        intendedStudyLevel,
        fieldOfStudy,
        preferredCountries,
        studyPreferences,
      },
      include: {
        userEducationHistory: true,
        userTestScores: true,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error creating/updating academic profile:', error);
    return NextResponse.json(
      { error: 'Failed to save academic profile' },
      { status: 500 }
    );
  }
}

// PATCH - Partially update user's academic profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    delete body.userId;
    delete body.createdAt;
    delete body.updatedAt;
    delete body.educationHistory;
    delete body.testScores;

    const profile = await prisma.userAcademicProfile.update({
      where: { userId: user.id },
      data: body,
      include: {
        userEducationHistory: true,
        userTestScores: true,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating academic profile:', error);
    return NextResponse.json(
      { error: 'Failed to update academic profile' },
      { status: 500 }
    );
  }
}
