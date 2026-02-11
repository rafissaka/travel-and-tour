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
  // --- GHANA & WEST AFRICA (High Priority) ---
  { code: 'ACC', city: 'Accra', country: 'Ghana', airport: 'Kotoka International Airport', searchTerms: 'accra ghana kotoka acc west africa' },
  { code: 'TKD', city: 'Takoradi', country: 'Ghana', airport: 'Takoradi Airport', searchTerms: 'takoradi ghana tkd' },
  { code: 'KMS', city: 'Kumasi', country: 'Ghana', airport: 'Kumasi Airport', searchTerms: 'kumasi ghana kms' },
  { code: 'TML', city: 'Tamale', country: 'Ghana', airport: 'Tamale Airport', searchTerms: 'tamale ghana tml' },
  { code: 'NYI', city: 'Sunyani', country: 'Ghana', airport: 'Sunyani Airport', searchTerms: 'sunyani ghana nyi' },
  { code: 'LOS', city: 'Lagos', country: 'Nigeria', airport: 'Murtala Muhammed Airport', searchTerms: 'lagos nigeria los west africa' },
  { code: 'ABV', city: 'Abuja', country: 'Nigeria', airport: 'Nnamdi Azikiwe Airport', searchTerms: 'abuja nigeria abv' },
  { code: 'LFW', city: 'Lomé', country: 'Togo', airport: 'Gnassingbé Eyadéma International Airport', searchTerms: 'lome togo lfw' },
  { code: 'COO', city: 'Cotonou', country: 'Benin', airport: 'Cadjehoun Airport', searchTerms: 'cotonou benin coo' },
  { code: 'ABJ', city: 'Abidjan', country: 'Ivory Coast', airport: 'Félix-Houphouët-Boigny Airport', searchTerms: 'abidjan ivory coast abj' },
  { code: 'DSS', city: 'Dakar', country: 'Senegal', airport: 'Blaise Diagne Airport', searchTerms: 'dakar senegal dss' },
  { code: 'BKO', city: 'Bamako', country: 'Mali', airport: 'Modibo Keita International Airport', searchTerms: 'bamako mali bko' },
  { code: 'OAG', city: 'Ouagadougou', country: 'Burkina Faso', airport: 'Ouagadougou Airport', searchTerms: 'ouagadougou burkina faso oag' },
  { code: 'FNA', city: 'Freetown', country: 'Sierra Leone', airport: 'Lungi International Airport', searchTerms: 'freetown sierra leone fna' },
  { code: 'ROB', city: 'Monrovia', country: 'Liberia', airport: 'Roberts International Airport', searchTerms: 'monrovia liberia rob' },
  { code: 'BJL', city: 'Banjul', country: 'Gambia', airport: 'Banjul International Airport', searchTerms: 'banjul gambia bjl' },
  { code: 'OXB', city: 'Bissau', country: 'Guinea-Bissau', airport: 'Osvaldo Vieira International Airport', searchTerms: 'bissau guinea-bissau oxb' },

  // --- ARAB & NORTH AFRICA ---
  { code: 'RAK', city: 'Marrakech', country: 'Morocco', airport: 'Menara Airport', searchTerms: 'marrakech morocco rak' },
  { code: 'CMN', city: 'Casablanca', country: 'Morocco', airport: 'Mohammed V Airport', searchTerms: 'casablanca morocco cmn' },
  { code: 'TUN', city: 'Tunis', country: 'Tunisia', airport: 'Carthage Airport', searchTerms: 'tunis tunisia tun' },
  { code: 'ALG', city: 'Algiers', country: 'Algeria', airport: 'Houari Boumediene Airport', searchTerms: 'algiers algeria alg' },
  { code: 'AMM', city: 'Amman', country: 'Jordan', airport: 'Queen Alia Airport', searchTerms: 'amman jordan amm' },
  { code: 'KWI', city: 'Kuwait City', country: 'Kuwait', airport: 'Kuwait International Airport', searchTerms: 'kuwait city kwi' },
  { code: 'MCT', city: 'Muscat', country: 'Oman', airport: 'Muscat International Airport', searchTerms: 'muscat oman mct' },
  { code: 'BAH', city: 'Manama', country: 'Bahrain', airport: 'Bahrain International Airport', searchTerms: 'manama bahrain bah' },
  { code: 'TLV', city: 'Tel Aviv', country: 'Israel', airport: 'Ben Gurion Airport', searchTerms: 'tel aviv israel tlv' },

  // --- REST OF AFRICA ---
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', airport: 'OR Tambo Airport', searchTerms: 'johannesburg south africa jnb' },
  { code: 'CPT', city: 'Cape Town', country: 'South Africa', airport: 'Cape Town Airport', searchTerms: 'cape town south africa cpt' },
  { code: 'NBO', city: 'Nairobi', country: 'Kenya', airport: 'Jomo Kenyatta Airport', searchTerms: 'nairobi kenya nbo' },
  { code: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', airport: 'Bole Airport', searchTerms: 'addis ababa ethiopia add' },
  { code: 'CAI', city: 'Cairo', country: 'Egypt', airport: 'Cairo International Airport', searchTerms: 'cairo egypt cai' },
  { code: 'KGL', city: 'Kigali', country: 'Rwanda', airport: 'Kigali International Airport', searchTerms: 'kigali rwanda kgl' },
  { code: 'DAR', city: 'Dar es Salaam', country: 'Tanzania', airport: 'Julius Nyerere Airport', searchTerms: 'dar es salaam tanzania dar' },
  { code: 'EBB', city: 'Entebbe/Kampala', country: 'Uganda', airport: 'Entebbe International Airport', searchTerms: 'kampala uganda ebb' },
  { code: 'HRE', city: 'Harare', country: 'Zimbabwe', airport: 'Harare International Airport', searchTerms: 'harare zimbabwe hre' },
  { code: 'LUN', city: 'Lusaka', country: 'Zambia', airport: 'Kenneth Kaunda Airport', searchTerms: 'lusaka zambia lun' },
  { code: 'LAD', city: 'Luanda', country: 'Angola', airport: 'Quatro de Fevereiro Airport', searchTerms: 'luanda angola lad' },

  // --- CANADA (Recently Added) ---
  { code: 'YYZ', city: 'Toronto', country: 'Canada', airport: 'Pearson International Airport', searchTerms: 'toronto canada yyz pearson ontario' },
  { code: 'YVR', city: 'Vancouver', country: 'Canada', airport: 'Vancouver Airport', searchTerms: 'vancouver canada yvr british columbia' },
  { code: 'YUL', city: 'Montreal', country: 'Canada', airport: 'Pierre Elliott Trudeau International Airport', searchTerms: 'montreal canada quebec yul' },
  { code: 'YQB', city: 'Quebec City', country: 'Canada', airport: 'Jean Lesage International Airport', searchTerms: 'quebec city canada yqb' },
  { code: 'YYC', city: 'Calgary', country: 'Canada', airport: 'Calgary International Airport', searchTerms: 'calgary canada yyc alberta' },
  { code: 'YOW', city: 'Ottawa', country: 'Canada', airport: 'Ottawa Macdonald-Cartier International Airport', searchTerms: 'ottawa canada yow ontario' },
  { code: 'YWG', city: 'Winnipeg', country: 'Canada', airport: 'Winnipeg Richardson International Airport', searchTerms: 'winnipeg canada manitoba ywg' },

  // --- UNITED STATES ---
  { code: 'JFK', city: 'New York', country: 'United States', airport: 'JFK International Airport', searchTerms: 'new york nyc usa america jfk' },
  { code: 'EWR', city: 'Newark/New York', country: 'United States', airport: 'Newark Liberty International Airport', searchTerms: 'new york nj newark ewr' },
  { code: 'IAD', city: 'Washington D.C.', country: 'United States', airport: 'Dulles International Airport', searchTerms: 'washington dc usa iad' },
  { code: 'LAX', city: 'Los Angeles', country: 'United States', airport: 'LAX International Airport', searchTerms: 'los angeles la california usa lax' },
  { code: 'SFO', city: 'San Francisco', country: 'United States', airport: 'San Francisco International Airport', searchTerms: 'san francisco sfo california' },
  { code: 'ORD', city: 'Chicago', country: 'United States', airport: "O'Hare International Airport", searchTerms: 'chicago illinois usa ord' },
  { code: 'MIA', city: 'Miami', country: 'United States', airport: 'Miami International Airport', searchTerms: 'miami florida usa mia' },
  { code: 'ATL', city: 'Atlanta', country: 'United States', airport: 'Atlanta Airport', searchTerms: 'atlanta georgia usa atl' },
  { code: 'IAH', city: 'Houston', country: 'United States', airport: 'George Bush Intercontinental Airport', searchTerms: 'houston texas usa iah' },
  { code: 'DFW', city: 'Dallas', country: 'United States', airport: 'Dallas/Fort Worth International Airport', searchTerms: 'dallas texas dfw' },
  { code: 'BOS', city: 'Boston', country: 'United States', airport: 'Logan International Airport', searchTerms: 'boston massachusetts bos' },
  { code: 'SEA', city: 'Seattle', country: 'United States', airport: 'Seattle-Tacoma International Airport', searchTerms: 'seattle washington sea' },
  { code: 'PHX', city: 'Phoenix', country: 'United States', airport: 'Sky Harbor International Airport', searchTerms: 'phoenix arizona phx' },

  // --- UNITED KINGDOM & EUROPE ---
  { code: 'LHR', city: 'London', country: 'United Kingdom', airport: 'Heathrow Airport', searchTerms: 'london uk england heathrow lhr' },
  { code: 'LGW', city: 'London', country: 'United Kingdom', airport: 'Gatwick Airport', searchTerms: 'london uk england gatwick lgw' },
  { code: 'MAN', city: 'Manchester', country: 'United Kingdom', airport: 'Manchester Airport', searchTerms: 'manchester uk england man' },
  { code: 'CDG', city: 'Paris', country: 'France', airport: 'Charles de Gaulle Airport', searchTerms: 'paris france cdg' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', airport: 'Schiphol Airport', searchTerms: 'amsterdam netherlands ams' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', airport: 'Frankfurt Airport', searchTerms: 'frankfurt germany fra' },
  { code: 'MUC', city: 'Munich', country: 'Germany', airport: 'Munich Airport', searchTerms: 'munich germany muc' },
  { code: 'MAD', city: 'Madrid', country: 'Spain', airport: 'Madrid-Barajas Airport', searchTerms: 'madrid spain mad' },
  { code: 'BCN', city: 'Barcelona', country: 'Spain', airport: 'Barcelona Airport', searchTerms: 'barcelona spain bcn' },
  { code: 'FCO', city: 'Rome', country: 'Italy', airport: 'Fiumicino Airport', searchTerms: 'rome italy fco' },
  { code: 'MXP', city: 'Milan', country: 'Italy', airport: 'Malpensa Airport', searchTerms: 'milan italy mxp' },
  { code: 'ZRH', city: 'Zurich', country: 'Switzerland', airport: 'Zurich Airport', searchTerms: 'zurich switzerland zrh' },
  { code: 'GVA', city: 'Geneva', country: 'Switzerland', airport: 'Geneva Airport', searchTerms: 'geneva switzerland gva' },
  { code: 'VIE', city: 'Vienna', country: 'Austria', airport: 'Vienna Airport', searchTerms: 'vienna austria vie' },
  { code: 'CPH', city: 'Copenhagen', country: 'Denmark', airport: 'Copenhagen Airport', searchTerms: 'copenhagen denmark cph' },
  { code: 'ARN', city: 'Stockholm', country: 'Sweden', airport: 'Arlanda Airport', searchTerms: 'stockholm sweden arn' },
  { code: 'OSL', city: 'Oslo', country: 'Norway', airport: 'Oslo Airport', searchTerms: 'oslo norway osl' },
  { code: 'HEL', city: 'Helsinki', country: 'Finland', airport: 'Helsinki Airport', searchTerms: 'helsinki finland hel' },
  { code: 'LIS', city: 'Lisbon', country: 'Portugal', airport: 'Lisbon Airport', searchTerms: 'lisbon portugal lis' },
  { code: 'ATH', city: 'Athens', country: 'Greece', airport: 'Athens International Airport', searchTerms: 'athens greece ath' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', airport: 'Istanbul Airport', searchTerms: 'istanbul turkey ist' },
  { code: 'DUB', city: 'Dublin', country: 'Ireland', airport: 'Dublin Airport', searchTerms: 'dublin ireland dub' },
  { code: 'WAW', city: 'Warsaw', country: 'Poland', airport: 'Chopin Airport', searchTerms: 'warsaw poland waw' },
  { code: 'PRG', city: 'Prague', country: 'Czech Republic', airport: 'Václav Havel Airport', searchTerms: 'prague czech republic prg' },
  { code: 'BUD', city: 'Budapest', country: 'Hungary', airport: 'Ferenc Liszt Airport', searchTerms: 'budapest hungary bud' },

  // --- MIDDLE EAST & ASIA ---
  { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', airport: 'Dubai International Airport', searchTerms: 'dubai uae emirates dxb' },
  { code: 'AUH', city: 'Abu Dhabi', country: 'United Arab Emirates', airport: 'Abu Dhabi International Airport', searchTerms: 'abu dhabi uae emirates auh' },
  { code: 'DOH', city: 'Doha', country: 'Qatar', airport: 'Hamad Airport', searchTerms: 'doha qatar doh' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', airport: 'Changi Airport', searchTerms: 'singapore sin changi' },
  { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', airport: 'Hong Kong Airport', searchTerms: 'hong kong hkg' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', airport: 'Suvarnabhumi Airport', searchTerms: 'bangkok thailand bkk' },
  { code: 'NRT', city: 'Tokyo', country: 'Japan', airport: 'Narita International Airport', searchTerms: 'tokyo japan narita nrt' },
  { code: 'HND', city: 'Tokyo', country: 'Japan', airport: 'Haneda Airport', searchTerms: 'tokyo japan haneda hnd' },
  { code: 'ICN', city: 'Seoul', country: 'South Korea', airport: 'Incheon Airport', searchTerms: 'seoul south korea icn' },
  { code: 'PEK', city: 'Beijing', country: 'China', airport: 'Beijing Capital Airport', searchTerms: 'beijing china pek' },
  { code: 'PVG', city: 'Shanghai', country: 'China', airport: 'Pudong International Airport', searchTerms: 'shanghai china pvg' },
  { code: 'CAN', city: 'Guangzhou', country: 'China', airport: 'Baiyun International Airport', searchTerms: 'guangzhou china can' },
  { code: 'TPE', city: 'Taipei', country: 'Taiwan', airport: 'Taoyuan Airport', searchTerms: 'taipei taiwan tpe' },
  { code: 'DEL', city: 'New Delhi', country: 'India', airport: 'Indira Gandhi Airport', searchTerms: 'delhi new delhi india del' },
  { code: 'BOM', city: 'Mumbai', country: 'India', airport: 'Chhatrapati Shivaji Airport', searchTerms: 'mumbai bombay india bom' },
  { code: 'BLR', city: 'Bengaluru', country: 'India', airport: 'Kempegowda International Airport', searchTerms: 'bangalore bengaluru india blr' },
  { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', airport: 'KLIA', searchTerms: 'kuala lumpur malaysia kul' },
  { code: 'CGK', city: 'Jakarta', country: 'Indonesia', airport: 'Soekarno-Hatta Airport', searchTerms: 'jakarta indonesia cgk' },
  { code: 'MNL', city: 'Manila', country: 'Philippines', airport: 'Ninoy Aquino Airport', searchTerms: 'manila philippines mnl' },
  { code: 'SGN', city: 'Ho Chi Minh City', country: 'Vietnam', airport: 'Tan Son Nhat Airport', searchTerms: 'ho chi minh saigon vietnam sgn' },

  // --- OCEANIA ---
  { code: 'SYD', city: 'Sydney', country: 'Australia', airport: 'Sydney Airport', searchTerms: 'sydney australia syd' },
  { code: 'MEL', city: 'Melbourne', country: 'Australia', airport: 'Melbourne Airport', searchTerms: 'melbourne australia mel' },
  { code: 'BNE', city: 'Brisbane', country: 'Australia', airport: 'Brisbane Airport', searchTerms: 'brisbane australia bne' },
  { code: 'PER', city: 'Perth', country: 'Australia', airport: 'Perth Airport', searchTerms: 'perth australia per' },
  { code: 'AKL', city: 'Auckland', country: 'New Zealand', airport: 'Auckland Airport', searchTerms: 'auckland new zealand akl' },

  // --- SOUTH AMERICA ---
  { code: 'GRU', city: 'São Paulo', country: 'Brazil', airport: 'Guarulhos Airport', searchTerms: 'sao paulo brazil gru' },
  { code: 'GIG', city: 'Rio de Janeiro', country: 'Brazil', airport: 'Galeão International Airport', searchTerms: 'rio de janeiro brazil gig' },
  { code: 'EZE', city: 'Buenos Aires', country: 'Argentina', airport: 'Ezeiza Airport', searchTerms: 'buenos aires argentina eze' },
  { code: 'SCL', city: 'Santiago', country: 'Chile', airport: 'Santiago Airport', searchTerms: 'santiago chile scl' },
  { code: 'BOG', city: 'Bogotá', country: 'Colombia', airport: 'El Dorado Airport', searchTerms: 'bogota colombia bog' },
  { code: 'LIM', city: 'Lima', country: 'Peru', airport: 'Jorge Chávez Airport', searchTerms: 'lima peru lim' },

  // --- CARIBBEAN & CENTRAL AMERICA ---
  { code: 'MEX', city: 'Mexico City', country: 'Mexico', airport: 'Mexico City International Airport', searchTerms: 'mexico city mexico mex' },
  { code: 'CUN', city: 'Cancun', country: 'Mexico', airport: 'Cancun International Airport', searchTerms: 'cancun mexico cun' },
  { code: 'PTY', city: 'Panama City', country: 'Panama', airport: 'Tocumen International Airport', searchTerms: 'panama city pty' },
  { code: 'SJO', city: 'San Jose', country: 'Costa Rica', airport: 'Juan Santamaría Airport', searchTerms: 'san jose costa rica sjo' },
  { code: 'HAV', city: 'Havana', country: 'Cuba', airport: 'José Martí International Airport', searchTerms: 'havana cuba hav' },
  { code: 'KIN', city: 'Kingston', country: 'Jamaica', airport: 'Norman Manley Airport', searchTerms: 'kingston jamaica kin' },

  // --- ISLAND DESTINATIONS ---
  { code: 'MLE', city: 'Male', country: 'Maldives', airport: 'Velana International Airport', searchTerms: 'male maldives mle' },
  { code: 'MRU', city: 'Port Louis', country: 'Mauritius', airport: 'Sir Seewoosagur Ramgoolam Airport', searchTerms: 'mauritius port louis mru' },
  { code: 'SEZ', city: 'Mahe', country: 'Seychelles', airport: 'Seychelles International Airport', searchTerms: 'seychelles mahe sez' },
  { code: 'DPS', city: 'Bali', country: 'Indonesia', airport: 'Ngurah Rai Airport', searchTerms: 'bali denpasar indonesia dps' },
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
