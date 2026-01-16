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

// GET - Fetch user's test scores
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

// POST - Create new test score
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      testType,
      testDate,
      overallScore,
      readingScore,
      writingScore,
      listeningScore,
      speakingScore,
      analyticalWriting,
      quantitativeScore,
      verbalScore,
      scoreDocumentUrl,
      isVerified,
      expiryDate,
    } = body;

    if (!testType) {
      return NextResponse.json(
        { error: 'Test type is required' },
        { status: 400 }
      );
    }

    const testScore = await prisma.userTestScore.create({
      data: {
        userId: user.id,
        testType,
        testDate: testDate ? new Date(testDate) : null,
        overallScore,
        readingScore,
        writingScore,
        listeningScore,
        speakingScore,
        analyticalWriting,
        quantitativeScore,
        verbalScore,
        scoreDocumentUrl,
        isVerified: isVerified || false,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });

    return NextResponse.json(testScore, { status: 201 });
  } catch (error) {
    console.error('Error creating test score:', error);
    return NextResponse.json(
      { error: 'Failed to create test score' },
      { status: 500 }
    );
  }
}

// PATCH - Update test score
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Test score ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.userTestScore.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Test score not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Convert date strings to Date objects
    if (updateData.testDate) {
      updateData.testDate = new Date(updateData.testDate);
    }
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }

    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const testScore = await prisma.userTestScore.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(testScore);
  } catch (error) {
    console.error('Error updating test score:', error);
    return NextResponse.json(
      { error: 'Failed to update test score' },
      { status: 500 }
    );
  }
}

// DELETE - Delete test score
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Test score ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.userTestScore.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Test score not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.userTestScore.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Test score deleted successfully' });
  } catch (error) {
    console.error('Error deleting test score:', error);
    return NextResponse.json(
      { error: 'Failed to delete test score' },
      { status: 500 }
    );
  }
}
