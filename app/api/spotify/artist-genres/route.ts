import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Cache to avoid repeated API calls
const genreCache = new Map<string, { genres: string[], timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

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

async function getArtistGenres(artistName: string, accessToken: string): Promise<string[]> {
  // Check cache first
  const cached = genreCache.get(artistName.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.genres;
  }
  
  try {
    // Search for the artist
    const searchUrl = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!searchResponse.ok) {
      console.error(`Failed to search for artist ${artistName}`);
      return [];
    }
    
    const searchData = await searchResponse.json();
    
    if (searchData.artists?.items?.length > 0) {
      const artist = searchData.artists.items[0];
      const genres = artist.genres || [];
      
      // Cache the result
      genreCache.set(artistName.toLowerCase(), {
        genres,
        timestamp: Date.now(),
      });
      
      return genres;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching genres for ${artistName}:`, error);
    return [];
  }
}

// Helper to clean and categorize EDM genres
function categorizeEDMGenres(genres: string[]): string[] {
  const edmGenreMap: Record<string, string> = {
    // House variants
    'house': 'House',
    'deep house': 'Deep House',
    'tech house': 'Tech House',
    'progressive house': 'Progressive House',
    'electro house': 'Electro House',
    'future house': 'Future House',
    'tropical house': 'Tropical House',
    'melodic house': 'Melodic House',
    'afro house': 'Afro House',
    'slap house': 'Slap House',
    
    // Techno variants
    'techno': 'Techno',
    'melodic techno': 'Melodic Techno',
    'minimal techno': 'Minimal Techno',
    'detroit techno': 'Detroit Techno',
    'acid techno': 'Acid Techno',
    
    // Bass music
    'dubstep': 'Dubstep',
    'riddim': 'Riddim',
    'brostep': 'Brostep',
    'drum and bass': 'Drum & Bass',
    'liquid funk': 'Liquid DnB',
    'neurofunk': 'Neurofunk',
    'trap': 'Trap',
    'future bass': 'Future Bass',
    
    // Trance
    'trance': 'Trance',
    'progressive trance': 'Progressive Trance',
    'uplifting trance': 'Uplifting Trance',
    'psytrance': 'Psytrance',
    'vocal trance': 'Vocal Trance',
    
    // Other EDM
    'edm': 'EDM',
    'electronic': 'Electronic',
    'electronica': 'Electronica',
    'hardstyle': 'Hardstyle',
    'hardcore': 'Hardcore',
    'gabber': 'Gabber',
    'uk garage': 'UK Garage',
    'grime': 'Grime',
    'breakbeat': 'Breakbeat',
    'electro': 'Electro',
    'synthwave': 'Synthwave',
    'future garage': 'Future Garage',
    'downtempo': 'Downtempo',
    'ambient': 'Ambient',
    'chillstep': 'Chillstep',
    'glitch hop': 'Glitch Hop',
    'moombahton': 'Moombahton',
  };
  
  const categorized = new Set<string>();
  
  for (const genre of genres) {
    const normalized = genre.toLowerCase();
    
    // Check for exact match
    if (edmGenreMap[normalized]) {
      categorized.add(edmGenreMap[normalized]);
      continue;
    }
    
    // Check for partial matches
    for (const [key, value] of Object.entries(edmGenreMap)) {
      if (normalized.includes(key)) {
        categorized.add(value);
        break;
      }
    }
  }
  
  // If no specific EDM genres found, check if it's still electronic
  if (categorized.size === 0 && genres.some(g => 
    g.toLowerCase().includes('electronic') || 
    g.toLowerCase().includes('edm') ||
    g.toLowerCase().includes('dance'))) {
    categorized.add('Electronic');
  }
  
  return Array.from(categorized);
}

export async function POST(request: NextRequest) {
  try {
    const { artists } = await request.json();
    
    if (!artists || !Array.isArray(artists)) {
      return NextResponse.json({ error: 'Artists array required' }, { status: 400 });
    }
    
    // Get Spotify access token
    const accessToken = await getSpotifyAccessToken();
    
    // Fetch genres for all artists
    const artistGenres = await Promise.all(
      artists.map(async (artistName: string) => {
        const genres = await getArtistGenres(artistName, accessToken);
        const categorized = categorizeEDMGenres(genres);
        return {
          artist: artistName,
          genres: categorized,
          rawGenres: genres,
        };
      })
    );
    
    // Combine all genres and count frequency
    const genreCount = new Map<string, number>();
    for (const { genres } of artistGenres) {
      for (const genre of genres) {
        genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
      }
    }
    
    // Sort by frequency
    const topGenres = Array.from(genreCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);
    
    return NextResponse.json({
      topGenres,
      artistGenres,
      allGenres: Array.from(genreCount.keys()),
    });
    
  } catch (error) {
    console.error('Error fetching artist genres:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artist genres' },
      { status: 500 }
    );
  }
}