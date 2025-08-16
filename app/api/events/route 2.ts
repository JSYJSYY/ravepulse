import { NextRequest, NextResponse } from 'next/server';
import { 
  getEDMTrainEvents, 
  formatEDMTrainEvent, 
  findNearestLocation,
  getEDMTrainLocations 
} from '@/lib/edmtrain';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  try {
    let locationIds: number[] = [];
    
    // If we have coordinates, find the nearest location
    if (latitude && longitude) {
      const nearestLocation = await findNearestLocation(
        parseFloat(latitude),
        parseFloat(longitude)
      );
      
      if (nearestLocation) {
        locationIds = [nearestLocation.id];
        console.log(`Found nearest location: ${nearestLocation.city}, ${nearestLocation.state}`);
      }
    } else if (city || state) {
      // Otherwise, search for locations by city/state
      const locations = await getEDMTrainLocations();
      
      const matchingLocations = locations.filter(loc => {
        const cityMatch = !city || (loc.city && loc.city.toLowerCase().includes(city.toLowerCase()));
        const stateMatch = !state || loc.stateCode.toLowerCase() === state.toLowerCase() || 
                          loc.state.toLowerCase() === state.toLowerCase();
        return cityMatch && stateMatch;
      });
      
      if (matchingLocations.length > 0) {
        // Take up to 5 matching locations
        locationIds = matchingLocations.slice(0, 5).map(loc => loc.id);
        console.log(`Found ${matchingLocations.length} matching locations`);
      }
    }
    
    // If no locations found, default to major cities
    if (locationIds.length === 0) {
      console.log('No specific location found, fetching events from major cities');
      // These are example location IDs for major cities - adjust based on actual EDMTrain location IDs
      // You can get these by calling the locations endpoint first
      const majorCityIds = [36, 94, 123, 456]; // San Francisco, Los Angeles, New York, Miami
      locationIds = majorCityIds;
    }
    
    // Calculate date range (default to next 30 days)
    const today = new Date();
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 30);
    
    const eventsStartDate = startDate || today.toISOString().split('T')[0];
    const eventsEndDate = endDate || defaultEndDate.toISOString().split('T')[0];
    
    // Fetch events from EDMTrain
    console.log(`Fetching EDMTrain events for locations: ${locationIds.join(',')}`);
    const edmtrainEvents = await getEDMTrainEvents(
      locationIds,
      eventsStartDate,
      eventsEndDate
    );
    
    if (edmtrainEvents.length > 0) {
      // Format EDMTrain events for our frontend
      const formattedEvents = await Promise.all(
        edmtrainEvents.map(async (event) => {
          const formatted = formatEDMTrainEvent(event);
          
          // Try to enhance with Spotify artist image if available
          try {
            const primaryArtist = event.artistList?.[0]?.name;
            if (primaryArtist && process.env.SPOTIFY_CLIENT_ID) {
              // Make internal API call to get artist image
              const baseUrl = request.nextUrl.origin;
              const artistImageResponse = await fetch(
                `${baseUrl}/api/spotify/artist-image?artist=${encodeURIComponent(primaryArtist)}`
              );
              
              if (artistImageResponse.ok) {
                const artistData = await artistImageResponse.json();
                if (artistData.image) {
                  formatted.image = artistData.image;
                }
              }
            }
          } catch (error) {
            // Silently fail, use default image
            console.log('Could not fetch Spotify artist image:', error);
          }
          
          return formatted;
        })
      );
      
      // Sort by date
      formattedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return NextResponse.json({
        events: formattedEvents,
        location: {
          city: formattedEvents[0]?.venue?.city || city || 'Multiple Cities',
          state: formattedEvents[0]?.venue?.state || state || 'US',
          coordinates: latitude && longitude ? { 
            lat: parseFloat(latitude), 
            lng: parseFloat(longitude) 
          } : null,
        },
        total: formattedEvents.length,
        source: 'edmtrain',
      });
    }
    
    // If no events found, return mock data as fallback
    console.log('No EDMTrain events found, returning mock data');
    const mockEvents = generateMockEvents(city || 'San Francisco', state || 'CA');
    
    return NextResponse.json({
      events: mockEvents,
      location: {
        city: city || 'San Francisco',
        state: state || 'CA',
        coordinates: latitude && longitude ? { 
          lat: parseFloat(latitude), 
          lng: parseFloat(longitude) 
        } : null,
      },
      total: mockEvents.length,
      source: 'mock',
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    
    // Return mock data on error
    const mockEvents = generateMockEvents(city || 'San Francisco', state || 'CA');
    
    return NextResponse.json({
      events: mockEvents,
      location: {
        city: city || 'San Francisco',
        state: state || 'CA',
        coordinates: latitude && longitude ? { 
          lat: parseFloat(latitude), 
          lng: parseFloat(longitude) 
        } : null,
      },
      total: mockEvents.length,
      source: 'mock',
      error: 'Failed to fetch live events, showing sample data',
    });
  }
}

