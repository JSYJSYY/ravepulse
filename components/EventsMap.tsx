'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, MapPin, Music, ExternalLink, Info } from 'lucide-react';
import EventModal from './EventModal';

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

// Create custom icons
const createCustomIcon = (isRecommended: boolean) => {
  const color = isRecommended ? '#a855f7' : '#ec4899';
  const size = isRecommended ? 40 : 30;
  
  return L.divIcon({
    html: `
      <div class="${isRecommended ? 'animate-pulse' : ''}" style="
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      ">
        <div style="transform: rotate(45deg); color: white;">
          <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM21 16c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
          </svg>
        </div>
      </div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
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
  const mapCenter: [number, number] = [center?.lat || 37.7749, center?.lng || -122.4194];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
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
        
        {events.map((event) => {
          const isRecommended = recommendedEventIds.includes(event.id);
          
          return (
            <Marker
              key={event.id}
              position={[event.venue.latitude, event.venue.longitude]}
              icon={createCustomIcon(isRecommended)}
              eventHandlers={{
                click: () => setSelectedEvent(event),
              }}
            >
              <Popup>
                <div className="bg-gray-900 rounded-lg p-4 max-w-sm">
                  {event.image && (
                    <img 
                      src={event.image} 
                      alt={event.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  
                  <h3 className="font-semibold text-lg mb-2 text-white">{event.name}</h3>
                  
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
                        {formatDate(event.date)} at {formatTime(event.startTime)}
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
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur rounded-lg p-3 z-[1000]">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
            <span className="text-gray-300">Recommended Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
            <span className="text-gray-300">Other Events</span>
          </div>
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