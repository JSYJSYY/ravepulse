# RavePulse 🎵

Real-time EDM event recommendations powered by your Spotify music taste.

## Features

- 🎵 **Spotify Integration**: Analyzes your recent plays and favorite artists
- 📍 **Location-Based**: Auto-detect or manually select your city
- 🎯 **Smart Recommendations**: 70% weight on recent plays + 30% on long-term favorites
- 🗺️ **Dual Views**: List view by dates or interactive map view
- 📅 **Event Tracking**: Track attended events and wishlist future ones
- 🎫 **Direct Ticketing**: Links to purchase tickets for each event

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **APIs**: Spotify Web API, EDMTrain API, Google Maps
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Spotify OAuth 2.0

## Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/ravepulse.git
cd ravepulse
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
```

4. Add your API credentials to `.env.local`:
   - **Spotify**: Create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - **EDMTrain**: Get API key from [EDMTrain](https://edmtrain.com/api)
   - **Google Maps**: Get API key from [Google Cloud Console](https://console.cloud.google.com)
   - **Supabase**: Create a project at [Supabase](https://supabase.com)

5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## API Configuration

### Spotify App Settings
- Redirect URI: `http://localhost:3000/api/auth/callback`
- Required scopes: `user-read-recently-played`, `user-top-read`, `user-read-private`, `user-read-email`

### Google Maps API
- Enable: Maps JavaScript API, Places API, Geocoding API

## Project Structure

```
ravepulse/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Main app dashboard
│   └── page.tsx          # Landing page
├── lib/                   # Utility functions
│   ├── spotify.ts        # Spotify API client
│   ├── edmtrain.ts       # EDMTrain API client
│   └── types.ts          # TypeScript types
├── components/            # React components
└── public/               # Static assets
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT