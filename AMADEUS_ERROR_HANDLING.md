# Amadeus API Error Handling Guide

## Common Errors and Solutions

### Error 141: SYSTEM ERROR HAS OCCURRED

**What it means:**
- The Amadeus API encountered an internal system error
- Usually related to invalid routes or unavailable flight data

**Common Causes:**
1. **Invalid destination code** (e.g., `KMS` might not be a valid IATA code)
2. **Route not serviced** (no airlines fly this route)
3. **Test API limitations** (test environment has limited data)
4. **Date too far in future** (test API may only have data for near dates)

**Solutions:**
✅ Verify airport codes are valid IATA codes (3 letters)
✅ Try popular routes (e.g., ACC → LHR, ACC → JFK)
✅ Use dates within next 2-3 months
✅ Check if the route actually exists

**User-friendly message:**
> "No flights found for this route. The destination might not have available flights or the route is not supported. Please try a different destination or dates."

---

### Error 477 / 32171: Invalid Airport Code

**What it means:**
- The origin or destination code is not valid

**Solution:**
✅ Use the airport search dropdown
✅ Ensure 3-letter IATA codes (not city names)

**User-friendly message:**
> "Invalid airport code. Please select a valid airport from the dropdown."

---

### Error 4926: No Availability

**What it means:**
- No flights available for selected dates

**Solution:**
✅ Try different dates
✅ Check if dates are in the past
✅ Ensure dates are not too far in future

**User-friendly message:**
> "No flights available for the selected dates. Please try different dates."

---

### Error 895: Nothing Found for City (Hotels)

**What it means:**
- City code not recognized for hotel search

**Solution:**
✅ Use city code mapping (e.g., ZVJ → DXB)
✅ Try major city codes (ACC, DXB, LHR)

**User-friendly message:**
> "No hotels found in this city. Please try a different location."

---

## Implementation

### Updated Error Handling

```typescript
// lib/amadeus.ts
catch (error: any) {
  const errorBody = error.response?.body;
  let userMessage = 'Failed to search flights.';
  
  if (errorBody?.errors?.[0]) {
    const firstError = errorBody.errors[0];
    
    switch (firstError.code) {
      case 141:
        userMessage = 'No flights found for this route...';
        break;
      case 477:
      case 32171:
        userMessage = 'Invalid airport code...';
        break;
      case 4926:
        userMessage = 'No flights available for dates...';
        break;
      default:
        userMessage = firstError.detail || 'Please try again.';
    }
  }
  
  return {
    success: false,
    error: errorBody,
    userMessage, // User-friendly message
  };
}
```

### API Route Updates

```typescript
// app/api/reservations/flights/search/route.ts
if (!result.success) {
  return NextResponse.json(
    { 
      error: result.userMessage, // Show to user
      details: result.error      // Log details
    },
    { status: 500 }
  );
}
```

---

## Testing Recommendations

### Valid Routes (Test API)

✅ **Working Routes:**
- ACC (Accra) → LHR (London)
- ACC (Accra) → JFK (New York)
- ACC (Accra) → DXB (Dubai)
- LHR (London) → CDG (Paris)
- JFK (New York) → LAX (Los Angeles)

❌ **Problematic Routes:**
- ACC → KMS (KMS may not be valid/serviced)
- Obscure regional airports
- Routes with no airline service

### Valid Date Ranges

✅ **Good Dates:**
- Today + 7 days to Today + 60 days
- Near-term travel dates

❌ **Problematic Dates:**
- Past dates
- More than 6 months in future (test API limitation)
- Same-day departures

### Valid Passenger Counts

✅ **Supported:**
- Adults: 1-9
- Children: 0-8
- Infants: 0 (max = adults count)

---

## Debugging Steps

1. **Check the error log:**
   ```
   Amadeus Flight Search Error: ClientError
   queryPath: /v2/shopping/flight-offers?...
   ```

2. **Verify parameters:**
   - originLocationCode: Must be valid IATA (3 letters)
   - destinationLocationCode: Must be valid IATA (3 letters)
   - departureDate: YYYY-MM-DD format, future date
   - adults: Number between 1-9

3. **Test with known-good values:**
   ```
   Origin: ACC
   Destination: LHR
   Date: Today + 14 days
   Adults: 1
   ```

4. **Check Amadeus status:**
   - Visit: https://developers.amadeus.com/
   - Check for service outages
   - Verify API credentials

---

## Error Code Reference

| Code | Title | Meaning | Solution |
|------|-------|---------|----------|
| 141 | SYSTEM ERROR | Internal error or invalid route | Try different route/dates |
| 477 | INVALID FORMAT | Invalid airport code | Use valid IATA codes |
| 4926 | NO RESULTS | No flights for dates | Try different dates |
| 895 | NOTHING FOUND | City not found (hotels) | Use city mapping |
| 32171 | INVALID ORIGIN/DESTINATION | Invalid location code | Verify airport codes |
| 38194 | RESOURCE NOT FOUND | Endpoint issue | Check API documentation |

---

## User Experience Improvements

### Before
```
Error: {"errors":[{"status":500,"code":141,"title":"SYSTEM ERROR HAS OCCURRED"}]}
```
User sees technical error ❌

### After
```
No flights found for this route. The destination might not have 
available flights or the route is not supported. Please try a 
different destination or dates.
```
User sees helpful message ✅

---

## Monitoring

Track these metrics:
1. **Error rate by code** - Which errors occur most?
2. **Routes causing errors** - Which routes fail?
3. **Success rate** - % of successful searches
4. **User retry rate** - Do users try again?

---

## Future Enhancements

1. **Route Validation** - Check if route exists before API call
2. **Smart Suggestions** - Suggest alternative airports
3. **Cached Results** - Reduce API calls
4. **Fallback Data** - Show cached/historical data on error

---

## Support

**For users getting errors:**
1. Verify airport codes are valid
2. Try popular routes first
3. Use dates within 2 months
4. Contact support if issue persists

**For developers:**
1. Check error logs for details
2. Test with curl/Postman
3. Verify API credentials
4. Check Amadeus status page

---

**Last Updated:** January 22, 2026
