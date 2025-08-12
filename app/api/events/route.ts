import { NextRequest, NextResponse } from 'next/server';

// We'll try multiple sources
const DICE_API_BASE = 'https://api.dice.fm/v1';
const EDMTRAIN_API_BASE = 'https://edmtrain.com/api/events';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  
  try {
    // Try to fetch real events from Dice API
    try {
      // Dice API endpoints
      // Note: Dice API requires authentication. You'll need to get an API key from Dice
      const diceApiKey = process.env.DICE_API_KEY;
      
      if (diceApiKey) {
        // Map city names to Dice location IDs (these are examples, you'll need real IDs)
        const locationMap: Record<string, string> = {
          'New York': 'new-york',
          'Los Angeles': 'los-angeles',
          'San Francisco': 'san-francisco',
          'Miami': 'miami',
          'Chicago': 'chicago',
          'Seattle': 'seattle',
          'Denver': 'denver',
          'Austin': 'austin',
        };
        
        const locationId = locationMap[city || 'San Francisco'] || 'san-francisco';
        
        // Dice API discovery endpoint for electronic music events
        const diceUrl = `${DICE_API_BASE}/discovery/events?location=${locationId}&genre=electronic&page_size=50`;
        console.log('Fetching from Dice API:', diceUrl);
        
        const response = await fetch(diceUrl, {
          headers: {
            'Authorization': `Bearer ${diceApiKey}`,
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Dice API response:', data);
          
          if (data.events && data.events.length > 0) {
            const events = data.events.map((event: any) => ({
              id: event.id,
              name: event.name,
              date: new Date(event.date).toISOString().split('T')[0],
              startTime: new Date(event.date).toTimeString().slice(0, 5),
              endTime: event.end_date ? new Date(event.end_date).toTimeString().slice(0, 5) : '',
              venue: {
                name: event.venue?.name || 'TBA',
                address: event.venue?.address || '',
                city: event.venue?.city || city || 'San Francisco',
                state: event.venue?.state || state || 'CA',
                latitude: event.venue?.lat || 37.7749,
                longitude: event.venue?.lng || -122.4194,
              },
              artists: event.lineup?.map((artist: any) => ({
                id: artist.id,
                name: artist.name,
              })) || [{id: '1', name: event.name}],
              genres: event.tags?.filter((tag: string) => 
                ['house', 'techno', 'trance', 'dubstep', 'drum & bass', 'electronic'].includes(tag.toLowerCase())
              ) || ['Electronic'],
              ages: event.age_restriction || 'All Ages',
              festivalInd: event.is_festival || false,
              electronicGenreInd: true,
              otherGenreInd: false,
              link: event.url || '',
              ticketLink: event.ticket_url || event.url || '',
              image: event.image_url || 'https://via.placeholder.com/300x300?text=Electronic+Event',
            }));
            
            return NextResponse.json({
              events,
              location: {
                city: city || 'San Francisco',
                state: state || 'CA',
                coordinates: null,
              },
              total: events.length,
              source: 'dice',
            });
          }
        }
      }
    } catch (diceError) {
      console.error('Dice API error:', diceError);
    }
    
    // Try EDMTrain as fallback
    try {
      const testUrl = 'https://edmtrain.com/api/events?client=ravepulse';
      console.log('Trying EDMTrain API as fallback:', testUrl);
      
      const testResponse = await fetch(testUrl);
      if (testResponse.ok) {
        const testData = await testResponse.json();
        if (testData.data && testData.data.length > 0) {
          // ... existing EDMTrain code ...
        }
      }
    } catch (apiError) {
      console.error('EDMTrain API error:', apiError);
    }
    
    // If API fails, return mock data
    console.log('Falling back to mock data');
    // Generate location-specific mock events
    const eventCity = city || 'San Francisco';
    const eventState = state || 'CA';
    
    const cityCoordinates = {
      'San Francisco': { lat: 37.7749, lng: -122.4194 },
      'Los Angeles': { lat: 34.0522, lng: -118.2437 },
      'New York': { lat: 40.7128, lng: -74.0060 },
      'Miami': { lat: 25.7617, lng: -80.1918 },
      'Chicago': { lat: 41.8781, lng: -87.6298 },
      'Seattle': { lat: 47.6062, lng: -122.3321 },
      'Denver': { lat: 39.7392, lng: -104.9903 },
      'Austin': { lat: 30.2672, lng: -97.7431 },
    };

    const venues = {
      'San Francisco': [
        { name: 'The Great Northern', address: '119 Utah St', lat: 37.7680, lng: -122.4058 },
        { name: 'Public Works', address: '161 Erie St', lat: 37.7526, lng: -122.4195 },
        { name: 'Audio', address: '316 11th St', lat: 37.7700, lng: -122.4150 },
        { name: '1015 Folsom', address: '1015 Folsom St', lat: 37.7785, lng: -122.4056 },
      ],
      'Los Angeles': [
        { name: 'Exchange LA', address: '618 S Spring St', lat: 34.0430, lng: -118.2516 },
        { name: 'Academy LA', address: '6021 Hollywood Blvd', lat: 34.1020, lng: -118.3210 },
        { name: 'Sound Nightclub', address: '1642 N Las Palmas Ave', lat: 34.1009, lng: -118.3338 },
      ],
      'New York': [
        { name: 'Brooklyn Mirage', address: '140 Stewart Ave', lat: 40.7114, lng: -73.9260 },
        { name: 'Nowadays', address: '56-06 Cooper Ave', lat: 40.7138, lng: -73.9242 },
        { name: 'Good Room', address: '98 Meserole Ave', lat: 40.7228, lng: -73.9391 },
        { name: 'Marquee New York', address: '289 10th Ave', lat: 40.7505, lng: -74.0023 },
      ],
      'Miami': [
        { name: 'Club Space', address: '34 NE 11th St', lat: 25.7834, lng: -80.1933 },
        { name: 'LIV', address: '4441 Collins Ave', lat: 25.8180, lng: -80.1220 },
        { name: 'Electric Pickle', address: '2826 N Miami Ave', lat: 25.8025, lng: -80.1990 },
      ],
    };

    const defaultCoords = cityCoordinates[eventCity] || { lat: 37.7749, lng: -122.4194 };
    const defaultVenues = [
      { name: 'EDM Club', address: '123 Main St', lat: defaultCoords.lat, lng: defaultCoords.lng },
      { name: 'The Warehouse', address: '456 Dance Ave', lat: defaultCoords.lat + 0.01, lng: defaultCoords.lng + 0.01 },
    ];

    const cityVenues = venues[eventCity] || defaultVenues;
    
    // City-specific event themes
    const cityEventThemes = {
      'New York': {
        eventNames: ['Brooklyn Warehouse Rave', 'Manhattan Underground', 'Queens Bass Night', 'Bronx Breaks', 'NYC Techno Marathon'],
        specialArtists: ['Carl Cox', 'The Martinez Brothers', 'Danny Tenaglia']
      },
      'Los Angeles': {
        eventNames: ['LA Desert Rave', 'Hollywood Hills House', 'Venice Beach Vibes', 'Downtown LA Techno', 'Sunset Strip Sessions'],
        specialArtists: ['Doc Martin', 'Lee Burridge', 'Desert Hearts Crew']
      },
      'Miami': {
        eventNames: ['South Beach Sessions', 'Wynwood Warehouse', 'Miami Bass Nights', 'Biscayne Beats', 'Ultra Afterparty'],
        specialArtists: ['Oscar G', 'Danny Daze', 'Sister System']
      },
      'San Francisco': {
        eventNames: ['Golden Gate Grooves', 'Mission District Underground', 'SF Warehouse Party', 'Bay Area Bass', 'Fog City Frequencies'],
        specialArtists: ['Claude VonStroke', 'Justin Martin', 'J.Phlip']
      },
      'Chicago': {
        eventNames: ['Chicago House Heritage', 'Windy City Warehouse', 'South Side Sessions', 'Millennium Park After Dark', 'Chi-Town Classics'],
        specialArtists: ['Green Velvet', 'Derrick Carter', 'DJ Heather']
      },
      'Seattle': {
        eventNames: ['Emerald City Electronics', 'Capitol Hill Underground', 'Seattle Sound System', 'Pike Place After Hours', 'Northwest Bass Culture'],
        specialArtists: ['DJAO', 'Pezzner', 'Subset']
      },
      'Denver': {
        eventNames: ['Mile High Bass', 'Rocky Mountain Rave', 'Denver Deep House', 'RiNo Warehouse Party', 'Colorado Electronic'],
        specialArtists: ['Maddy O\'Neal', 'Mikey Thunder', 'SoDown']
      },
      'Austin': {
        eventNames: ['6th Street Electronic', 'Austin City Limits After Dark', 'Texas Techno', 'Rainey Street Rave', 'Hill Country House'],
        specialArtists: ['Maceo Plex', 'Steffi', 'Silent Servant']
      }
    };

    const theme = cityEventThemes[eventCity] || cityEventThemes['San Francisco'];
    
    // Generate events for the next 10 days
    const generateMockEvents = () => {
      const events = [];
      const eventTypes = [
        { genres: ['Deep House', 'Progressive House'], artists: [['Lane 8', 'Yotto'], ['Ben Böhmer', 'Tinlicker']] },
        { genres: ['Techno', 'Minimal Techno'], artists: [['Adam Beyer', 'Cirez D'], ['Charlotte de Witte', 'Amelie Lens']] },
        { genres: ['Future Bass', 'Melodic Dubstep'], artists: [['Flume', 'ODESZA'], ['Porter Robinson', 'Madeon']] },
        { genres: ['Trance', 'Progressive Trance'], artists: [['Above & Beyond', 'Armin van Buuren'], ['Paul van Dyk', 'Ferry Corsten']] },
        { genres: ['Drum & Bass', 'Neurofunk'], artists: [['Andy C', 'Sub Focus'], ['Noisia', 'Black Sun Empire']] },
        { genres: ['House', 'Tech House'], artists: [['Chris Lake', 'Fisher'], ['John Summit', 'Dom Dolla']] },
        { genres: ['Dubstep', 'Riddim'], artists: [['Skrillex', 'Zomboy'], ['Virtual Riot', 'Subtronics']] },
        { genres: ['Trap', 'Future Trap'], artists: [['RL Grime', 'Baauer'], ['TroyBoi', 'Ekali']] },
      ];

      for (let i = 0; i < 10; i++) {
        const eventType = eventTypes[i % eventTypes.length];
        const artistSet = eventType.artists[i % 2];
        const venueIndex = i % cityVenues.length;
        const eventNameIndex = i % theme.eventNames.length;
        
        // Add city-specific artist occasionally
        if (i % 3 === 0 && theme.specialArtists) {
          artistSet[1] = theme.specialArtists[i % theme.specialArtists.length];
        }

        events.push({
          id: `${i + 1}`,
          name: theme.eventNames[eventNameIndex],
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: i % 2 === 0 ? '22:00' : '23:00',
          endTime: i % 2 === 0 ? '03:00' : '05:00',
          venue: {
            ...cityVenues[venueIndex] || cityVenues[0],
            city: eventCity,
            state: eventState,
            latitude: cityVenues[venueIndex]?.lat || cityVenues[0]?.lat || defaultCoords.lat,
            longitude: cityVenues[venueIndex]?.lng || cityVenues[0]?.lng || defaultCoords.lng,
          },
          artists: artistSet.map((name, idx) => ({ id: `${i}-${idx}`, name })),
          genres: eventType.genres,
          ages: i % 3 === 0 ? '18+' : '21+',
          festivalInd: false,
          electronicGenreInd: true,
          otherGenreInd: false,
          link: '#',
          ticketLink: '#',
          image: `https://source.unsplash.com/400x400/?${eventType.genres[0].replace(' ', '')},concert`,
        });
      }

      return events;
    };

    const mockEvents = generateMockEvents();

    const events = mockEvents;

    return NextResponse.json({
      events,
      location: {
        city: city || 'San Francisco',
        state: state || 'CA',
        coordinates: latitude && longitude ? { lat: parseFloat(latitude), lng: parseFloat(longitude) } : null,
      },
      total: events.length,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}