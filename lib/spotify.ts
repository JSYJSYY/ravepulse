const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const TOP_TRACKS_ENDPOINT = 'https://api.spotify.com/v1/me/top/tracks';
const TOP_ARTISTS_ENDPOINT = 'https://api.spotify.com/v1/me/top/artists';
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played';

export const getAuthorizationUrl = () => {
  // Check if required environment variables are available
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
    throw new Error('Missing Spotify environment variables. Please ensure NEXT_PUBLIC_SPOTIFY_CLIENT_ID and NEXT_PUBLIC_SPOTIFY_REDIRECT_URI are set in your .env.local file.');
  }

  const scopes = [
    'user-read-recently-played',
    'user-top-read',
    'user-read-private',
    'user-read-email'
  ].join(' ');

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: scopes,
    show_dialog: 'true', // Force showing the authorization dialog every time
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const getAccessToken = async (code: string) => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }),
  });

  return response.json();
};

export const getAccessTokenFromRefreshToken = async (refresh_token: string) => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });

  return response.json();
};

export const getTopTracks = async (access_token: string, time_range: 'short_term' | 'long_term' = 'short_term') => {
  const response = await fetch(`${TOP_TRACKS_ENDPOINT}?time_range=${time_range}&limit=50`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  return response.json();
};

export const getTopArtists = async (access_token: string, time_range: 'short_term' | 'long_term' = 'short_term') => {
  const response = await fetch(`${TOP_ARTISTS_ENDPOINT}?time_range=${time_range}&limit=50`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  return response.json();
};

export const getRecentlyPlayed = async (access_token: string) => {
  const response = await fetch(`${RECENTLY_PLAYED_ENDPOINT}?limit=50`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  return response.json();
};

export const getUserProfile = async (access_token: string) => {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  return response.json();
};