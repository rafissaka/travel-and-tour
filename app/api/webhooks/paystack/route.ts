import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { notifyAdmins, notifyPaymentReceived, notifyBookingStatusChange } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    // Verify Paystack signature
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecretKey) {
      console.error('Paystack secret key not configured');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      console.error('No Paystack signature found');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Verify the signature
    const hash = crypto
      .createHmac('sha512', paystackSecretKey)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid Paystack signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Parse the webhook data
    const event = JSON.parse(body);

    console.log('Paystack webhook received:', event.event);

    // Handle different event types
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;

      if (metadata && metadata.consultationId) {
        const consultationId = metadata.consultationId;

        // Update consultation booking status
        const consultation = await prisma.consultationBooking.findUnique({
          where: { id: consultationId },
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        if (!consultation) {
          console.error('Consultation not found:', consultationId);
          return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
        }

        // Only update if not already paid
        if (consultation.paymentStatus !== 'PAID') {
          await prisma.consultationBooking.update({
            where: { id: consultationId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              confirmedAt: new Date(),
              paymentReference: reference,
            },
          });

          // Notify admins about confirmed payment
          await notifyAdmins(
            'Consultation Payment Confirmed',
            `Payment confirmed for consultation from ${consultation.contactFullName}. Amount: GHS ${consultation.feeEstimate}`,
            `/profile/bookings`
          );

          console.log('Consultation payment confirmed:', consultationId);
        }
      } else if (metadata && metadata.bookingId) {
        const bookingId = metadata.bookingId;

        // Update booking status
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
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
          console.error('Booking not found:', bookingId);
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Only update if not already paid
        if (booking.paymentStatus !== 'PAID') {
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
            booking.userId,
            bookingId,
            Number(booking.totalAmount || 0),
            'GHS'
          );

          // Notify user about booking confirmation
          await notifyBookingStatusChange(
            booking.userId,
            bookingId,
            'CONFIRMED',
            itemName
          );

          // Notify admins about confirmed payment
          await notifyAdmins(
            'Booking Payment Confirmed',
            `Payment confirmed for booking from ${booking.user.firstName} ${booking.user.lastName}. Amount: GH₵ ${booking.totalAmount}`,
            `/profile/bookings`
          );

          console.log('Booking payment confirmed:', bookingId);
        }
      }
    }

    // Return 200 to acknowledge receipt of webhook
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
