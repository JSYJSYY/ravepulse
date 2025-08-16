import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRecentlyPlayed, getTopArtists, getTopTracks } from '@/lib/spotify';

// Extract EDM-related genres from artists
function extractEDMGenres(artists: any[]): { genre: string; count: number }[] {
  const genreCount: Record<string, number> = {};
  
  artists.forEach((artist) => {
    // Also use artist name as a genre indicator
    if (artist.name) {
      genreCount[artist.name] = (genreCount[artist.name] || 0) + (artist.playCount || 1);
    }
    
    // Process artist genres
    if (artist.genres && Array.isArray(artist.genres)) {
      artist.genres.forEach((genre: string) => {
        // Include all genres for better matching
        genreCount[genre] = (genreCount[genre] || 0) + (artist.playCount || 1);
        
        // Also extract sub-genres
        const genreLower = genre.toLowerCase();
        if (genreLower.includes('house')) {
          genreCount['house'] = (genreCount['house'] || 0) + 1;
        }
        if (genreLower.includes('techno')) {
          genreCount['techno'] = (genreCount['techno'] || 0) + 1;
        }
        if (genreLower.includes('trance')) {
          genreCount['trance'] = (genreCount['trance'] || 0) + 1;
        }
        if (genreLower.includes('dubstep') || genreLower.includes('bass')) {
          genreCount['bass'] = (genreCount['bass'] || 0) + 1;
        }
        if (genreLower.includes('drum') || genreLower.includes('dnb')) {
          genreCount['drum & bass'] = (genreCount['drum & bass'] || 0) + 1;
        }
      });
    }
  });
  
  // Convert to array and sort by count
  return Object.entries(genreCount)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('spotify_access_token');

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch all listening data in parallel
    const [recentlyPlayed, topArtistsShort, topArtistsLong, topTracksShort] = await Promise.all([
      getRecentlyPlayed(accessToken.value),
      getTopArtists(accessToken.value, 'short_term'),
      getTopArtists(accessToken.value, 'long_term'),
      getTopTracks(accessToken.value, 'short_term'),
    ]);

    console.log('Recently played response:', JSON.stringify(recentlyPlayed, null, 2));

    // Extract EDM-related genres with specific subgenre extraction
    const extractEDMGenres = (artists: any[]) => {
      const edmSubgenres = [
        'house', 'techno', 'trance', 'dubstep', 'drum and bass', 'dnb',
        'hardstyle', 'future bass', 'trap', 'progressive house', 'deep house', 
        'tech house', 'melodic dubstep', 'future house', 'electro house', 
        'big room', 'tropical house', 'bass house', 'garage', 'breakbeat', 
        'hardcore', 'ambient', 'synthwave', 'electronica', 'psytrance',
        'minimal techno', 'acid house', 'uk garage', 'riddim', 'bass music',
        'liquid dnb', 'neurofunk', 'jump up', 'darkstep', 'drumstep',
        'future garage', 'wave', 'phonk', 'midtempo', 'leftfield bass'
      ];
      
      const genreCounts: Record<string, number> = {};
      
      artists.forEach(artist => {
        artist.genres?.forEach((genre: string) => {
          const lowerGenre = genre.toLowerCase();
          
          // First, check for specific subgenres within the genre string
          edmSubgenres.forEach(subgenre => {
            if (lowerGenre.includes(subgenre)) {
              // Capitalize properly for display
              const displayName = subgenre.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              genreCounts[displayName] = (genreCounts[displayName] || 0) + 1;
            }
          });
          
          // If it just says "edm" or "electronic", use the full genre name
          if ((lowerGenre === 'edm' || lowerGenre === 'electronic') && 
              !edmSubgenres.some(sub => lowerGenre.includes(sub))) {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          }
        });
      });
      
      console.log('EDM Genres found:', genreCounts);
      
      return Object.entries(genreCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([genre, count]) => ({ genre, count }));
    };

    // Extract artists from recently played and count their appearances
    const recentArtistCounts = new Map<string, { artist: any, count: number }>();
    recentlyPlayed.items?.forEach((item: any) => {
      item.track.artists.forEach((artist: any) => {
        const existing = recentArtistCounts.get(artist.id);
        if (existing) {
          existing.count++;
        } else {
          recentArtistCounts.set(artist.id, { artist, count: 1 });
        }
      });
    });

    // Fetch full artist data for recently played artists to get genres
    const recentArtists = [];
    const recentArtistIds = Array.from(recentArtistCounts.keys());
    
    if (recentArtistIds.length > 0) {
      const artistsResponse = await fetch(
        `https://api.spotify.com/v1/artists?ids=${recentArtistIds.slice(0, 50).join(',')}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
          },
        }
      );
      const artistsData = await artistsResponse.json();
      
      // Merge play counts with full artist data
      artistsData.artists?.forEach((fullArtist: any) => {
        const countData = recentArtistCounts.get(fullArtist.id);
        if (countData) {
          recentArtists.push({
            ...fullArtist,
            playCount: countData.count
          });
        }
      });
      
      // Sort by play count
      recentArtists.sort((a, b) => b.playCount - a.playCount);
    }
    
    console.log('Sample artist genres:', topArtistsShort.items?.slice(0, 3).map((a: any) => ({
      name: a.name,
      genres: a.genres
    })));

    const data = {
      recentlyPlayed: {
        tracks: recentlyPlayed.items || [],
        artists: recentArtists,
      },
      topArtists: {
        shortTerm: topArtistsShort.items || [],
        longTerm: topArtistsLong.items || [],
      },
      topTracks: {
        shortTerm: topTracksShort.items?.slice(0, 20) || [],
      },
      edmGenres: {
        recentlyPlayed: extractEDMGenres(recentArtists),
        shortTerm: extractEDMGenres(topArtistsShort.items || []),
        longTerm: extractEDMGenres(topArtistsLong.items || []),
      },
      summary: {
        totalRecentTracks: recentlyPlayed.items?.length || 0,
        uniqueRecentArtists: recentArtists.length,
        topGenresShortTerm: extractEDMGenres(topArtistsShort.items || []).slice(0, 5),
        topGenresLongTerm: extractEDMGenres(topArtistsLong.items || []).slice(0, 5),
      }
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Spotify data fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch Spotify data' }, { status: 500 });
  }
}