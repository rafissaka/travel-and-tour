// Hotel Search API Endpoint
// Searches for available hotels using Amadeus API

import { NextRequest, NextResponse } from 'next/server';
import { searchHotels } from '@/lib/amadeus';
import { getCityCodeForHotels, getMappedCityInfo } from '@/lib/city-mapping';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      city,
      cityCode,
      checkInDate,
      checkOutDate,
      adults,
      children,
      rooms,
    } = body;

    // Validation
    if (!cityCode || !checkInDate || !checkOutDate || !adults) {
      return NextResponse.json(
        { error: 'Missing required fields: cityCode, checkInDate, checkOutDate, adults' },
        { status: 400 }
      );
    }

    // Map airport code to city code if needed (e.g., ZVJ → DXB)
    const mappingInfo = getMappedCityInfo(cityCode);
    const actualCityCode = mappingInfo.mappedCode;

    // Log mapping for debugging
    if (mappingInfo.isMapped) {
      console.log(`Hotel search: Mapped ${cityCode} → ${actualCityCode}`);
    }

    // Search hotels using Amadeus
    const result = await searchHotels({
      cityCode: actualCityCode,
      checkInDate,
      checkOutDate,
      adults: parseInt(adults),
      roomQuantity: rooms ? parseInt(rooms) : 1,
      currency: 'USD', // We'll convert to GHS on the client/server
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to search hotels' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      hotels: result.data,
      meta: result.meta,
      cityMapping: mappingInfo.isMapped ? {
        originalCode: cityCode,
        mappedCode: actualCityCode,
        message: mappingInfo.message,
      } : undefined,
    });
  } catch (error: any) {
    console.error('Hotel search error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