// Helper function to generate mock events when API fails
function generateMockEvents(city: string, state: string) {
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Miami': { lat: 25.7617, lng: -80.1918 },
    'Chicago': { lat: 41.8781, lng: -87.6298 },
    'Seattle': { lat: 47.6062, lng: -122.3321 },
    'Denver': { lat: 39.7392, lng: -104.9903 },
    'Austin': { lat: 30.2672, lng: -97.7431 },
  };

  const venues: Record<string, Array<{ name: string; address: string; lat: number; lng: number }>> = {
    'San Francisco': [
      { name: 'The Great Northern', address: '119 Utah St', lat: 37.7680, lng: -122.4058 },
      { name: 'Public Works', address: '161 Erie St', lat: 37.7526, lng: -122.4195 },
      { name: 'Audio', address: '316 11th St', lat: 37.7700, lng: -122.4150 },
    ],
    'Los Angeles': [
      { name: 'Exchange LA', address: '618 S Spring St', lat: 34.0430, lng: -118.2516 },
      { name: 'Academy LA', address: '6021 Hollywood Blvd', lat: 34.1020, lng: -118.3210 },
    ],
    'New York': [
      { name: 'Brooklyn Mirage', address: '140 Stewart Ave', lat: 40.7114, lng: -73.9260 },
      { name: 'Nowadays', address: '56-06 Cooper Ave', lat: 40.7138, lng: -73.9242 },
    ],
  };

  const defaultCoords = cityCoordinates[city] || { lat: 37.7749, lng: -122.4194 };
  const cityVenues = venues[city] || [
    { name: 'EDM Club', address: '123 Main St', lat: defaultCoords.lat, lng: defaultCoords.lng },
  ];
  
  const eventTypes = [
    { genres: ['Deep House', 'Progressive House'], artists: [['Lane 8', 'Yotto'], ['Ben Böhmer', 'Tinlicker']] },
    { genres: ['Techno', 'Minimal Techno'], artists: [['Adam Beyer', 'Cirez D'], ['Charlotte de Witte', 'Amelie Lens']] },
    { genres: ['Future Bass', 'Melodic Dubstep'], artists: [['Flume', 'ODESZA'], ['Porter Robinson', 'Madeon']] },
    { genres: ['Trance', 'Progressive Trance'], artists: [['Above & Beyond', 'Armin van Buuren'], ['Paul van Dyk', 'Ferry Corsten']] },
    { genres: ['Drum & Bass', 'Neurofunk'], artists: [['Andy C', 'Sub Focus'], ['Noisia', 'Black Sun Empire']] },
  ];

  const events = [];
  for (let i = 0; i < 5; i++) {
    const eventType = eventTypes[i % eventTypes.length];
    const artistSet = eventType.artists[i % 2];
    const venueIndex = i % cityVenues.length;
    
    events.push({
      id: `mock-${i + 1}`,
      name: `${artistSet[0]} presents ${eventType.genres[0]} Night`,
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '22:00',
      endTime: '03:00',
      venue: {
        ...cityVenues[venueIndex],
        city: city,
        state: state,
        latitude: cityVenues[venueIndex].lat,
        longitude: cityVenues[venueIndex].lng,
      },
      artists: artistSet.map((name, idx) => ({ id: `${i}-${idx}`, name })),
      genres: eventType.genres,
      ages: i % 2 === 0 ? '18+' : '21+',
      festivalInd: false,
      electronicGenreInd: true,
      otherGenreInd: false,
      link: '#',
      ticketLink: '#',
      image: `https://source.unsplash.com/400x400/?${eventType.genres[0].replace(' ', '')},concert`,
    });
  }

  return events;
}