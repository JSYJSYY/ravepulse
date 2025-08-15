# RavePulse 🎵⚡

Real-time EDM event discovery platform powered by AI and your Spotify music taste. Features a cyberpunk-themed interface with real-time event data from EDMTrain API.

## 🚀 Features

- 🎵 **Spotify Integration**: Analyzes your listening patterns and favorite artists
- 📍 **Real-Time Events**: Live EDM event data from EDMTrain API
- 🎯 **Smart Genre Detection**: Identifies 40+ EDM sub-genres (Tech House, Melodic Dubstep, Drum & Bass, etc.)
- 🗺️ **Interactive Map**: Visual event locations with clustering
- 🎨 **Cyberpunk UI**: Neon-themed interface with matrix rain effects
- ⚡ **Performance Optimized**: Built with Next.js 15 Turbopack, includes response caching
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile

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
│   ├── auth/success/      # Post-auth redirect
│   └── page.tsx          # Landing page
├── components/            # React components
│   ├── EventsList.tsx    # Event cards display
│   ├── EventModal.tsx    # Event details modal
│   └── MapView.tsx       # Interactive map
├── lib/                   # Core utilities
│   ├── spotify.ts        # Spotify API client
│   ├── edmtrain.ts       # EDMTrain API integration
│   ├── cache.ts          # Response caching
│   └── types.ts          # TypeScript types
└── public/               # Static assets
```

## 🎨 Features in Detail

### EDMTrain Integration
- Real-time event data with preserved event links (per API Terms)
- Location-based event discovery
- Automatic nearest city detection

### Genre Enrichment
The app identifies and categorizes 40+ EDM sub-genres including:
- House: Deep House, Tech House, Progressive House, Future House
- Bass: Dubstep, Drum & Bass, Future Bass, Trap
- Techno: Minimal Techno, Hard Techno, Acid Techno
- Trance: Progressive Trance, Psytrance, Uplifting Trance
- And many more...

### Performance Optimizations
- 10-minute API response caching
- Optimized image loading with Next.js Image
- Turbopack for faster development builds
- Package import optimizations

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