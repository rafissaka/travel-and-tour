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

async function isAdmin(userId: string): Promise<boolean> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return dbUser?.role === 'ADMIN' || dbUser?.role === 'SUPER_ADMIN';
}

// GET - Fetch program requirements (admin view all, users view by program ID)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    if (!programId) {
      // Admin can fetch all program requirements
      if (!(await isAdmin(user.id))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const requirements = await prisma.programRequirement.findMany({
        include: {
          program: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(requirements);
    }

    // Fetch requirements for a specific program (accessible by all authenticated users)
    const requirements = await prisma.programRequirement.findMany({
      where: { programId },
    });

    return NextResponse.json(requirements);
  } catch (error) {
    console.error('Error fetching program requirements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program requirements' },
      { status: 500 }
    );
  }
}

// POST - Create program requirements (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      programId,
      educationLevel,
      minimumGpa,
      gradingSystem,
      requiredDocuments,
      toeflMinimum,
      ieltsMinimum,
      duolingoMinimum,
      pteMinimum,
      satMinimum,
      actMinimum,
      greMinimum,
      gmatMinimum,
      workExperienceRequired,
      minimumWorkExperienceYears,
      ageRequirement,
      requiredPrerequisites,
      additionalRequirements,
    } = body;

    if (!programId || !educationLevel || !requiredDocuments) {
      return NextResponse.json(
        { error: 'Program ID, education level, and required documents are required' },
        { status: 400 }
      );
    }

    const requirement = await prisma.programRequirement.create({
      data: {
        programId,
        acceptedEducationLevels: educationLevel,
        minimumGpa,
        gradingSystem,
        requiredDocuments,
        toeflMinimum,
        ieltsMinimum,
        duolingoMinimum,
        pteMinimum,
        satMinimum,
        actMinimum,
        greMinimum,
        gmatMinimum,
        workExperienceRequired,
        minimumWorkExperienceYears,
        ageRequirement,
        requiredPrerequisites,
        additionalRequirements,
      },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(requirement, { status: 201 });
  } catch (error) {
    console.error('Error creating program requirements:', error);
    return NextResponse.json(
      { error: 'Failed to create program requirements' },
      { status: 500 }
    );
  }
}

// PATCH - Update program requirements (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Requirement ID is required' },
        { status: 400 }
      );
    }

    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.program;

    const requirement = await prisma.programRequirement.update({
      where: { id },
      data: updateData,
      include: {
        program: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(requirement);
  } catch (error) {
    console.error('Error updating program requirements:', error);
    return NextResponse.json(
      { error: 'Failed to update program requirements' },
      { status: 500 }
    );
  }
}

// DELETE - Delete program requirements (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Requirement ID is required' },
        { status: 400 }
      );
    }

    await prisma.programRequirement.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Program requirements deleted successfully' });
  } catch (error) {
    console.error('Error deleting program requirements:', error);
    return NextResponse.json(
      { error: 'Failed to delete program requirements' },
      { status: 500 }
    );
  }
}
