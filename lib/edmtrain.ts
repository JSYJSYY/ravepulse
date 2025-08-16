export interface EDMTrainEvent {
  id: number;
  name: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  venue: {
    id: number;
    name: string;
    location: string;
    address: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  artistList: Array<{
    id: number;
    name: string;
    link: string | null;
    b2bInd: boolean;
  }>;
  ages: string | null;
  festivalInd: boolean;
  livestreamInd?: boolean;
  electronicGenreInd: boolean;
  otherGenreInd: boolean;
  link: string;
  ticketLink?: string | null;
  createdDate: string;
  imageUrl?: string | null;
}

export interface EDMTrainLocation {
  id: number;
  city: string | null;
  state: string;
  stateCode: string;
  latitude: number;
  longitude: number;
}

const EDMTRAIN_API_BASE = 'https://edmtrain.com/api';
const EDMTRAIN_CLIENT_KEY = '932533d3-1d7b-49ef-8757-cd22cdae5d11';

// Cache for artist images to avoid repeated API calls
const artistImageCache = new Map<string, string | null>();

export async function getEDMTrainLocations(): Promise<EDMTrainLocation[]> {
  try {
    const response = await fetch(`${EDMTRAIN_API_BASE}/locations?client=${EDMTRAIN_CLIENT_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching EDMTrain locations:', error);
    return [];
  }
}

export async function findNearestLocation(latitude: number, longitude: number): Promise<EDMTrainLocation | null> {
  const locations = await getEDMTrainLocations();
  
  if (locations.length === 0) return null;
  
  let nearest: EDMTrainLocation | null = null;
  let minDistance = Infinity;
  
  for (const location of locations) {
    const distance = calculateDistance(latitude, longitude, location.latitude, location.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  }
  
  return nearest;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function getEDMTrainEvents(
  locationIds?: number[],
  startDate?: string,
  endDate?: string
): Promise<EDMTrainEvent[]> {
  try {
    const params = new URLSearchParams({
      client: EDMTRAIN_CLIENT_KEY,
    });
    
    if (locationIds && locationIds.length > 0) {
      params.append('locationIds', locationIds.join(','));
    }
    
    if (startDate) {
      params.append('startDate', startDate);
    }
    
    if (endDate) {
      params.append('endDate', endDate);
    }
    
    const url = `${EDMTRAIN_API_BASE}/events?${params.toString()}`;
    console.log('Fetching EDMTrain events:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching EDMTrain events:', error);
    return [];
  }
}

// Helper function to fetch artist image from cache or Spotify
async function getArtistImage(artistName: string): Promise<string | null> {
  // Check cache first
  if (artistImageCache.has(artistName)) {
    return artistImageCache.get(artistName) || null;
  }
  
  try {
    // Try to fetch from our Spotify API route (server-side)
    // This would need to be called from the API route, not directly from browser
    // For now, we'll just return null and use the fallback
    artistImageCache.set(artistName, null);
    return null;
  } catch (error) {
    console.error(`Failed to fetch image for artist ${artistName}:`, error);
    artistImageCache.set(artistName, null);
    return null;
  }
}

// Helper function to generate image URL based on event details
function generateEventImage(event: EDMTrainEvent, artistImage?: string | null): string {
  // If we have an artist image from Spotify, use it
  if (artistImage) {
    return artistImage;
  }
  
  // If EDMTrain provides an image URL in the future, use it
  if (event.imageUrl) {
    return event.imageUrl;
  }
  
  // Get the primary artist name for better image relevance
  const primaryArtist = event.artistList?.[0]?.name || 'EDM';
  const eventName = event.name || 'Electronic Music Event';
  
  // Use different image strategies based on event type
  if (event.festivalInd) {
    // For festivals, use festival-specific images
    return `https://source.unsplash.com/600x400/?music,festival,stage`;
  }
  
  // For regular events, create more targeted searches
  // Clean artist name for better search results
  const cleanArtistName = primaryArtist
    .replace(/b2b/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
  
  // Use venue-specific or generic EDM images
  const venueType = event.venue.name.toLowerCase().includes('club') ? 'nightclub' : 'concert';
  
  // Build search query
  const searchQuery = [
    'electronic',
    'music',
    venueType,
    'dj'
  ].join(',');
  
  // Return Unsplash image with specific search terms
  return `https://source.unsplash.com/600x400/?${searchQuery}`;
}

export function formatEDMTrainEvent(event: EDMTrainEvent) {
  // Extract city from location string (e.g., "San Francisco, CA" -> "San Francisco")
  const locationParts = event.venue.location.split(',');
  const city = locationParts[0] || 'Unknown City';
  const stateAbbr = locationParts[1]?.trim() || '';
  
  // Use artist names if event name is missing or generic
  let eventName = event.name;
  
  // Log to see what we're getting
  if (!eventName || eventName.trim() === '') {
    console.log('Event has no name, using artists:', event.artistList);
  }
  
  if (!eventName || eventName.trim() === '' || eventName === 'EDM Event' || eventName === 'TBA') {
    // Create event name from artist list
    const artistNames = event.artistList
      .slice(0, 3) // Take up to 3 artists
      .map(artist => artist.name)
      .filter(name => name && name !== 'TBA');
    
    if (artistNames.length > 0) {
      eventName = artistNames.join(' • ');
      console.log('Replaced empty/generic name with:', eventName);
    } else {
      eventName = 'EDM Event';
    }
  }
  
  return {
    id: event.id.toString(),
    name: eventName,
    date: event.date,
    startTime: event.startTime || null,
    endTime: event.endTime || null,
    isTimeEstimated: false, // Don't estimate times anymore
    venue: {
      id: event.venue.id,
      name: event.venue.name,
      address: event.venue.address || '',
      city: city,
      state: event.venue.state || stateAbbr,
      latitude: event.venue.latitude,
      longitude: event.venue.longitude,
    },
    artists: event.artistList.map(artist => ({
      id: artist.id.toString(),
      name: artist.name,
      b2b: artist.b2bInd,
    })),
    genres: [], // Genres will be populated from Spotify API
    ages: event.ages || 'All Ages',
    festivalInd: event.festivalInd,
    electronicGenreInd: event.electronicGenreInd,
    otherGenreInd: event.otherGenreInd,
    link: event.link, // This is the EDMTrain link that must be preserved per API Terms
    ticketLink: event.ticketLink || event.link,
    image: generateEventImage(event, null),
  };
}