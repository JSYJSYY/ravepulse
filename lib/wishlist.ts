// Event wishlist tracking utilities

interface WishlistEvent {
  eventId: string;
  eventName: string;
  venueName: string;
  date: string;
  addedAt: string; // ISO date when added to wishlist
  artists: string[];
}

const WISHLIST_KEY = 'ravepulse_wishlist_events';

export function getWishlistEvents(): WishlistEvent[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(WISHLIST_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addToWishlist(event: {
  id: string;
  name: string;
  venue: { name: string };
  date: string;
  artists: Array<{ name: string; b2bArtist?: string }>;
}): void {
  const wishlist = getWishlistEvents();
  
  // Check if already in wishlist
  if (wishlist.some(e => e.eventId === event.id)) {
    return;
  }
  
  const wishlistEvent: WishlistEvent = {
    eventId: event.id,
    eventName: event.name,
    venueName: event.venue.name,
    date: event.date,
    addedAt: new Date().toISOString(),
    artists: event.artists.map(a => 
      a.b2bArtist ? `${a.name} b2b ${a.b2bArtist}` : a.name
    ),
  };
  
  wishlist.push(wishlistEvent);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

export function removeFromWishlist(eventId: string): void {
  const wishlist = getWishlistEvents();
  const filtered = wishlist.filter(e => e.eventId !== eventId);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(filtered));
}

export function isInWishlist(eventId: string): boolean {
  const wishlist = getWishlistEvents();
  return wishlist.some(e => e.eventId === eventId);
}

export function getWishlistStats() {
  const wishlist = getWishlistEvents();
  
  // Filter out past events
  const now = new Date();
  const upcoming = wishlist.filter(event => new Date(event.date) >= now);
  const past = wishlist.filter(event => new Date(event.date) < now);
  
  return {
    total: wishlist.length,
    upcoming: upcoming.length,
    past: past.length,
    events: wishlist.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
  };
}