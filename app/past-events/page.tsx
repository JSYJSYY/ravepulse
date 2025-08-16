'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Archive, Calendar, MapPin, Music, Star, ExternalLink, Users, Trophy, BarChart3, Clock } from 'lucide-react';
import { EDMEvent } from '@/lib/types';
import EventModal from '@/components/EventModal';
import toast from 'react-hot-toast';

interface EventWithRating extends EDMEvent {
  djRatings?: Record<string, number>; // DJ name -> rating
  venueRating?: number;
  notes?: string;
  image?: string; // Add missing image property
  link?: string; // Add missing link property
}

// Generic EDM event image fallback
const GENERIC_EDM_IMAGE = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop&q=80';

interface DJRanking {
  name: string;
  count: number;
  lastSeen: string;
  avgRating: number;
}

interface VenueRanking {
  name: string;
  count: number;
  lastSeen: string;
  avgRating: number;
}

export default function PastEventsPage() {
  const [pastEvents, setPastEvents] = useState<EventWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EDMEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'events' | 'djs' | 'venues'>('events');
  const [djRankings, setDjRankings] = useState<DJRanking[]>([]);
  const [venueRankings, setVenueRankings] = useState<VenueRanking[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    uniqueVenues: 0,
    uniqueArtists: 0,
    topGenre: ''
  });

  useEffect(() => {
    loadPastEvents();
  }, []);

  const loadPastEvents = () => {
    try {
      // Load events with ratings (new structure: DJ and venue ratings)
      const ratingsData = localStorage.getItem('eventDetailedRatings');
      const ratings = ratingsData ? JSON.parse(ratingsData) : {};
      
      // Load full event data
      const fullEvents = localStorage.getItem('attendedEventsFull');
      let events: EventWithRating[] = [];
      
      if (fullEvents) {
        events = JSON.parse(fullEvents).map((e: EDMEvent) => ({
          ...e,
          djRatings: ratings[e.id]?.djRatings || {},
          venueRating: ratings[e.id]?.venueRating || 0,
          notes: ratings[e.id]?.notes || '',
          image: e.imageUrl, // Map imageUrl to image
          link: e.ticketLink // Map ticketLink to link
        }));
      } else {
        // Fallback to basic data
        const saved = localStorage.getItem('ravepulse_attended_events');
        if (saved) {
          const attendedData = JSON.parse(saved);
          events = attendedData.map((item: any) => ({
            id: item.eventId,
            name: item.eventName,
            date: item.date,
            venue: { name: item.venueName },
            artists: item.artists.map((name: string) => ({ name })),
            djRatings: ratings[item.eventId]?.djRatings || {},
            venueRating: ratings[item.eventId]?.venueRating || 0,
            notes: ratings[item.eventId]?.notes || ''
          }));
        }
      }
      
      setPastEvents(events);
      
      // Calculate stats
      const venues = new Set(events.map((e: EventWithRating) => e.venue.name));
      const artists = new Set(events.flatMap((e: EventWithRating) => 
        e.artists?.map(a => a.name) || []
      ));
      
      // Count genres
      const genreCounts: Record<string, number> = {};
      events.forEach((e: EventWithRating) => {
        e.genres?.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      });
      
      const topGenre = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Electronic';
      
      setStats({
        totalEvents: events.length,
        uniqueVenues: venues.size,
        uniqueArtists: artists.size,
        topGenre
      });
      
      // Calculate DJ rankings with ratings
      const djData: Record<string, { count: number; lastSeen: string; ratings: number[] }> = {};
      events.forEach((event: EventWithRating) => {
        event.artists?.forEach(artist => {
          if (!djData[artist.name]) {
            djData[artist.name] = { count: 0, lastSeen: event.date, ratings: [] };
          }
          djData[artist.name].count++;
          
          // Add rating if exists
          const djRating = event.djRatings?.[artist.name];
          if (djRating && djRating > 0) {
            djData[artist.name].ratings.push(djRating);
          }
          
          // Parse dates properly to avoid timezone issues
          const [eventYear, eventMonth, eventDay] = event.date.split('-').map(num => parseInt(num));
          const [lastYear, lastMonth, lastDay] = djData[artist.name].lastSeen.split('-').map(num => parseInt(num));
          const eventDate = new Date(eventYear, eventMonth - 1, eventDay);
          const lastSeenDate = new Date(lastYear, lastMonth - 1, lastDay);
          if (eventDate > lastSeenDate) {
            djData[artist.name].lastSeen = event.date;
          }
        });
      });
      
      const djRankings = Object.entries(djData)
        .map(([name, data]) => ({
          name,
          count: data.count,
          lastSeen: data.lastSeen,
          avgRating: data.ratings.length > 0 
            ? data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length 
            : 0
        }))
        .sort((a, b) => b.count - a.count);
      
      setDjRankings(djRankings);
      
      // Calculate Venue rankings with ratings
      const venueData: Record<string, { count: number; lastSeen: string; ratings: number[] }> = {};
      events.forEach((event: EventWithRating) => {
        const venueName = event.venue.name;
        if (!venueData[venueName]) {
          venueData[venueName] = { count: 0, lastSeen: event.date, ratings: [] };
        }
        venueData[venueName].count++;
        
        // Add rating if exists
        if (event.venueRating && event.venueRating > 0) {
          venueData[venueName].ratings.push(event.venueRating);
        }
        
        // Update last seen date
        const [eventYear, eventMonth, eventDay] = event.date.split('-').map(num => parseInt(num));
        const [lastYear, lastMonth, lastDay] = venueData[venueName].lastSeen.split('-').map(num => parseInt(num));
        const eventDate = new Date(eventYear, eventMonth - 1, eventDay);
        const lastSeenDate = new Date(lastYear, lastMonth - 1, lastDay);
        if (eventDate > lastSeenDate) {
          venueData[venueName].lastSeen = event.date;
        }
      });
      
      const venueRankings = Object.entries(venueData)
        .map(([name, data]) => ({
          name,
          count: data.count,
          lastSeen: data.lastSeen,
          avgRating: data.ratings.length > 0 
            ? data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length 
            : 0
        }))
        .sort((a, b) => b.count - a.count);
      
      setVenueRankings(venueRankings);
    } catch (error) {
      console.error('Error loading past events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: EventWithRating) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDJRatingChange = (eventId: string, djName: string, rating: number) => {
    // Update DJ rating in localStorage
    const ratingsData = localStorage.getItem('eventDetailedRatings');
    const ratings = ratingsData ? JSON.parse(ratingsData) : {};
    if (!ratings[eventId]) ratings[eventId] = {};
    if (!ratings[eventId].djRatings) ratings[eventId].djRatings = {};
    ratings[eventId].djRatings[djName] = rating;
    localStorage.setItem('eventDetailedRatings', JSON.stringify(ratings));
    
    // Update local state
    setPastEvents(prev => prev.map(e => 
      e.id === eventId ? { 
        ...e, 
        djRatings: { ...e.djRatings, [djName]: rating }
      } : e
    ));
    
    loadPastEvents(); // Recalculate rankings
    toast.success(`DJ ${djName} rated!`);
  };

  const handleVenueRatingChange = (eventId: string, rating: number) => {
    // Update venue rating in localStorage
    const ratingsData = localStorage.getItem('eventDetailedRatings');
    const ratings = ratingsData ? JSON.parse(ratingsData) : {};
    if (!ratings[eventId]) ratings[eventId] = {};
    ratings[eventId].venueRating = rating;
    localStorage.setItem('eventDetailedRatings', JSON.stringify(ratings));
    
    // Update local state
    setPastEvents(prev => prev.map(e => 
      e.id === eventId ? { ...e, venueRating: rating } : e
    ));
    
    loadPastEvents(); // Recalculate rankings
    toast.success('Venue rated!');
  };

  const formatDate = (dateString: string) => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(num => parseInt(num));
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string | null) => {
    if (!time || time === 'TBA') return '';
    
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const hour = hours;
      const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch {
      return time;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
             style={{borderColor: 'var(--cyber-hot-pink)'}}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Scan Line Effect */}
      <div className="scan-line"></div>
      
      {/* Header */}
      <header className="cyber-border bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-mono"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            
            <h1 className="text-2xl md:text-3xl font-bold cyber-chrome">
              <span style={{color: 'var(--cyber-neon-green)'}}>ARCHIVED</span>
              <span style={{color: 'var(--cyber-cyan)'}}> DATA</span>
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5" style={{color: 'var(--cyber-neon-green)'}} />
                <span className="font-mono text-gray-300">{pastEvents.length}</span>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex gap-1 cyber-border p-1">
                <button
                  onClick={() => setViewMode('events')}
                  className={`px-3 py-2 font-mono text-xs transition-all ${
                    viewMode === 'events' 
                      ? 'bg-gradient-to-r from-green-500/20 to-cyan-500/20 text-white' 
                      : 'hover:bg-white/10 text-gray-400'
                  }`}
                >
                  EVENTS
                </button>
                <button
                  onClick={() => setViewMode('djs')}
                  className={`px-3 py-2 font-mono text-xs transition-all ${
                    viewMode === 'djs' 
                      ? 'bg-gradient-to-r from-green-500/20 to-cyan-500/20 text-white' 
                      : 'hover:bg-white/10 text-gray-400'
                  }`}
                >
                  DJs
                </button>
                <button
                  onClick={() => setViewMode('venues')}
                  className={`px-3 py-2 font-mono text-xs transition-all ${
                    viewMode === 'venues' 
                      ? 'bg-gradient-to-r from-green-500/20 to-cyan-500/20 text-white' 
                      : 'hover:bg-white/10 text-gray-400'
                  }`}
                >
                  VENUES
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      {pastEvents.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="cyber-card p-4 text-center">
              <div className="text-2xl font-bold cyber-neon font-mono" style={{color: 'var(--cyber-cyan)'}}>
                {stats.totalEvents}
              </div>
              <div className="text-xs text-gray-400 font-mono">TOTAL EVENTS</div>
            </div>
            <div className="cyber-card p-4 text-center">
              <div className="text-2xl font-bold cyber-neon font-mono" style={{color: 'var(--cyber-hot-pink)'}}>
                {stats.uniqueVenues}
              </div>
              <div className="text-xs text-gray-400 font-mono">VENUES</div>
            </div>
            <div className="cyber-card p-4 text-center">
              <div className="text-2xl font-bold cyber-neon font-mono" style={{color: 'var(--cyber-yellow)'}}>
                {stats.uniqueArtists}
              </div>
              <div className="text-xs text-gray-400 font-mono">ARTISTS SEEN</div>
            </div>
            <div className="cyber-card p-4 text-center">
              <div className="text-2xl font-bold cyber-neon font-mono" style={{color: 'var(--cyber-neon-green)'}}>
                {stats.topGenre}
              </div>
              <div className="text-xs text-gray-400 font-mono">TOP GENRE</div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {pastEvents.length === 0 ? (
          <div className="text-center py-20">
            <Archive className="w-20 h-20 mx-auto mb-4 opacity-20" style={{color: 'var(--cyber-neon-green)'}} />
            <h2 className="text-2xl font-bold mb-2 font-mono" style={{color: 'var(--cyber-cyan)'}}>
              NO ARCHIVED EVENTS
            </h2>
            <p className="text-gray-400 font-mono mb-8">
              Mark events as attended from the dashboard to build your archive
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 cyber-border font-mono transition-all hover:scale-105 cyber-hologram"
              style={{
                background: 'var(--cyber-gradient-1)',
                color: 'black',
                clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)'
              }}
            >
              BROWSE EVENTS
            </Link>
          </div>
        ) : viewMode === 'djs' ? (
          <div className="cyber-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6" style={{color: 'var(--cyber-yellow)'}} />
              <h2 className="text-xl font-bold font-mono" style={{color: 'var(--cyber-yellow)'}}>
                DJ RANKINGS - TOP ARTISTS SEEN
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b" style={{borderColor: 'var(--cyber-cyan)'}}>
                    <th className="text-left py-3 px-2" style={{color: 'var(--cyber-cyan)'}}>RANK</th>
                    <th className="text-left py-3 px-4" style={{color: 'var(--cyber-cyan)'}}>ARTIST</th>
                    <th className="text-center py-3 px-4" style={{color: 'var(--cyber-cyan)'}}>TIMES SEEN</th>
                    <th className="text-center py-3 px-4" style={{color: 'var(--cyber-cyan)'}}>AVG RATING</th>
                    <th className="text-right py-3 px-2" style={{color: 'var(--cyber-cyan)'}}>LAST SEEN</th>
                  </tr>
                </thead>
                <tbody>
                  {djRankings.slice(0, 20).map((dj, idx) => (
                    <tr 
                      key={dj.name} 
                      className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-2">
                        {idx === 0 && <span style={{color: 'var(--cyber-yellow)'}}>🥇</span>}
                        {idx === 1 && <span style={{color: 'var(--cyber-gray)'}}>🥈</span>}
                        {idx === 2 && <span style={{color: 'var(--cyber-orange)'}}>🥉</span>}
                        {idx > 2 && <span className="text-gray-500">#{idx + 1}</span>}
                      </td>
                      <td className="py-3 px-4 font-bold" style={{color: idx < 3 ? 'var(--cyber-hot-pink)' : 'white'}}>
                        {dj.name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-2">
                          <span>{dj.count}</span>
                          <BarChart3 className="w-4 h-4 opacity-50" />
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {dj.avgRating > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3 h-3" style={{color: 'var(--cyber-yellow)', fill: 'var(--cyber-yellow)'}} />
                            <span style={{color: 'var(--cyber-yellow)'}}>{dj.avgRating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-400">
                        {formatDate(dj.lastSeen)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {djRankings.length > 20 && (
                <div className="text-center py-4 text-gray-500 font-mono text-sm">
                  And {djRankings.length - 20} more artists...
                </div>
              )}
            </div>
          </div>
        ) : viewMode === 'venues' ? (
          <div className="cyber-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6" style={{color: 'var(--cyber-hot-pink)'}} />
              <h2 className="text-xl font-bold font-mono" style={{color: 'var(--cyber-hot-pink)'}}>
                VENUE RANKINGS - TOP VENUES VISITED
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b" style={{borderColor: 'var(--cyber-cyan)'}}>
                    <th className="text-left py-3 px-2" style={{color: 'var(--cyber-cyan)'}}>RANK</th>
                    <th className="text-left py-3 px-4" style={{color: 'var(--cyber-cyan)'}}>VENUE</th>
                    <th className="text-center py-3 px-4" style={{color: 'var(--cyber-cyan)'}}>EVENTS</th>
                    <th className="text-center py-3 px-4" style={{color: 'var(--cyber-cyan)'}}>AVG RATING</th>
                    <th className="text-right py-3 px-2" style={{color: 'var(--cyber-cyan)'}}>LAST VISIT</th>
                  </tr>
                </thead>
                <tbody>
                  {venueRankings.slice(0, 20).map((venue, idx) => (
                    <tr 
                      key={venue.name} 
                      className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-2">
                        {idx === 0 && <span style={{color: 'var(--cyber-yellow)'}}>🥇</span>}
                        {idx === 1 && <span style={{color: 'var(--cyber-gray)'}}>🥈</span>}
                        {idx === 2 && <span style={{color: 'var(--cyber-orange)'}}>🥉</span>}
                        {idx > 2 && <span className="text-gray-500">#{idx + 1}</span>}
                      </td>
                      <td className="py-3 px-4 font-bold" style={{color: idx < 3 ? 'var(--cyber-hot-pink)' : 'white'}}>
                        {venue.name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-2">
                          <span>{venue.count}</span>
                          <BarChart3 className="w-4 h-4 opacity-50" />
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {venue.avgRating > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3 h-3" style={{color: 'var(--cyber-yellow)', fill: 'var(--cyber-yellow)'}} />
                            <span style={{color: 'var(--cyber-yellow)'}}>{venue.avgRating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-400">
                        {formatDate(venue.lastSeen)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {venueRankings.length > 20 && (
                <div className="text-center py-4 text-gray-500 font-mono text-sm">
                  And {venueRankings.length - 20} more venues...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Group events by month */}
            {Object.entries(
              pastEvents.reduce((acc, event) => {
                // Parse date properly
                const [year, monthNum, day] = event.date.split('-').map(num => parseInt(num));
                const eventDate = new Date(year, monthNum - 1, day);
                const month = eventDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                });
                if (!acc[month]) acc[month] = [];
                acc[month].push(event);
                return acc;
              }, {} as Record<string, EventWithRating[]>)
            )
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([month, events]) => (
              <div key={month}>
                <h2 className="text-xl font-bold mb-4 font-mono cyber-neon" style={{color: 'var(--cyber-neon-green)'}}>
                  {month}
                </h2>
                <div className="grid gap-4">
                  {events.map((event) => (
                    <div 
                      key={event.id} 
                      className="cyber-card p-6 group hover:scale-[1.01] transition-transform cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start gap-4">
                        <img 
                          src={event.image || GENERIC_EDM_IMAGE} 
                          alt={event.name}
                          className="w-20 h-20 object-cover rounded cyber-border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = GENERIC_EDM_IMAGE;
                          }}
                        />
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2 cyber-neon group-hover:text-white transition-colors font-mono" 
                              style={{color: 'var(--cyber-cyan)'}}>
                            {event.name}
                          </h3>
                          
                          <div className="space-y-1 text-sm font-mono">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Calendar className="w-4 h-4" style={{color: 'var(--cyber-hot-pink)'}} />
                              <span>{formatDate(event.date)}</span>
                              <span className="text-gray-500">•</span>
                              <Clock className="w-4 h-4" style={{color: 'var(--cyber-hot-pink)'}} />
                              <span>{formatTime(event.startTime)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-300">
                              <MapPin className="w-4 h-4" style={{color: 'var(--cyber-hot-pink)'}} />
                              <span>{event.venue.name}, {event.venue.city}</span>
                            </div>
                            
                            {event.artists && event.artists.length > 0 && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <Users className="w-4 h-4" style={{color: 'var(--cyber-hot-pink)'}} />
                                <span className="text-xs">{event.artists.slice(0, 3).map(a => a.name).join(' • ')}</span>
                              </div>
                            )}
                            
                            {event.genres && event.genres.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {event.genres.slice(0, 3).map((genre, idx) => (
                                  <span 
                                    key={idx} 
                                    className="px-2 py-1 text-xs font-mono cyber-border"
                                    style={{
                                      background: 'rgba(0, 255, 255, 0.1)',
                                      color: 'var(--cyber-cyan)'
                                    }}
                                  >
                                    {genre}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* DJ Ratings */}
                          {event.artists && event.artists.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <div className="text-xs font-mono text-gray-400">DJ RATINGS:</div>
                              {event.artists.slice(0, 3).map((artist) => (
                                <div key={artist.name} className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-mono text-gray-300 truncate">{artist.name}</span>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <button
                                        key={i} 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDJRatingChange(event.id, artist.name, i + 1);
                                        }}
                                        className="hover:scale-110 transition-transform"
                                      >
                                        <Star 
                                          className="w-3 h-3" 
                                          style={{
                                            color: i < (event.djRatings?.[artist.name] || 0) ? 'var(--cyber-yellow)' : 'var(--cyber-gray)',
                                            fill: i < (event.djRatings?.[artist.name] || 0) ? 'var(--cyber-yellow)' : 'none'
                                          }}
                                        />
                                      </button>
                                    ))}
                                    <span className="text-xs text-gray-500 ml-1">
                                      {event.djRatings?.[artist.name] || '—'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Venue Rating */}
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span className="text-xs font-mono text-gray-400">VENUE RATING:</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <button
                                  key={i} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVenueRatingChange(event.id, i + 1);
                                  }}
                                  className="hover:scale-110 transition-transform"
                                >
                                  <Star 
                                    className="w-3 h-3" 
                                    style={{
                                      color: i < (event.venueRating || 0) ? 'var(--cyber-yellow)' : 'var(--cyber-gray)',
                                      fill: i < (event.venueRating || 0) ? 'var(--cyber-yellow)' : 'none'
                                    }}
                                  />
                                </button>
                              ))}
                              <span className="text-xs text-gray-500 ml-1">
                                {event.venueRating || '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {event.link && event.link !== '#' && (
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 cyber-border hover:scale-110 transition-transform"
                            style={{background: 'var(--cyber-gradient-2)'}}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-5 h-5 text-black" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent ? {
          ...selectedEvent,
          ages: '18+', // Default ages
          festivalInd: false,
          electronicGenreInd: true,
          otherGenreInd: false,
          link: selectedEvent.ticketLink || '#',
          ticketLink: selectedEvent.ticketLink || '#',
          image: selectedEvent.imageUrl,
          endTime: selectedEvent.endTime || null,
          venue: {
            ...selectedEvent.venue,
            address: selectedEvent.venue.location || ''
          }
        } : null}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onAttendanceChange={loadPastEvents}
      />
    </div>
  );
}