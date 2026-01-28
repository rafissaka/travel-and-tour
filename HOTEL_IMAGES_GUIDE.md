# Hotel Images Integration Guide

## Overview

The hotel search now displays attractive images for each hotel result. 

**Important:** Amadeus hotel search API (as of January 2026) **does NOT provide hotel images** in their standard response. The API only returns:
- Hotel name, address, rating
- Room details and descriptions  
- Pricing information

Therefore, we've implemented a smart image system with multiple sources and fallback options.

## Current Implementation

### Image Sources (in priority order)

1. **Primary: Amadeus API Images** (if available - currently NOT supported)
   - Checked automatically if Amadeus adds this feature
   - Would provide real hotel photos directly from API
   - **Status: Not available as of January 2026**

2. **Secondary: Unsplash** (Free, no API key required - **Currently Active**)
   - Provides high-quality hotel images
   - Dynamic search based on hotel location and rating
   - Different images for each hotel using index-based seeding

3. **Fallback: Colored Gradients**
   - Beautiful gradient backgrounds if images fail to load
   - Color varies based on hotel rating:
     - ⭐⭐⭐⭐⭐ (5 stars): Gold/Orange gradient
     - ⭐⭐⭐⭐ (4 stars): Purple/Pink gradient
     - ⭐⭐⭐ (3 stars): Blue/Cyan gradient
     - Lower ratings: Cycling through various gradients

### Features

- ✅ **Lazy Loading**: Images load only when visible
- ✅ **Hover Effect**: Smooth zoom animation on hover
- ✅ **Rating Badge**: Shows star rating on image
- ✅ **Selected Badge**: Clear indicator when hotel is selected
- ✅ **Gradient Overlay**: Ensures text readability
- ✅ **Error Handling**: Automatic fallback to gradient

## Files Modified

1. **`lib/hotel-images.ts`** - Helper functions for generating image URLs
2. **`app/components/HotelResults.tsx`** - Updated to use hotel images

## How It Works

```typescript
// Generate image URL based on hotel data
const imageUrl = getHotelImageUrl({
  hotelName: 'Hilton Hotel',
  cityName: 'Dubai',
  rating: 5,
  index: 0, // For variety
});
```

## Future Enhancements

### Option 1: Use Pexels API (Recommended)

Pexels offers a free API with high-quality hotel images.

**Steps:**
1. Sign up at https://www.pexels.com/api/
2. Get your API key
3. Add to `.env.local`:
   ```
   PEXELS_API_KEY=your_api_key_here
   ```
4. Update `lib/hotel-images.ts` to use Pexels API

**Example Implementation:**
```typescript
export async function getHotelImageFromPexels(query: string) {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${query}&per_page=1`,
    {
      headers: {
        Authorization: process.env.PEXELS_API_KEY!,
      },
    }
  );
  const data = await response.json();
  return data.photos[0]?.src.large;
}
```

### Option 2: Upload Custom Hotel Images

Add hotel images to your database/storage.

**Steps:**
1. Add `imageUrl` field to hotel data
2. Store images in Cloudinary/Supabase Storage
3. Update `HotelResults.tsx` to use custom images first

**Example:**
```typescript
// Priority: custom image > Unsplash > gradient
const imageUrl = hotel.customImageUrl || getHotelImageUrl({...});
```

### Option 3: Google Places API

Get real hotel images from Google Places.

**Steps:**
1. Enable Google Places API
2. Use hotel name + location to search
3. Fetch place photos
4. Cache results to avoid repeated API calls

### Option 4: Hotel Booking APIs

Integrate with Booking.com, Expedia, or Hotels.com APIs for real hotel data including images.

## Customization

### Change Image Size

Edit in `lib/hotel-images.ts`:
```typescript
// Current: 800x600
return `https://source.unsplash.com/1200x800/?${query}&sig=${index}`;
```

### Change Fallback Gradients

Edit in `lib/hotel-images.ts`:
```typescript
export function getHotelGradient(rating?: number, index: number = 0): string {
  // Add your custom gradients here
  return 'bg-gradient-to-br from-your-color to-your-color';
}
```

### Add More Search Terms

Edit in `lib/hotel-images.ts`:
```typescript
const searchTerms: string[] = ['hotel', 'resort', 'bedroom', 'suite'];
```

## Performance Considerations

- **Lazy Loading**: Images load only when needed
- **Image Optimization**: Consider using Next.js Image component
- **Caching**: Browser caches images automatically
- **CDN**: Unsplash uses CDN for fast delivery

## Troubleshooting

### Images Not Loading

1. Check internet connection
2. Verify Unsplash is not blocked
3. Check browser console for errors
4. Fallback gradient should appear automatically

### Wrong Images Appearing

- Unsplash provides random images based on search terms
- Consider implementing custom image database for accuracy

### Slow Loading

- Images are lazy-loaded
- Consider reducing image size
- Implement progressive loading

## Cost Considerations

| Service | Cost | Images/Month | Best For |
|---------|------|--------------|----------|
| Unsplash Source | Free | Unlimited | Development/Testing |
| Pexels API | Free | 200/hour | Small-Medium apps |
| Google Places | $7/1000 | Pay per use | High accuracy needed |
| Custom Storage | Variable | Unlimited | Full control |

## Recommendation

**For Production:**
1. Start with current Unsplash implementation
2. Add Pexels API as secondary source
3. Eventually build custom hotel image database
4. Use Cloudinary for image optimization

## Support

For questions or issues, refer to:
- Unsplash API: https://unsplash.com/documentation
- Pexels API: https://www.pexels.com/api/documentation/
- Next.js Image: https://nextjs.org/docs/api-reference/next/image
