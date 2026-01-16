import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { EducationLevel, DocumentType, GradingSystem } from '@prisma/client';

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
 * GET /api/programs/[programId]/requirements
 * Get program requirements
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;

    const requirements = await prisma.programRequirement.findMany({
      where: { programId },
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

/**
 * POST /api/programs/[programId]/requirements
 * Create program requirements (Admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { programId } = await params;
    const body = await request.json();

    // Validate program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Validate required fields
    if (!body.acceptedEducationLevels || !body.requiredDocuments) {
      return NextResponse.json(
        { error: 'Education levels and required documents are required' },
        { status: 400 }
      );
    }

    // Validate education levels
    if (!Array.isArray(body.acceptedEducationLevels)) {
      return NextResponse.json(
        { error: 'Accepted education levels must be an array' },
        { status: 400 }
      );
    }

    const invalidLevels = body.acceptedEducationLevels.filter(
      (level: string) => !Object.values(EducationLevel).includes(level as EducationLevel)
    );

    if (invalidLevels.length > 0) {
      return NextResponse.json(
        { error: `Invalid education levels: ${invalidLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate document types
    if (!Array.isArray(body.requiredDocuments)) {
      return NextResponse.json(
        { error: 'Required documents must be an array' },
        { status: 400 }
      );
    }

    const invalidDocs = body.requiredDocuments.filter(
      (doc: string) => !Object.values(DocumentType).includes(doc as DocumentType)
    );

    if (invalidDocs.length > 0) {
      return NextResponse.json(
        { error: `Invalid document types: ${invalidDocs.join(', ')}` },
        { status: 400 }
      );
    }

    // Create requirement
    const requirement = await prisma.programRequirement.create({
      data: {
        programId,
        acceptedEducationLevels: body.acceptedEducationLevels,
        minimumGpa: body.minimumGpa ? parseFloat(body.minimumGpa) : null,
        gradingSystem: body.gradingSystem || null,
        requiredDocuments: body.requiredDocuments,
        toeflMinimum: body.toeflMinimum ? parseInt(body.toeflMinimum) : null,
        ieltsMinimum: body.ieltsMinimum ? parseFloat(body.ieltsMinimum) : null,
        duolingoMinimum: body.duolingoMinimum ? parseInt(body.duolingoMinimum) : null,
        pteMinimum: body.pteMinimum ? parseInt(body.pteMinimum) : null,
        satMinimum: body.satMinimum ? parseInt(body.satMinimum) : null,
        actMinimum: body.actMinimum ? parseInt(body.actMinimum) : null,
        greMinimum: body.greMinimum ? parseInt(body.greMinimum) : null,
        gmatMinimum: body.gmatMinimum ? parseInt(body.gmatMinimum) : null,
        workExperienceRequired: body.workExperienceRequired || false,
        minimumWorkExperienceYears: body.minimumWorkExperienceYears
          ? parseInt(body.minimumWorkExperienceYears)
          : null,
        ageRequirement: body.ageRequirement || null,
        requiredPrerequisites: body.requiredPrerequisites || null,
        additionalRequirements: body.additionalRequirements || null,
        // Institutional Requirements
        acceptedInstitutions: body.acceptedInstitutions || null,
        acceptedCourses: body.acceptedCourses || null,
        acceptedFundingTypes: body.acceptedFundingTypes || null,
        requireCompletionDate: body.requireCompletionDate || false,
        minimumStudyDurationMonths: body.minimumStudyDurationMonths 
          ? parseInt(body.minimumStudyDurationMonths) 
          : null,
      },
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

/**
 * PATCH /api/programs/[programId]/requirements
 * Update program requirements (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { programId } = await params;
    const body = await request.json();

    // Find existing requirement
    const existing = await prisma.programRequirement.findFirst({
      where: { programId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Program requirements not found' },
        { status: 404 }
      );
    }

    // Validate education levels if provided
    if (body.acceptedEducationLevels) {
      if (!Array.isArray(body.acceptedEducationLevels)) {
        return NextResponse.json(
          { error: 'Accepted education levels must be an array' },
          { status: 400 }
        );
      }

      const invalidLevels = body.acceptedEducationLevels.filter(
        (level: string) => !Object.values(EducationLevel).includes(level as EducationLevel)
      );

      if (invalidLevels.length > 0) {
        return NextResponse.json(
          { error: `Invalid education levels: ${invalidLevels.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate document types if provided
    if (body.requiredDocuments) {
      if (!Array.isArray(body.requiredDocuments)) {
        return NextResponse.json(
          { error: 'Required documents must be an array' },
          { status: 400 }
        );
      }

      const invalidDocs = body.requiredDocuments.filter(
        (doc: string) => !Object.values(DocumentType).includes(doc as DocumentType)
      );

      if (invalidDocs.length > 0) {
        return NextResponse.json(
          { error: `Invalid document types: ${invalidDocs.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (body.acceptedEducationLevels !== undefined) updateData.acceptedEducationLevels = body.acceptedEducationLevels;
    if (body.minimumGpa !== undefined) updateData.minimumGpa = body.minimumGpa ? parseFloat(body.minimumGpa) : null;
    if (body.gradingSystem !== undefined) updateData.gradingSystem = body.gradingSystem || null;
    if (body.requiredDocuments !== undefined) updateData.requiredDocuments = body.requiredDocuments;
    if (body.toeflMinimum !== undefined) updateData.toeflMinimum = body.toeflMinimum ? parseInt(body.toeflMinimum) : null;
    if (body.ieltsMinimum !== undefined) updateData.ieltsMinimum = body.ieltsMinimum ? parseFloat(body.ieltsMinimum) : null;
    if (body.duolingoMinimum !== undefined) updateData.duolingoMinimum = body.duolingoMinimum ? parseInt(body.duolingoMinimum) : null;
    if (body.pteMinimum !== undefined) updateData.pteMinimum = body.pteMinimum ? parseInt(body.pteMinimum) : null;
    if (body.satMinimum !== undefined) updateData.satMinimum = body.satMinimum ? parseInt(body.satMinimum) : null;
    if (body.actMinimum !== undefined) updateData.actMinimum = body.actMinimum ? parseInt(body.actMinimum) : null;
    if (body.greMinimum !== undefined) updateData.greMinimum = body.greMinimum ? parseInt(body.greMinimum) : null;
    if (body.gmatMinimum !== undefined) updateData.gmatMinimum = body.gmatMinimum ? parseInt(body.gmatMinimum) : null;
    if (body.workExperienceRequired !== undefined) updateData.workExperienceRequired = body.workExperienceRequired;
    if (body.minimumWorkExperienceYears !== undefined) {
      updateData.minimumWorkExperienceYears = body.minimumWorkExperienceYears 
        ? parseInt(body.minimumWorkExperienceYears) 
        : null;
    }
    if (body.ageRequirement !== undefined) updateData.ageRequirement = body.ageRequirement || null;
    if (body.requiredPrerequisites !== undefined) updateData.requiredPrerequisites = body.requiredPrerequisites || null;
    if (body.additionalRequirements !== undefined) updateData.additionalRequirements = body.additionalRequirements || null;
    // Institutional Requirements
    if (body.acceptedInstitutions !== undefined) updateData.acceptedInstitutions = body.acceptedInstitutions || null;
    if (body.acceptedCourses !== undefined) updateData.acceptedCourses = body.acceptedCourses || null;
    if (body.acceptedFundingTypes !== undefined) updateData.acceptedFundingTypes = body.acceptedFundingTypes || null;
    if (body.requireCompletionDate !== undefined) updateData.requireCompletionDate = body.requireCompletionDate;
    if (body.minimumStudyDurationMonths !== undefined) {
      updateData.minimumStudyDurationMonths = body.minimumStudyDurationMonths 
        ? parseInt(body.minimumStudyDurationMonths) 
        : null;
    }

    // Update requirement
    const requirement = await prisma.programRequirement.update({
      where: { id: existing.id },
      data: updateData,
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

/**
 * DELETE /api/programs/[programId]/requirements
 * Delete program requirements (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { programId } = await params;

    // Find existing requirement
    const existing = await prisma.programRequirement.findFirst({
      where: { programId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Program requirements not found' },
        { status: 404 }
      );
    }

    // Delete requirement
    await prisma.programRequirement.delete({
      where: { id: existing.id },
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
