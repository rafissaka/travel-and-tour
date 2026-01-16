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

// GET - Fetch user's education history
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

// POST - Create new education history entry
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      institutionName,
      institutionCountry,
      educationLevel,
      fieldOfStudy,
      startDate,
      endDate,
      isCurrent,
      grade,
      gradingSystem,
      graduated,
      certificateUrl,
      transcriptUrl,
    } = body;

    if (!institutionName || !educationLevel) {
      return NextResponse.json(
        { error: 'Institution name and education level are required' },
        { status: 400 }
      );
    }

    const educationEntry = await prisma.userEducationHistory.create({
      data: {
        userId: user.id,
        institutionName,
        institutionCountry,
        educationLevel,
        fieldOfStudy,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent,
        grade,
        gradingSystem,
        graduated,
        certificateUrl,
        transcriptUrl,
      },
    });

    return NextResponse.json(educationEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating education history:', error);
    return NextResponse.json(
      { error: 'Failed to create education history' },
      { status: 500 }
    );
  }
}

// PATCH - Update education history entry
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
        { error: 'Education history ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.userEducationHistory.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Education history not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Convert date strings to Date objects
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const educationEntry = await prisma.userEducationHistory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(educationEntry);
  } catch (error) {
    console.error('Error updating education history:', error);
    return NextResponse.json(
      { error: 'Failed to update education history' },
      { status: 500 }
    );
  }
}

// DELETE - Delete education history entry
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
        { error: 'Education history ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.userEducationHistory.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Education history not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.userEducationHistory.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Education history deleted successfully' });
  } catch (error) {
    console.error('Error deleting education history:', error);
    return NextResponse.json(
      { error: 'Failed to delete education history' },
      { status: 500 }
    );
  }
}
