'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'us' | 'international'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardHeights, setCardHeights] = useState<Record<string, number>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRefs = useRef<Record<string, HTMLElement | null>>({});

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
    fetchEvents();
  }, []);

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

    setFilteredEvents(filtered);
  }, [locationFilter, regionFilter, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
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

        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading events...</p>
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
                {events.map((event) => {
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
                          className={`block bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer group transition-opacity duration-300 ${
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

