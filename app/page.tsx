'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Music, MapPin, Calendar, Sparkles } from 'lucide-react';

export default function Home() {
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 text-transparent bg-clip-text animate-gradient">
              RavePulse
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light">
              Real-time EDM event recommendations powered by your music taste
            </p>
          </div>

          {/* Connect with Spotify button */}
          <Link 
            href="/api/auth/login"
            className={`inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-black font-bold text-lg px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg ${
              pulseAnimation ? 'animate-pulse' : ''
            }`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Connect with Spotify
          </Link>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 transform hover:scale-105 transition-transform">
              <Music className="w-8 h-8 mb-4 mx-auto text-purple-400" />
              <h3 className="font-semibold mb-2">Music Taste Analysis</h3>
              <p className="text-sm text-gray-400">Analyzes your recent plays and favorite artists</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 transform hover:scale-105 transition-transform">
              <Sparkles className="w-8 h-8 mb-4 mx-auto text-pink-400" />
              <h3 className="font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-sm text-gray-400">70% recent + 30% all-time favorites</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 transform hover:scale-105 transition-transform">
              <MapPin className="w-8 h-8 mb-4 mx-auto text-cyan-400" />
              <h3 className="font-semibold mb-2">Location Based</h3>
              <p className="text-sm text-gray-400">Auto-detect or manually select your city</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 transform hover:scale-105 transition-transform">
              <Calendar className="w-8 h-8 mb-4 mx-auto text-yellow-400" />
              <h3 className="font-semibold mb-2">Event Tracking</h3>
              <p className="text-sm text-gray-400">Track attended & wishlist future events</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center p-8 text-gray-500 text-sm">
        <p>Powered by Spotify Web API & EDMTrain</p>
      </footer>
    </div>
  );
}