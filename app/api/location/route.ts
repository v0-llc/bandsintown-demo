import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering since we use request headers
export const dynamic = 'force-dynamic';

// Simple in-memory cache (in production, consider using Redis or Vercel KV)
const locationCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Test location objects for development/testing
const TEST_LOCATIONS = {
  london: {
    city: 'London',
    region: 'England',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
  },
  savannah: {
    city: 'Savannah',
    region: 'GA',
    country: 'United States',
    latitude: 32.0809,
    longitude: -81.0912,
  },
  hamburg: {
    city: 'Hamburg',
    region: 'Hamburg',
    country: 'Germany',
    latitude: 53.5511,
    longitude: 9.9937,
  },
  sydney: {
    city: 'Sydney',
    region: 'NSW',
    country: 'Australia',
    latitude: -33.8688,
    longitude: 151.2093,
  },
};

export async function GET(request: NextRequest) {
  try {
    // Get the user's IP address from the request
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || request.ip || '';

    // If we're in development or can't get IP, use default location from TEST_LOCATIONS
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      // You can change TEST_LOCATIONS.london to TEST_LOCATIONS.savannah, TEST_LOCATIONS.hamburg, or TEST_LOCATIONS.sydney for testing
      return NextResponse.json({ 
        ...TEST_LOCATIONS.london,
        ip: '127.0.0.1',
        isDefault: true 
      });
    }

    // Check cache first
    const cached = locationCache.get(ip);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Use ipapi.co (free tier: 1000 requests/day, no API key needed)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    // Handle rate limiting (429) - fall back to default location
    if (response.status === 429) {
      console.warn('ipapi.co rate limit exceeded, using default location');
      const defaultLocation = {
        ...TEST_LOCATIONS.london,
        ip: ip,
        isDefault: true,
      };
      // Cache the default location to avoid repeated API calls
      locationCache.set(ip, { data: defaultLocation, timestamp: Date.now() });
      return NextResponse.json(defaultLocation);
    }

    if (!response.ok) {
      throw new Error(`IP geolocation API error: ${response.status}`);
    }

    const data = await response.json();

    // Handle API errors
    if (data.error) {
      return NextResponse.json({ 
        city: null, 
        region: null, 
        country: null,
        latitude: null,
        longitude: null,
        ip: null,
        isDefault: false,
        error: data.reason 
      });
    }

    const locationData = {
      city: data.city || null,
      region: data.region || null,
      country: data.country_name || null,
      countryCode: data.country_code || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      ip: ip,
      isDefault: false,
    };

    // Cache the result
    locationCache.set(ip, { data: locationData, timestamp: Date.now() });

    return NextResponse.json(locationData);
  } catch (error) {
    console.error('Error fetching location:', error);
      return NextResponse.json(
      { 
        city: null, 
        region: null, 
        country: null,
        latitude: null,
        longitude: null,
        ip: null,
        isDefault: false,
        error: 'Failed to fetch location' 
      },
      { status: 500 }
    );
  }
}
