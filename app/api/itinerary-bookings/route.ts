import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { notifyNewItinerary, notifyAdminsNewItinerary } from '@/lib/notifications';

// GET - Fetch all itinerary bookings for a user or admin
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
    const bookings = await prisma.itineraryBooking.findMany({
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
    console.error('Error fetching itinerary bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Create a new itinerary booking
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
      destination,
      travelStartDate,
      travelEndDate,
      tripDuration,
      travelers,
      tripType,
      accommodationType,
      transportPreference,
      interests,
      mustVisit,
      avoidPreferences,
      dietaryRestrictions,
      mobilityRequirements,
      specialRequests,
      budgetRange,
      budgetIncludes,
      pacingPreference,
      planningLevel,
      needsReservations,
      previousExperience,
      additionalNotes,
      referralSource,
      feeEstimate,
    } = body;

    // Validate required fields
    if (!serviceId || !contactFullName || !contactEmail || !contactPhone ||
      !destination || !travelStartDate || !travelEndDate || !travelers || !travelers.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await prisma.itineraryBooking.create({
      data: {
        userId: user.id,
        serviceId,
        contactFullName,
        contactEmail,
        contactPhone,
        destination,
        travelStartDate: new Date(travelStartDate),
        travelEndDate: new Date(travelEndDate),
        tripDuration,
        travelers,
        travelerCount: travelers.length,
        tripType,
        accommodationType,
        transportPreference,
        interests,
        mustVisit,
        avoidPreferences,
        dietaryRestrictions,
        mobilityRequirements,
        specialRequests,
        budgetRange,
        budgetIncludes,
        pacingPreference,
        planningLevel,
        needsReservations,
        previousExperience,
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
          activityType: 'itinerary_planning_request',
          activityData: {
            bookingId: booking.id,
            destination: booking.destination,
            travelerCount: booking.travelerCount,
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
      await notifyNewItinerary(user.id, booking.id, destination);
      
      // Notify admins
      await notifyAdminsNewItinerary(booking.id, userName, destination);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating itinerary booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PATCH - Update an itinerary booking (for admins to add quotes, update status, deliver itinerary)
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
    const existingBooking = await prisma.itineraryBooking.findUnique({
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
    const updatedBooking = await prisma.itineraryBooking.update({
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
    console.error('Error updating itinerary booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
