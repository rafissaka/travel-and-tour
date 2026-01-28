// Package Quote Request API
// Creates flight + hotel package reservation with discount

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculatePackagePricing } from '@/lib/currency';

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
      // Flight data
      flightData,
      // Hotel data
      hotelData,
      // Package notes
      packageNotes,
    } = body;

    // Validation
    if (!flightData || !hotelData) {
      return NextResponse.json(
        { error: 'Both flight and hotel data are required for package booking' },
        { status: 400 }
      );
    }

    // Calculate package pricing with 5% discount
    const flightPriceUSD = parseFloat(flightData.basePriceUSD);
    const hotelPriceUSD = parseFloat(hotelData.basePriceUSD);
    
    const packagePricing = await calculatePackagePricing(flightPriceUSD, hotelPriceUSD);

    // Create flight reservation
    const flightReservation = await prisma.flightReservation.create({
      data: {
        userId: user.id,
        origin: flightData.origin,
        destination: flightData.destination,
        departureDate: new Date(flightData.departureDate),
        returnDate: flightData.returnDate ? new Date(flightData.returnDate) : null,
        adults: parseInt(flightData.adults),
        children: flightData.children ? parseInt(flightData.children) : 0,
        infants: flightData.infants ? parseInt(flightData.infants) : 0,
        cabin: flightData.cabin || 'ECONOMY',
        airline: flightData.airline,
        flightNumber: flightData.flightNumber,
        departureTime: flightData.departureTime,
        arrivalTime: flightData.arrivalTime,
        duration: flightData.duration,
        stops: flightData.stops ? parseInt(flightData.stops) : 0,
        flightDetails: flightData.flightDetails || null,
        basePriceUSD: flightPriceUSD,
        basePriceGHS: packagePricing.basePriceGHS * (flightPriceUSD / packagePricing.basePriceUSD),
        serviceFee: packagePricing.serviceFee * (flightPriceUSD / packagePricing.basePriceUSD),
        totalAmount: packagePricing.totalAmount * (flightPriceUSD / packagePricing.basePriceUSD),
        exchangeRate: packagePricing.exchangeRate,
        status: 'PENDING_QUOTE',
        paymentStatus: 'PENDING',
      },
    });

    // Create hotel reservation
    const hotelReservation = await prisma.hotelReservation.create({
      data: {
        userId: user.id,
        city: hotelData.city,
        country: hotelData.country,
        checkInDate: new Date(hotelData.checkInDate),
        checkOutDate: new Date(hotelData.checkOutDate),
        adults: parseInt(hotelData.adults),
        children: hotelData.children ? parseInt(hotelData.children) : 0,
        rooms: hotelData.rooms ? parseInt(hotelData.rooms) : 1,
        hotelName: hotelData.hotelName,
        hotelAddress: hotelData.hotelAddress,
        roomType: hotelData.roomType,
        amenities: hotelData.amenities || null,
        starRating: hotelData.starRating ? parseInt(hotelData.starRating) : null,
        hotelDetails: hotelData.hotelDetails || null,
        basePriceUSD: hotelPriceUSD,
        basePriceGHS: packagePricing.basePriceGHS * (hotelPriceUSD / packagePricing.basePriceUSD),
        serviceFee: packagePricing.serviceFee * (hotelPriceUSD / packagePricing.basePriceUSD),
        totalAmount: packagePricing.totalAmount * (hotelPriceUSD / packagePricing.basePriceUSD),
        exchangeRate: packagePricing.exchangeRate,
        nights: hotelData.nights,
        status: 'PENDING_QUOTE',
        paymentStatus: 'PENDING',
      },
    });

    // Create package reservation linking both
    const packageReservation = await prisma.packageReservation.create({
      data: {
        userId: user.id,
        flightReservationId: flightReservation.id,
        hotelReservationId: hotelReservation.id,
        packageDiscount: packagePricing.packageDiscount,
        discountPercent: 5.0, // 5% discount
        totalAmount: packagePricing.finalTotal,
        adminNotes: packageNotes || null,
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
        flightReservation: true,
        hotelReservation: true,
      },
    });

    return NextResponse.json({
      success: true,
      package: packageReservation,
      savings: packagePricing.packageDiscount,
      message: 'Package quote request submitted successfully! You saved GH₵ ' + packagePricing.packageDiscount.toFixed(2),
    });
  } catch (error: any) {
    console.error('Package quote request error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Get user's package reservations
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

    const packages = await prisma.packageReservation.findMany({
      where: { userId: user.id },
      include: {
        flightReservation: true,
        hotelReservation: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      packages,
    });
  } catch (error: any) {
    console.error('Get package reservations error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
