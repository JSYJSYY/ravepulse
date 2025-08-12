'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Music, ArrowLeft, Trash2, AlertCircle, Heart, Zap } from 'lucide-react';
import { getWishlistStats, removeFromWishlist } from '@/lib/wishlist';
import toast from 'react-hot-toast';
import EventModal from '@/components/EventModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function Wishlist() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    eventId: string;
    eventName: string;
  }>({ isOpen: false, eventId: '', eventName: '' });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        setIsAuthenticated(true);
        loadStats();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const loadStats = () => {
    const wishlistStats = getWishlistStats();
    setStats(wishlistStats);
  };

  const handleRemove = (eventId: string, eventName: string) => {
    setConfirmModal({ isOpen: true, eventId, eventName });
  };

  const confirmRemove = () => {
    removeFromWishlist(confirmModal.eventId);
    loadStats();
    toast.success('Event removed from wishlist');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isPastEvent = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const handleEventClick = (event: any) => {
    // Convert wishlist event format to full event format for modal
    const fullEvent = {
      id: event.eventId,
      name: event.eventName,
      date: event.date,
      venue: { name: event.venueName },
      artists: event.artists.map((name: string) => ({ 
        id: name, 
        name: name.includes(' b2b ') ? name.split(' b2b ')[0] : name,
        b2bArtist: name.includes(' b2b ') ? name.split(' b2b ')[1] : undefined
      })),
      // Add dummy data for required fields
      startTime: '22:00',
      endTime: '',
      ages: '21+',
      festivalInd: false,
      electronicGenreInd: true,
      otherGenreInd: false,
      link: '#',
      ticketLink: '#',
    };
    setSelectedEvent(fullEvent);
    setIsModalOpen(true);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: 'var(--cyber-cyan)'}}></div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 tech-pattern opacity-20"></div>
        <div className="scan-line"></div>
        <div className="cyber-border bg-black/90 backdrop-blur-sm p-8 text-center max-w-md">
          <h2 className="text-2xl font-mono font-bold mb-4" style={{color: 'var(--cyber-hot-pink)'}}>
            {'>> Not authenticated'}
          </h2>
          <p className="font-mono text-sm mb-6" style={{color: 'var(--cyber-magenta)'}}>
            Pulse link disconnected. Re-authentication required.
          </p>
          <button
            onClick={() => router.push('/api/auth/login')}
            className="cyber-border px-6 py-3 font-mono font-bold transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
            style={{
              background: 'var(--cyber-gradient-1)',
              color: 'black',
              clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)'
            }}
          >
            <ArrowLeft className="w-5 h-5 rotate-45" />
            RECONNECT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 tech-pattern opacity-20"></div>
      <div className="scan-line"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-green to-transparent opacity-50"></div>

      {/* Header */}
      <div className="cyber-border bg-black/80 backdrop-blur-sm border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="cyber-border p-2 transition-all transform hover:scale-110"
                style={{background: 'var(--cyber-gradient-2)', color: 'black'}}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-mono font-bold" style={{color: 'var(--cyber-neon-green)'}}>
                  <Heart className="w-8 h-8 inline mr-3" />
                  PRIORITY_QUEUE
                </h1>
                <p className="font-mono text-sm mt-1" style={{color: 'var(--cyber-magenta)'}}>
                  {'>> High-value event targets selected for future engagement'}
                </p>
              </div>
            </div>
            <div className="cyber-border bg-black/50 px-4 py-2">
              <div className="font-mono text-sm" style={{color: 'var(--cyber-neon-green)'}}>
                QUEUED_EVENTS: {stats?.total || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!stats?.events?.length ? (
          <div className="cyber-border bg-black/70 backdrop-blur-sm p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" style={{color: 'var(--cyber-neon-green)'}} />
            <h2 className="text-xl font-mono font-bold mb-2" style={{color: 'var(--cyber-neon-green)'}}>
              PRIORITY_QUEUE_EMPTY
            </h2>
            <p className="font-mono text-sm mb-6" style={{color: 'var(--cyber-magenta)'}}>
              {'>> No high-priority events currently queued for future engagement'}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="cyber-border px-6 py-3 font-mono font-bold transition-all transform hover:scale-105"
              style={{
                background: 'var(--cyber-gradient-1)',
                color: 'black',
                clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)'
              }}
            >
              RETURN_TO_PULSE_INTERFACE
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="cyber-border bg-black/70 backdrop-blur-sm p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/5 to-transparent"></div>
                <h3 className="text-3xl font-mono font-bold relative z-10" style={{color: 'var(--cyber-neon-green)'}}>{stats.total}</h3>
                <p className="font-mono text-sm relative z-10" style={{color: 'var(--cyber-magenta)'}}>TOTAL_TARGETS</p>
              </div>
              
              <div className="cyber-border bg-black/70 backdrop-blur-sm p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent"></div>
                <h3 className="text-3xl font-mono font-bold relative z-10" style={{color: 'var(--cyber-cyan)'}}>{stats.upcoming}</h3>
                <p className="font-mono text-sm relative z-10" style={{color: 'var(--cyber-magenta)'}}>ACTIVE_QUEUE</p>
              </div>
              
              <div className="cyber-border bg-black/70 backdrop-blur-sm p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-500/5 to-transparent"></div>
                <h3 className="text-3xl font-mono font-bold relative z-10" style={{color: 'var(--cyber-orange)'}}>{stats.past}</h3>
                <p className="font-mono text-sm relative z-10" style={{color: 'var(--cyber-magenta)'}}>ARCHIVED</p>
              </div>
            </div>

            {/* Event List */}
            <div>
              <div className="cyber-border bg-black/50 p-4 mb-6">
                <h2 className="font-mono font-bold" style={{color: 'var(--cyber-neon-green)'}}>
                  {'>> PULSE_ANALYSIS: PRIORITY_TARGETS_DETECTED'}
                </h2>
                <p className="font-mono text-sm mt-2" style={{color: 'var(--cyber-magenta)'}}>
                  Events marked for high-priority engagement. Pulse recommendation engine active.
                </p>
              </div>
              <div className="space-y-4">
                {stats.events.map((event: any) => {
                  const isPast = isPastEvent(event.date);
                  
                  return (
                    <div 
                      key={event.eventId}
                      className={`cyber-border bg-black/70 backdrop-blur-sm p-6 transition-all duration-200 hover:bg-black/80 cursor-pointer relative overflow-hidden ${
                        isPast ? 'opacity-60' : ''
                      }`}
                      style={{clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'}}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent"></div>
                      <div className="relative z-10 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div>
                              <h3 className="font-mono font-bold text-lg mb-2" style={{color: 'var(--cyber-neon-green)'}}>
                                {event.eventName}
                                <span className="ml-3 text-xs px-3 py-1 cyber-border font-mono" style={{background: 'var(--cyber-gradient-1)', color: 'black'}}>
                                  PRIORITY_TARGET
                                </span>
                              </h3>
                              
                              {isPast && (
                                <div className="flex items-center gap-2 text-sm mt-2" style={{color: 'var(--cyber-orange)'}}>
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="font-mono">TARGET_EXPIRED</span>
                                </div>
                              )}
                              
                              <div className="mt-2 space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Music className="w-4 h-4" style={{color: 'var(--cyber-cyan)'}} />
                                  <span className="font-mono" style={{color: 'var(--cyber-cyan)'}}>{event.artists.join(', ')}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" style={{color: 'var(--cyber-hot-pink)'}} />
                                  <span className={`font-mono ${isPast ? 'line-through opacity-50' : ''}`} style={{color: 'var(--cyber-hot-pink)'}}>
                                    {formatDate(event.date)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" style={{color: 'var(--cyber-purple)'}} />
                                  <span className="font-mono" style={{color: 'var(--cyber-purple)'}}>{event.venueName}</span>
                                </div>
                              </div>
                              
                              <p className="text-xs font-mono mt-3" style={{color: 'var(--cyber-orange)'}}>
                                QUEUED: {formatDate(event.addedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent({
                                id: event.eventId,
                                name: event.eventName,
                                date: event.date,
                                venue: { name: event.venueName },
                                artists: event.artists.map((name: string) => ({ 
                                  id: name, 
                                  name: name.includes(' b2b ') ? name.split(' b2b ')[0] : name,
                                  b2bArtist: name.includes(' b2b ') ? name.split(' b2b ')[1] : undefined
                                })),
                                startTime: '22:00', endTime: '', ages: '21+',
                                festivalInd: false, electronicGenreInd: true, otherGenreInd: false,
                                link: '#', ticketLink: '#',
                              });
                              setIsModalOpen(true);
                            }}
                            className="cyber-border px-3 py-2 font-mono text-sm transition-all transform hover:scale-105"
                            style={{background: 'var(--cyber-gradient-1)', color: 'black'}}
                          >
                            ANALYZE
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(event.eventId, event.eventName);
                            }}
                            className="cyber-border p-2 transition-all transform hover:scale-110"
                            style={{color: 'var(--cyber-hot-pink)'}}
                            title="Remove from Priority Queue"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onAttendanceChange={loadStats}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, eventId: '', eventName: '' })}
        onConfirm={confirmRemove}
        title="Remove from Wishlist"
        message={`Are you sure you want to remove "${confirmModal.eventName}" from your wishlist?`}
        confirmText="Remove"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}