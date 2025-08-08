import axios from 'axios';
import { EDMEvent } from './types';

const EDMTRAIN_API_URL = 'https://edmtrain.com/api/events';
const API_KEY = process.env.EDMTRAIN_API_KEY;

interface EDMTrainEvent {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime?: string;
  venue: {
    id: number;
    name: string;
    location: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  artistList: {
    id: number;
    name: string;
  }[];
  link?: string;
  description?: string;
  imageUrl?: string;
  genres?: string[];
}

export const getEventsByLocation = async (
  city: string,
  state?: string,
  startDate?: Date,
  endDate?: Date
): Promise<EDMEvent[]> => {
  try {
    const params: any = {
      client: API_KEY,
      city,
    };

    if (state) params.state = state;
    if (startDate) params.startDate = startDate.toISOString().split('T')[0];
    if (endDate) params.endDate = endDate.toISOString().split('T')[0];

    const response = await axios.get(EDMTRAIN_API_URL, { params });
    
    return response.data.data.map((event: EDMTrainEvent) => ({
      id: event.id.toString(),
      name: event.name,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: {
        id: event.venue.id.toString(),
        name: event.venue.name,
        location: event.venue.location,
        city: event.venue.city,
        state: event.venue.state,
        latitude: event.venue.latitude,
        longitude: event.venue.longitude,
      },
      artists: event.artistList.map(artist => ({
        id: artist.id.toString(),
        name: artist.name,
      })),
      ticketLink: event.link,
      description: event.description,
      imageUrl: event.imageUrl,
      genres: event.genres || [],
    }));
  } catch (error) {
    console.error('EDMTrain API error:', error);
    throw new Error('Failed to fetch events from EDMTrain');
  }
};

export const getEventsByArtists = async (
  artistNames: string[],
  city?: string,
  state?: string
): Promise<EDMEvent[]> => {
  try {
    const allEvents: EDMEvent[] = [];
    
    // EDMTrain API might not support bulk artist search, so we'll search individually
    for (const artistName of artistNames) {
      const params: any = {
        client: API_KEY,
        artistName,
      };

      if (city) params.city = city;
      if (state) params.state = state;

      try {
        const response = await axios.get(EDMTRAIN_API_URL, { params });
        const events = response.data.data.map((event: EDMTrainEvent) => ({
          id: event.id.toString(),
          name: event.name,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          venue: {
            id: event.venue.id.toString(),
            name: event.venue.name,
            location: event.venue.location,
            city: event.venue.city,
            state: event.venue.state,
            latitude: event.venue.latitude,
            longitude: event.venue.longitude,
          },
          artists: event.artistList.map(artist => ({
            id: artist.id.toString(),
            name: artist.name,
          })),
          ticketLink: event.link,
          description: event.description,
          imageUrl: event.imageUrl,
          genres: event.genres || [],
        }));
        
        allEvents.push(...events);
      } catch (error) {
        console.error(`Failed to fetch events for artist ${artistName}:`, error);
      }
    }

    // Remove duplicates
    const uniqueEvents = Array.from(
      new Map(allEvents.map(event => [event.id, event])).values()
    );

    return uniqueEvents;
  } catch (error) {
    console.error('EDMTrain API error:', error);
    throw new Error('Failed to fetch events by artists');
  }
};