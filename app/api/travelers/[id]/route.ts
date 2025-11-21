import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch single traveler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser || !['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const traveler = await prisma.traveler.findUnique({
      where: { id },
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

    if (!traveler) {
      return NextResponse.json({ error: 'Traveler not found' }, { status: 404 });
    }

    return NextResponse.json(traveler);
  } catch (error: unknown) {
    console.error('Error fetching traveler:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PATCH - Update traveler
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (middleName !== undefined) updateData.middleName = middleName;
    if (surname !== undefined) updateData.surname = surname;
    if (sex !== undefined) updateData.sex = sex;
    if (nationality !== undefined) updateData.nationality = nationality;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (placeOfBirth !== undefined) updateData.placeOfBirth = placeOfBirth;
    if (passportNumber !== undefined) updateData.passportNumber = passportNumber;
    if (workTitle !== undefined) updateData.workTitle = workTitle;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (paymentAmount !== undefined) updateData.paymentAmount = paymentAmount ? parseFloat(paymentAmount) : null;
    if (paymentDate !== undefined) updateData.paymentDate = paymentDate ? new Date(paymentDate) : null;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (processStatus !== undefined) updateData.processStatus = processStatus;
    if (notes !== undefined) updateData.notes = notes;

    const traveler = await prisma.traveler.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(traveler);
  } catch (error: unknown) {
    console.error('Error updating traveler:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Soft delete traveler
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser || !['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const traveler = await prisma.traveler.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Traveler deleted successfully', traveler });
  } catch (error: unknown) {
    console.error('Error deleting traveler:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
