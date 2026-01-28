# Amadeus API Setup Guide

## Step 1: Register for Amadeus API

1. Go to https://developers.amadeus.com/
2. Click "Register" and create an account
3. Once logged in, go to "My Self-Service Workspace"
4. Click "Create New App"
5. Fill in the app details:
   - App Name: Ghana Travel Hub
   - App Description: Flight and hotel booking system

## Step 2: Get API Credentials

After creating your app, you'll receive:
- **API Key** (Client ID)
- **API Secret** (Client Secret)

You'll see two environments:
- **Test Environment**: For development (free, limited data)
- **Production Environment**: For live usage (paid, real bookings)

## Step 3: Add to Environment Variables

Add these to your `.env.local` file:

```env
# Amadeus API Configuration
AMADEUS_API_KEY=your_api_key_here
AMADEUS_API_SECRET=your_api_secret_here
AMADEUS_ENV=test  # Use 'production' when ready for live bookings

# Exchange Rate API (for USD to GHS conversion)
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
# Get free API key from: https://www.exchangerate-api.com/
```

## Step 4: Install Amadeus SDK

```bash
npm install amadeus
```

## API Endpoints We'll Use

### Flight Search
- **Endpoint**: `GET /v2/shopping/flight-offers`
- **Purpose**: Search for available flights
- **Quota**: Test environment allows limited searches per month

### Hotel Search
- **Endpoint**: `GET /v3/shopping/hotel-offers`
- **Purpose**: Search for available hotels
- **Quota**: Test environment allows limited searches per month

### Flight Price Confirmation
- **Endpoint**: `POST /v1/shopping/flight-offers/pricing`
- **Purpose**: Confirm flight pricing before booking
- **Important**: Prices can change, always confirm before payment

### Hotel Offers by City
- **Endpoint**: `GET /v1/reference-data/locations/hotels/by-city`
- **Purpose**: Get hotel IDs in a specific city
- **Then**: Use hotel IDs to get detailed offers

## Rate Limits (Test Environment)

- **Flight Offers Search**: 2,000 calls/month (free)
- **Hotel Search**: 2,000 calls/month (free)
- **Flight Price**: Unlimited (confirmation calls)

## Important Notes

1. **Test vs Production**:
   - Test environment uses cached data (not real-time)
   - Production requires approval and has costs per booking
   
2. **Currency**:
   - Amadeus returns prices in USD by default
   - We need to convert to GHS (Ghana Cedis)
   
3. **Booking Flow**:
   - Search → Display Results → Quote Request → Admin Approval → Payment
   - We're NOT making actual bookings through API
   - Using it for search and pricing only

## Exchange Rate API Setup

1. Go to https://www.exchangerate-api.com/
2. Sign up for free account
3. Get your API key
4. Free tier: 1,500 requests/month

Alternative: Use Bank of Ghana rates (manual update daily)

## Testing the Integration

Once configured, test with:
```bash
npm run test-amadeus
```

This will verify your API credentials are working.
