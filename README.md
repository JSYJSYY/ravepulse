# RavePulse 🎵⚡

Real-time EDM event discovery platform powered by AI and your Spotify music taste. Features a cyberpunk-themed interface with real-time event data from EDMTrain API.

## 🚀 Features

- 🎵 **Spotify Integration**: Analyzes your listening patterns and favorite artists for personalized recommendations
- 📍 **Real-Time Events**: Live EDM event data from EDMTrain API with automatic location detection
- 🎯 **Smart Recommendations**: AI-powered event suggestions based on your music taste
- 🗺️ **Interactive GEO_MAP**: Visual event locations with time filters and recommendation highlights
- 💜 **Priority List**: Save and track events you want to attend with map visualization
- 📊 **Archived Data**: Track past events with ratings, DJ rankings, and statistics
- 🎨 **Cyberpunk UI**: Neon-themed interface with matrix rain effects and glitch animations
- ⚡ **Performance Optimized**: Built with Next.js 15 Turbopack, includes response caching
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🏷️ **Smart Labeling**: Events without titles automatically show artist names
- 🖼️ **Fallback Images**: Generic EDM images for events without artwork

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **APIs**: 
  - EDMTrain API (real-time event data)
  - Spotify Web API (artist images & genre enrichment)
- **Maps**: React Leaflet with OpenStreetMap
- **Performance**: In-memory caching, optimized builds

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Spotify Developer Account
- EDMTrain API Key

## 🔧 Setup

1. **Clone the repository**
```bash
git clone https://github.com/JSYJSYY/ravepulse.git
cd ravepulse
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:4000/api/auth/callback

# App URL
NEXT_PUBLIC_APP_URL=http://127.0.0.1:4000

# Optional: Google Maps (for enhanced location features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

4. **Configure Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add redirect URI: `http://127.0.0.1:4000/api/auth/callback`
   - Note your Client ID and Client Secret

5. **Run the development server**
```bash
npm run dev
```

The app will be available at [http://127.0.0.1:4000](http://127.0.0.1:4000)

## 📁 Project Structure

```
ravepulse/
├── app/                    # Next.js 15 app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Spotify OAuth flow
│   │   ├── events/        # EDMTrain event fetching
│   │   └── spotify/       # Artist data & genres
│   ├── dashboard/         # Main dashboard with events
│   ├── wishlist/          # Priority list page
│   ├── past-events/       # Archived events & DJ rankings
│   ├── auth/success/      # Post-auth redirect
│   └── page.tsx          # Landing page
├── components/            # React components
│   ├── EventsList.tsx    # Event cards display
│   ├── EventModal.tsx    # Event details modal
│   ├── EventsMap.tsx     # Enhanced GEO_MAP with filters
│   └── MapView.tsx       # Priority list map visualization
├── lib/                   # Core utilities
│   ├── spotify.ts        # Spotify API client
│   ├── edmtrain.ts       # EDMTrain API integration
│   ├── attendance.ts     # Event attendance tracking
│   ├── wishlist.ts       # Priority list management
│   ├── cache.ts          # Response caching
│   └── types.ts          # TypeScript types
└── public/               # Static assets
```

## 🎨 Features in Detail

### Smart Recommendations
- **Personalized Matching**: Events are recommended based on your Spotify listening history
- **Artist Recognition**: Direct matches with artists you've listened to
- **Genre Analysis**: Intelligent matching of EDM sub-genres from your music taste
- **Visual Indicators**: Purple pins for recommended events, green for others
- **Sorting**: Recommended events appear first in chronological order

### Interactive GEO_MAP
- **Time Filters**: View events for today, this week, next week, or this month
- **Recommendation Filter**: Toggle to show only recommended events
- **Event Labels**: Shows event names and venues directly on the map (recommended only)
- **Color Coding**: Purple for recommended, green for regular events
- **Popup Details**: Click markers for full event information

### Priority List & Archive
- **Priority List**: Save events you want to attend with dedicated map view
- **Event Archive**: Track all attended events with ratings and notes
- **DJ Rankings**: See your most-seen artists with play counts
- **Statistics Dashboard**: View total events, unique venues, top genres, and average ratings
- **Date Organization**: Events grouped by date for easy browsing

### EDMTrain Integration
- Real-time event data with preserved event links (per API Terms)
- Location-based event discovery
- Automatic nearest city detection
- Smart title handling (replaces generic titles with artist names)

### Genre Enrichment
The app identifies and categorizes 40+ EDM sub-genres including:
- House: Deep House, Tech House, Progressive House, Future House
- Bass: Dubstep, Drum & Bass, Future Bass, Trap
- Techno: Minimal Techno, Hard Techno, Acid Techno
- Trance: Progressive Trance, Psytrance, Uplifting Trance
- And many more...

### Performance Optimizations
- 10-minute API response caching
- Optimized image loading with fallback support
- Turbopack for faster development builds
- Package import optimizations
- LocalStorage for instant data access

## 🚀 Scripts

```bash
npm run dev          # Start development server on port 4000
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🔐 API Keys

### EDMTrain API
The app uses EDMTrain's API with client key authentication. The key is embedded in the code as per EDMTrain's requirements.

### Spotify API
Required scopes:
- `user-read-recently-played`
- `user-top-read` 
- `user-read-private`
- `user-read-email`

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SPOTIFY_CLIENT_ID` | Spotify app client ID | Yes |
| `SPOTIFY_CLIENT_SECRET` | Spotify app client secret | Yes |
| `SPOTIFY_REDIRECT_URI` | OAuth callback URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | Optional |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [EDMTrain](https://edmtrain.com) for event data API
- [Spotify](https://developer.spotify.com) for music data API
- [Next.js](https://nextjs.org) for the amazing framework

---

Built with 💜 by music lovers, for music lovers