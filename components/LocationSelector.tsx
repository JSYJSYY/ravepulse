'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Radar, Satellite } from 'lucide-react';

interface LocationSelectorProps {
  currentLocation: { city: string; state: string };
  onLocationChange: (city: string, state: string) => void;
}

const popularCities = [
  { city: 'San Francisco', state: 'CA' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'New York', state: 'NY' },
  { city: 'Miami', state: 'FL' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Austin', state: 'TX' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Denver', state: 'CO' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Detroit', state: 'MI' },
];

// Extended list for autocomplete
const allCities = [
  ...popularCities,
  { city: 'Brooklyn', state: 'NY' },
  { city: 'Queens', state: 'NY' },
  { city: 'Boston', state: 'MA' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'Washington', state: 'DC' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Houston', state: 'TX' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Portland', state: 'OR' },
  { city: 'Nashville', state: 'TN' },
  { city: 'New Orleans', state: 'LA' },
  { city: 'Orlando', state: 'FL' },
  { city: 'Tampa', state: 'FL' },
  { city: 'Charlotte', state: 'NC' },
  { city: 'Minneapolis', state: 'MN' },
  { city: 'St. Louis', state: 'MO' },
  { city: 'Kansas City', state: 'MO' },
  { city: 'Salt Lake City', state: 'UT' },
  { city: 'Sacramento', state: 'CA' },
  { city: 'San Jose', state: 'CA' },
  { city: 'Oakland', state: 'CA' },
  { city: 'Scottsdale', state: 'AZ' },
  { city: 'Pittsburgh', state: 'PA' },
  { city: 'Cincinnati', state: 'OH' },
  { city: 'Cleveland', state: 'OH' },
  { city: 'Columbus', state: 'OH' },
  { city: 'Indianapolis', state: 'IN' },
  { city: 'Milwaukee', state: 'WI' },
  { city: 'Baltimore', state: 'MD' },
  { city: 'Raleigh', state: 'NC' },
  { city: 'Richmond', state: 'VA' },
  { city: 'Virginia Beach', state: 'VA' },
  { city: 'Jacksonville', state: 'FL' },
  { city: 'Memphis', state: 'TN' },
  { city: 'Louisville', state: 'KY' },
  { city: 'Oklahoma City', state: 'OK' },
  { city: 'Tulsa', state: 'OK' },
  { city: 'Albuquerque', state: 'NM' },
  { city: 'El Paso', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'Fort Worth', state: 'TX' },
  { city: 'Tucson', state: 'AZ' },
  { city: 'Fresno', state: 'CA' },
  { city: 'Long Beach', state: 'CA' },
  { city: 'Colorado Springs', state: 'CO' },
  { city: 'Omaha', state: 'NE' },
  { city: 'Honolulu', state: 'HI' },
  { city: 'Anchorage', state: 'AK' },
].sort((a, b) => a.city.localeCompare(b.city));

export default function LocationSelector({ currentLocation, onLocationChange }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Filter cities based on search query
  const filteredCities = searchQuery.trim() 
    ? allCities.filter(location => 
        location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.state.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8) // Show max 8 suggestions
    : [];
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city: string, state: string) => {
    onLocationChange(city, state);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full cyber-border bg-black/70 hover:bg-black/90 px-4 py-3 text-left flex items-center gap-3 transition-all transform hover:scale-105 font-mono"
        style={{clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)'}}
      >
        <Radar className="w-5 h-5 cyber-neon" style={{color: 'var(--cyber-cyan)'}} />
        <span style={{color: 'var(--cyber-cyan)'}}>&gt; {currentLocation.city}, {currentLocation.state}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="absolute inset-0 tech-pattern opacity-20"></div>
          <div className="scan-line"></div>
          <div className="cyber-border bg-black/90 backdrop-blur-sm p-6 max-w-md w-full mx-4 relative" style={{clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-mono font-bold " style={{color: 'var(--cyber-cyan)'}}>&gt;&gt; GEO_SELECTOR</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 cyber-border transition-all transform hover:scale-110"
                style={{background: 'var(--cyber-gradient-2)', color: 'black'}}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Popular Cities */}
            <div className="mb-6">
              <h3 className="text-sm font-mono font-bold mb-4" style={{color: 'var(--cyber-hot-pink)'}}>&gt; POPULAR_SECTORS</h3>
              <div className="grid grid-cols-2 gap-3">
                {popularCities.map((loc) => (
                  <button
                    key={`${loc.city}-${loc.state}`}
                    onClick={() => handleCitySelect(loc.city, loc.state)}
                    className={`px-3 py-2 text-sm font-mono transition-all transform hover:scale-105 cyber-border ${
                      currentLocation.city === loc.city && currentLocation.state === loc.state
                        ? 'cyber-hologram text-black'
                        : 'hover:bg-gray-800/50'
                    }`}
                    style={{
                      background: currentLocation.city === loc.city && currentLocation.state === loc.state ? 'var(--cyber-gradient-1)' : 'rgba(0,0,0,0.5)',
                      color: currentLocation.city === loc.city && currentLocation.state === loc.state ? 'black' : 'var(--cyber-magenta)',
                      clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)'
                    }}
                  >
                    {loc.city}, {loc.state}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Location */}
            <div>
              <h3 className="text-sm font-mono font-bold mb-4" style={{color: 'var(--cyber-electric-blue)'}}>&gt; PULSE_SEARCH</h3>
              <div className="relative" ref={searchRef}>
                <div className="relative">
                  <Satellite className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{color: 'var(--cyber-cyan)'}} />
                  <input
                    type="text"
                    placeholder=">> Enter sector coordinates..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full pl-10 pr-3 py-3 cyber-border bg-black/70 font-mono focus:outline-none transition-all"
                    style={{
                      color: 'var(--cyber-cyan)',
                      clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)'
                    }}
                  />
                </div>
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && filteredCities.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 cyber-border bg-black/95 backdrop-blur-sm max-h-64 overflow-y-auto z-10" style={{clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)'}}>
                    {filteredCities.map((location) => (
                      <button
                        key={`${location.city}-${location.state}`}
                        onClick={() => handleCitySelect(location.city, location.state)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-all transform hover:scale-105 flex justify-between items-center font-mono border-b border-gray-800 last:border-b-0"
                      >
                        <span style={{color: 'var(--cyber-cyan)'}}>&gt; {location.city}</span>
                        <span className="text-sm" style={{color: 'var(--cyber-magenta)'}}>{location.state}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {searchQuery && filteredCities.length === 0 && (
                <p className="text-xs font-mono mt-2" style={{color: 'var(--cyber-hot-pink)'}}>
                  &gt;&gt; No sectors found. Recalibrate search parameters.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}