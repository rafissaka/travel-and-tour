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

    // Check if user is admin
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all applications stats
    const applicationStats = {
      total: await prisma.application.count(),
      draft: await prisma.application.count({ where: { status: 'DRAFT' } }),
      submitted: await prisma.application.count({ where: { status: 'SUBMITTED' } }),
      underReview: await prisma.application.count({ where: { status: 'UNDER_REVIEW' } }),
      approved: await prisma.application.count({ where: { status: 'APPROVED' } }),
      rejected: await prisma.application.count({ where: { status: 'REJECTED' } }),
    };

    // Fetch recent applications
    const recentApplications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        programName: true,
        programCountry: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Fetch all reservations stats (FlightReservation, HotelReservation, PackageReservation)
    const flightResCount = await prisma.flightReservation.count();
    const hotelResCount = await prisma.hotelReservation.count();
    const packageResCount = await prisma.packageReservation.count();
    
    const reservationStats = {
      total: flightResCount + hotelResCount + packageResCount,
      pending: (await prisma.flightReservation.count({ where: { status: 'PENDING_QUOTE' } })) +
               (await prisma.hotelReservation.count({ where: { status: 'PENDING_QUOTE' } })) +
               (await prisma.packageReservation.count({ where: { status: 'PENDING_QUOTE' } })),
      confirmed: (await prisma.flightReservation.count({ where: { status: 'CONFIRMED' } })) +
                 (await prisma.hotelReservation.count({ where: { status: 'CONFIRMED' } })) +
                 (await prisma.packageReservation.count({ where: { status: 'CONFIRMED' } })),
      completed: (await prisma.flightReservation.count({ where: { status: 'COMPLETED' } })) +
                 (await prisma.hotelReservation.count({ where: { status: 'COMPLETED' } })) +
                 (await prisma.packageReservation.count({ where: { status: 'COMPLETED' } })),
      cancelled: (await prisma.flightReservation.count({ where: { status: 'CANCELLED' } })) +
                 (await prisma.hotelReservation.count({ where: { status: 'CANCELLED' } })) +
                 (await prisma.packageReservation.count({ where: { status: 'CANCELLED' } })),
      flight: flightResCount,
      hotel: hotelResCount,
      both: packageResCount,
    };

    // Fetch recent flight reservations
    const recentFlightRes = await prisma.flightReservation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        origin: true,
        destination: true,
        departureDate: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const recentReservations = recentFlightRes.map(r => ({
      id: r.id,
      reservationType: 'FLIGHT' as const,
      status: r.status,
      departureCity: r.origin,
      arrivalCity: r.destination,
      hotelCity: null,
      departureDate: r.departureDate,
      checkInDate: null,
      createdAt: r.createdAt,
      user: r.user,
    }));

    // Fetch all bookings stats
    const bookingStats = {
      total: await prisma.booking.count(),
      pending: await prisma.booking.count({ where: { status: 'PENDING' } }),
      confirmed: await prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      completed: await prisma.booking.count({ where: { status: 'COMPLETED' } }),
      cancelled: await prisma.booking.count({ where: { status: 'CANCELLED' } }),
      service: await prisma.booking.count({ where: { serviceId: { not: null } } }),
      event: await prisma.booking.count({ where: { eventId: { not: null } } }),
    };

    // Fetch recent bookings
    const recentBookings = await prisma.booking.findMany({
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
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Fetch programs stats
    const programStats = {
      total: await prisma.program.count(),
      active: await prisma.program.count({ where: { isActive: true } }),
    };

    // Fetch users stats
    const userStats = {
      total: await prisma.user.count(),
      admins: await prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      users: await prisma.user.count({ where: { role: 'USER' } }),
      active: await prisma.user.count({ where: { isActive: true } }),
      verified: await prisma.user.count({ where: { emailVerified: true } }),
    };

    // Fetch travelers stats
    const travelerStats = {
      total: await prisma.traveler.count(),
      completed: await prisma.traveler.count({ where: { processStatus: 'COMPLETED' } }),
      processing: await prisma.traveler.count({ 
        where: { 
          processStatus: { 
            in: ['DOCUMENTS_RECEIVED', 'DOCUMENTS_VERIFIED', 'VISA_PROCESSING'] 
          } 
        } 
      }),
      pending: await prisma.traveler.count({ 
        where: { 
          processStatus: { 
            in: ['INQUIRY', 'DOCUMENTS_PENDING', 'PAYMENT_PENDING'] 
          } 
        } 
      }),
      paid: await prisma.traveler.count({ where: { paymentStatus: 'PAID' } }),
      cancelled: await prisma.traveler.count({ where: { processStatus: 'CANCELLED' } }),
    };

    // Fetch chat stats
    const chatStats = {
      total: await prisma.chatConversation.count(),
      active: await prisma.chatConversation.count({ where: { status: 'ACTIVE' } }),
      resolved: await prisma.chatConversation.count({ where: { status: 'RESOLVED' } }),
      pendingAdmin: await prisma.chatConversation.count({ where: { status: 'PENDING_ADMIN' } }),
      totalMessages: await prisma.chatMessage.count(),
      unreadMessages: await prisma.chatMessage.count({ where: { isRead: false, sender: 'USER' } }),
    };

    // Fetch testimonials stats
    const testimonialStats = {
      total: await prisma.testimonial.count(),
      pending: await prisma.testimonial.count({ where: { isApproved: false } }),
      approved: await prisma.testimonial.count({ where: { isApproved: true } }),
      featured: await prisma.testimonial.count({ where: { isFeatured: true } }),
    };

    // Fetch content stats
    const eventStats = {
      total: await prisma.event.count(),
      active: await prisma.event.count({ where: { isActive: true } }),
      upcoming: await prisma.event.count({ where: { status: 'UPCOMING' } }),
      featured: await prisma.event.count({ where: { isFeatured: true } }),
    };

    const serviceStats = {
      total: await prisma.service.count(),
      active: await prisma.service.count({ where: { isActive: true } }),
    };

    const galleryStats = {
      total: await prisma.galleryImage.count(),
      featured: await prisma.galleryImage.count({ where: { isFeatured: true } }),
    };

    // Activity trends - last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = {
      newApplications: await prisma.application.count({ 
        where: { createdAt: { gte: thirtyDaysAgo } } 
      }),
      newReservations: (await prisma.flightReservation.count({ where: { createdAt: { gte: thirtyDaysAgo } } })) +
                       (await prisma.hotelReservation.count({ where: { createdAt: { gte: thirtyDaysAgo } } })) +
                       (await prisma.packageReservation.count({ where: { createdAt: { gte: thirtyDaysAgo } } })),
      newBookings: await prisma.booking.count({ 
        where: { createdAt: { gte: thirtyDaysAgo } } 
      }),
      newUsers: await prisma.user.count({ 
        where: { createdAt: { gte: thirtyDaysAgo } } 
      }),
      newTravelers: await prisma.traveler.count({ 
        where: { createdAt: { gte: thirtyDaysAgo } } 
      }),
    };

    // Status distribution data for charts
    const applicationStatusData = [
      { name: 'Draft', value: applicationStats.draft },
      { name: 'Submitted', value: applicationStats.submitted },
      { name: 'Under Review', value: applicationStats.underReview },
      { name: 'Approved', value: applicationStats.approved },
      { name: 'Rejected', value: applicationStats.rejected },
    ].filter(item => item.value > 0);

    const reservationStatusData = [
      { name: 'Pending', value: reservationStats.pending },
      { name: 'Confirmed', value: reservationStats.confirmed },
      { name: 'Completed', value: reservationStats.completed },
      { name: 'Cancelled', value: reservationStats.cancelled },
    ].filter(item => item.value > 0);

    const bookingStatusData = [
      { name: 'Pending', value: bookingStats.pending },
      { name: 'Confirmed', value: bookingStats.confirmed },
      { name: 'Completed', value: bookingStats.completed },
      { name: 'Cancelled', value: bookingStats.cancelled },
    ].filter(item => item.value > 0);

    const reservationTypeData = [
      { name: 'Flight Only', value: reservationStats.flight },
      { name: 'Hotel Only', value: reservationStats.hotel },
      { name: 'Flight + Hotel', value: reservationStats.both },
    ].filter(item => item.value > 0);

    return NextResponse.json({
      applications: {
        stats: applicationStats,
        recent: recentApplications,
        statusData: applicationStatusData,
      },
      reservations: {
        stats: reservationStats,
        recent: recentReservations,
        statusData: reservationStatusData,
        typeData: reservationTypeData,
      },
      bookings: {
        stats: bookingStats,
        recent: recentBookings,
        statusData: bookingStatusData,
      },
      programs: {
        stats: programStats,
      },
      users: {
        stats: userStats,
      },
      travelers: {
        stats: travelerStats,
      },
      chats: {
        stats: chatStats,
      },
      testimonials: {
        stats: testimonialStats,
      },
      events: {
        stats: eventStats,
      },
      services: {
        stats: serviceStats,
      },
      gallery: {
        stats: galleryStats,
      },
      recentActivity: recentActivity,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin dashboard data' },
      { status: 500 }
    );
  }
}
