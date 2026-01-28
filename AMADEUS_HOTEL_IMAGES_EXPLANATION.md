# Amadeus Hotel Images - Technical Explanation

## Question: Does Amadeus Hotel Search API Provide Images?

**Short Answer:** ❌ **NO** - As of January 2026, the Amadeus hotel search API does NOT provide hotel images in the response.

## What Amadeus Hotel API Provides

The Amadeus hotel search API (`shopping.hotelOffersSearch`) returns:

```json
{
  "data": [
    {
      "type": "hotel-offers",
      "hotel": {
        "hotelId": "BGLONALL",
        "name": "Hilton London Heathrow Airport",
        "rating": 5,
        "cityCode": "LON",
        "address": {
          "lines": ["Terminal 4, Heathrow Airport"],
          "cityName": "LONDON",
          "countryCode": "GB"
        }
        // ❌ NO image field
        // ❌ NO media field
        // ❌ NO photo field
      },
      "offers": [
        {
          "id": "...",
          "room": {
            "typeEstimated": {
              "category": "STANDARD_ROOM"
            },
            "description": {
              "text": "Standard Room with 2 Twin Beds"
            }
          },
          "price": {
            "total": "150.00",
            "currency": "USD"
          }
        }
      ]
    }
  ]
}
```

## What's Missing

❌ No `hotel.images` field
❌ No `hotel.media` field  
❌ No `hotel.photos` field
❌ No `hotel.thumbnails` field

## Our Solution

Since Amadeus doesn't provide images, we implemented a **3-tier image system**:

### Tier 1: Check for Amadeus Images (Future-Proof) ⏳
```typescript
// If Amadeus adds images in the future, use them automatically
if (hotel.media?.[0]?.uri) {
  return hotel.media[0].uri;
}
```
**Status:** Not available yet, but ready if Amadeus adds this feature

### Tier 2: Unsplash Images (Currently Active) ✅
```typescript
// Generate dynamic Unsplash image based on hotel details
return `https://source.unsplash.com/800x600/?hotel,luxury,${cityName}&sig=${index}`;
```
**Benefits:**
- Free, no API key required
- High-quality professional photos
- Dynamic based on city and rating
- Variety using index seeding

### Tier 3: Gradient Fallback (Always Works) ✅
```typescript
// Beautiful gradient if images fail to load
<div className="bg-gradient-to-br from-purple-500 to-pink-500">
  <Hotel icon />
</div>
```
**Benefits:**
- Always displays something
- Color-coded by rating (5-star = gold, 4-star = purple, etc.)
- Fast, no network request

## Alternative Solutions

If you need **real hotel photos**, here are options:

### Option 1: Google Places API ⭐ Recommended
```typescript
// 1. Search for hotel by name + address
const place = await googlePlaces.findPlaceFromText({
  input: `${hotelName}, ${cityName}`,
  inputtype: 'textquery',
  fields: 'photos,place_id'
});

// 2. Get photo reference
const photoRef = place.photos[0].photo_reference;

// 3. Get photo URL
const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${API_KEY}`;
```

**Cost:** $7 per 1,000 requests
**Accuracy:** Very high (real hotel photos)

### Option 2: Pexels API
```typescript
const response = await fetch(
  `https://api.pexels.com/v1/search?query=${hotelName} ${cityName}&per_page=1`,
  {
    headers: { Authorization: process.env.PEXELS_API_KEY }
  }
);
```

**Cost:** Free (200 requests/hour)
**Accuracy:** Medium (generic hotel photos)

### Option 3: Custom Image Database
- Store hotel images in Cloudinary/Supabase
- Match by hotel name or ID
- Full control over images

**Cost:** Storage + bandwidth
**Accuracy:** Perfect (you control the images)

### Option 4: Hotel Booking APIs
- Booking.com API
- Expedia API  
- Hotels.com API

**Cost:** Usually requires partnership
**Accuracy:** Perfect (real hotel data + images)

## Why We Use Unsplash

✅ **Free** - No API key, no rate limits
✅ **Easy** - Just construct URL, no API calls
✅ **Fast** - Direct image URL
✅ **Good Quality** - Professional photos
✅ **No Setup** - Works immediately
❌ **Not Accurate** - Generic hotel photos, not specific hotel

## Future Enhancement Plan

### Phase 1: Current (Unsplash) ✅ Done
- Quick solution for MVP
- No cost, no complexity

### Phase 2: Add Pexels API (Recommended Next)
- Better variety
- 200 requests/hour free tier
- Fallback to Unsplash if limit reached

### Phase 3: Add Google Places (Production Ready)
- Real hotel photos
- High accuracy
- Cache results to reduce API calls

### Phase 4: Custom Database (Enterprise)
- Upload real hotel images
- Perfect accuracy
- Full control

## Code Structure

```
lib/hotel-images.ts
├── getHotelImageUrl()          # Main function
│   ├── Check Amadeus images    # Priority 1 (future)
│   ├── Return Unsplash URL     # Priority 2 (current)
│   └── Return gradient class   # Priority 3 (fallback)
│
├── getHotelGradient()          # Fallback gradients
│   └── Color by rating
│
└── alternativeImageSources     # For future expansion
    ├── pexels()
    ├── picsum()
    └── placeholder()
```

## Performance Metrics

| Source | Speed | Accuracy | Cost | Setup |
|--------|-------|----------|------|-------|
| Amadeus API | N/A | N/A | N/A | ❌ Not Available |
| Unsplash | Fast | Low | Free | ✅ Done |
| Pexels API | Fast | Medium | Free | 5 mins |
| Google Places | Medium | High | $7/1k | 10 mins |
| Custom DB | Fast | Perfect | Storage | Hours |

## Example Output

### Current Implementation
```
User searches hotels in Dubai
↓
Amadeus returns: Hilton Dubai (no image)
↓
Our system generates: unsplash.com/800x600/?hotel,luxury,dubai&sig=1
↓
User sees: Beautiful hotel image (generic Dubai hotel)
```

### If Amadeus Added Images (Future)
```
User searches hotels in Dubai
↓
Amadeus returns: Hilton Dubai + image URL
↓
Our system uses: Amadeus image (real Hilton photo)
↓
User sees: Actual Hilton Dubai photo
```

## Testing

You can verify that Amadeus doesn't provide images by checking the API response:

```bash
# Make a hotel search request
curl "https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=BGLONALL&adults=2&checkInDate=2026-06-01&checkOutDate=2026-06-03" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response will NOT include any image/media/photo fields
```

## Summary

✅ **Current Status:** Amadeus hotel API does NOT provide images
✅ **Our Solution:** Smart 3-tier system (Amadeus check → Unsplash → Gradient)
✅ **User Experience:** Always shows beautiful images
✅ **Future-Proof:** Ready for when Amadeus adds images
✅ **Extensible:** Easy to add new image sources

## Recommendation

**For MVP/Development:** ✅ Keep current Unsplash solution
**For Beta/Soft Launch:** Consider adding Pexels API
**For Production:** Implement Google Places API + caching
**For Enterprise:** Build custom hotel image database

## Questions?

- Want to add Google Places API? See `HOTEL_IMAGES_GUIDE.md`
- Want to add Pexels API? Takes 5 minutes
- Want to upload custom images? Need Cloudinary setup
- Want to test current system? Just search for hotels!
