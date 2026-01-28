// Hotel Quote Request API
// Creates a hotel reservation quote request

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
      city,
      country,
      checkInDate,
      checkOutDate,
      adults,
      children,
      rooms,
      hotelName,
      hotelAddress,
      roomType,
      amenities,
      starRating,
      basePriceUSD,
      nights,
      hotelDetails,
      quoteNotes,
    } = body;

    // Validation
    const missingFields = [];
    if (!city) missingFields.push('city');
    if (!checkInDate) missingFields.push('checkInDate');
    if (!checkOutDate) missingFields.push('checkOutDate');
    if (!adults) missingFields.push('adults');
    if (!basePriceUSD) missingFields.push('basePriceUSD');

    if (missingFields.length > 0) {
      console.error('Missing hotel quote fields:', missingFields, 'Body:', body);
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missingFields,
          debug: { city, checkInDate, checkOutDate, adults, basePriceUSD }
        },
        { status: 400 }
      );
    }

    // Calculate pricing with service fee
    const pricing = await calculateReservationPricing(parseFloat(basePriceUSD));

    // Create hotel reservation quote
    const reservation = await prisma.hotelReservation.create({
      data: {
        userId: user.id,
        city,
        country,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        adults: parseInt(adults),
        children: children ? parseInt(children) : 0,
        rooms: rooms ? parseInt(rooms) : 1,
        hotelName,
        hotelAddress,
        roomType,
        amenities: amenities || null,
        starRating: starRating ? parseInt(starRating) : null,
        hotelDetails: hotelDetails || null,
        basePriceUSD: pricing.basePriceUSD,
        basePriceGHS: pricing.basePriceGHS,
        serviceFee: pricing.serviceFee,
        totalAmount: pricing.totalAmount,
        exchangeRate: pricing.exchangeRate,
        nights: nights ? parseInt(nights) : null,
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
      message: 'Hotel quote request submitted successfully',
    });
  } catch (error: any) {
    console.error('Hotel quote request error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Get user's hotel reservations
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

    const reservations = await prisma.hotelReservation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      reservations,
    });
  } catch (error: any) {
    console.error('Get hotel reservations error:', error);
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
    const reservation = await prisma.hotelReservation.update({
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
    console.error('Update hotel quote error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
