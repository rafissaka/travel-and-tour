'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Plane, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AirportCity {
  code: string;
  city: string;
  country: string;
  airport?: string;
  type?: string;
}

interface AirportCitySearchProps {
  value: string;
  onChange: (code: string, city?: string) => void;
  placeholder?: string;
  label: string;
  type?: 'airport' | 'city';
}

export default function AirportCitySearch({
  value,
  onChange,
  placeholder = 'Search by city or country...',
  label,
  type = 'airport',
}: AirportCitySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<AirportCity[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<AirportCity | null>(null);
  const [searching, setSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>(undefined);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search airports using Amadeus API when query changes
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.length >= 2) {
      setSearching(true);
      
      // Debounce search to avoid too many API calls
      searchTimeout.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `/api/reservations/locations/search?keyword=${encodeURIComponent(searchQuery)}&type=${type}`
          );
          const data = await response.json();
          
          if (data.success && data.locations) {
            setResults(data.locations.slice(0, 10)); // Limit to 10 results
            setShowResults(true);
          } else {
            setResults([]);
          }
        } catch (error) {
          console.error('Location search error:', error);
          setResults([]);
        } finally {
          setSearching(false);
        }
      }, 300); // Wait 300ms after user stops typing
    } else {
      setResults([]);
      setShowResults(false);
      setSearching(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery, type]);

  const handleSelect = (location: AirportCity) => {
    setSelectedLocation(location);
    setSearchQuery('');
    setShowResults(false);
    onChange(location.code, location.city);
  };

  const handleClear = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    onChange('');
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>

      {selectedLocation ? (
        // Show selected location
        <div className="relative">
          <div className="w-full px-4 py-3 rounded-lg border-2 border-primary bg-primary/5 text-foreground flex items-center justify-between">
            <div className="flex items-center gap-3">
              {type === 'airport' ? (
                <Plane className="w-5 h-5 text-primary" />
              ) : (
                <MapPin className="w-5 h-5 text-primary" />
              )}
              <div>
                <p className="font-bold">{selectedLocation.city}, {selectedLocation.country}</p>
                <p className="text-sm text-muted-foreground">
                  {type === 'airport' && selectedLocation.airport ? selectedLocation.airport : ''} ({selectedLocation.code})
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-1 hover:bg-muted rounded-full transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        // Show search input
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {searching ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none"
            autoComplete="off"
          />

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showResults && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-2 bg-card border-2 border-border rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto"
              >
                {results.map((location, index) => (
                  <button
                    key={`${location.code}-${index}`}
                    onClick={() => handleSelect(location)}
                    type="button"
                    className="w-full px-4 py-3 hover:bg-muted transition-colors text-left flex items-center gap-3 border-b border-border last:border-b-0"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {type === 'airport' ? (
                        <Plane className="w-5 h-5 text-primary" />
                      ) : (
                        <MapPin className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {location.city}, {location.country}
                      </p>
                      {type === 'airport' && location.airport && (
                        <p className="text-sm text-muted-foreground truncate">
                          {location.airport}
                        </p>
                      )}
                    </div>
                    <div className="px-3 py-1 bg-muted rounded-full">
                      <span className="text-sm font-bold text-foreground">{location.code}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* No results message */}
          {showResults && searchQuery.length >= 2 && results.length === 0 && !searching && (
            <div className="absolute z-50 w-full mt-2 bg-card border-2 border-border rounded-xl shadow-xl p-4 text-center">
              <p className="text-muted-foreground text-sm">
                No results found for "{searchQuery}"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try a different city, country, or airport name
              </p>
            </div>
          )}
        </div>
      )}

      {!selectedLocation && (
        <p className="text-xs text-muted-foreground mt-1">
          {type === 'airport' 
            ? 'Search by city name (e.g., "London", "Dubai", "Ghana")'
            : 'Search by city name (e.g., "London", "Paris", "Tokyo")'
          }
        </p>
      )}
    </div>
  );
}
