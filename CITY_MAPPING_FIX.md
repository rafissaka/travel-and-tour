# City Code Mapping Fix

## Problem

When searching for hotels using certain airport codes (like ZVJ - EK Bus Station in Dubai), the Amadeus API returns error:

```
Error 895: NOTHING FOUND FOR REQUESTED CITY
```

This happens because:
- Some airport codes (bus stations, secondary airports, seaplane terminals) are not recognized as valid city codes by Amadeus
- Amadeus hotel search API requires proper IATA city codes, not just any airport code
- ZVJ is a bus station code, not a city code

## Solution

Created a **city code mapping system** that automatically converts non-standard airport codes to their corresponding city codes for hotel searches.

## Implementation

### Files Created/Modified

1. **`lib/city-mapping.ts`** - New utility for city code mapping
2. **`app/api/reservations/hotels/search/route.ts`** - Updated to use mapping
3. **`app/components/ReservationsBooking.tsx`** - Shows user-friendly messages

### How It Works

```typescript
// User searches for hotels in ZVJ (bus station)
Input: cityCode = "ZVJ"

// System maps it to the nearest major city
Mapping: ZVJ → DXB (Dubai)

// Amadeus API receives the correct city code
API Call: cityCode = "DXB" ✅

// User sees helpful message
"Showing hotels in DXB area (nearest city to ZVJ)"
```

## Current Mappings

### UAE Locations
| Original Code | Mapped To | Description |
|---------------|-----------|-------------|
| ZVJ | DXB | EK Bus Station → Dubai |
| DWC | DXB | Dubai World Central → Dubai |
| DCG | DXB | Dubai Creek SPB → Dubai |
| NHD | DXB | Minhad AB → Dubai |
| DST | DXB | Dubai Seaplane Terminal → Dubai |

### Standard Codes (No Mapping)
- DXB - Dubai International Airport (already correct)
- AUH - Abu Dhabi Airport (already correct)
- ACC - Accra Airport (already correct)
- etc.

## Features

✅ **Automatic Mapping**: Transparent conversion of airport codes to city codes
✅ **User Notification**: Friendly message when mapping occurs
✅ **Fallback Logic**: Uses original code if no mapping exists
✅ **Case Insensitive**: Works with any case (zvj, ZVJ, Zvj)
✅ **Extensible**: Easy to add new mappings
✅ **Zero Breaking Changes**: Doesn't affect existing searches

## API Response

### Without Mapping (Standard Code)
```json
{
  "success": true,
  "hotels": [...],
  "meta": {...}
}
```

### With Mapping (Converted Code)
```json
{
  "success": true,
  "hotels": [...],
  "meta": {...},
  "cityMapping": {
    "originalCode": "ZVJ",
    "mappedCode": "DXB",
    "message": "Showing hotels in DXB area (nearest city to ZVJ)"
  }
}
```

## User Experience

**Before Fix:**
1. User searches "ZVJ" for hotels
2. Error: "Nothing found for requested criteria"
3. User confused ❌

**After Fix:**
1. User searches "ZVJ" for hotels
2. Info message: "Showing hotels in DXB area (nearest city to ZVJ)"
3. Hotels displayed successfully ✅

## Adding New Mappings

To add more city mappings, edit `lib/city-mapping.ts`:

```typescript
export const airportToCityMapping: Record<string, string> = {
  // Existing mappings...
  
  // Add new mappings
  'LHR': 'LON', // London Heathrow → London
  'JFK': 'NYC', // JFK Airport → New York City
  'CDG': 'PAR', // Charles de Gaulle → Paris
};
```

## Testing

### Test ZVJ Mapping
```typescript
import { getCityCodeForHotels } from '@/lib/city-mapping';

console.log(getCityCodeForHotels('ZVJ')); // Output: "DXB"
console.log(getCityCodeForHotels('DXB')); // Output: "DXB"
console.log(getCityCodeForHotels('ACC')); // Output: "ACC"
```

### Test in Browser
1. Navigate to reservations page
2. Search for flights/hotels using "ZVJ"
3. Should see: "Showing hotels in DXB area (nearest city to ZVJ)"
4. Hotels should display successfully

## Benefits

✅ **Better UX**: No confusing errors for users
✅ **More Coverage**: Support for bus stations, secondary airports
✅ **Transparent**: Users know what's happening
✅ **Maintainable**: Easy to add new mappings
✅ **Robust**: Graceful fallback if mapping fails

## Edge Cases Handled

- ✅ Code not in mapping → Uses original code
- ✅ Case variations → Converts to uppercase
- ✅ Invalid codes → Falls back gracefully
- ✅ API errors → Shows appropriate error message

## Future Enhancements

1. **Dynamic Mapping**: Fetch city mappings from database
2. **Radius Search**: Show hotels within X km of airport
3. **Multiple Cities**: Support airports serving multiple cities
4. **Smart Suggestions**: "Did you mean DXB instead of ZVJ?"
5. **Analytics**: Track which codes need mapping most

## Related Files

- `lib/amadeus.ts` - Amadeus API integration
- `lib/airports.ts` - Airport database
- `app/api/reservations/hotels/search/route.ts` - Hotel search endpoint
- `app/api/reservations/flights/search/route.ts` - Flight search (may need similar fix)
- `app/components/ReservationsBooking.tsx` - UI component

## Migration Notes

**No migration required** - This is a backwards-compatible enhancement.

Existing searches will work exactly as before. Only affected codes will use the mapping.

## Troubleshooting

### Hotels still not found after mapping?

1. Check if mapped city code is valid in Amadeus
2. Verify Amadeus API credentials
3. Check date formats (YYYY-MM-DD)
4. Ensure check-in date is in the future

### Mapping not working?

1. Clear Next.js cache: `npm run build`
2. Check console for mapping logs
3. Verify code is in `airportToCityMapping`
4. Test with uppercase code

### Wrong city being used?

1. Update mapping in `lib/city-mapping.ts`
2. Restart dev server
3. Clear browser cache

## Success Metrics

- ✅ ZVJ hotel searches now work
- ✅ No breaking changes to existing searches
- ✅ Users receive helpful feedback
- ✅ Easy to extend with new mappings

## Conclusion

This fix resolves the "Nothing found for requested city" error by intelligently mapping non-standard airport codes to their corresponding city codes, providing a seamless experience for users searching for hotels near bus stations, secondary airports, and other transportation hubs.
