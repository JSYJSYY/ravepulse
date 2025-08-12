'use client';

import { useEffect, useState } from 'react';
import EventsList from './EventsList';

interface EventsListWrapperProps {
  city?: string;
  state?: string;
  edmGenres?: { genre: string; count: number }[];
  onEventsLoad?: (events: any[]) => void;
}

export default function EventsListWrapper({ city, state, edmGenres, onEventsLoad }: EventsListWrapperProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [city, state]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (city && state) {
        params.append('city', city);
        params.append('state', state);
      }

      const response = await fetch(`/api/events?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        onEventsLoad?.(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-400">Loading events...</span>
      </div>
    );
  }

  return <EventsList events={events} edmGenres={edmGenres} />;
}