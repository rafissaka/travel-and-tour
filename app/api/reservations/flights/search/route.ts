// Flight Search API Endpoint
// Searches for available flights using Amadeus API

import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/lib/amadeus';

export async function POST(request: NextRequest) {
  try {
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
    } = body;

    // Validation
    if (!origin || !destination || !departureDate || !adults) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, departureDate, adults' },
        { status: 400 }
      );
    }

    // Search flights using Amadeus
    const result = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults: parseInt(adults),
      children: children ? parseInt(children) : 0,
      infants: infants ? parseInt(infants) : 0,
      travelClass: cabin || 'ECONOMY',
      max: 20, // Return up to 20 flight options
    });

    // Handle errors gracefully - return empty results instead of error for route issues
    if (!result.success) {
      const errorBody = result.error;
      const isRouteError = errorBody?.errors?.some((err: any) => 
        err.code === 141 || err.code === 4926
      );
      
      // For route/availability errors, return empty results with message
      if (isRouteError) {
        return NextResponse.json({
          success: true,
          flights: [],
          meta: {},
          message: result.userMessage || 'No flights found for this route',
        });
      }
      
      // For other errors, return error response
      return NextResponse.json(
        { 
          error: result.userMessage || 'Failed to search flights',
          details: result.error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      flights: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error('Flight search error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
