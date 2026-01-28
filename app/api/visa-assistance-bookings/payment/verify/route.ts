import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Verify Paystack payment for visa assistance
async function verifyPayment(request: NextRequest, isPost: boolean = false) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let reference, visaAssistanceId;

    if (isPost) {
      const body = await request.json();
      reference = body.reference;
      visaAssistanceId = body.visaAssistanceId;
    } else {
      const { searchParams } = new URL(request.url);
      reference = searchParams.get('reference');
      visaAssistanceId = searchParams.get('visaAssistanceId');
    }

    if (!reference || !visaAssistanceId) {
      return NextResponse.json(
        { error: 'Missing payment reference or visa assistance ID' },
        { status: 400 }
      );
    }

    // Get visa assistance booking
    const visaBooking = await prisma.visaAssistanceBooking.findUnique({
      where: { id: visaAssistanceId },
    });

    if (!visaBooking) {
      return NextResponse.json(
        { error: 'Visa assistance booking not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (visaBooking.userId !== user.id) {
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
    const feeAmount = visaBooking.finalFee || visaBooking.feeEstimate;
    const expectedAmount = Number(feeAmount) * 100; // Convert to pesewas
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

    // Update visa assistance booking
    await prisma.visaAssistanceBooking.update({
      where: { id: visaAssistanceId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      visaBooking: {
        id: visaAssistanceId,
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
