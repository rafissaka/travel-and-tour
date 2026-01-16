import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { TestType } from '@prisma/client';
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
 * GET /api/user/test-scores
 * Get user's test scores
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testScores = await prisma.userTestScore.findMany({
      where: { userId: user.id },
      orderBy: { testDate: 'desc' },
    });

    return NextResponse.json(testScores);
  } catch (error) {
    console.error('Error fetching test scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test scores' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/test-scores
 * Add a test score
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
    if (!body.testType) {
      return NextResponse.json(
        { error: 'Test type is required' },
        { status: 400 }
      );
    }

    if (!Object.values(TestType).includes(body.testType)) {
      return NextResponse.json(
        { error: 'Invalid test type' },
        { status: 400 }
      );
    }

    const testScore = await prisma.userTestScore.create({
      data: {
        userId: user.id,
        testType: body.testType,
        testDate: body.testDate ? new Date(body.testDate) : null,
        overallScore: body.overallScore || null,
        readingScore: body.readingScore || null,
        writingScore: body.writingScore || null,
        listeningScore: body.listeningScore || null,
        speakingScore: body.speakingScore || null,
        analyticalWriting: body.analyticalWriting || null,
        quantitativeScore: body.quantitativeScore || null,
        verbalScore: body.verbalScore || null,
        scoreDocumentUrl: body.scoreDocumentUrl || null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      },
    });

    // Recalculate eligibility after adding test score
    await calculateAllProgramsEligibility(user.id);

    return NextResponse.json(testScore, { status: 201 });
  } catch (error) {
    console.error('Error creating test score:', error);
    return NextResponse.json(
      { error: 'Failed to create test score' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/test-scores?id=xxx
 * Delete a test score
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const testScoreId = searchParams.get('id');

    if (!testScoreId) {
      return NextResponse.json(
        { error: 'Test score ID is required' },
        { status: 400 }
      );
    }

    // Verify test score belongs to user
    const testScore = await prisma.userTestScore.findUnique({
      where: { id: testScoreId },
    });

    if (!testScore) {
      return NextResponse.json({ error: 'Test score not found' }, { status: 404 });
    }

    if (testScore.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.userTestScore.delete({
      where: { id: testScoreId },
    });

    // Recalculate eligibility after deletion
    await calculateAllProgramsEligibility(user.id);

    return NextResponse.json({ message: 'Test score deleted successfully' });
  } catch (error) {
    console.error('Error deleting test score:', error);
    return NextResponse.json(
      { error: 'Failed to delete test score' },
      { status: 500 }
    );
  }
}
