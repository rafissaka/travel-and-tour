// Popular airports and cities database
// Users can search by city name or country

export interface AirportCity {
  code: string; // IATA code (3 letters)
  city: string;
  country: string;
  airport?: string; // Airport name (optional)
  searchTerms: string; // Combined search string
}

export const popularAirportsAndCities: AirportCity[] = [
  // Ghana
  { code: 'ACC', city: 'Accra', country: 'Ghana', airport: 'Kotoka International Airport', searchTerms: 'accra ghana kotoka acc' },
  
  // United Kingdom
  { code: 'LHR', city: 'London', country: 'United Kingdom', airport: 'Heathrow Airport', searchTerms: 'london uk england heathrow lhr' },
  { code: 'LGW', city: 'London', country: 'United Kingdom', airport: 'Gatwick Airport', searchTerms: 'london uk england gatwick lgw' },
  { code: 'MAN', city: 'Manchester', country: 'United Kingdom', airport: 'Manchester Airport', searchTerms: 'manchester uk england man' },
  { code: 'EDI', city: 'Edinburgh', country: 'United Kingdom', airport: 'Edinburgh Airport', searchTerms: 'edinburgh scotland uk edi' },
  { code: 'BHX', city: 'Birmingham', country: 'United Kingdom', airport: 'Birmingham Airport', searchTerms: 'birmingham uk england bhx' },
  
  // United States
  { code: 'JFK', city: 'New York', country: 'United States', airport: 'JFK International Airport', searchTerms: 'new york nyc usa america jfk' },
  { code: 'LAX', city: 'Los Angeles', country: 'United States', airport: 'LAX International Airport', searchTerms: 'los angeles la california usa lax' },
  { code: 'ORD', city: 'Chicago', country: 'United States', airport: "O'Hare International Airport", searchTerms: 'chicago illinois usa ord ohare' },
  { code: 'MIA', city: 'Miami', country: 'United States', airport: 'Miami International Airport', searchTerms: 'miami florida usa mia' },
  { code: 'ATL', city: 'Atlanta', country: 'United States', airport: 'Atlanta Airport', searchTerms: 'atlanta georgia usa atl' },
  
  // UAE
  { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', airport: 'Dubai International Airport', searchTerms: 'dubai uae emirates dxb' },
  { code: 'AUH', city: 'Abu Dhabi', country: 'United Arab Emirates', airport: 'Abu Dhabi International Airport', searchTerms: 'abu dhabi uae emirates auh' },
  
  // France
  { code: 'CDG', city: 'Paris', country: 'France', airport: 'Charles de Gaulle Airport', searchTerms: 'paris france cdg charles de gaulle' },
  { code: 'ORY', city: 'Paris', country: 'France', airport: 'Orly Airport', searchTerms: 'paris france orly ory' },
  
  // Germany
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', airport: 'Frankfurt Airport', searchTerms: 'frankfurt germany fra' },
  { code: 'MUC', city: 'Munich', country: 'Germany', airport: 'Munich Airport', searchTerms: 'munich germany muc' },
  { code: 'BER', city: 'Berlin', country: 'Germany', airport: 'Berlin Brandenburg Airport', searchTerms: 'berlin germany ber' },
  
  // Netherlands
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', airport: 'Schiphol Airport', searchTerms: 'amsterdam netherlands holland schiphol ams' },
  
  // Spain
  { code: 'MAD', city: 'Madrid', country: 'Spain', airport: 'Madrid-Barajas Airport', searchTerms: 'madrid spain mad barajas' },
  { code: 'BCN', city: 'Barcelona', country: 'Spain', airport: 'Barcelona Airport', searchTerms: 'barcelona spain bcn' },
  
  // Italy
  { code: 'FCO', city: 'Rome', country: 'Italy', airport: 'Fiumicino Airport', searchTerms: 'rome italy fco fiumicino' },
  { code: 'MXP', city: 'Milan', country: 'Italy', airport: 'Malpensa Airport', searchTerms: 'milan italy mxp malpensa' },
  
  // Switzerland
  { code: 'ZRH', city: 'Zurich', country: 'Switzerland', airport: 'Zurich Airport', searchTerms: 'zurich switzerland zrh' },
  { code: 'GVA', city: 'Geneva', country: 'Switzerland', airport: 'Geneva Airport', searchTerms: 'geneva switzerland gva' },
  
  // Japan
  { code: 'NRT', city: 'Tokyo', country: 'Japan', airport: 'Narita International Airport', searchTerms: 'tokyo japan narita nrt' },
  { code: 'HND', city: 'Tokyo', country: 'Japan', airport: 'Haneda Airport', searchTerms: 'tokyo japan haneda hnd' },
  { code: 'KIX', city: 'Osaka', country: 'Japan', airport: 'Kansai International Airport', searchTerms: 'osaka japan kansai kix' },
  
  // China
  { code: 'PEK', city: 'Beijing', country: 'China', airport: 'Beijing Capital Airport', searchTerms: 'beijing china pek' },
  { code: 'PVG', city: 'Shanghai', country: 'China', airport: 'Pudong International Airport', searchTerms: 'shanghai china pudong pvg' },
  
  // Australia
  { code: 'SYD', city: 'Sydney', country: 'Australia', airport: 'Sydney Airport', searchTerms: 'sydney australia syd' },
  { code: 'MEL', city: 'Melbourne', country: 'Australia', airport: 'Melbourne Airport', searchTerms: 'melbourne australia mel' },
  
  // Canada
  { code: 'YYZ', city: 'Toronto', country: 'Canada', airport: 'Pearson International Airport', searchTerms: 'toronto canada yyz pearson' },
  { code: 'YVR', city: 'Vancouver', country: 'Canada', airport: 'Vancouver Airport', searchTerms: 'vancouver canada yvr' },
  
  // South Africa
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', airport: 'OR Tambo Airport', searchTerms: 'johannesburg south africa jnb tambo' },
  { code: 'CPT', city: 'Cape Town', country: 'South Africa', airport: 'Cape Town Airport', searchTerms: 'cape town south africa cpt' },
  
  // Nigeria
  { code: 'LOS', city: 'Lagos', country: 'Nigeria', airport: 'Murtala Muhammed Airport', searchTerms: 'lagos nigeria los' },
  { code: 'ABV', city: 'Abuja', country: 'Nigeria', airport: 'Nnamdi Azikiwe Airport', searchTerms: 'abuja nigeria abv' },
  
  // Kenya
  { code: 'NBO', city: 'Nairobi', country: 'Kenya', airport: 'Jomo Kenyatta Airport', searchTerms: 'nairobi kenya nbo' },
  
  // Egypt
  { code: 'CAI', city: 'Cairo', country: 'Egypt', airport: 'Cairo International Airport', searchTerms: 'cairo egypt cai' },
  
  // Morocco
  { code: 'CMN', city: 'Casablanca', country: 'Morocco', airport: 'Mohammed V Airport', searchTerms: 'casablanca morocco cmn' },
  
  // India
  { code: 'DEL', city: 'New Delhi', country: 'India', airport: 'Indira Gandhi Airport', searchTerms: 'delhi new delhi india del' },
  { code: 'BOM', city: 'Mumbai', country: 'India', airport: 'Chhatrapati Shivaji Airport', searchTerms: 'mumbai bombay india bom' },
  
  // Singapore
  { code: 'SIN', city: 'Singapore', country: 'Singapore', airport: 'Changi Airport', searchTerms: 'singapore sin changi' },
  
  // Thailand
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', airport: 'Suvarnabhumi Airport', searchTerms: 'bangkok thailand bkk' },
  
  // Turkey
  { code: 'IST', city: 'Istanbul', country: 'Turkey', airport: 'Istanbul Airport', searchTerms: 'istanbul turkey ist' },
  
  // Brazil
  { code: 'GRU', city: 'São Paulo', country: 'Brazil', airport: 'Guarulhos Airport', searchTerms: 'sao paulo brazil gru guarulhos' },
  { code: 'GIG', city: 'Rio de Janeiro', country: 'Brazil', airport: 'Galeão Airport', searchTerms: 'rio de janeiro brazil gig' },
  
  // Russia
  { code: 'SVO', city: 'Moscow', country: 'Russia', airport: 'Sheremetyevo Airport', searchTerms: 'moscow russia svo sheremetyevo' },
  { code: 'DME', city: 'Moscow', country: 'Russia', airport: 'Domodedovo Airport', searchTerms: 'moscow russia dme domodedovo' },
  { code: 'LED', city: 'St. Petersburg', country: 'Russia', airport: 'Pulkovo Airport', searchTerms: 'st petersburg saint petersburg russia led pulkovo' },
  
  // Mexico
  { code: 'MEX', city: 'Mexico City', country: 'Mexico', airport: 'Mexico City Airport', searchTerms: 'mexico city mexico mex' },
  { code: 'CUN', city: 'Cancun', country: 'Mexico', airport: 'Cancun Airport', searchTerms: 'cancun mexico cun' },
  
  // Argentina
  { code: 'EZE', city: 'Buenos Aires', country: 'Argentina', airport: 'Ezeiza Airport', searchTerms: 'buenos aires argentina eze ezeiza' },
  
  // Chile
  { code: 'SCL', city: 'Santiago', country: 'Chile', airport: 'Santiago Airport', searchTerms: 'santiago chile scl' },
  
  // Colombia
  { code: 'BOG', city: 'Bogotá', country: 'Colombia', airport: 'El Dorado Airport', searchTerms: 'bogota colombia bog el dorado' },
  
  // Peru
  { code: 'LIM', city: 'Lima', country: 'Peru', airport: 'Jorge Chávez Airport', searchTerms: 'lima peru lim' },
  
  // South Korea
  { code: 'ICN', city: 'Seoul', country: 'South Korea', airport: 'Incheon Airport', searchTerms: 'seoul south korea icn incheon' },
  { code: 'GMP', city: 'Seoul', country: 'South Korea', airport: 'Gimpo Airport', searchTerms: 'seoul south korea gmp gimpo' },
  
  // Malaysia
  { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', airport: 'KLIA', searchTerms: 'kuala lumpur malaysia kul klia' },
  
  // Indonesia
  { code: 'CGK', city: 'Jakarta', country: 'Indonesia', airport: 'Soekarno-Hatta Airport', searchTerms: 'jakarta indonesia cgk' },
  { code: 'DPS', city: 'Bali', country: 'Indonesia', airport: 'Ngurah Rai Airport', searchTerms: 'bali denpasar indonesia dps' },
  
  // Philippines
  { code: 'MNL', city: 'Manila', country: 'Philippines', airport: 'Ninoy Aquino Airport', searchTerms: 'manila philippines mnl' },
  
  // Vietnam
  { code: 'SGN', city: 'Ho Chi Minh City', country: 'Vietnam', airport: 'Tan Son Nhat Airport', searchTerms: 'ho chi minh saigon vietnam sgn' },
  { code: 'HAN', city: 'Hanoi', country: 'Vietnam', airport: 'Noi Bai Airport', searchTerms: 'hanoi vietnam han' },
  
  // Hong Kong
  { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', airport: 'Hong Kong Airport', searchTerms: 'hong kong hkg' },
  
  // Taiwan
  { code: 'TPE', city: 'Taipei', country: 'Taiwan', airport: 'Taoyuan Airport', searchTerms: 'taipei taiwan tpe taoyuan' },
  
  // New Zealand
  { code: 'AKL', city: 'Auckland', country: 'New Zealand', airport: 'Auckland Airport', searchTerms: 'auckland new zealand akl' },
  { code: 'CHC', city: 'Christchurch', country: 'New Zealand', airport: 'Christchurch Airport', searchTerms: 'christchurch new zealand chc' },
  
  // Pakistan
  { code: 'KHI', city: 'Karachi', country: 'Pakistan', airport: 'Jinnah Airport', searchTerms: 'karachi pakistan khi' },
  { code: 'LHE', city: 'Lahore', country: 'Pakistan', airport: 'Allama Iqbal Airport', searchTerms: 'lahore pakistan lhe' },
  { code: 'ISB', city: 'Islamabad', country: 'Pakistan', airport: 'Islamabad Airport', searchTerms: 'islamabad pakistan isb' },
  
  // Bangladesh
  { code: 'DAC', city: 'Dhaka', country: 'Bangladesh', airport: 'Shahjalal Airport', searchTerms: 'dhaka bangladesh dac' },
  
  // Sri Lanka
  { code: 'CMB', city: 'Colombo', country: 'Sri Lanka', airport: 'Bandaranaike Airport', searchTerms: 'colombo sri lanka cmb' },
  
  // Saudi Arabia
  { code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia', airport: 'King Khalid Airport', searchTerms: 'riyadh saudi arabia ruh' },
  { code: 'JED', city: 'Jeddah', country: 'Saudi Arabia', airport: 'King Abdulaziz Airport', searchTerms: 'jeddah saudi arabia jed' },
  
  // Qatar
  { code: 'DOH', city: 'Doha', country: 'Qatar', airport: 'Hamad Airport', searchTerms: 'doha qatar doh hamad' },
  
  // Kuwait
  { code: 'KWI', city: 'Kuwait City', country: 'Kuwait', airport: 'Kuwait Airport', searchTerms: 'kuwait city kuwait kwi' },
  
  // Oman
  { code: 'MCT', city: 'Muscat', country: 'Oman', airport: 'Muscat Airport', searchTerms: 'muscat oman mct' },
  
  // Israel
  { code: 'TLV', city: 'Tel Aviv', country: 'Israel', airport: 'Ben Gurion Airport', searchTerms: 'tel aviv israel tlv ben gurion' },
  
  // Jordan
  { code: 'AMM', city: 'Amman', country: 'Jordan', airport: 'Queen Alia Airport', searchTerms: 'amman jordan amm' },
  
  // Lebanon
  { code: 'BEY', city: 'Beirut', country: 'Lebanon', airport: 'Rafic Hariri Airport', searchTerms: 'beirut lebanon bey' },
  
  // Ethiopia
  { code: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', airport: 'Bole Airport', searchTerms: 'addis ababa ethiopia add' },
  
  // Tanzania
  { code: 'DAR', city: 'Dar es Salaam', country: 'Tanzania', airport: 'Julius Nyerere Airport', searchTerms: 'dar es salaam tanzania dar' },
  
  // Uganda
  { code: 'EBB', city: 'Kampala', country: 'Uganda', airport: 'Entebbe Airport', searchTerms: 'kampala entebbe uganda ebb' },
  
  // Rwanda
  { code: 'KGL', city: 'Kigali', country: 'Rwanda', airport: 'Kigali Airport', searchTerms: 'kigali rwanda kgl' },
  
  // Senegal
  { code: 'DSS', city: 'Dakar', country: 'Senegal', airport: 'Blaise Diagne Airport', searchTerms: 'dakar senegal dss' },
  
  // Ivory Coast
  { code: 'ABJ', city: 'Abidjan', country: 'Ivory Coast', airport: 'Félix-Houphouët-Boigny Airport', searchTerms: 'abidjan ivory coast cote divoire abj' },
  
  // Zimbabwe
  { code: 'HRE', city: 'Harare', country: 'Zimbabwe', airport: 'Harare Airport', searchTerms: 'harare zimbabwe hre' },
  
  // Zambia
  { code: 'LUN', city: 'Lusaka', country: 'Zambia', airport: 'Kenneth Kaunda Airport', searchTerms: 'lusaka zambia lun' },
  
  // Botswana
  { code: 'GBE', city: 'Gaborone', country: 'Botswana', airport: 'Sir Seretse Khama Airport', searchTerms: 'gaborone botswana gbe' },
  
  // Portugal
  { code: 'LIS', city: 'Lisbon', country: 'Portugal', airport: 'Lisbon Airport', searchTerms: 'lisbon lisboa portugal lis' },
  { code: 'OPO', city: 'Porto', country: 'Portugal', airport: 'Porto Airport', searchTerms: 'porto portugal opo' },
  
  // Greece
  { code: 'ATH', city: 'Athens', country: 'Greece', airport: 'Athens Airport', searchTerms: 'athens greece ath' },
  
  // Austria
  { code: 'VIE', city: 'Vienna', country: 'Austria', airport: 'Vienna Airport', searchTerms: 'vienna wien austria vie' },
  
  // Belgium
  { code: 'BRU', city: 'Brussels', country: 'Belgium', airport: 'Brussels Airport', searchTerms: 'brussels belgium bru' },
  
  // Denmark
  { code: 'CPH', city: 'Copenhagen', country: 'Denmark', airport: 'Copenhagen Airport', searchTerms: 'copenhagen denmark cph' },
  
  // Sweden
  { code: 'ARN', city: 'Stockholm', country: 'Sweden', airport: 'Arlanda Airport', searchTerms: 'stockholm sweden arn arlanda' },
  
  // Norway
  { code: 'OSL', city: 'Oslo', country: 'Norway', airport: 'Oslo Airport', searchTerms: 'oslo norway osl' },
  
  // Finland
  { code: 'HEL', city: 'Helsinki', country: 'Finland', airport: 'Helsinki-Vantaa Airport', searchTerms: 'helsinki finland hel vantaa' },
  
  // Poland
  { code: 'WAW', city: 'Warsaw', country: 'Poland', airport: 'Chopin Airport', searchTerms: 'warsaw poland waw' },
  
  // Czech Republic
  { code: 'PRG', city: 'Prague', country: 'Czech Republic', airport: 'Václav Havel Airport', searchTerms: 'prague czech republic prg' },
  
  // Hungary
  { code: 'BUD', city: 'Budapest', country: 'Hungary', airport: 'Ferenc Liszt Airport', searchTerms: 'budapest hungary bud' },
  
  // Romania
  { code: 'OTP', city: 'Bucharest', country: 'Romania', airport: 'Henri Coandă Airport', searchTerms: 'bucharest romania otp' },
  
  // Ukraine
  { code: 'KBP', city: 'Kyiv', country: 'Ukraine', airport: 'Boryspil Airport', searchTerms: 'kyiv kiev ukraine kbp' },
  
  // Ireland
  { code: 'DUB', city: 'Dublin', country: 'Ireland', airport: 'Dublin Airport', searchTerms: 'dublin ireland dub' },
];

/**
 * Search airports/cities by any term (city, country, airport name, or code)
 */
export function searchAirports(query: string, limit: number = 10): AirportCity[] {
  if (!query || query.length < 2) return [];
  
  const searchLower = query.toLowerCase().trim();
  
  const results = popularAirportsAndCities.filter(location => 
    location.searchTerms.toLowerCase().includes(searchLower)
  );
  
  return results.slice(0, limit);
}

/**
 * Get airport by code
 */
export function getAirportByCode(code: string): AirportCity | undefined {
  return popularAirportsAndCities.find(
    location => location.code.toUpperCase() === code.toUpperCase()
  );
}
