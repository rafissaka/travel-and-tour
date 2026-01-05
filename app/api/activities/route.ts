import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { id: true, role: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch different types of activities
    const activities = [];

    // 1. Bookings
    if (!type || type === 'booking') {
      const bookings = await prisma.booking.findMany({
        where: { userId: dbUser.id },
        include: {
          service: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      bookings.forEach((booking) => {
        const serviceTitle = booking.service?.title || 'Unknown Service';
        
        activities.push({
          id: `booking-${booking.id}`,
          type: 'booking',
          action: 'created',
          title: 'Booking Request',
          description: `Requested appointment for ${serviceTitle}`,
          status: booking.status,
          timestamp: booking.createdAt,
          metadata: {
            serviceTitle: serviceTitle,
            status: booking.status,
          },
        });
      });
    }

    // 2. Applications
    if (!type || type === 'application') {
      const applications = await prisma.application.findMany({
        where: { userId: dbUser.id },
        include: {
          program: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      applications.forEach((app) => {
        const programTitle = app.program?.title || app.programName || 'Unknown Program';
        
        activities.push({
          id: `application-${app.id}`,
          type: 'application',
          action: 'submitted',
          title: 'Program Application',
          description: `Applied to ${programTitle}`,
          status: app.status,
          timestamp: app.createdAt,
          metadata: {
            programTitle: programTitle,
            status: app.status,
          },
        });
      });
    }

    // 3. Reservations
    if (!type || type === 'reservation') {
      const reservations = await prisma.reservation.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      reservations.forEach((reservation) => {
        let description = '';
        if (reservation.reservationType === 'FLIGHT') {
          description = `Flight reservation from ${reservation.departureCity} to ${reservation.arrivalCity}`;
        } else if (reservation.reservationType === 'HOTEL') {
          description = `Hotel reservation in ${reservation.hotelCity}`;
        } else {
          description = `Flight & Hotel reservation`;
        }

        activities.push({
          id: `reservation-${reservation.id}`,
          type: 'reservation',
          action: 'created',
          title: 'Travel Reservation',
          description,
          status: reservation.status,
          timestamp: reservation.createdAt,
          metadata: {
            reservationType: reservation.reservationType,
            status: reservation.status,
          },
        });
      });
    }

    // 4. Account activities (login, profile updates, etc.)
    if (!type || type === 'account') {
      // Add account creation activity
      const userCreation = await prisma.user.findUnique({
        where: { id: dbUser.id },
        select: { createdAt: true },
      });

      if (userCreation) {
        activities.push({
          id: `account-created-${dbUser.id}`,
          type: 'account',
          action: 'created',
          title: 'Account Created',
          description: 'Your account was successfully created',
          status: 'completed',
          timestamp: userCreation.createdAt,
          metadata: {},
        });
      }
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply limit
    const limitedActivities = activities.slice(0, limit);

    // Calculate statistics
    const stats = {
      total: activities.length,
      bookings: activities.filter((a) => a.type === 'booking').length,
      applications: activities.filter((a) => a.type === 'application').length,
      reservations: activities.filter((a) => a.type === 'reservation').length,
      account: activities.filter((a) => a.type === 'account').length,
    };

    return NextResponse.json({
      activities: limitedActivities,
      stats,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
