import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Verify Paystack payment
async function verifyPayment(request: NextRequest, isPost: boolean = false) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let reference, consultationId;

    if (isPost) {
      const body = await request.json();
      reference = body.reference;
      consultationId = body.consultationId;
    } else {
      const { searchParams } = new URL(request.url);
      reference = searchParams.get('reference');
      consultationId = searchParams.get('consultationId');
    }

    if (!reference || !consultationId) {
      return NextResponse.json(
        { error: 'Missing payment reference or consultation ID' },
        { status: 400 }
      );
    }

    // Get consultation
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

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment verification failed', data: verifyData },
        { status: 400 }
      );
    }

    // Verify the amount paid matches the expected amount
    const expectedAmount = Number(consultation.feeEstimate) * 100; // Convert to kobo
    const paidAmount = verifyData.data.amount;

    if (paidAmount !== expectedAmount) {
      return NextResponse.json(
        {
          error: 'Payment amount mismatch',
          expected: expectedAmount,
          paid: paidAmount
        },
        { status: 400 }
      );
    }

    // Update consultation booking
    await prisma.consultationBooking.update({
      where: { id: consultationId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      consultation: {
        id: consultationId,
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
      },
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return verifyPayment(request, false);
}

export async function POST(request: NextRequest) {
  return verifyPayment(request, true);
}
