import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { notifyPaymentReceived, notifyBookingStatusChange, notifyAdmins } from '@/lib/notifications';

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

// Verify payment with Paystack
async function verifyPaystackPayment(reference: string) {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecretKey) {
    throw new Error('Paystack secret key not configured');
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to verify payment with Paystack');
  }

  const data = await response.json();
  return data;
}

// POST verify payment
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reference, bookingId } = body;

    if (!reference || !bookingId) {
      return NextResponse.json(
        { error: 'Reference and booking ID are required' },
        { status: 400 }
      );
    }

    // Verify the booking exists and belongs to the user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: {
          select: {
            title: true,
          },
        },
        service: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if already paid
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        message: 'Payment already confirmed',
      });
    }

    // Verify payment with Paystack
    const paystackResponse = await verifyPaystackPayment(reference);

    if (
      paystackResponse.status &&
      paystackResponse.data.status === 'success'
    ) {
      // Update booking status
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });

      const itemName = booking.event?.title || booking.service?.title || 'booking';

      // Notify user about payment confirmation
      await notifyPaymentReceived(
        user.id,
        bookingId,
        Number(booking.totalAmount || 0),
        'GHS'
      );

      // Notify user about booking confirmation
      await notifyBookingStatusChange(
        user.id,
        bookingId,
        'CONFIRMED',
        itemName
      );

      // Notify admins
      await notifyAdmins(
        'Booking Payment Confirmed',
        `Payment confirmed for booking. Amount: GH₵ ${booking.totalAmount}`,
        `/profile/bookings`
      );

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
