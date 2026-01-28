// Flight Quote Request API
// Creates a flight reservation quote request

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateReservationPricing } from '@/lib/currency';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      cabin,
      airline,
      flightNumber,
      departureTime,
      arrivalTime,
      duration,
      stops,
      basePriceUSD,
      flightDetails,
      quoteNotes,
    } = body;

    // Validation
    if (!origin || !destination || !departureDate || !adults || !basePriceUSD) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate pricing with service fee
    const pricing = await calculateReservationPricing(parseFloat(basePriceUSD));

    // Create flight reservation quote
    const reservation = await prisma.flightReservation.create({
      data: {
        userId: user.id,
        origin,
        destination,
        departureDate: new Date(departureDate),
        returnDate: returnDate ? new Date(returnDate) : null,
        adults: parseInt(adults),
        children: children ? parseInt(children) : 0,
        infants: infants ? parseInt(infants) : 0,
        cabin: cabin || 'ECONOMY',
        airline,
        flightNumber,
        departureTime,
        arrivalTime,
        duration,
        stops: stops ? parseInt(stops) : 0,
        flightDetails: flightDetails || null,
        basePriceUSD: pricing.basePriceUSD,
        basePriceGHS: pricing.basePriceGHS,
        serviceFee: pricing.serviceFee,
        totalAmount: pricing.totalAmount,
        exchangeRate: pricing.exchangeRate,
        quoteNotes,
        status: 'PENDING_QUOTE',
        paymentStatus: 'PENDING',
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
      },
    });

    return NextResponse.json({
      success: true,
      reservation,
      message: 'Flight quote request submitted successfully',
    });
  } catch (error: any) {
    console.error('Flight quote request error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Get user's flight reservations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const reservations = await prisma.flightReservation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      reservations,
    });
  } catch (error: any) {
    console.error('Get flight reservations error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

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
    const { id, status, basePriceUSD, basePriceGHS, totalAmount, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 });
    }

    // Update the reservation
    const reservation = await prisma.flightReservation.update({
      where: { id },
      data: {
        status: status || 'QUOTE_SENT',
        basePriceUSD: basePriceUSD ? parseFloat(basePriceUSD) : undefined,
        basePriceGHS: basePriceGHS ? parseFloat(basePriceGHS) : undefined,
        totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
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
      },
    });

    // TODO: Send email notification to customer

    return NextResponse.json({
      success: true,
      reservation,
      message: 'Quote updated successfully',
    });
  } catch (error: any) {
    console.error('Update flight quote error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
