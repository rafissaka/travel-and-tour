import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

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

// GET all bookings (admin sees all, user sees only their own)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const serviceId = searchParams.get('serviceId');

    const where: any = {};

    // Regular users can only see their own bookings
    if (user.role === 'USER') {
      where.userId = user.id;
    }

    if (status) {
      where.status = status;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            startDate: true,
          },
        },
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST create new booking
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      serviceId,
      eventId,
      bookingType,
      participants,
      specialRequests,
      preferredDate,
      preferredTime,
      fullName,
      email,
      phone,
      paymentOption,
      totalAmount,
    } = body;

    // Validation
    if (!serviceId && !eventId) {
      return NextResponse.json(
        { error: 'Service or Event ID is required' },
        { status: 400 }
      );
    }

    // For event bookings, require contact info
    if (eventId && (!fullName || !email || !phone)) {
      return NextResponse.json(
        { error: 'Full name, email, and phone are required for event bookings' },
        { status: 400 }
      );
    }

    // Determine booking type if not provided
    const finalBookingType = bookingType || (eventId ? 'EVENT' : 'SERVICE');

    // Determine payment status based on payment option
    const paymentStatus = paymentOption === 'PAY_NOW' ? 'PENDING' : 'PENDING';

    // Store contact info and special requests as JSON
    const requestsData: any = {
      message: specialRequests || '',
      preferredDate: preferredDate || null,
      preferredTime: preferredTime || null,
    };

    // Add contact info for event bookings
    if (eventId) {
      requestsData.fullName = fullName;
      requestsData.email = email;
      requestsData.phone = phone;
      requestsData.paymentOption = paymentOption;
    }

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: serviceId || null,
        eventId: eventId || null,
        bookingType: finalBookingType,
        status: 'PENDING',
        participants: participants || 1,
        totalAmount: totalAmount || null,
        paymentStatus,
        specialRequests: JSON.stringify(requestsData),
        bookingDate: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            startDate: true,
          },
        },
      },
    });

    // Update event participant count if this is an event booking
    if (eventId) {
      await prisma.event.update({
        where: { id: eventId },
        data: {
          currentParticipants: {
            increment: participants || 1,
          },
        },
      });
    }

    return NextResponse.json({ booking, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PATCH update booking (admin only for status changes)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, paymentStatus, totalAmount, specialRequests } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Check if user owns the booking or is admin
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only admin can change status and payment status
    const updateData: any = {};

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      if (status) updateData.status = status;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (totalAmount !== undefined) updateData.totalAmount = totalAmount;

      // Set confirmed/cancelled timestamps
      if (status === 'CONFIRMED') {
        updateData.confirmedAt = new Date();
      } else if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
      }
    }

    // Users can only update their own special requests
    if (existingBooking.userId === user.id && specialRequests !== undefined) {
      updateData.specialRequests = specialRequests;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE booking
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
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Check if user owns the booking or is admin
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (
      existingBooking.userId !== user.id &&
      user.role !== 'ADMIN' &&
      user.role !== 'SUPER_ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
