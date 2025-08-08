export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: { url: string }[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: {
    name: string;
    images: { url: string }[];
  };
  popularity: number;
}

export interface EDMEvent {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime?: string;
  venue: {
    id: string;
    name: string;
    location: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  artists: {
    id: string;
    name: string;
  }[];
  ticketLink?: string;
  description?: string;
  imageUrl?: string;
  genres: string[];
  recommendationScore?: number;
}

export interface UserPreferences {
  userId: string;
  city?: string;
  autoDetectLocation: boolean;
  favoriteGenres: string[];
  favoriteArtists: string[];
  attendedEvents: string[];
  wishlistEvents: string[];
}