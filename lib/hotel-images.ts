// Hotel Image Helper
// Provides hotel images from various sources with fallbacks

export interface HotelImageOptions {
  hotelName?: string;
  cityName?: string;
  rating?: number;
  index?: number;
  // If Amadeus ever provides images, we can use them
  amadeusImageUrl?: string;
  media?: any[]; // For future media array support
}

/**
 * Get hotel image URL from various sources
 * Priority: Amadeus API images > Unsplash > Gradient fallback
 * 
 * Note: As of now, Amadeus hotel search API doesn't provide images.
 * If they add this feature in the future, it will be used automatically.
 */
export function getHotelImageUrl(options: HotelImageOptions = {}): string {
  const { hotelName, cityName, rating, index = 0, amadeusImageUrl, media } = options;
  
  // Priority 1: Use Amadeus image if available (future feature)
  if (amadeusImageUrl) {
    return amadeusImageUrl;
  }
  
  // Priority 2: Use media array if available (future feature)
  if (media && media.length > 0 && media[0].uri) {
    return media[0].uri;
  }
  
  // Create search terms based on available data
  const searchTerms: string[] = ['hotel'];
  
  // Add luxury term for higher rated hotels
  if (rating && rating >= 4) {
    searchTerms.push('luxury');
  } else if (rating && rating >= 3) {
    searchTerms.push('resort');
  }
  
  // Add city name if available
  if (cityName) {
    searchTerms.push(cityName.toLowerCase());
  }
  
  // Join search terms
  const query = searchTerms.join(',');
  
  // Use Unsplash Source API (provides random images based on search)
  // Adding index as seed for variety
  return `https://source.unsplash.com/800x600/?${query}&sig=${index}`;
}

/**
 * Get fallback gradient colors based on hotel rating or index
 */
export function getHotelGradient(rating?: number, index: number = 0): string {
  if (rating && rating >= 5) {
    return 'bg-gradient-to-br from-amber-500 to-orange-500';
  } else if (rating && rating >= 4) {
    return 'bg-gradient-to-br from-purple-500 to-pink-500';
  } else if (rating && rating >= 3) {
    return 'bg-gradient-to-br from-blue-500 to-cyan-500';
  } else {
    // Cycle through gradients based on index
    const gradients = [
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-green-500 to-teal-500',
      'bg-gradient-to-br from-orange-500 to-red-500',
    ];
    return gradients[index % gradients.length];
  }
}

/**
 * Alternative image sources if Unsplash is unavailable
 */
export const alternativeImageSources = {
  // Pexels - requires API key for production
  pexels: (query: string) => `https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800`,
  
  // Lorem Picsum - random images
  picsum: (seed: number) => `https://picsum.photos/seed/${seed}/800/600`,
  
  // Placeholder images
  placeholder: () => `https://via.placeholder.com/800x600/6366f1/ffffff?text=Hotel+Image`,
};

/**
 * Get hotel image with multiple fallback options
 */
export function getHotelImageWithFallback(
  options: HotelImageOptions = {}
): { primary: string; fallbacks: string[] } {
  const { index = 0 } = options;
  
  return {
    primary: getHotelImageUrl(options),
    fallbacks: [
      alternativeImageSources.picsum(index),
      alternativeImageSources.placeholder(),
    ],
  };
}
