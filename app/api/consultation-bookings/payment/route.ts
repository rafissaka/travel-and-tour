import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Initialize Paystack payment
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { consultationId } = await request.json();

    if (!consultationId) {
      return NextResponse.json(
        { error: 'Consultation ID is required' },
        { status: 400 }
      );
    }

    // Get consultation booking
    const consultation = await prisma.consultationBooking.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (consultation.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if already paid
    if (consultation.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Consultation already paid for' },
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

    // Ensure key is properly encoded (trim any whitespace/special chars)
    const cleanSecretKey = paystackSecretKey.trim().replace(/[\r\n]/g, '');

    // Convert GHS to pesewas (Paystack uses lowest currency unit)
    const amountInPesewas = Math.round(Number(consultation.feeEstimate) * 100);

    // Prepare payment data with safe ASCII-only encoding
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/consultation/payment/verify?consultationId=${consultation.id}`;
    
    const paymentData = {
      email: consultation.contactEmail,
      amount: amountInPesewas,
      currency: 'GHS',
      reference: `CONSULT-${consultation.id}-${Date.now()}`,
      callback_url: callbackUrl,
      metadata: {
        consultation_id: consultation.id,
        user_id: user.id,
        traveler_count: consultation.travelerCount,
      },
    };

    console.log('Initializing Paystack payment:', {
      amount: amountInPesewas,
      email: consultation.contactEmail,
      callback: callbackUrl,
      data: JSON.stringify(paymentData)
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

    // Update consultation with payment reference
    await prisma.consultationBooking.update({
      where: { id: consultationId },
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
