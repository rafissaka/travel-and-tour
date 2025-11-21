import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all travelers with filters and search
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const processStatus = searchParams.get('processStatus');
    const paymentStatus = searchParams.get('paymentStatus');
    const sex = searchParams.get('sex');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { middleName: { contains: search, mode: 'insensitive' } },
        { surname: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { passportNumber: { contains: search, mode: 'insensitive' } },
        { nationality: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filters
    if (processStatus) {
      where.processStatus = processStatus;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (sex) {
      where.sex = sex;
    }

    // Exclude deleted by default
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const travelers = await prisma.traveler.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(travelers);
  } catch (error: unknown) {
    console.error('Error fetching travelers:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Create new traveler
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      firstName,
      middleName,
      surname,
      sex,
      nationality,
      dateOfBirth,
      placeOfBirth,
      passportNumber,
      workTitle,
      email,
      phone,
      address,
      paymentAmount,
      paymentDate,
      paymentStatus,
      processStatus,
      notes,
    } = body;

    // Validation
    if (!firstName || !surname || !sex || !nationality || !dateOfBirth || !placeOfBirth || !passportNumber) {
      return NextResponse.json(
        { error: 'Required fields: firstName, surname, sex, nationality, dateOfBirth, placeOfBirth, passportNumber' },
        { status: 400 }
      );
    }

    const traveler = await prisma.traveler.create({
      data: {
        firstName,
        middleName,
        surname,
        sex,
        nationality,
        dateOfBirth: new Date(dateOfBirth),
        placeOfBirth,
        passportNumber,
        workTitle,
        email,
        phone,
        address,
        paymentAmount: paymentAmount ? parseFloat(paymentAmount) : null,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        paymentStatus: paymentStatus || 'PENDING',
        processStatus: processStatus || 'INQUIRY',
        notes,
        createdById: currentUser.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(traveler, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating traveler:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
