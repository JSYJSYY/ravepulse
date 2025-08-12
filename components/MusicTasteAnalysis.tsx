'use client';

import { useEffect, useState } from 'react';
import { Music, TrendingUp, Clock, Sparkles, RefreshCw, Cpu, Brain, Activity, Zap } from 'lucide-react';

interface ListeningData {
  recentlyPlayed: {
    tracks: any[];
    artists: any[];
  };
  topArtists: {
    shortTerm: any[];
    longTerm: any[];
  };
  edmGenres: {
    recentlyPlayed: { genre: string; count: number }[];
    shortTerm: { genre: string; count: number }[];
    longTerm: { genre: string; count: number }[];
  };
  summary: {
    totalRecentTracks: number;
    uniqueRecentArtists: number;
    topGenresShortTerm: { genre: string; count: number }[];
    topGenresLongTerm: { genre: string; count: number }[];
  };
}

export default function MusicTasteAnalysis() {
  const [listeningData, setListeningData] = useState<ListeningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recent' | 'artists' | 'genres'>('recent');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEDMOnly, setShowEDMOnly] = useState(false);

  useEffect(() => {
    fetchListeningData();
  }, []);

  const fetchListeningData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/spotify/listening-data');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch');
      }
      const data = await response.json();
      console.log('Fetched listening data:', data);
      setListeningData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching listening data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchListeningData();
  };

  if (loading) {
    return (
      <div className="cyber-border bg-black/80 backdrop-blur-sm p-6 tech-pattern">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor: 'var(--cyber-cyan)'}}></div>
          <span className="ml-3 font-mono" style={{color: 'var(--cyber-magenta)'}}>&gt;&gt; PULSE SCAN IN PROGRESS...</span>
        </div>
        <div className="scan-line"></div>
      </div>
    );
  }

  if (!listeningData || error) {
    return (
      <div className="cyber-border bg-black/80 backdrop-blur-sm p-6">
        <p className="font-mono text-center" style={{color: 'var(--cyber-hot-pink)'}}>
          &gt;&gt; {error || 'PULSE LINK DISCONNECTED'}
        </p>
        {error && (
          <button
            onClick={handleRefresh}
            className="mx-auto mt-4 flex items-center gap-2 px-4 py-2 font-mono cyber-border transition-all transform hover:scale-105"
            style={{background: 'var(--cyber-gradient-1)', color: 'black', clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)'}}
          >
            <RefreshCw className="w-4 h-4" />
            RECONNECT
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="cyber-border bg-black/80 backdrop-blur-sm p-6 tech-pattern relative">
      <div className="scan-line"></div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-mono font-bold flex items-center gap-3 ">
          <Brain className="w-6 h-6 cyber-neon" style={{color: 'var(--cyber-cyan)'}} />
          <span style={{color: 'var(--cyber-cyan)'}}>PULSE_TASTE_ANALYSIS</span>
        </h2>
        <div className="flex items-center gap-4">
          <div className="cyber-border bg-black/50 px-3 py-1">
            <div className="text-sm font-mono" style={{color: 'var(--cyber-neon-green)'}}>
              &gt; {listeningData.summary.totalRecentTracks} SCANNED_TRACKS
              {lastUpdated && (
                <div className="text-xs mt-1" style={{color: 'var(--cyber-magenta)'}}>
                  LAST_SYNC: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 cyber-border transition-all transform hover:scale-110 disabled:opacity-50"
            style={{color: 'var(--cyber-hot-pink)'}}
            title="Rescan Pulse Patterns"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 cyber-border bg-black/50 p-2">
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 px-4 py-2 font-mono transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
            activeTab === 'recent' 
              ? 'cyber-hologram text-black' 
              : 'hover:bg-gray-800/50'
          }`}
          style={{
            background: activeTab === 'recent' ? 'var(--cyber-gradient-1)' : 'transparent',
            color: activeTab === 'recent' ? 'black' : 'var(--cyber-cyan)',
            clipPath: activeTab === 'recent' ? 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' : 'none'
          }}
        >
          <Activity className="w-4 h-4" />
          RECENT_SCAN
        </button>
        <button
          onClick={() => setActiveTab('artists')}
          className={`flex-1 px-4 py-2 font-mono transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
            activeTab === 'artists' 
              ? 'cyber-hologram text-black' 
              : 'hover:bg-gray-800/50'
          }`}
          style={{
            background: activeTab === 'artists' ? 'var(--cyber-gradient-2)' : 'transparent',
            color: activeTab === 'artists' ? 'black' : 'var(--cyber-hot-pink)',
            clipPath: activeTab === 'artists' ? 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' : 'none'
          }}
        >
          <TrendingUp className="w-4 h-4" />
          TOP_ARTISTS
        </button>
        <button
          onClick={() => setActiveTab('genres')}
          className={`flex-1 px-4 py-2 font-mono transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
            activeTab === 'genres' 
              ? 'cyber-hologram text-black' 
              : 'hover:bg-gray-800/50'
          }`}
          style={{
            background: activeTab === 'genres' ? 'var(--cyber-gradient-3)' : 'transparent',
            color: activeTab === 'genres' ? 'black' : 'var(--cyber-electric-blue)',
            clipPath: activeTab === 'genres' ? 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' : 'none'
          }}
        >
          <Zap className="w-4 h-4" />
          EDM_MATRIX
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'recent' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono font-bold" style={{color: 'var(--cyber-cyan)'}}>&gt; RECENT_PULSE_PATTERNS</h3>
              <button
                onClick={() => setShowEDMOnly(!showEDMOnly)}
                className={`text-xs px-3 py-1 cyber-border font-mono transition-all transform hover:scale-105 ${
                  showEDMOnly 
                    ? 'text-black' 
                    : 'hover:bg-gray-800/50'
                }`}
                style={{
                  background: showEDMOnly ? 'var(--cyber-gradient-2)' : 'transparent',
                  color: showEDMOnly ? 'black' : 'var(--cyber-hot-pink)',
                  clipPath: 'polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)'
                }}
              >
                EDM_FILTER
              </button>
            </div>
            {listeningData.recentlyPlayed.tracks.length > 0 ? (
              <>
                {(() => {
                  const filteredTracks = listeningData.recentlyPlayed.tracks
                    .filter(item => {
                    if (!showEDMOnly) return true;
                    // Check if any artist has EDM-related genres
                    return item.track.artists.some((artist: any) => 
                      listeningData.recentlyPlayed.artists.find((a: any) => 
                        a.id === artist.id && a.genres?.some((genre: string) => {
                          const lowerGenre = genre.toLowerCase();
                          const edmKeywords = [
                            'edm', 'electronic', 'house', 'techno', 'trance', 'dubstep', 
                            'drum and bass', 'dnb', 'hardstyle', 'future bass', 'trap', 
                            'progressive', 'deep house', 'tech house', 'melodic dubstep', 
                            'future house', 'electro', 'big room', 'tropical house', 
                            'bass house', 'garage', 'breakbeat', 'hardcore', 'ambient',
                            'synthwave', 'electronica', 'psytrance', 'minimal', 'acid',
                            'riddim', 'bass music', 'neurofunk', 'liquid', 'darkstep',
                            'drumstep', 'wave', 'phonk', 'midtempo', 'leftfield'
                          ];
                          return edmKeywords.some(edm => lowerGenre.includes(edm));
                        })
                      )
                    );
                  });

                  return (
                    <>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredTracks.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 cyber-border hover:bg-gray-800/50 transition-all transform hover:scale-105">
                  <img 
                    src={item.track.album.images[2]?.url} 
                    alt={item.track.name}
                    className="w-12 h-12 cyber-border"
                    style={{clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)'}}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-bold truncate" style={{color: 'var(--cyber-cyan)'}}>{item.track.name}</p>
                    <p className="text-xs font-mono truncate" style={{color: 'var(--cyber-magenta)'}}>
                      &gt; {item.track.artists.map((a: any) => a.name).join(' | ')}
                    </p>
                  </div>
                  <span className="text-xs font-mono cyber-border px-2 py-1" style={{color: 'var(--cyber-neon-green)', background: 'rgba(0,0,0,0.5)'}}>
                    {new Date(item.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                        ))}
                      </div>
                      {showEDMOnly && filteredTracks.length === 0 && (
                        <div className="text-center py-8 cyber-border bg-black/50">
                          <p className="font-mono" style={{color: 'var(--cyber-hot-pink)'}}>&gt;&gt; NO EDM PATTERNS DETECTED</p>
                          <p className="text-sm font-mono mt-2" style={{color: 'var(--cyber-magenta)'}}>
                            Pulse scan requires electronic music data!
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            ) : (
              <div className="text-center py-8 cyber-border bg-black/50">
                <p className="font-mono" style={{color: 'var(--cyber-hot-pink)'}}>&gt;&gt; NO PULSE PATTERNS FOUND</p>
                <p className="text-sm font-mono mt-2" style={{color: 'var(--cyber-magenta)'}}>
                  Initialize Spotify playback and rescan pulse network.
                </p>
                <p className="text-xs font-mono mt-4" style={{color: 'var(--cyber-cyan)'}}>
                  Note: Pulse sync may require processing time.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'artists' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-mono font-medium" style={{color: 'var(--cyber-magenta)'}}>
                {'>> TOP_PULSE_ARTISTS'}
              </h3>
              <button
                onClick={() => setShowEDMOnly(!showEDMOnly)}
                className={`text-xs px-3 py-1 font-mono cyber-border transition-all transform hover:scale-105 ${
                  showEDMOnly 
                    ? 'cyber-hologram text-black' 
                    : 'hover:bg-gray-800/50'
                }`}
                style={{
                  background: showEDMOnly ? 'var(--cyber-gradient-1)' : 'transparent',
                  color: showEDMOnly ? 'black' : 'var(--cyber-cyan)',
                  clipPath: showEDMOnly ? 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' : 'none'
                }}
              >
                EDM_FILTER
              </button>
            </div>
            {listeningData.recentlyPlayed.artists.length > 0 ? (
              <div className="space-y-2">
                {(() => {
                  const artists = showEDMOnly 
                    ? listeningData.recentlyPlayed.artists.filter(artist => 
                        artist.genres?.some((genre: string) => {
                          const lowerGenre = genre.toLowerCase();
                          const edmKeywords = [
                            'edm', 'electronic', 'house', 'techno', 'trance', 'dubstep', 
                            'drum and bass', 'dnb', 'hardstyle', 'future bass', 'trap', 
                            'progressive', 'deep house', 'tech house', 'melodic dubstep', 
                            'future house', 'electro', 'big room', 'tropical house', 
                            'bass house', 'garage', 'breakbeat', 'hardcore', 'ambient',
                            'synthwave', 'electronica', 'psytrance', 'minimal', 'acid',
                            'riddim', 'bass music', 'neurofunk', 'liquid', 'darkstep',
                            'drumstep', 'wave', 'phonk', 'midtempo', 'leftfield'
                          ];
                          return edmKeywords.some(edm => lowerGenre.includes(edm));
                        })
                      )
                    : listeningData.recentlyPlayed.artists;
                  
                  return artists.slice(0, 15).map((artist, index) => (
                    <div key={artist.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
                      <span className="text-xs text-gray-500 w-6">{index + 1}</span>
                      <img 
                        src={artist.images?.[2]?.url || '/default-artist.png'} 
                        alt={artist.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{artist.name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {artist.genres?.slice(0, 2).join(', ') || 'No genres'}
                        </p>
                      </div>
                      {artist.playCount && (
                        <span className="text-xs text-gray-500">
                          {artist.playCount} {artist.playCount === 1 ? 'play' : 'plays'}
                        </span>
                      )}
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No artists found in recently played tracks.
              </p>
            )}
            {showEDMOnly && listeningData.recentlyPlayed.artists.filter(artist => 
              artist.genres?.some((genre: string) => {
                const lowerGenre = genre.toLowerCase();
                const edmKeywords = ['edm', 'electronic', 'house', 'techno', 'trance', 'dubstep', 
                  'drum and bass', 'dnb', 'hardstyle', 'future bass', 'trap', 'progressive', 
                  'deep house', 'tech house', 'melodic dubstep', 'future house', 'electro', 
                  'big room', 'tropical house', 'bass house', 'garage', 'breakbeat', 'hardcore', 
                  'ambient', 'synthwave', 'electronica', 'psytrance', 'minimal', 'acid', 'riddim', 
                  'bass music', 'neurofunk', 'liquid', 'darkstep', 'drumstep', 'wave', 'phonk', 
                  'midtempo', 'leftfield'];
                return edmKeywords.some(edm => lowerGenre.includes(edm));
              })
            ).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No EDM artists found in recently played tracks.
              </p>
            )}
          </div>
        )}

        {activeTab === 'genres' && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Your Real-Time EDM Preferences</h3>
            {listeningData.edmGenres.recentlyPlayed.length > 0 ? (
              <div>
                <p className="text-xs text-gray-500 mb-3">Based on your recently played tracks</p>
                <div className="flex flex-wrap gap-2">
                  {listeningData.edmGenres.recentlyPlayed.map((genre) => (
                    <span 
                      key={genre.genre}
                      className="px-4 py-2 cyber-border text-sm font-mono transition-all transform hover:scale-105"
                      style={{
                        background: 'var(--cyber-gradient-1)',
                        color: 'black',
                        clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)'
                      }}
                    >
                      {genre.genre.toUpperCase()} [{genre.count}]
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No EDM genres detected in your recently played tracks. 
                Play some electronic music to see your preferences!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}