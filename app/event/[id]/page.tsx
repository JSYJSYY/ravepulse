'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Music, Users, ExternalLink, ChevronLeft, Heart, Share2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  artists: Array<{
    id: string;
    name: string;
    b2bArtist?: string;
  }>;
  ages: string;
  festivalInd: boolean;
  electronicGenreInd: boolean;
  otherGenreInd: boolean;
  link: string;
  ticketLink: string;
  image?: string;
  description?: string;
}

export default function EventDetail() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [params.id]);

  const fetchEventDetails = async () => {
    try {
      // For now, we'll fetch all events and find the one we need
      // In a real app, this would be a dedicated endpoint
      const response = await fetch('/api/events?city=New York&state=NY');
      if (response.ok) {
        const data = await response.json();
        const foundEvent = data.events.find((e: Event) => e.id === params.id);
        if (foundEvent) {
          setEvent(foundEvent);
        }
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.name,
          text: `Check out ${event?.name} at ${event?.venue.name}`,
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/dashboard');
                }
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleWishlist}
                className={`p-2 rounded-md transition-colors ${
                  isWishlisted 
                    ? 'bg-pink-600/20 text-pink-400' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-md bg-gray-800 text-gray-400 hover:text-white transition-colors"
                title="Share event"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-purple-900/50 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Event Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{event.name}</h1>
            <div className="flex flex-wrap gap-4 text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span>
                  {formatTime(event.startTime)}
                  {event.endTime && ` - ${formatTime(event.endTime)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Artists */}
            <section className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-400" />
                Artists
              </h2>
              <div className="space-y-3">
                {event.artists.map((artist) => (
                  <div key={artist.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="font-medium">
                      {artist.b2bArtist ? `${artist.name} b2b ${artist.b2bArtist}` : artist.name}
                    </span>
                    <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Description */}
            {event.description && (
              <section className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                <p className="text-gray-300 leading-relaxed">{event.description}</p>
              </section>
            )}

            {/* Venue Info */}
            <section className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                Venue
              </h2>
              <div className="space-y-3">
                <h3 className="font-medium text-lg">{event.venue.name}</h3>
                <p className="text-gray-400">
                  {event.venue.address}<br />
                  {event.venue.city}, {event.venue.state}
                </p>
                <button className="text-purple-400 hover:text-purple-300 transition-colors">
                  View on Map →
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="bg-gray-900 rounded-lg p-6 sticky top-24">
              <div className="space-y-4">
                {event.ages && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{event.ages}</span>
                  </div>
                )}
                
                {event.ticketLink && (
                  <a
                    href={event.ticketLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-md text-lg font-medium transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Get Tickets
                  </a>
                )}
                
                {!event.ticketLink && event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-md text-lg font-medium transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Event Info
                  </a>
                )}

                <button className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-md font-medium transition-colors">
                  Mark as Attended
                </button>
              </div>
            </div>

            {/* Similar Events */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Similar Events</h3>
              <p className="text-sm text-gray-400">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}