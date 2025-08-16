'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Calendar, MapPin, Music, Trash2, ExternalLink, List, Map as MapIcon, Clock, Users } from 'lucide-react';
import { Event } from '@/lib/types';
import EventModal from '@/components/EventModal';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

// Generic EDM event image fallback
const GENERIC_EDM_IMAGE = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop&q=80';

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center">Loading map...</div>
});

export default function WishlistPage() {
  const [wishlistEvents, setWishlistEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);

  useEffect(() => {
    // Load wishlist from localStorage
    const loadWishlist = () => {
      try {
        const saved = localStorage.getItem('ravepulse_wishlist_events');
        if (saved) {
          const wishlistData = JSON.parse(saved);
          // Now we need to fetch the full event data
          // For now, we'll reconstruct minimal event objects
          const events = wishlistData.map((item: any) => ({
            id: item.eventId,
            name: item.eventName,
            date: item.date,
            venue: { name: item.venueName },
            artists: item.artists.map((name: string) => ({ name })),
            // We'll need to get full event data from the API or store it
          }));
          setWishlistEvents(events);
        }
        
        // Also check for any full event data stored separately
        const fullEvents = localStorage.getItem('wishlistEventsFull');
        if (fullEvents) {
          setWishlistEvents(JSON.parse(fullEvents));
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const removeFromWishlist = (eventId: string) => {
    // Update the ravepulse_wishlist_events key
    const wishlistData = localStorage.getItem('ravepulse_wishlist_events');
    if (wishlistData) {
      const parsed = JSON.parse(wishlistData);
      const filtered = parsed.filter((e: any) => e.eventId !== eventId);
      localStorage.setItem('ravepulse_wishlist_events', JSON.stringify(filtered));
    }
    
    // Update local state
    const updated = wishlistEvents.filter(e => e.id !== eventId);
    setWishlistEvents(updated);
    
    // Update the full events storage
    localStorage.setItem('wishlistEventsFull', JSON.stringify(updated));
    
    toast.success('Removed from priority list');
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleAttendanceChange = () => {
    // Reload wishlist in case an event was removed
    const fullEvents = localStorage.getItem('wishlistEventsFull');
    if (fullEvents) {
      setWishlistEvents(JSON.parse(fullEvents));
    }
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

  // Group events by date for better organization
  const eventsByDate = wishlistEvents.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const sortedDates = Object.keys(eventsByDate).sort((a, b) => {
    const [aYear, aMonth, aDay] = a.split('-').map(num => parseInt(num));
    const [bYear, bMonth, bDay] = b.split('-').map(num => parseInt(num));
    const aDate = new Date(aYear, aMonth - 1, aDay);
    const bDate = new Date(bYear, bMonth - 1, bDay);
    return aDate.getTime() - bDate.getTime();
  });

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
              <span style={{color: 'var(--cyber-hot-pink)'}}>PRIORITY</span>
              <span style={{color: 'var(--cyber-cyan)'}}> LIST</span>
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" style={{color: 'var(--cyber-yellow)'}} />
                <span className="font-mono text-gray-300">{wishlistEvents.length}</span>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex gap-1 cyber-border p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-pink-500/20' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <List className="w-4 h-4" style={{color: viewMode === 'list' ? 'var(--cyber-cyan)' : 'white'}} />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 transition-all ${
                    viewMode === 'map' 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-pink-500/20' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <MapIcon className="w-4 h-4" style={{color: viewMode === 'map' ? 'var(--cyber-cyan)' : 'white'}} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {wishlistEvents.length === 0 ? (
          <div className="text-center py-20">
            <Star className="w-20 h-20 mx-auto mb-4 opacity-20" style={{color: 'var(--cyber-yellow)'}} />
            <h2 className="text-2xl font-bold mb-2 font-mono" style={{color: 'var(--cyber-cyan)'}}>
              NO EVENTS IN PRIORITY LIST
            </h2>
            <p className="text-gray-400 font-mono mb-8">
              Start adding events from the dashboard to build your priority list
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
        ) : viewMode === 'map' ? (
          <div className="space-y-4">
            {/* Map Controls */}
            <div className="cyber-card p-4 bg-black/90 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRecommendedOnly}
                      onChange={(e) => setShowRecommendedOnly(e.target.checked)}
                      className="w-5 h-5 accent-yellow-500"
                      style={{
                        accentColor: showRecommendedOnly ? 'var(--cyber-yellow)' : 'var(--cyber-cyan)'
                      }}
                    />
                    <span className="font-mono text-base font-bold" style={{color: showRecommendedOnly ? 'var(--cyber-yellow)' : 'var(--cyber-cyan)'}}>
                      SHOW RECOMMENDED EVENTS ONLY
                    </span>
                  </label>
                  {showRecommendedOnly && (
                    <span className="px-3 py-1 cyber-border font-mono text-sm" 
                          style={{background: 'linear-gradient(135deg, var(--cyber-yellow), var(--cyber-orange))', color: 'black'}}>
                      ⭐ {wishlistEvents.filter(e => e.genres && e.genres.length > 2).length} RECOMMENDED
                    </span>
                  )}
                </div>
                <div className="text-sm font-mono" style={{color: 'var(--cyber-gray)'}}>
                  Total: {wishlistEvents.length} events
                </div>
              </div>
              <div className="mt-2 text-xs font-mono" style={{color: 'var(--cyber-gray)'}}>
                📍 Events are labeled with title and venue directly on the map
              </div>
            </div>
            
            <div className="h-[calc(100vh-280px)] cyber-border relative">
              <MapView 
                events={showRecommendedOnly ? wishlistEvents.filter(e => e.genres && e.genres.length > 2) : wishlistEvents}
                onEventClick={handleEventClick}
                showLabels={true}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map(date => (
              <div key={date}>
                <h2 className="text-xl font-bold mb-4 font-mono cyber-neon" style={{color: 'var(--cyber-yellow)'}}>
                  {formatDate(date)}
                </h2>
                <div className="grid gap-4">
                  {eventsByDate[date].map((event) => (
                    <div 
                      key={event.id} 
                      className="cyber-card p-6 group hover:scale-[1.01] transition-transform cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <img 
                              src={event.image || GENERIC_EDM_IMAGE} 
                              alt={event.name}
                              className="w-24 h-24 object-cover rounded cyber-border"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = GENERIC_EDM_IMAGE;
                              }}
                            />
                            
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-2 cyber-neon group-hover:text-white transition-colors font-mono" 
                                  style={{color: 'var(--cyber-cyan)'}}>
                                {event.name}
                              </h3>
                              
                              <div className="space-y-2 text-sm font-mono">
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Clock className="w-4 h-4" style={{color: 'var(--cyber-hot-pink)'}} />
                                  <span>{formatTime(event.startTime)}</span>
                                  {event.endTime && (
                                    <>
                                      <span className="text-gray-500">-</span>
                                      <span>{formatTime(event.endTime)}</span>
                                    </>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 text-gray-300">
                                  <MapPin className="w-4 h-4" style={{color: 'var(--cyber-hot-pink)'}} />
                                  <span>{event.venue.name}</span>
                                  <span className="text-gray-500">•</span>
                                  <span>{event.venue.city}, {event.venue.state}</span>
                                </div>
                                
                                {event.artists && event.artists.length > 0 && (
                                  <div className="flex items-center gap-2 text-gray-300">
                                    <Users className="w-4 h-4" style={{color: 'var(--cyber-hot-pink)'}} />
                                    <span>{event.artists.slice(0, 3).map(a => a.name).join(' • ')}</span>
                                    {event.artists.length > 3 && (
                                      <span className="text-gray-500">+{event.artists.length - 3} more</span>
                                    )}
                                  </div>
                                )}
                                
                                {event.genres && event.genres.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {event.genres.map((genre, idx) => (
                                      <span 
                                        key={idx} 
                                        className="px-2 py-1 text-xs font-mono cyber-border"
                                        style={{
                                          background: 'linear-gradient(135deg, var(--cyber-cyan) 0%, var(--cyber-hot-pink) 100%)',
                                          color: 'black'
                                        }}
                                      >
                                        {genre}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromWishlist(event.id);
                            }}
                            className="p-2 cyber-border hover:scale-110 transition-transform"
                            style={{background: 'rgba(255, 0, 0, 0.2)'}}
                          >
                            <Trash2 className="w-5 h-5" style={{color: 'var(--cyber-hot-pink)'}} />
                          </button>
                        </div>
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
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onAttendanceChange={handleAttendanceChange}
      />
    </div>
  );
}