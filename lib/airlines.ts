// Airline codes, names, and logo URLs
// Uses public CDN for airline logos

export interface Airline {
  code: string;
  name: string;
  logoUrl: string;
}

export const airlines: Record<string, Airline> = {
  // Major International Airlines
  'AA': { code: 'AA', name: 'American Airlines', logoUrl: 'https://images.kiwi.com/airlines/64/AA.png' },
  'AF': { code: 'AF', name: 'Air France', logoUrl: 'https://images.kiwi.com/airlines/64/AF.png' },
  'BA': { code: 'BA', name: 'British Airways', logoUrl: 'https://images.kiwi.com/airlines/64/BA.png' },
  'DL': { code: 'DL', name: 'Delta Air Lines', logoUrl: 'https://images.kiwi.com/airlines/64/DL.png' },
  'EK': { code: 'EK', name: 'Emirates', logoUrl: 'https://images.kiwi.com/airlines/64/EK.png' },
  'ET': { code: 'ET', name: 'Ethiopian Airlines', logoUrl: 'https://images.kiwi.com/airlines/64/ET.png' },
  'KL': { code: 'KL', name: 'KLM Royal Dutch Airlines', logoUrl: 'https://images.kiwi.com/airlines/64/KL.png' },
  'LH': { code: 'LH', name: 'Lufthansa', logoUrl: 'https://images.kiwi.com/airlines/64/LH.png' },
  'LX': { code: 'LX', name: 'Swiss International Air Lines', logoUrl: 'https://images.kiwi.com/airlines/64/LX.png' },
  'QR': { code: 'QR', name: 'Qatar Airways', logoUrl: 'https://images.kiwi.com/airlines/64/QR.png' },
  'TK': { code: 'TK', name: 'Turkish Airlines', logoUrl: 'https://images.kiwi.com/airlines/64/TK.png' },
  'UA': { code: 'UA', name: 'United Airlines', logoUrl: 'https://images.kiwi.com/airlines/64/UA.png' },
  
  // African Airlines
  'KQ': { code: 'KQ', name: 'Kenya Airways', logoUrl: 'https://images.kiwi.com/airlines/64/KQ.png' },
  'SA': { code: 'SA', name: 'South African Airways', logoUrl: 'https://images.kiwi.com/airlines/64/SA.png' },
  'MS': { code: 'MS', name: 'EgyptAir', logoUrl: 'https://images.kiwi.com/airlines/64/MS.png' },
  'AT': { code: 'AT', name: 'Royal Air Maroc', logoUrl: 'https://images.kiwi.com/airlines/64/AT.png' },
  
  // Middle East Airlines
  'SV': { code: 'SV', name: 'Saudia', logoUrl: 'https://images.kiwi.com/airlines/64/SV.png' },
  'WY': { code: 'WY', name: 'Oman Air', logoUrl: 'https://images.kiwi.com/airlines/64/WY.png' },
  'EY': { code: 'EY', name: 'Etihad Airways', logoUrl: 'https://images.kiwi.com/airlines/64/EY.png' },
  
  // Asian Airlines
  'SQ': { code: 'SQ', name: 'Singapore Airlines', logoUrl: 'https://images.kiwi.com/airlines/64/SQ.png' },
  'CX': { code: 'CX', name: 'Cathay Pacific', logoUrl: 'https://images.kiwi.com/airlines/64/CX.png' },
  'NH': { code: 'NH', name: 'All Nippon Airways', logoUrl: 'https://images.kiwi.com/airlines/64/NH.png' },
  'JL': { code: 'JL', name: 'Japan Airlines', logoUrl: 'https://images.kiwi.com/airlines/64/JL.png' },
  'TG': { code: 'TG', name: 'Thai Airways', logoUrl: 'https://images.kiwi.com/airlines/64/TG.png' },
  
  // European Airlines
  'IB': { code: 'IB', name: 'Iberia', logoUrl: 'https://images.kiwi.com/airlines/64/IB.png' },
  'AZ': { code: 'AZ', name: 'ITA Airways', logoUrl: 'https://images.kiwi.com/airlines/64/AZ.png' },
  'OS': { code: 'OS', name: 'Austrian Airlines', logoUrl: 'https://images.kiwi.com/airlines/64/OS.png' },
  'SK': { code: 'SK', name: 'Scandinavian Airlines', logoUrl: 'https://images.kiwi.com/airlines/64/SK.png' },
  'TP': { code: 'TP', name: 'TAP Air Portugal', logoUrl: 'https://images.kiwi.com/airlines/64/TP.png' },
  
  // Add more as needed
};

/**
 * Get airline information by code
 */
export function getAirline(code: string): Airline {
  const airline = airlines[code.toUpperCase()];
  
  if (airline) {
    return airline;
  }
  
  // Return default if not found
  return {
    code: code.toUpperCase(),
    name: code.toUpperCase(),
    logoUrl: `https://images.kiwi.com/airlines/64/${code.toUpperCase()}.png`, // Try CDN anyway
  };
}

/**
 * Get airline logo URL
 */
export function getAirlineLogo(code: string): string {
  return getAirline(code).logoUrl;
}

/**
 * Get airline full name
 */
export function getAirlineName(code: string): string {
  return getAirline(code).name;
}
