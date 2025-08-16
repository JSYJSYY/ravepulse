'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, MapPin, Music, ExternalLink, Info } from 'lucide-react';
import EventModal from './EventModal';

// Generic EDM event image fallback
const GENERIC_EDM_IMAGE = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=200&fit=crop&q=80';

interface Event {
  id: string;
  name: string;
  date: string;
  startTime: string;
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
  }>;
  ages: string;
  ticketLink: string;
  image?: string;
}

interface EventsMapProps {
  events: Event[];
  center?: { lat: number; lng: number };
  recommendedEventIds?: string[];
  onAttendanceChange?: () => void;
}

// Create custom icons with labels (only for recommended events)
const createCustomIcon = (event: Event, isRecommended: boolean, showLabels: boolean) => {
  const color = isRecommended ? '#9333EA' : '#10B981'; // Purple for recommended, green for non-recommended
  const size = isRecommended ? 40 : 30;
  
  // Only show labels for recommended events
  const iconHtml = (showLabels && isRecommended) ? `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 200px;
    ">
      <!-- Event Label -->
      <div style="
        background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.85));
        border: 1px solid ${color};
        border-radius: 8px;
        padding: 8px 10px;
        margin-bottom: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        min-width: 180px;
        position: relative;
        z-index: 1000;
      ">
        ${isRecommended ? `
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            background: #9333EA;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
          ">⭐</div>
        ` : ''}
        <div style="
          color: ${isRecommended ? '#9333EA' : '#10B981'};
          font-weight: bold;
          font-size: 11px;
          font-family: monospace;
          margin-bottom: 4px;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        ">${(() => {
            if (event.name === 'EDM Event' || event.name === 'TBA' || !event.name) {
              const validArtists = event.artists?.filter(a => a.name && a.name !== 'TBA') || [];
              if (validArtists.length > 0) {
                return validArtists.slice(0, 3).map(a => a.name).join(' • ');
              }
              return `${event.venue?.name || 'Event'}`;
            }
            return event.name;
          })()}</div>
        <div style="
          color: #00FFFF;
          font-size: 10px;
          font-family: monospace;
          margin-bottom: 3px;
          opacity: 0.9;
        ">${event.venue.name}</div>
        <div style="
          color: #888;
          font-size: 9px;
          font-family: monospace;
        ">
          📅 ${(() => {
            const [year, month, day] = event.date.split('-').map(num => parseInt(num));
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          })()}
        </div>
      </div>
      <!-- Arrow pointing to location -->
      <div style="
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid ${color};
        margin-bottom: -4px;
      "></div>
      <!-- Marker Pin -->
      <div style="
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, ${isRecommended ? '#9333EA, #7C3AED' : '#10B981, #059669'});
        border: 2px solid ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      ">
        <div style="transform: rotate(45deg); color: black; font-weight: bold; font-size: 14px;">
          🎵
        </div>
      </div>
    </div>
  ` : `
    <div style="
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, ${isRecommended ? '#9333EA, #7C3AED' : '#10B981, #059669'});
      border: 2px solid ${color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    ">
      <div style="transform: rotate(45deg); color: black; font-weight: bold; font-size: 14px;">
        🎵
      </div>
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: '',
    iconSize: (showLabels && isRecommended) ? [200, 120] : [size, size],
    iconAnchor: (showLabels && isRecommended) ? [100, 80] : [size / 2, size],
    popupAnchor: [0, (showLabels && isRecommended) ? -80 : -size],
  });
};

// Component to handle map center changes
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 12, { animate: true });
  }, [center, map]);
  
  return null;
}

export default function EventsMap({ events, center, recommendedEventIds = [], onAttendanceChange }: EventsMapProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(true); // Default to showing recommended only
  const [showLabels, setShowLabels] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'nextWeek' | 'month'>('all');
  const mapCenter: [number, number] = [center?.lat || 37.7749, center?.lng || -122.4194];
  
  // Apply time filter
  const getTimeFilteredEvents = (eventsToFilter: Event[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    switch (timeFilter) {
      case 'today':
        return eventsToFilter.filter(event => {
          // Parse date as local date
          const [year, month, day] = event.date.split('-').map(num => parseInt(num));
          const eventDate = new Date(year, month - 1, day);
          
          // Get today's date
          const today = new Date();
          
          // Check if event date matches today exactly
          return eventDate.getFullYear() === today.getFullYear() &&
                 eventDate.getMonth() === today.getMonth() &&
                 eventDate.getDate() === today.getDate();
        });
      
      case 'week':
        const endOfWeek = new Date(now);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        return eventsToFilter.filter(event => {
          // Parse date as local date
          const [year, month, day] = event.date.split('-').map(num => parseInt(num));
          const eventDate = new Date(year, month - 1, day);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= now && eventDate < endOfWeek;
        });
      
      case 'nextWeek':
        const startOfNextWeek = new Date(now);
        startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
        const endOfNextWeek = new Date(startOfNextWeek);
        endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);
        return eventsToFilter.filter(event => {
          // Parse date as local date
          const [year, month, day] = event.date.split('-').map(num => parseInt(num));
          const eventDate = new Date(year, month - 1, day);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= startOfNextWeek && eventDate < endOfNextWeek;
        });
      
      case 'month':
        const endOfMonth = new Date(now);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        return eventsToFilter.filter(event => {
          // Parse date as local date
          const [year, month, day] = event.date.split('-').map(num => parseInt(num));
          const eventDate = new Date(year, month - 1, day);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= now && eventDate < endOfMonth;
        });
      
      case 'all':
      default:
        return eventsToFilter;
    }
  };
  
  // Filter events based on recommendation status and time
  const filteredByRecommendation = showRecommendedOnly 
    ? events.filter(event => recommendedEventIds.includes(event.id))
    : events;
  const displayedEvents = getTimeFilteredEvents(filteredByRecommendation);

  const formatDate = (dateString: string) => {
    // Parse the date string as local date, not UTC
    // Split the date string to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(num => parseInt(num));
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    if (!time || time === 'TBA') return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <MapCenterUpdater center={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {displayedEvents.map((event) => {
          const isRecommended = recommendedEventIds.includes(event.id);
          
          return (
            <Marker
              key={event.id}
              position={[event.venue.latitude, event.venue.longitude]}
              icon={createCustomIcon(event, isRecommended, showLabels)}
              eventHandlers={{
                click: () => setSelectedEvent(event),
              }}
            >
              <Popup>
                <div className="bg-gray-900 rounded-lg p-4 max-w-sm">
                  <img 
                    src={event.image || GENERIC_EDM_IMAGE} 
                    alt={event.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = GENERIC_EDM_IMAGE;
                    }}
                  />
                  
                  <h3 className="font-semibold text-lg mb-2 text-white">
                    {(() => {
                      if (event.name === 'EDM Event' || event.name === 'TBA' || !event.name) {
                        const validArtists = event.artists?.filter(a => a.name && a.name !== 'TBA') || [];
                        if (validArtists.length > 0) {
                          return validArtists.slice(0, 3).map(a => a.name).join(' • ');
                        }
                        const date = new Date(event.date);
                        const [year, month, day] = event.date.split('-').map(num => parseInt(num));
                        const localDate = new Date(year, month - 1, day);
                        return `${event.venue?.name || 'Event'} - ${localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                      }
                      return event.name;
                    })()}
                  </h3>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Music className="w-4 h-4" />
                      <span className="truncate">
                        {event.artists.map(a => a.name).join(', ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(event.date)}{formatTime(event.startTime) && ` at ${formatTime(event.startTime)}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue.name}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors text-white"
                    >
                      <Info className="w-3 h-3" />
                      Details
                    </button>
                    {event.ticketLink && (
                      <a
                        href={event.ticketLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm transition-colors text-white"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Tickets
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Filter Controls */}
      <div className="absolute top-4 left-4 right-4 z-[1000] space-y-3">
        <div className="bg-black/90 backdrop-blur-sm cyber-border p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRecommendedOnly}
                  onChange={(e) => setShowRecommendedOnly(e.target.checked)}
                  className="w-5 h-5"
                  style={{
                    accentColor: showRecommendedOnly ? '#9333EA' : '#10B981'
                  }}
                />
                <span className="font-mono text-base font-bold" style={{color: showRecommendedOnly ? '#9333EA' : '#10B981'}}>
                  SHOW RECOMMENDED EVENTS ONLY
                </span>
              </label>
              {showRecommendedOnly && (
                <span className="px-3 py-1 cyber-border font-mono text-sm" 
                      style={{background: 'linear-gradient(135deg, #9333EA, #7C3AED)', color: 'white'}}>
                  ⭐ {recommendedEventIds.length} RECOMMENDED
                </span>
              )}
            </div>
            
            {/* Time Filter Dropdown */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm" style={{color: '#00FFFF'}}>TIME FILTER:</span>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as any)}
                  className="cyber-border bg-black/80 text-white font-mono px-3 py-1 rounded"
                  style={{
                    borderColor: '#00FFFF',
                    outline: 'none'
                  }}
                >
                  <option value="all">ALL DATES</option>
                  <option value="today">TODAY</option>
                  <option value="week">THIS WEEK</option>
                  <option value="nextWeek">NEXT WEEK</option>
                  <option value="month">THIS MONTH</option>
                </select>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="w-5 h-5"
                  style={{accentColor: '#FF69B4'}}
                />
                <span className="font-mono text-sm" style={{color: '#FF69B4'}}>
                  SHOW LABELS
                </span>
              </label>
              
              <div className="text-sm font-mono" style={{color: '#888'}}>
                Showing: {displayedEvents.length} events
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur rounded-lg p-3 z-[1000]">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full" style={{background: 'linear-gradient(135deg, #9333EA, #7C3AED)'}}></div>
            <span className="text-gray-300">Recommended Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{background: 'linear-gradient(135deg, #10B981, #059669)'}}></div>
            <span className="text-gray-300">Other Events</span>
          </div>
          {showLabels && (
            <div className="text-xs text-gray-400 font-mono mt-2 pt-2 border-t border-gray-700">
              📍 Labels shown for recommended events
            </div>
          )}
        </div>
      </div>
      
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