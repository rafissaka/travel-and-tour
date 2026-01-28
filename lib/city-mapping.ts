// City Code Mapping
// Maps non-standard airport codes to their proper city codes for hotel searches

/**
 * Some airport codes are not recognized as valid city codes by Amadeus
 * This mapping ensures hotels can be found using the correct city code
 */
export const airportToCityMapping: Record<string, string> = {
  // UAE - Bus stations and secondary airports should map to main city
  'ZVJ': 'DXB', // EK Bus Station → Dubai
  'DWC': 'DXB', // Dubai World Central → Dubai
  'DCG': 'DXB', // Dubai Creek SPB → Dubai
  'NHD': 'DXB', // Minhad AB → Dubai
  'DST': 'DXB', // Dubai Seaplane Terminal → Dubai
  
  // Add more mappings as needed
};

/**
 * Get the correct city code for hotel searches
 * Falls back to the original code if no mapping exists
 */
export function getCityCodeForHotels(airportCode: string): string {
  return airportToCityMapping[airportCode.toUpperCase()] || airportCode;
}

/**
 * Check if a code needs city mapping
 */
export function needsCityMapping(code: string): boolean {
  return code.toUpperCase() in airportToCityMapping;
}

/**
 * Get the display name for mapped cities
 */
export function getMappedCityInfo(originalCode: string): { 
  mappedCode: string; 
  isMapped: boolean;
  message?: string;
} {
  const mappedCode = getCityCodeForHotels(originalCode);
  const isMapped = mappedCode !== originalCode.toUpperCase();
  
  if (isMapped) {
    return {
      mappedCode,
      isMapped: true,
      message: `Showing hotels in ${mappedCode} area (nearest city to ${originalCode})`,
    };
  }
  
  return {
    mappedCode,
    isMapped: false,
  };
}
