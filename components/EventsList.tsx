'use client';

import { useState } from 'react';
import { Calendar, MapPin, Users, ExternalLink, Zap, Shield } from 'lucide-react';
import EventModal from './EventModal';

// Generic EDM event image fallback
const GENERIC_EDM_IMAGE = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop&q=80';

interface Event {
  id: string;
  name: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  isTimeEstimated?: boolean;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  artists: Array<{
    id: string;
    name: string;
    b2bArtist?: string;
  }>;
  genres?: string[];
  ages: string;
  festivalInd: boolean;
  electronicGenreInd: boolean;
  otherGenreInd: boolean;
  link: string;
  ticketLink: string;
  image?: string;
}

interface EventsListProps {
  events: Event[];
  edmGenres?: { genre: string; count: number }[];
  recommendedEventIds?: string[];
  onAttendanceChange?: () => void;
}

export default function EventsList({ events, edmGenres = [], recommendedEventIds = [], onAttendanceChange }: EventsListProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const formatDate = (dateString: string) => {
    // Parse the date string as local date, not UTC
    // Split the date string to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(num => parseInt(num));
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    // Otherwise show day and date
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string | null) => {
    if (!time || time === 'TBA') return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Simplified genre matching for recommendations
  const getMatchScore = (event: Event) => {
    if (edmGenres.length === 0) return 0;
    
    let score = 0;
    const eventName = event.name.toLowerCase();
    const eventGenres = (event.genres || []).map(g => g.toLowerCase()).join(' ');
    const eventArtists = event.artists.map(a => a.name.toLowerCase());
    const artistNames = eventArtists.join(' ');
    
    edmGenres.forEach(({ genre, count }) => {
      const userGenre = genre.toLowerCase();
      
      // Exact genre match
      if (eventGenres.includes(userGenre)) {
        score += count * 2;
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
      
      // Check for partial artist name match
      if (eventName.includes(userGenre) || artistNames.includes(userGenre)) {
        score += count * 1.5;
        return;
      }
      
      // Genre keyword matching
      const significantKeywords = [
        'house', 'techno', 'trance', 'dubstep', 'bass', 'drum', 'trap', 
        'hardstyle', 'progressive', 'deep', 'future', 'tech', 'melodic',
        'minimal', 'acid', 'breaks', 'garage', 'jungle', 'hardcore'
      ];
      
      // Check if user genre contains any keywords
      significantKeywords.forEach(keyword => {
        if (userGenre.includes(keyword) && (eventGenres.includes(keyword) || eventName.includes(keyword))) {
          score += count * 0.8;
        }
      });
      
      // Generic EDM match
      if (userGenre.includes('edm') || userGenre.includes('electronic') || userGenre.includes('dance')) {
        if (event.electronicGenreInd) {
          score += count * 0.3;
        }
      }
    });
    
    return score >= 3 ? score : 0;
  };

  const sortedEvents = events;

  if (events.length === 0) {
    return (
      <div className="cyber-frame-corners text-center py-16">
        <div className="text-xl font-semibold cyber-text-primary mb-2">
          No events found
        </div>
        <p className="cyber-text-muted">
          Try adjusting your location or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedEvents.map((event) => {
        const isRecommended = recommendedEventIds.length > 0 
          ? recommendedEventIds.includes(event.id)
          : getMatchScore(event) > 0;
        
        return (
          <div
            key={event.id}
            onClick={() => {
              setSelectedEvent(event);
              setIsModalOpen(true);
            }}
            className={`cyber-card p-6 cursor-pointer animate-fade-in ${
              isRecommended ? 'featured cyber-border-glow' : ''
            }`}
          >
            <div className="flex gap-6">
              {/* Event Image */}
              <div className="flex-shrink-0">
                <img
                  src={event.image || GENERIC_EDM_IMAGE}
                  alt={event.name}
                  className="w-24 h-24 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = GENERIC_EDM_IMAGE;
                  }}
                />
              </div>
              
              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Event Title */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold cyber-heading text-white">
                        {(() => {
                          if (event.name === 'EDM Event' || event.name === 'TBA' || !event.name) {
                            const validArtists = event.artists?.filter(a => a.name && a.name !== 'TBA') || [];
                            if (validArtists.length > 0) {
                              return validArtists.slice(0, 3).map(a => a.name).join(' • ');
                            }
                            const [year, month, day] = event.date.split('-').map(num => parseInt(num));
                            const localDate = new Date(year, month - 1, day);
                            return `${event.venue?.name || 'Event'} - ${localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                          }
                          return event.name;
                        })()}
                      </h3>
                      {isRecommended && (
                        <span className="cyber-badge active text-xs">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    
                    {/* Artists */}
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 cyber-text-muted" />
                      <span className="text-sm cyber-text-muted">
                        {event.artists.map(artist => 
                          artist.b2bArtist ? `${artist.name} b2b ${artist.b2bArtist}` : artist.name
                        ).join(' • ')}
                      </span>
                    </div>
                    
                    {/* Genres */}
                    {event.genres && event.genres.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {event.genres.slice(0, 4).map((genre, idx) => (
                          <span 
                            key={idx} 
                            className={`cyber-badge text-xs ${
                              genre.toLowerCase().includes('house') ? 'bg-purple-900/30 border-purple-500/50' :
                              genre.toLowerCase().includes('techno') ? 'bg-blue-900/30 border-blue-500/50' :
                              genre.toLowerCase().includes('bass') || genre.toLowerCase().includes('dubstep') ? 'bg-green-900/30 border-green-500/50' :
                              genre.toLowerCase().includes('trance') ? 'bg-pink-900/30 border-pink-500/50' :
                              genre.toLowerCase().includes('drum') ? 'bg-orange-900/30 border-orange-500/50' :
                              ''
                            }`}
                          >
                            {genre}
                          </span>
                        ))}
                        {event.genres.length > 4 && (
                          <span className="cyber-badge text-xs opacity-60">
                            +{event.genres.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Date, Time & Location */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 cyber-text-primary">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        {formatTime(event.startTime) && (
                          <span className="cyber-text-muted">
                            {formatTime(event.startTime)}
                            {event.endTime && event.startTime && ` - ${formatTime(event.endTime)}`}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 cyber-text-muted">
                        <MapPin className="w-4 h-4" />
                        <span>{event.venue.name}, {event.venue.city}</span>
                      </div>
                      
                      {event.ages && (
                        <div className="flex items-center gap-2 cyber-text-muted">
                          <Shield className="w-4 h-4" />
                          <span>{event.ages}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {event.ticketLink && (
                      <a
                        href={event.ticketLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="cyber-button primary flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Tickets
                      </a>
                    )}
                    {event.link && !event.ticketLink && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="cyber-button flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Details
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onAttendanceChange={onAttendanceChange}
      />
    </div>
  );
}