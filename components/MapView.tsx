'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Music, Calendar, Clock, Users, Star } from 'lucide-react';
import { Event } from '@/lib/types';

// Generic EDM event image fallback
const GENERIC_EDM_IMAGE = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=200&fit=crop&q=80';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface MapViewProps {
  events: Event[];
  center?: { lat: number; lng: number };
  onEventClick?: (event: Event) => void;
  showLabels?: boolean;
}

export default function MapView({ events, center, onEventClick, showLabels = false }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [hoveredVenue, setHoveredVenue] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Initialize map
    const map = L.map(mapContainer.current, {
      attributionControl: false,
      zoomControl: true,
    }).setView([center?.lat || 37.7749, center?.lng || -122.4194], 12);

    // Add dark tile layer for cyberpunk theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors © CARTO',
    }).addTo(map);

    // Add attribution control with custom position
    L.control.attribution({
      position: 'bottomright',
      prefix: false,
    }).addTo(map);

    // Custom zoom control position
    map.zoomControl.setPosition('topright');

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center]);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Group events by venue for clustering
    const venueGroups = events.reduce((acc, event) => {
      const key = `${event.venue.latitude},${event.venue.longitude}`;
      if (!acc[key]) {
        acc[key] = {
          venue: event.venue,
          events: [],
        };
      }
      acc[key].events.push(event);
      return acc;
    }, {} as Record<string, { venue: any; events: Event[] }>);

    // Add markers for each venue
    Object.values(venueGroups).forEach(({ venue, events: venueEvents }) => {
      if (!venue.latitude || !venue.longitude) return;

      const isRecommended = venueEvents.some(e => e.genres && e.genres.length > 2);
      const upcomingEvent = venueEvents[0]; // Get the first/next event

      // Create enhanced marker with event info
      const iconHtml = `
        <div style="
          position: relative;
          width: ${showLabels ? '200px' : '40px'};
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          ${showLabels ? `
            <div style="
              background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.85));
              border: 1px solid ${isRecommended ? '#FFD700' : '#00FFFF'};
              border-radius: 8px;
              padding: 8px 10px;
              margin-bottom: 8px;
              box-shadow: 0 0 20px ${isRecommended ? '#FFD700' : '#00FFFF'};
              min-width: 180px;
              position: relative;
              z-index: 1000;
            ">
              ${isRecommended ? `
                <div style="
                  position: absolute;
                  top: -8px;
                  right: -8px;
                  background: #FFD700;
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
                color: ${isRecommended ? '#FFD700' : '#FF69B4'};
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
              ">${upcomingEvent.name}</div>
              <div style="
                color: #00FFFF;
                font-size: 10px;
                font-family: monospace;
                margin-bottom: 3px;
                opacity: 0.9;
              ">${venue.name}</div>
              <div style="
                color: #888;
                font-size: 9px;
                font-family: monospace;
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                📅 ${new Date(upcomingEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                ${venueEvents.length > 1 ? `<span style="color: #FF69B4">+${venueEvents.length - 1} more</span>` : ''}
              </div>
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 8px solid ${isRecommended ? '#FFD700' : '#00FFFF'};
              margin-bottom: -4px;
            "></div>
          ` : ''}
          
          <div style="
            width: ${showLabels ? '36px' : '32px'};
            height: ${showLabels ? '36px' : '32px'};
            background: ${isRecommended 
              ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
              : 'linear-gradient(135deg, #FF69B4, #00FFFF)'};
            border: 2px solid ${isRecommended ? '#FFD700' : '#00FFFF'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 ${isRecommended ? '30px' : '20px'} ${isRecommended ? '#FFD700' : '#00FFFF'};
            position: relative;
            z-index: 999;
          ">
            <span style="
              transform: rotate(45deg);
              color: black;
              font-weight: bold;
              font-size: 14px;
              font-family: monospace;
            ">${venueEvents.length}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        iconSize: showLabels ? [200, 120] : [40, 40],
        iconAnchor: showLabels ? [100, 80] : [20, 40],
        popupAnchor: [0, -40],
        className: 'custom-marker-container',
      });

      const marker = L.marker([venue.latitude, venue.longitude], { icon: customIcon })
        .addTo(mapInstance.current!);

      // Create enhanced popup content
      const popupContent = `
        <div style="
          background: linear-gradient(135deg, rgba(0,0,0,0.98), rgba(10,10,10,0.95));
          border: 1px solid #00FFFF;
          padding: 16px;
          min-width: 300px;
          max-width: 400px;
          font-family: monospace;
          border-radius: 8px;
          box-shadow: 0 0 30px #00FFFF;
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #00FFFF;
          ">
            <h3 style="
              color: #FF69B4;
              margin: 0;
              font-size: 16px;
              font-weight: bold;
              text-shadow: 0 0 10px #FF69B4;
            ">${venue.name}</h3>
            ${isRecommended ? `
              <span style="
                background: #FFD700;
                color: black;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
              ">RECOMMENDED</span>
            ` : ''}
          </div>
          
          <p style="
            color: #00FFFF;
            margin: 0 0 12px 0;
            font-size: 12px;
            opacity: 0.9;
          ">📍 ${venue.address || ''} ${venue.city}, ${venue.state}</p>
          
          <div style="
            border-top: 1px solid rgba(0,255,255,0.3);
            padding-top: 12px;
            margin-top: 12px;
            max-height: 300px;
            overflow-y: auto;
          ">
            <div style="
              color: var(--cyber-cyan);
              font-size: 11px;
              text-transform: uppercase;
              margin-bottom: 8px;
              opacity: 0.7;
            ">Upcoming Events (${venueEvents.length})</div>
            
            ${venueEvents.map(event => `
              <div style="
                margin-bottom: 12px;
                padding: 10px;
                background: rgba(0,255,255,0.05);
                border: 1px solid rgba(0,255,255,0.2);
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
              " 
              onmouseover="this.style.background='rgba(0,255,255,0.1)'; this.style.borderColor='var(--cyber-cyan)'; this.style.transform='translateX(4px)'" 
              onmouseout="this.style.background='rgba(0,255,255,0.05)'; this.style.borderColor='rgba(0,255,255,0.2)'; this.style.transform='translateX(0)'">
                <div style="
                  color: white;
                  font-size: 13px;
                  font-weight: bold;
                  margin-bottom: 4px;
                ">${event.name}</div>
                
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  color: var(--cyber-gray);
                  font-size: 11px;
                  margin-bottom: 4px;
                ">
                  <span>📅 ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  ${event.startTime ? `<span>🕐 ${event.startTime}</span>` : ''}
                </div>
                
                ${event.artists && event.artists.length > 0 ? `
                  <div style="
                    color: var(--cyber-hot-pink);
                    font-size: 11px;
                    margin-top: 4px;
                  ">🎧 ${event.artists.slice(0, 3).map(a => a.name).join(' • ')}</div>
                ` : ''}
                
                ${event.genres && event.genres.length > 0 ? `
                  <div style="
                    display: flex;
                    gap: 4px;
                    margin-top: 6px;
                    flex-wrap: wrap;
                  ">
                    ${event.genres.slice(0, 3).map(genre => `
                      <span style="
                        background: rgba(255,255,0,0.1);
                        border: 1px solid var(--cyber-yellow);
                        color: var(--cyber-yellow);
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 9px;
                      ">${genre}</span>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'cyber-popup',
        closeButton: true,
        maxWidth: 400,
      });

      // Handle click events
      if (onEventClick) {
        marker.on('popupopen', () => {
          // Add click listeners to each event in the popup
          setTimeout(() => {
            const popup = marker.getPopup();
            if (popup) {
              const popupElement = popup.getElement();
              if (popupElement) {
                const eventDivs = popupElement.querySelectorAll('[onmouseover]');
                eventDivs.forEach((div, index) => {
                  div.addEventListener('click', () => {
                    if (venueEvents[index]) {
                      onEventClick(venueEvents[index]);
                    }
                  });
                });
              }
            }
          }, 100);
        });
      }

      markersRef.current.push(marker);
    });

    // Fit map to show all markers with padding
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstance.current.fitBounds(group.getBounds().pad(0.15));
    }
  }, [events, onEventClick, showLabels]);

  return (
    <>
      <style jsx global>{`
        .custom-marker-container {
          z-index: 1000 !important;
        }
        
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        
        .leaflet-popup-content {
          margin: 0 !important;
        }
        
        .leaflet-popup-tip {
          background: linear-gradient(135deg, rgba(0,0,0,0.98), rgba(10,10,10,0.95)) !important;
          border-bottom: 1px solid var(--cyber-cyan) !important;
          box-shadow: 0 0 20px var(--cyber-cyan) !important;
        }
        
        .leaflet-popup-close-button {
          color: var(--cyber-hot-pink) !important;
          font-size: 20px !important;
          font-weight: bold !important;
          width: 24px !important;
          height: 24px !important;
          padding: 0 !important;
          right: 8px !important;
          top: 8px !important;
        }
        
        .leaflet-popup-close-button:hover {
          color: var(--cyber-cyan) !important;
        }
      `}</style>
      
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{
          background: 'var(--cyber-dark)',
          position: 'relative',
        }}
      />
    </>
  );
}