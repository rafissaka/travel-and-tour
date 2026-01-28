import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

// PATCH - Admin update quote with final pricing
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, totalAmount, packageDiscount, discountPercent, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 });
    }

    // Update the reservation
    const reservation = await prisma.packageReservation.update({
      where: { id },
      data: {
        status: status || 'QUOTE_SENT',
        totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
        packageDiscount: packageDiscount ? parseFloat(packageDiscount) : undefined,
        discountPercent: discountPercent ? parseFloat(discountPercent) : undefined,
        adminNotes,
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
        flightReservation: true,
        hotelReservation: true,
      },
    });

    // TODO: Send email notification to customer

    return NextResponse.json({
      success: true,
      reservation,
      message: 'Quote updated successfully',
    });
  } catch (error: any) {
    console.error('Update package quote error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
