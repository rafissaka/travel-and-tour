import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

// Helper function to get authenticated user with role
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

// GET all programs or programs for a specific service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const active = searchParams.get('active');
    const slug = searchParams.get('slug');

    const where: any = {};

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (active !== null) {
      where.isActive = active === 'true';
    }

    if (slug) {
      where.slug = slug;
    }

    const programs = await prisma.program.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        programRequirements: true,
      },
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

// POST create new program
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      serviceId,
      title,
      slug,
      tagline,
      description,
      fullDescription,
      country,
      university,
      duration,
      startDate,
      endDate,
      deadline,
      imageUrl,
      features,
      requirements,
      benefits,
      tuitionFee,
      applicationFee,
      scholarshipType,
      isActive,
      displayOrder,
      availableSlots,
    } = body;

    if (!serviceId || !title || !slug) {
      return NextResponse.json(
        { error: 'Service ID, title, and slug are required' },
        { status: 400 }
      );
    }

    // Validate and truncate field lengths to match schema constraints
    const validatedData = {
      serviceId,
      title: title?.substring(0, 300) || '',
      slug: slug?.substring(0, 300) || '',
      tagline: tagline?.substring(0, 200) || null,
      description: description?.substring(0, 5000) || null,
      fullDescription: fullDescription?.substring(0, 50000) || null,
      country: country?.substring(0, 100) || null,
      university: university?.substring(0, 300) || null,
      duration: duration?.substring(0, 100) || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      deadline: deadline ? new Date(deadline) : null,
      imageUrl: imageUrl?.substring(0, 2000) || null,
      features,
      requirements,
      benefits,
      tuitionFee: tuitionFee?.substring(0, 100) || null,
      applicationFee: applicationFee?.substring(0, 100) || null,
      scholarshipType: scholarshipType?.substring(0, 100) || null,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
      availableSlots,
      createdById: user.id,
    };

    const program = await prisma.program.create({
      data: validatedData,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error: any) {
    console.error('Error creating program:', error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2000') {
      return NextResponse.json(
        { error: 'One or more fields exceed the maximum allowed length. Please check your input.' },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A program with this slug already exists. Please use a different slug.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create program', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH update program
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Program ID is required' },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects
    const dataToUpdate: any = { ...updateData };
    const dateFields = ['startDate', 'endDate', 'deadline'];

    for (const field of dateFields) {
      if (dataToUpdate[field]) {
        dataToUpdate[field] = new Date(dataToUpdate[field]);
      }
    }

    const program = await prisma.program.update({
      where: { id },
      data: dataToUpdate,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

// DELETE program
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Program ID is required' },
        { status: 400 }
      );
    }

    await prisma.program.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}
