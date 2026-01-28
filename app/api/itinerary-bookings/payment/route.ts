import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Initialize Paystack payment for itinerary planning
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { itineraryId } = await request.json();

    if (!itineraryId) {
      return NextResponse.json(
        { error: 'Itinerary ID is required' },
        { status: 400 }
      );
    }

    // Get itinerary booking
    const itineraryBooking = await prisma.itineraryBooking.findUnique({
      where: { id: itineraryId },
    });

    if (!itineraryBooking) {
      return NextResponse.json(
        { error: 'Itinerary booking not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (itineraryBooking.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if already paid
    if (itineraryBooking.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Itinerary already paid for' },
        { status: 400 }
      );
    }

    // Check if fee has been set
    if (!itineraryBooking.finalFee && !itineraryBooking.feeEstimate) {
      return NextResponse.json(
        { error: 'Fee not yet determined. Please wait for admin to provide a quote.' },
        { status: 400 }
      );
    }

    // Initialize Paystack payment
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      console.error('Paystack secret key not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Ensure key is properly encoded
    const cleanSecretKey = paystackSecretKey.trim().replace(/[\r\n]/g, '');

    // Use final fee if set, otherwise use estimate
    const feeAmount = itineraryBooking.finalFee || itineraryBooking.feeEstimate;
    
    // Convert GHS to pesewas (Paystack uses lowest currency unit)
    const amountInPesewas = Math.round(Number(feeAmount) * 100);

    // Prepare payment data
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/itinerary/payment/verify?itineraryId=${itineraryBooking.id}`;
    
    const paymentData = {
      email: itineraryBooking.contactEmail,
      amount: amountInPesewas,
      currency: 'GHS',
      reference: `ITINERARY-${itineraryBooking.id}-${Date.now()}`,
      callback_url: callbackUrl,
      metadata: {
        itinerary_id: itineraryBooking.id,
        user_id: user.id,
        destination: itineraryBooking.destination,
        traveler_count: itineraryBooking.travelerCount,
        trip_duration: itineraryBooking.tripDuration,
      },
    };

    console.log('Initializing Paystack payment for itinerary:', {
      amount: amountInPesewas,
      email: itineraryBooking.contactEmail,
      callback: callbackUrl,
    });

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanSecretKey}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(paymentData),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Paystack initialization failed:', paystackData);
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 500 }
      );
    }

    // Update booking with payment reference
    await prisma.itineraryBooking.update({
      where: { id: itineraryId },
      data: {
        paymentReference: paystackData.data.reference,
      },
    });

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference,
    });

  } catch (error) {
    console.error('Error initializing payment:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}
