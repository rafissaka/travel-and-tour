import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { notifyAdminsNewReservation } from '@/lib/notifications';

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

// GET all reservations (admin sees all, user sees only their own)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const whereClause = isAdmin ? {} : { userId: user.id };

    // Fetch all three types of reservations
    const [flightReservations, hotelReservations, packageReservations] = await Promise.all([
      prisma.flightReservation.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.hotelReservation.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.packageReservation.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          flightReservation: true,
          hotelReservation: true,
        },
      }),
    ]);

    // Combine and add type field
    const allReservations = [
      ...flightReservations.map(r => ({ ...r, type: 'FLIGHT' })),
      ...hotelReservations.map(r => ({ ...r, type: 'HOTEL' })),
      ...packageReservations.map(r => ({ ...r, type: 'PACKAGE' })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ reservations: allReservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

// OLD RESERVATION ENDPOINTS REMOVED
// Use the following new endpoints instead:
// - POST /api/reservations/flights/quote - Create flight reservation
// - POST /api/reservations/hotels/quote - Create hotel reservation
// - GET /api/reservations/flights/quote - Get user's flight reservations
// - GET /api/reservations/hotels/quote - Get user's hotel reservations
