// Location Search API using Amadeus
// Searches for airports and cities dynamically with fallback to static list

import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/amadeus';
import { searchAirports } from '@/lib/airports';
import { apiCache, createCacheKey } from '@/lib/cache';

// Simple circuit breaker for Amadeus rate limits
let amadeusErrorUntil = 0; // Timestamp when Amadeus can be tried again

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const type = searchParams.get('type') || 'airport'; // 'airport' or 'city'

    if (!keyword || keyword.length < 2) {
      return NextResponse.json({
        success: true,
        locations: [],
      });
    }

    // Check cache first to avoid rate limiting
    const cacheKey = createCacheKey('location-search', { keyword, type });
    const cachedResult = apiCache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    // Determine subType based on request
    const subTypes = type === 'city'
      ? ['CITY', 'AIRPORT']
      : ['AIRPORT', 'CITY'];

    // Circuit Breaker check
    const isAmadeusSuppressed = Date.now() < amadeusErrorUntil;
    let result: any = { success: false };

    if (!isAmadeusSuppressed) {
      // Try Amadeus API first
      result = await searchLocations(keyword, subTypes);

      // If we hit a rate limit, suppress Amadeus for 1 minute
      if (result.isRateLimit) {
        amadeusErrorUntil = Date.now() + 60000;
        console.warn('Amadeus Rate Limit hit. Suppressing for 60s.');
      }
    } else {
      console.log('Amadeus suppressed, using static fallback for:', keyword);
    }

    let locations: any[] = [];

    if (result.success && result.data && result.data.length > 0) {
      // Transform Amadeus response to our format
      locations = result.data.map((location: any) => ({
        code: location.iataCode,
        city: location.address?.cityName || location.name,
        country: location.address?.countryName || '',
        airport: location.name,
        type: location.subType,
      }));
    } else {
      // Fallback to static list if Amadeus returns no results
      const staticResults = searchAirports(keyword, 10);
      locations = staticResults.map(loc => ({
        code: loc.code,
        city: loc.city,
        country: loc.country,
        airport: loc.airport,
        type: 'AIRPORT',
      }));
    }

    // Determine the source of results
    let source = 'static';
    if (locations.length > 0) {
      if (!isAmadeusSuppressed && result.success && result.data?.length > 0) {
        source = 'amadeus';
      } else {
        source = 'static';
      }
    }

    const response = {
      success: true,
      locations,
      source,
    };

    // Cache the result for 10 minutes to reduce API calls
    apiCache.set(cacheKey, response, 10);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Location search error:', error);
    const keyword = request.nextUrl.searchParams.get('keyword') || '';

    // Fallback to static list on error
    try {
      const staticResults = searchAirports(keyword, 10);
      const locations = staticResults.map(loc => ({
        code: loc.code,
        city: loc.city,
        country: loc.country,
        airport: loc.airport,
        type: 'AIRPORT',
      }));

      return NextResponse.json({
        success: true,
        locations,
        source: locations.length > 0 ? 'static' : 'none',
      });
    } catch {
      return NextResponse.json({
        success: true,
        locations: [],
      });
    }
  }
}
