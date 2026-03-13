import { NextRequest, NextResponse } from 'next/server';

// Test location objects for development/testing
const TEST_LOCATIONS = {
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

    // If we're in development or can't get IP, use Savannah, GA as default
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      // In development, return Savannah, GA coordinates
      // You can change TEST_LOCATIONS.savannah to TEST_LOCATIONS.hamburg or TEST_LOCATIONS.sydney for testing
      return NextResponse.json({ 
        ...TEST_LOCATIONS.hamburg,
        ip: '127.0.0.1' 
      });
    }

    // Use ipapi.co (free tier: 1000 requests/day, no API key needed)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'Accept': 'application/json',
      },
    });

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
        error: data.reason 
      });
    }

    return NextResponse.json({
      city: data.city || null,
      region: data.region || null,
      country: data.country_name || null,
      countryCode: data.country_code || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      ip: ip,
    });
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
        error: 'Failed to fetch location' 
      },
      { status: 500 }
    );
  }
}
