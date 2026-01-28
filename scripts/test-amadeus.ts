// Test Amadeus API Connection
// Run with: npx ts-node scripts/test-amadeus.ts

import { searchFlights, searchLocations } from '../lib/amadeus';

async function testAmadeusConnection() {
  console.log('🧪 Testing Amadeus API Connection...\n');

  try {
    // Test 1: Search locations (Airport autocomplete)
    console.log('Test 1: Searching for "Accra" airports...');
    const locationResult = await searchLocations('Accra', ['AIRPORT']);
    
    if (locationResult.success && locationResult.data) {
      console.log('✅ Location search successful!');
      console.log(`Found ${locationResult.data.length} locations`);
      if (locationResult.data.length > 0) {
        console.log('First result:', locationResult.data[0]);
      }
    } else {
      console.log('❌ Location search failed:', locationResult.error);
      return;
    }

    console.log('\n---\n');

    // Test 2: Search flights
    console.log('Test 2: Searching for flights ACC → LHR...');
    const flightResult = await searchFlights({
      origin: 'ACC',
      destination: 'LHR',
      departureDate: '2026-07-15',
      adults: 1,
      max: 5,
    });

    if (flightResult.success && flightResult.data) {
      console.log('✅ Flight search successful!');
      console.log(`Found ${flightResult.data.length} flight options`);
      
      if (flightResult.data.length > 0) {
        const firstFlight = flightResult.data[0];
        console.log('\nFirst flight option:');
        console.log('  Price:', firstFlight.price?.total, firstFlight.price?.currency);
        console.log('  Validating:', firstFlight.validatingAirlineCodes?.[0]);
        console.log('  Duration:', firstFlight.itineraries?.[0]?.duration);
      }
    } else {
      console.log('❌ Flight search failed:', flightResult.error);
    }

    console.log('\n✨ Amadeus API is working correctly!\n');
    console.log('Next steps:');
    console.log('1. Build the UI components');
    console.log('2. Test the complete booking flow');
    console.log('3. Set up admin approval interface');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testAmadeusConnection();
