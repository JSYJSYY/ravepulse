'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Map, List, Heart, Clock, Settings, MapPin, LogOut, Zap, Shield, Cpu, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import MusicTasteAnalysis from '@/components/MusicTasteAnalysis';
import EventsList from '@/components/EventsList';
import LocationSelector from '@/components/LocationSelector';
import { getAttendanceStats } from '@/lib/attendance';
import { getWishlistStats } from '@/lib/wishlist';
import dynamic from 'next/dynamic';

// Dynamic import for map to avoid SSR issues
const EventsMap = dynamic(() => import('@/components/EventsMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
    </div>
  )
});

export default function Dashboard() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ city: string; state: string }>({ 
    city: 'New York', 
    state: 'NY' 
  });
  const [listeningData, setListeningData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [wishlistStats, setWishlistStats] = useState<any>(null);
  const [filterThisWeek, setFilterThisWeek] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    checkAuth();
    // Fetch listening data
    fetchListeningData();
    // Load attendance stats
    loadAttendanceStats();
  }, []);

  useEffect(() => {
    // Fetch events when location changes
    fetchEvents();
  }, [userLocation]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/');
    }
  };

  const fetchListeningData = async () => {
    try {
      const response = await fetch('/api/spotify/listening-data');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched listening data:', data);
        setListeningData(data);
      } else {
        console.error('Failed to fetch listening data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching listening data:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams({
        city: userLocation.city,
        state: userLocation.state,
      });
      const response = await fetch(`/api/events?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleLocationChange = (city: string, state: string) => {
    setUserLocation({ city, state });
    toast.success(`Location updated to ${city}, ${state}`);
  };

  const loadAttendanceStats = () => {
    const stats = getAttendanceStats();
    setAttendanceStats(stats);
    const wishlist = getWishlistStats();
    setWishlistStats(wishlist);
  };

  const getThisWeekEvents = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    // Calculate this Monday (start of week)
    const monday = new Date(now);
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, so we need to adjust
    monday.setDate(now.getDate() - daysFromMonday);
    monday.setHours(0, 0, 0, 0);
    
    // Calculate this Sunday (end of week)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return events.filter(event => {
      // Parse date as local date to avoid timezone issues
      const [year, month, day] = event.date.split('-').map(num => parseInt(num));
      const eventDate = new Date(year, month - 1, day);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= monday && eventDate <= sunday;
    }).sort((a, b) => {
      const [aYear, aMonth, aDay] = a.date.split('-').map(num => parseInt(num));
      const [bYear, bMonth, bDay] = b.date.split('-').map(num => parseInt(num));
      const aDate = new Date(aYear, aMonth - 1, aDay);
      const bDate = new Date(bYear, bMonth - 1, bDay);
      return aDate.getTime() - bDate.getTime();
    });
  };

  const sortEventsByRecommendation = (eventsToSort: any[]) => {
    // Separate recommended and non-recommended events
    const recommendedEvents = [];
    const otherEvents = [];
    
    for (const event of eventsToSort) {
      if (getEventMatchScore(event) > 0) {
        recommendedEvents.push(event);
      } else {
        otherEvents.push(event);
      }
    }
    
    // Sort both groups by date (chronological order)
    const sortByDate = (a: any, b: any) => {
      const [aYear, aMonth, aDay] = a.date.split('-').map(num => parseInt(num));
      const [bYear, bMonth, bDay] = b.date.split('-').map(num => parseInt(num));
      const aDate = new Date(aYear, aMonth - 1, aDay);
      const bDate = new Date(bYear, bMonth - 1, bDay);
      return aDate.getTime() - bDate.getTime();
    };
    
    recommendedEvents.sort(sortByDate);
    otherEvents.sort(sortByDate);
    
    // Return recommended events first, then others
    return [...recommendedEvents, ...otherEvents];
  };

  const getEventMatchScore = (event: any) => {
    if (!listeningData?.edmGenres?.recentlyPlayed?.length) {
      return 0;
    }
    if (!event || !event.name) return 0;
    
    let score = 0;
    const eventName = (event.name || '').toLowerCase();
    const eventArtists = (event.artists || []).map((a: any) => (a.name || '').toLowerCase());
    const artistNames = eventArtists.join(' ');
    const eventGenres = (event.genres || []).map((g: string) => (g || '').toLowerCase()).join(' ');
    
    
    // More precise matching - check for exact matches first
    listeningData.edmGenres.recentlyPlayed.forEach(({ genre, count }: any) => {
      if (!genre) return;
      const userGenre = genre.toLowerCase();
      
      // Check for exact genre match in event genres
      if (eventGenres.includes(userGenre)) {
        score += count * 2; // Double weight for exact genre match
        return;
      }
      
      // Check for exact artist name match (case-insensitive)
      const matchedArtist = eventArtists.some(artist => 
        artist === userGenre || 
        artist.includes(userGenre) || 
        userGenre.includes(artist)
      );
      if (matchedArtist) {
        score += count * 3; // Triple weight for exact artist match
        return;
      }
      
      // Check for partial artist name match in event name or artist list
      if (eventName.includes(userGenre) || artistNames.includes(userGenre)) {
        score += count * 1.5; // 1.5x weight for partial match
        return;
      }
      
      // Genre keyword matching - expand the list and be more flexible
      const significantKeywords = [
        'house', 'techno', 'trance', 'dubstep', 'bass', 'drum', 'trap', 
        'hardstyle', 'progressive', 'deep', 'future', 'tech', 'melodic',
        'minimal', 'acid', 'breaks', 'garage', 'jungle', 'hardcore'
      ];
      
      // Check if user genre contains any keywords
      significantKeywords.forEach(keyword => {
        if (userGenre.includes(keyword) && (eventGenres.includes(keyword) || eventName.includes(keyword))) {
          score += count * 0.8; // Weight for keyword match
        }
      });
      
      // Also check for EDM, electronic, dance as generic matches
      if (userGenre.includes('edm') || userGenre.includes('electronic') || userGenre.includes('dance')) {
        if (event.electronicGenreInd) {
          score += count * 0.3; // Small weight for generic EDM match
        }
      }
    });
    
    // Only recommend if score is above a threshold
    return score >= 3 ? score : 0;
  };

  const displayedEvents = filterThisWeek 
    ? getThisWeekEvents() // Keep date order for "This Week" view
    : sortEventsByRecommendation(events);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Cyberpunk Background Effects */}
      <div className="absolute inset-0 tech-pattern opacity-20"></div>
      <div className="scan-line"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
      {/* Navigation Bar */}
      <nav className="bg-black/80 backdrop-blur-sm cyber-border border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold font-mono " style={{color: 'var(--cyber-cyan)'}}>
                <span className="cyber-chrome">RAVE</span><span style={{color: 'var(--cyber-hot-pink)'}}>PULSE</span>
              </h1>
              <div className="ml-4 text-xs font-mono" style={{color: 'var(--cyber-magenta)'}}>
                {'>> PULSE INTERFACE ACTIVE'}
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-4">
              <div className="cyber-border bg-black/50 p-1 flex">
                <button
                  onClick={() => setActiveView('list')}
                  className={`px-4 py-2 font-mono flex items-center gap-2 transition-all transform hover:scale-105 ${
                    activeView === 'list' 
                      ? 'cyber-hologram text-black' 
                      : 'hover:bg-gray-800/50'
                  }`}
                  style={{
                    background: activeView === 'list' ? 'var(--cyber-gradient-1)' : 'transparent',
                    color: activeView === 'list' ? 'black' : 'var(--cyber-cyan)',
                    clipPath: activeView === 'list' ? 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' : 'none'
                  }}
                >
                  <List className="w-4 h-4" />
                  DATA_LIST
                </button>
                <button
                  onClick={() => setActiveView('map')}
                  className={`px-4 py-2 font-mono flex items-center gap-2 transition-all transform hover:scale-105 ${
                    activeView === 'map' 
                      ? 'cyber-hologram text-black' 
                      : 'hover:bg-gray-800/50'
                  }`}
                  style={{
                    background: activeView === 'map' ? 'var(--cyber-gradient-2)' : 'transparent',
                    color: activeView === 'map' ? 'black' : 'var(--cyber-hot-pink)',
                    clipPath: activeView === 'map' ? 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)' : 'none'
                  }}
                >
                  <Map className="w-4 h-4" />
                  GEO_MAP
                </button>
              </div>
              
              {/* User Profile */}
              {userProfile && (
                <div className="flex items-center gap-4">
                  <div className="cyber-border px-3 py-1 bg-black/50">
                    <span className="text-sm font-mono" style={{color: 'var(--cyber-neon-green)'}}>
                      USER: {userProfile.display_name.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/api/auth/logout')}
                    className="p-2 cyber-border hover:bg-red-500/20 transition-all transform hover:scale-110"
                    style={{color: 'var(--cyber-hot-pink)'}}
                    title="Disconnect Pulse Link"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-black/80 backdrop-blur-sm cyber-border border-r relative z-10">
          <div className="p-4 space-y-6">
            {/* Location Selector */}
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider mb-3" style={{color: 'var(--cyber-cyan)'}}>
                <MapPin className="w-4 h-4 inline mr-2" />
                GEO_LOCATION
              </h3>
              <div className="cyber-border bg-black/50 p-2">
                <LocationSelector 
                  currentLocation={userLocation}
                  onLocationChange={handleLocationChange}
                />
              </div>
            </div>

            {/* Filters */}
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider mb-3" style={{color: 'var(--cyber-hot-pink)'}}>
                <Zap className="w-4 h-4 inline mr-2" />
                PULSE_FILTERS
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => router.push('/wishlist')}
                  className="w-full text-left px-4 py-2 cyber-border hover:bg-gray-800/50 transition-all transform hover:scale-105 flex items-center gap-2 font-mono"
                  style={{
                    color: 'var(--cyber-neon-green)',
                    clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)'
                  }}
                >
                  <Heart className="w-4 h-4" />
                  PRIORITY_LIST
                </button>
                <button 
                  onClick={() => router.push('/past-events')}
                  className="w-full text-left px-4 py-2 cyber-border hover:bg-gray-800/50 transition-all transform hover:scale-105 flex items-center gap-2 font-mono"
                  style={{
                    color: 'var(--cyber-orange)',
                    clipPath: 'polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)'
                  }}
                >
                  <Clock className="w-4 h-4" />
                  ARCHIVE_DATA
                </button>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider mb-3" style={{color: 'var(--cyber-electric-blue)'}}>
                <Activity className="w-4 h-4 inline mr-2" />
                PULSE_STATS
              </h3>
              <div className="cyber-border bg-black/70 backdrop-blur-sm p-4 space-y-3 text-sm cyber-hologram">
                <div className="flex justify-between items-center">
                  <span className="font-mono" style={{color: 'var(--cyber-magenta)'}}>&gt; EVENTS_ATTENDED</span>
                  <span className="font-mono font-bold cyber-neon" style={{color: 'var(--cyber-cyan)'}}>{attendanceStats?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono" style={{color: 'var(--cyber-magenta)'}}>&gt; PRIORITY_QUEUE</span>
                  <span className="font-mono font-bold cyber-neon" style={{color: 'var(--cyber-neon-green)'}}>{wishlistStats?.total || 0}</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-3"></div>
                <div className="text-xs font-mono text-center" style={{color: 'var(--cyber-hot-pink)'}}>
                  STATUS: ONLINE
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main View */}
        <main className="flex-1 overflow-hidden relative">
          {activeView === 'list' ? (
            <div className="h-full overflow-y-auto p-6 bg-black/50 backdrop-blur-sm">
              <div className="max-w-4xl mx-auto">
                {/* Music Taste Analysis - only show when not filtering */}
                {!filterThisWeek && (
                  <div className="mb-8">
                    <MusicTasteAnalysis />
                  </div>
                )}
                
                {/* Events List */}
                <div className="mt-8">
                  <div className="cyber-border bg-black/50 p-4 mb-4">
                    <h2 className="text-xl font-mono font-bold" style={{color: 'var(--cyber-hot-pink)'}}>
                      {filterThisWeek ? '>> CURRENT_CYCLE_EVENTS' : '>> UPCOMING_EVENT_MATRIX'}
                    </h2>
                  </div>
                  {filterThisWeek && displayedEvents.length === 0 ? (
                    <div className="text-center py-8 cyber-border bg-black/50">
                      <p className="font-mono" style={{color: 'var(--cyber-magenta)'}}>&gt; NO EVENTS IN CURRENT CYCLE</p>
                      <button
                        onClick={() => setFilterThisWeek(false)}
                        className="mt-4 px-4 py-2 cyber-border font-mono transition-all transform hover:scale-105"
                        style={{color: 'var(--cyber-cyan)', background: 'var(--cyber-gradient-1)', clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)'}}
                      >
                        ACCESS_ALL_EVENTS
                      </button>
                    </div>
                  ) : (
                    <EventsList 
                      events={displayedEvents}
                      edmGenres={listeningData?.edmGenres?.recentlyPlayed}
                      recommendedEventIds={displayedEvents
                        .filter(event => getEventMatchScore(event) > 0)
                        .map(event => event.id)}
                      onAttendanceChange={loadAttendanceStats}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-black/50 backdrop-blur-sm">
              <div className="cyber-border bg-black/70 p-4 m-4">
                <h2 className="text-xl font-mono font-bold" style={{color: 'var(--cyber-electric-blue)'}}>
                  &gt;&gt; GEOSPATIAL_EVENT_MATRIX
                </h2>
              </div>
              <EventsMap 
                events={displayedEvents}
                onAttendanceChange={loadAttendanceStats}
                center={(() => {
                  const cityCoords: Record<string, { lat: number; lng: number }> = {
                    'San Francisco': { lat: 37.7749, lng: -122.4194 },
                    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
                    'New York': { lat: 40.7128, lng: -74.0060 },
                    'Miami': { lat: 25.7617, lng: -80.1918 },
                    'Chicago': { lat: 41.8781, lng: -87.6298 },
                    'Seattle': { lat: 47.6062, lng: -122.3321 },
                    'Denver': { lat: 39.7392, lng: -104.9903 },
                    'Austin': { lat: 30.2672, lng: -97.7431 },
                  };
                  return cityCoords[userLocation.city] || { lat: 40.7128, lng: -74.0060 };
                })()}
                recommendedEventIds={displayedEvents
                  .filter(event => getEventMatchScore(event) > 0)
                  .map(event => event.id)}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}