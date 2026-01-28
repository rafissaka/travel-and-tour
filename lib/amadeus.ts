/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// @ts-nocheck
// Amadeus API Helper
// Handles flight and hotel search functionality

import Amadeus from 'amadeus';
import { getAirportByCode } from './airports';

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY || '',
  clientSecret: process.env.AMADEUS_API_SECRET || '',
  hostname: process.env.AMADEUS_ENV === 'production' ? 'production' : 'test',
});

// Type Definitions
export interface FlightSearchParams {
  origin: string; // Airport code (e.g., "ACC")
  destination: string; // Airport code (e.g., "LHR")
  departureDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD (optional for one-way)
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  currencyCode?: string;
  max?: number; // Maximum results
}

export interface HotelSearchParams {
  cityCode: string; // IATA city code (e.g., "ACC" for Accra)
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  adults: number;
  roomQuantity?: number;
  radius?: number; // Search radius in KM
  radiusUnit?: 'KM' | 'MILE';
  hotelName?: string;
  ratings?: string[]; // e.g., ['4', '5'] for 4 and 5 star hotels
  priceRange?: string; // e.g., '100-300'
  currency?: string;
}

/**
 * Search for flights using Amadeus API
 */
export async function searchFlights(params: FlightSearchParams) {
  try {
    // Basic validation: ensure origin and destination look like IATA codes (3 letters)
    const origin = (params.origin || '').toUpperCase();
    const destination = (params.destination || '').toUpperCase();
    const iataRegex = /^[A-Z]{3}$/;

    if (!origin || !destination || !iataRegex.test(origin) || !iataRegex.test(destination)) {
      return {
        success: false,
        error: 'Invalid origin or destination format',
        userMessage: 'Invalid airport code. Please select a valid airport from the dropdown.',
      };
    }

    // Verify codes exist in our curated list before calling Amadeus.
    // This prevents sending invalid/obscure codes that cause Amadeus errors (e.g., Error 141).
    const originInfo = getAirportByCode(origin);
    const destInfo = getAirportByCode(destination);

    if (!originInfo || !destInfo) {
      // If either code is unknown to our curated list, return a friendly error.
      // (Optional enhancement: attempt Amadeus location lookup as a fallback.)
      return {
        success: false,
        error: 'Unknown origin or destination code',
        userMessage: 'Invalid airport code. Please select a valid airport from the dropdown.',
      };
    }

    const searchParams: any = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: params.departureDate,
      adults: params.adults,
      max: params.max || 10,
    };

    // Add optional parameters
    if (params.returnDate) {
      searchParams.returnDate = params.returnDate;
    }
    if (params.children) {
      searchParams.children = params.children;
    }
    if (params.infants) {
      searchParams.infants = params.infants;
    }
    if (params.travelClass) {
      searchParams.travelClass = params.travelClass;
    }
    if (params.currencyCode) {
      searchParams.currencyCode = params.currencyCode;
    }

    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);

    return {
      success: true,
      data: response.data,
      meta: response.result?.meta,
    };
  } catch (error: any) {
    console.error('Amadeus Flight Search Error:', error);
    
    // Parse error for better user messages
    const errorBody = error.response?.body;
    let userMessage = 'Failed to search flights. Please try again.';
    
    if (errorBody?.errors && Array.isArray(errorBody.errors)) {
      const firstError = errorBody.errors[0];
      
      // Handle specific error codes
      if (firstError.code === 141) {
        userMessage = 'No flights found for this route. The destination might not have available flights or the route is not supported. Please try a different destination or dates.';
      } else if (firstError.code === 477 || firstError.code === 32171) {
        userMessage = 'Invalid airport code. Please select a valid airport from the dropdown.';
      } else if (firstError.code === 4926) {
        userMessage = 'No flights available for the selected dates. Please try different dates.';
      } else if (firstError.status === 500) {
        userMessage = 'Flight search service temporarily unavailable. Please try again in a few moments.';
      } else if (firstError.detail) {
        userMessage = firstError.detail;
      }
    }
    
    return {
      success: false,
      error: errorBody || error.message,
      userMessage,
    };
  }
}

/**
 * Get hotel offers in a specific city
 */
export async function searchHotels(params: HotelSearchParams) {
  try {
    // Step 1: Get hotel IDs in the city
    const hotelsResponse = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode: params.cityCode,
    });

    if (!hotelsResponse.data || hotelsResponse.data.length === 0) {
      return {
        success: true,
        data: [],
        message: 'No hotels found in this city',
      };
    }

    // Get hotel IDs (limit to first 50 for performance)
    const hotelIds = hotelsResponse.data.slice(0, 50).map((hotel: any) => hotel.hotelId);

    // Step 2: Get offers for these hotels
    const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
      hotelIds: hotelIds.join(','),
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults,
      roomQuantity: params.roomQuantity || 1,
      currency: params.currency || 'USD',
    });

    return {
      success: true,
      data: offersResponse.data,
      meta: offersResponse.result?.meta,
    };
  } catch (error: any) {
    console.error('Amadeus Hotel Search Error:', error);
    return {
      success: false,
      error: error.response?.body || error.message,
    };
  }
}

/**
 * Confirm flight pricing before booking
 * Important: Flight prices can change, always confirm before payment
 */
export async function confirmFlightPrice(flightOffer: any) {
  try {
    const response = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [flightOffer],
        },
      })
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Amadeus Flight Price Confirmation Error:', error);
    return {
      success: false,
      error: error.response?.body || error.message,
    };
  }
}

/**
 * Get airport/city locations for autocomplete
 */
export async function searchLocations(keyword: string, subType: string[] = ['AIRPORT', 'CITY']) {
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: subType.join(','),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Amadeus Location Search Error:', error);
    return {
      success: false,
      error: error.response?.body || error.message,
    };
  }
}

export default amadeus;
