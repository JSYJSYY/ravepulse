'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Map, List, Heart, Clock, Settings, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Bar */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                RavePulse
              </h1>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-4">
              <div className="bg-gray-800 rounded-lg p-1 flex">
                <button
                  onClick={() => setActiveView('list')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                    activeView === 'list' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
                <button
                  onClick={() => setActiveView('map')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                    activeView === 'map' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  Map
                </button>
              </div>
              
              {/* User Profile */}
              {userProfile && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-300">
                    {userProfile.display_name}
                  </span>
                  <img 
                    src={userProfile.images?.[0]?.url || '/default-avatar.png'} 
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4">
          <div className="space-y-6">
            {/* Location Selector */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Location
              </h3>
              <button className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2 text-left flex items-center gap-2 transition-colors">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>San Francisco, CA</span>
              </button>
            </div>

            {/* Filters */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Quick Filters
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  This Weekend
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Wishlist
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Past Events
                </button>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Your Stats
              </h3>
              <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Events Attended</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wishlist</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Music Match</span>
                  <span className="font-semibold text-green-400">--</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main View */}
        <main className="flex-1 overflow-hidden">
          {activeView === 'list' ? (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">
                  Recommended Events
                </h2>
                
                {/* Loading State */}
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-3 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    <span>Analyzing your music taste...</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    We're fetching your Spotify data and matching it with upcoming EDM events
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-gray-900 flex items-center justify-center">
              <p className="text-gray-400">Map view coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}