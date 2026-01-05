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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's applications
    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        programName: true,
        programCountry: true,
        status: true,
        createdAt: true,
        submittedAt: true,
      },
    });

    const applicationStats = {
      total: await prisma.application.count({ where: { userId: user.id } }),
      draft: await prisma.application.count({ 
        where: { userId: user.id, status: 'DRAFT' } 
      }),
      submitted: await prisma.application.count({ 
        where: { userId: user.id, status: 'SUBMITTED' } 
      }),
      underReview: await prisma.application.count({ 
        where: { userId: user.id, status: 'UNDER_REVIEW' } 
      }),
      approved: await prisma.application.count({ 
        where: { userId: user.id, status: 'APPROVED' } 
      }),
      rejected: await prisma.application.count({ 
        where: { userId: user.id, status: 'REJECTED' } 
      }),
    };

    // Fetch user's reservations
    const reservations = await prisma.reservation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        reservationType: true,
        status: true,
        departureCity: true,
        arrivalCity: true,
        hotelCity: true,
        departureDate: true,
        checkInDate: true,
        createdAt: true,
      },
    });

    const reservationStats = {
      total: await prisma.reservation.count({ where: { userId: user.id } }),
      pending: await prisma.reservation.count({ 
        where: { userId: user.id, status: 'PENDING' } 
      }),
      confirmed: await prisma.reservation.count({ 
        where: { userId: user.id, status: 'CONFIRMED' } 
      }),
      completed: await prisma.reservation.count({ 
        where: { userId: user.id, status: 'COMPLETED' } 
      }),
      cancelled: await prisma.reservation.count({ 
        where: { userId: user.id, status: 'CANCELLED' } 
      }),
    };

    // Fetch user's bookings
    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
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
            startDate: true,
          },
        },
      },
    });

    const bookingStats = {
      total: await prisma.booking.count({ where: { userId: user.id } }),
      pending: await prisma.booking.count({ 
        where: { userId: user.id, status: 'PENDING' } 
      }),
      confirmed: await prisma.booking.count({ 
        where: { userId: user.id, status: 'CONFIRMED' } 
      }),
      completed: await prisma.booking.count({ 
        where: { userId: user.id, status: 'COMPLETED' } 
      }),
      cancelled: await prisma.booking.count({ 
        where: { userId: user.id, status: 'CANCELLED' } 
      }),
    };

    return NextResponse.json({
      applications: {
        stats: applicationStats,
        recent: applications,
      },
      reservations: {
        stats: reservationStats,
        recent: reservations,
      },
      bookings: {
        stats: bookingStats,
        recent: bookings,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
