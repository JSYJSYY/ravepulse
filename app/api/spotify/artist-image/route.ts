import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }
  
  const data = await response.json();
  return data.access_token;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artistName = searchParams.get('artist');
  
  if (!artistName) {
    return NextResponse.json({ error: 'Artist name required' }, { status: 400 });
  }
  
  try {
    // Get Spotify access token
    const accessToken = await getSpotifyAccessToken();
    
    // Search for the artist
    const searchUrl = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!searchResponse.ok) {
      throw new Error('Failed to search artist on Spotify');
    }
    
    const searchData = await searchResponse.json();
    
    if (searchData.artists?.items?.length > 0) {
      const artist = searchData.artists.items[0];
      const images = artist.images || [];
      
      // Return the best quality image available
      const image = images[0]?.url || images[1]?.url || images[2]?.url || null;
      
      return NextResponse.json({
        artistName: artist.name,
        spotifyId: artist.id,
        image: image,
        images: images,
        genres: artist.genres || [],
        popularity: artist.popularity,
      });
    }
    
    // No artist found
    return NextResponse.json({
      artistName: artistName,
      image: null,
      message: 'Artist not found on Spotify',
    });
    
  } catch (error) {
    console.error('Error fetching artist image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artist image' },
      { status: 500 }
    );
  }
}