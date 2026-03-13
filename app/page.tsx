'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface Event {
  id: string;
  url: string;
  datetime: string;
  venue: {
    name: string;
    city: string;
    region: string;
    country: string;
    latitude: string;
    longitude: string;
  };
  lineup: string[];
  offers?: Array<{
    type: string;
    url: string;
    status: string;
  }>;
}

interface UserLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault?: boolean;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'us' | 'international'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'proximity'>('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [cardHeights, setCardHeights] = useState<Record<string, number>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRefs = useRef<Record<string, HTMLElement | null>>({});
  const hasFetchedEvents = useRef(false);

  const measureCardHeights = useCallback(() => {
    const heights: Record<string, number> = {};
    
    Object.keys(contentRefs.current).forEach((eventId) => {
      const contentEl = contentRefs.current[eventId];
      const wrapper = cardRefs.current[eventId];
      
      if (contentEl && wrapper) {
        // Save original wrapper styles
        const originalHeight = wrapper.style.height;
        const originalMargin = wrapper.style.margin;
        const originalOverflow = wrapper.style.overflow;
        
        // Temporarily make wrapper visible to measure accurately
        wrapper.style.height = 'auto';
        wrapper.style.margin = '';
        wrapper.style.overflow = 'visible';
        wrapper.style.visibility = 'hidden';
        wrapper.style.position = 'absolute';
        
        // Measure the content's natural height
        heights[eventId] = contentEl.scrollHeight;
        
        // Restore original wrapper styles
        wrapper.style.height = originalHeight;
        wrapper.style.margin = originalMargin;
        wrapper.style.overflow = originalOverflow;
        wrapper.style.visibility = '';
        wrapper.style.position = '';
      }
    });
    
    if (Object.keys(heights).length > 0) {
      setCardHeights(heights);
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedEvents.current) {
      hasFetchedEvents.current = true;
      fetchEvents();
    }
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    try {
      const response = await fetch('/api/location');
      if (response.ok) {
        const location = await response.json();
        const lat = typeof location.latitude === 'number' 
          ? location.latitude 
          : location.latitude ? parseFloat(location.latitude) : null;
        const lon = typeof location.longitude === 'number'
          ? location.longitude
          : location.longitude ? parseFloat(location.longitude) : null;
        
        if (location.city || location.region || location.country) {
          setUserLocation({
            city: location.city,
            region: location.region,
            country: location.country,
            latitude: lat,
            longitude: lon,
            isDefault: location.isDefault || false,
          });
        }
      }
    } catch (err) {
      // Silently fail - location detection is optional
      console.log('Could not detect location:', err);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (events.length > 0) {
      // Measure heights after events are loaded and rendered
      setTimeout(() => {
        measureCardHeights();
      }, 100);
    }
  }, [events, measureCardHeights]);

  useEffect(() => {
    const handleResize = () => {
      measureCardHeights();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measureCardHeights]);

  useEffect(() => {
    let filtered = events;

    // Apply region filter (US/International)
    if (regionFilter === 'us') {
      filtered = filtered.filter((event) => 
        event.venue.country === 'United States'
      );
    } else if (regionFilter === 'international') {
      filtered = filtered.filter((event) => 
        event.venue.country !== 'United States'
      );
    }

    // Apply location filter
    if (locationFilter.trim() !== '') {
      const filter = locationFilter.toLowerCase();
      filtered = filtered.filter((event) => {
        const city = event.venue.city?.toLowerCase() || '';
        const region = event.venue.region?.toLowerCase() || '';
        const country = event.venue.country?.toLowerCase() || '';
        const venueName = event.venue.name?.toLowerCase() || '';
        
        return (
          city.includes(filter) ||
          region.includes(filter) ||
          country.includes(filter) ||
          venueName.includes(filter)
        );
      });
    }

    // Sort events
    if (sortBy === 'date') {
      filtered = [...filtered].sort((a, b) => 
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      );
    } else if (sortBy === 'proximity' && userLocation?.latitude != null && userLocation?.longitude != null) {
      filtered = [...filtered].sort((a, b) => {
        const latA = parseFloat(a.venue.latitude);
        const lonA = parseFloat(a.venue.longitude);
        const latB = parseFloat(b.venue.latitude);
        const lonB = parseFloat(b.venue.longitude);
        
        // Events without valid coordinates go to the end
        if (isNaN(latA) || isNaN(lonA)) return 1;
        if (isNaN(latB) || isNaN(lonB)) return -1;
        
        const distA = calculateDistance(
          userLocation.latitude!,
          userLocation.longitude!,
          latA,
          lonA
        );
        const distB = calculateDistance(
          userLocation.latitude!,
          userLocation.longitude!,
          latB,
          lonB
        );
        
        return distA - distB;
      });
    } else if (sortBy === 'proximity') {
      // If proximity is selected but no location, fall back to date sorting
      filtered = [...filtered].sort((a, b) => 
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      );
    }

    setFilteredEvents(filtered);
  }, [locationFilter, regionFilter, events, sortBy, userLocation]);

  // Create sorted events array for rendering (maintains filteredEvents order for visible items)
  const sortedEventsForRender = useMemo(() => {
    const filteredEventMap = new Map(filteredEvents.map((e, idx) => [e.id, idx]));
    
    return [...events].sort((a, b) => {
      const aInFiltered = filteredEventMap.has(a.id);
      const bInFiltered = filteredEventMap.has(b.id);
      
      if (aInFiltered && bInFiltered) {
        // Both are filtered, maintain filteredEvents order
        return filteredEventMap.get(a.id)! - filteredEventMap.get(b.id)!;
      } else if (aInFiltered) {
        return -1; // a comes first
      } else if (bInFiltered) {
        return 1; // b comes first
      }
      return 0; // maintain original order for non-filtered
    });
  }, [events, filteredEvents]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      console.log('Events:', data);
      setEvents(data);
      setFilteredEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Postmodern Jukebox Events
        </h1>
        <p className="text-gray-600 mb-6">
          Upcoming concerts and shows
        </p>

        <div className="mb-6">
          {/* Mobile: Toggle first */}
          <div className="flex items-center gap-3 mb-4 md:hidden">
            <span className="text-sm text-gray-600">Region:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setRegionFilter('all')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  regionFilter === 'all'
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setRegionFilter('us')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  regionFilter === 'us'
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                US
              </button>
              <button
                type="button"
                onClick={() => setRegionFilter('international')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  regionFilter === 'international'
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                International
              </button>
            </div>
          </div>

          {/* Label and toggle row (desktop) or just label (mobile) */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
            <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-2 md:mb-0">
              Filter by Location
            </label>
            {/* Desktop: Toggle on same row */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-600">Region:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setRegionFilter('all')}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    regionFilter === 'all'
                      ? 'bg-brand-blue text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setRegionFilter('us')}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    regionFilter === 'us'
                      ? 'bg-brand-blue text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  US
                </button>
                <button
                  type="button"
                  onClick={() => setRegionFilter('international')}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    regionFilter === 'international'
                      ? 'bg-brand-blue text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  International
                </button>
              </div>
            </div>
          </div>
          
          {/* Input field */}
          <input
            id="location-filter"
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Enter city, state, country, or venue name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none"
          />
        </div>

        {/* Sort by toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort by
          </label>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setSortBy('date')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                sortBy === 'date'
                  ? 'bg-brand-blue text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Date
            </button>
            <button
              type="button"
              onClick={() => setSortBy('proximity')}
              disabled={!userLocation?.latitude || !userLocation?.longitude}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                sortBy === 'proximity'
                  ? 'bg-brand-blue text-white'
                  : 'text-gray-700 hover:text-gray-900'
              } ${
                !userLocation?.latitude || !userLocation?.longitude
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              Proximity
            </button>
            </div>
            {userLocation && (userLocation.city || userLocation.region || userLocation.country) && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${userLocation.isDefault ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                    {(() => {
                      const parts = [];
                      if (userLocation.city) parts.push(userLocation.city);
                      // Only add region if it's different from city
                      if (userLocation.region && userLocation.region !== userLocation.city) {
                        parts.push(userLocation.region);
                      }
                      if (userLocation.country) parts.push(userLocation.country);
                      return parts.join(', ');
                    })()}
                  </p>
                  {userLocation.isDefault && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium">
                      Demo Location
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setUserLocation(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear location"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {sortBy === 'proximity' && (!userLocation?.latitude || !userLocation?.longitude) && (
            <p className="text-xs text-gray-500 mt-2">
              Location detection required for proximity sorting
            </p>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-12 h-12">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-blue rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredEvents.length} of {events.length} events
            </p>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No events found matching your filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedEventsForRender.map((event) => {
                  const isVisible = filteredEvents.some(e => e.id === event.id);
                  const measuredHeight = cardHeights[event.id] || 0;
                  return (
                    <div
                      key={event.id}
                      ref={(el) => {
                        cardRefs.current[event.id] = el;
                      }}
                      className="transition-all duration-300 overflow-hidden"
                      style={isVisible 
                        ? { height: `${measuredHeight}px`, margin: '' } 
                        : { height: 0, margin: 0 }
                      }
                    >
                      {event.offers && event.offers.length > 0 ? (
                        <a
                          ref={(el) => {
                            contentRefs.current[event.id] = el;
                          }}
                          href={event.offers[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block bg-white rounded-lg p-6 cursor-pointer group transition-opacity duration-300 ${
                            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                          }`}
                        >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-1">
                            {event.venue.name}
                          </h2>
                          <p className="text-gray-600">
                            {event.venue.city}
                            {event.venue.region && `, ${event.venue.region}`}
                            {event.venue.country && `, ${event.venue.country}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(event.datetime)}
                          </p>
                        </div>
                      </div>

                      {/* Lineup section - hidden for now */}
                      {/* {event.lineup && event.lineup.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">Lineup:</p>
                          <p className="text-sm text-gray-700">{event.lineup.join(', ')}</p>
                        </div>
                      )} */}

                      <div className="mt-4">
                        <span className="inline-block bg-brand-blue group-hover:bg-brand-blue-hover text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                          Get Tickets
                        </span>
                      </div>
                    </a>
                      ) : (
                        <div
                          ref={(el) => {
                            contentRefs.current[event.id] = el;
                          }}
                          className={`bg-white rounded-lg shadow-md p-6 transition-opacity duration-300 ${
                            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                          }`}
                        >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-1">
                            {event.venue.name}
                          </h2>
                          <p className="text-gray-600">
                            {event.venue.city}
                            {event.venue.region && `, ${event.venue.region}`}
                            {event.venue.country && `, ${event.venue.country}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(event.datetime)}
                          </p>
                        </div>
                      </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

