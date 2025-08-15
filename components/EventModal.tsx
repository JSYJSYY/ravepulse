'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, MapPin, X, Heart, Share2, Clock, Check, Zap, Shield, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { markEventAsAttended, unmarkEventAsAttended, isEventAttended } from '@/lib/attendance';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlist';

interface Event {
  id: string;
  name: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
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
  genres?: string[];
  festivalInd: boolean;
  electronicGenreInd: boolean;
  otherGenreInd: boolean;
  link: string;
  ticketLink: string;
  image?: string;
}

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onAttendanceChange?: () => void;
}

export default function EventModal({ event, isOpen, onClose, onAttendanceChange }: EventModalProps) {
  const [isAttended, setIsAttended] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Ensure positioning is set after mount
    requestAnimationFrame(() => {
      setIsPositioned(true);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (event) {
      setIsAttended(isEventAttended(event.id));
      setIsWishlisted(isInWishlist(event.id));
    }
  }, [event]);

  useEffect(() => {
    // Reset positioning state when modal closes
    if (!isOpen) {
      setTimeout(() => {
        setIsPositioned(false);
      }, 200);
    } else {
      // Set positioned state when opening
      requestAnimationFrame(() => {
        setIsPositioned(true);
      });
    }
  }, [isOpen]);

  if (!mounted || !isOpen || !event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string | null) => {
    if (!time) return 'Time TBA';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/event/${event.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: `Check out ${event.name} at ${event.venue.name}`,
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

  const handleAttendance = () => {
    if (isAttended) {
      unmarkEventAsAttended(event.id);
      setIsAttended(false);
      toast.success('Removed from attended events');
    } else {
      markEventAsAttended(event);
      setIsAttended(true);
      toast.success('Marked as attended!');
    }
    onAttendanceChange?.();
  };

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(event.id);
      setIsWishlisted(false);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(event);
      setIsWishlisted(true);
      toast.success('Added to wishlist!');
    }
    onAttendanceChange?.();
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
        }}
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="cyber-card"
        style={{
          position: 'fixed',
          left: 'calc(50% + 120px)', // Account for sidebar offset directly
          top: '50%',
          transform: isPositioned ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) scale(0.95)',
          width: '90%',
          maxWidth: '42rem',
          maxHeight: '85vh',
          zIndex: 9999,
          overflow: 'hidden',
          opacity: isPositioned && mounted && isOpen ? 1 : 0,
          visibility: isPositioned ? 'visible' : 'hidden',
          transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-lg overflow-hidden">
          {event.image && (
            <img 
              src={event.image} 
              alt={event.name}
              className="w-full h-full object-cover opacity-80"
            />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 cyber-button p-2"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Event Title */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-2xl font-semibold cyber-heading text-white mb-3">{event.name}</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 cyber-text-primary">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 cyber-text-muted">
                <Clock className="w-4 h-4" />
                <span>
                  {formatTime(event.startTime)}
                  {event.endTime && event.startTime && ` - ${formatTime(event.endTime)}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 12rem)' }}>
          <div className="p-6 space-y-5">
            {/* Artists */}
            <div className="cyber-card p-4">
              <h3 className="text-sm font-semibold cyber-text-primary mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Artists
              </h3>
              <div className="space-y-2">
                {event.artists.map((artist) => (
                  <div key={artist.id} className="text-white">
                    {artist.b2bArtist ? `${artist.name} b2b ${artist.b2bArtist}` : artist.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Genres */}
            {event.genres && event.genres.length > 0 && (
              <div className="cyber-card p-4">
                <h3 className="text-sm font-semibold cyber-text-secondary mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {event.genres.map((genre, idx) => (
                    <span 
                      key={idx} 
                      className={`cyber-badge ${
                        genre.toLowerCase().includes('house') ? 'bg-purple-900/30 border-purple-500/50' :
                        genre.toLowerCase().includes('techno') ? 'bg-blue-900/30 border-blue-500/50' :
                        genre.toLowerCase().includes('bass') || genre.toLowerCase().includes('dubstep') ? 'bg-green-900/30 border-green-500/50' :
                        genre.toLowerCase().includes('trance') ? 'bg-pink-900/30 border-pink-500/50' :
                        genre.toLowerCase().includes('drum') ? 'bg-orange-900/30 border-orange-500/50' :
                        ''
                      }`}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Venue */}
            <div className="cyber-card p-4">
              <h3 className="text-sm font-semibold cyber-text-primary mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h3>
              <div className="text-white">
                {event.venue.name}
              </div>
              <div className="cyber-text-muted text-sm mt-1">
                {event.venue.address}, {event.venue.city}, {event.venue.state}
              </div>
            </div>

            {/* Age Restriction */}
            {event.ages && (
              <div className="cyber-card p-4 flex items-center gap-2">
                <Shield className="w-4 h-4 cyber-text-muted" />
                <span className="text-sm cyber-text-muted">
                  Age restriction: <span className="text-white">{event.ages}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="border-t border-gray-700 p-4 bg-gray-900/50 rounded-b-lg">
          <div className="flex items-center gap-3">
            {event.ticketLink && (
              <a
                href={event.ticketLink}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-button primary flex-1 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Get Tickets
              </a>
            )}
            
            <button
              onClick={handleWishlist}
              className={`cyber-button p-3 ${isWishlisted ? 'secondary' : ''}`}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleAttendance}
              className={`cyber-button p-3 ${isAttended ? 'secondary' : ''}`}
              title={isAttended ? "Remove from attended" : "Mark as attended"}
            >
              <Check className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleShare}
              className="cyber-button p-3"
              title="Share event"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}