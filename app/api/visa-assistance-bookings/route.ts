import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { notifyNewVisaAssistance, notifyAdminsNewVisaAssistance } from '@/lib/notifications';

// GET - Fetch all visa assistance bookings for a user or admin
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database to check role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch bookings based on role
    const bookings = await prisma.visaAssistanceBooking.findMany({
      where: dbUser.role === 'ADMIN' || dbUser.role === 'SUPER_ADMIN'
        ? {}
        : { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching visa assistance bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Create a new visa assistance booking
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      serviceId,
      contactFullName,
      contactEmail,
      contactPhone,
      contactResidence,
      destinationCountry,
      travelPurpose,
      plannedTravelDate,
      durationOfStay,
      applicants,
      hasValidPassport,
      passportExpiryDate,
      previousVisaRefusal,
      refusalDetails,
      needsDocumentation,
      needsAppointment,
      needsTranslation,
      rushProcessing,
      additionalNotes,
      referralSource,
      feeEstimate,
    } = body;

    // Validate required fields
    if (!serviceId || !contactFullName || !contactEmail || !contactPhone ||
      !destinationCountry || !travelPurpose || !applicants || !applicants.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await prisma.visaAssistanceBooking.create({
      data: {
        userId: user.id,
        serviceId,
        contactFullName,
        contactEmail,
        contactPhone,
        contactResidence,
        destinationCountry,
        travelPurpose,
        plannedTravelDate: plannedTravelDate ? new Date(plannedTravelDate) : null,
        durationOfStay,
        applicants,
        applicantCount: applicants.length,
        hasValidPassport,
        passportExpiryDate: passportExpiryDate ? new Date(passportExpiryDate) : null,
        previousVisaRefusal,
        refusalDetails,
        needsDocumentation,
        needsAppointment,
        needsTranslation,
        rushProcessing,
        additionalNotes,
        referralSource,
        feeEstimate: feeEstimate || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    // Create user activity
    try {
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          activityType: 'visa_assistance_request',
          activityData: {
            bookingId: booking.id,
            destinationCountry: booking.destinationCountry,
            applicantCount: booking.applicantCount,
          },
        },
      });
    } catch (error) {
      console.error('Error creating user activity:', error);
    }

    // Send notifications
    try {
      const userName = booking.user.firstName && booking.user.lastName
        ? `${booking.user.firstName} ${booking.user.lastName}`
        : booking.user.email;

      // Notify user
      await notifyNewVisaAssistance(user.id, booking.id, destinationCountry);
      
      // Notify admins
      await notifyAdminsNewVisaAssistance(booking.id, userName, destinationCountry);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating visa assistance booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PATCH - Update a visa assistance booking (for admins to add quotes, update status)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get user from database to check role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user owns the booking or is admin
    const existingBooking = await prisma.visaAssistanceBooking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (existingBooking.userId !== user.id &&
      dbUser.role !== 'ADMIN' &&
      dbUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the booking
    const updatedBooking = await prisma.visaAssistanceBooking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating visa assistance booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
