// Event attendance tracking utilities

interface AttendedEvent {
  eventId: string;
  eventName: string;
  venueName: string;
  date: string;
  attendedAt: string; // ISO date when marked as attended
  artists: string[];
}

const ATTENDANCE_KEY = 'ravepulse_attended_events';

export function getAttendedEvents(): AttendedEvent[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(ATTENDANCE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function markEventAsAttended(event: {
  id: string;
  name: string;
  venue: { name: string };
  date: string;
  artists: Array<{ name: string; b2bArtist?: string }>;
}): void {
  const attended = getAttendedEvents();
  
  // Check if already attended
  if (attended.some(e => e.eventId === event.id)) {
    return;
  }
  
  const attendedEvent: AttendedEvent = {
    eventId: event.id,
    eventName: event.name,
    venueName: event.venue.name,
    date: event.date,
    attendedAt: new Date().toISOString(),
    artists: event.artists.map(a => 
      a.b2bArtist ? `${a.name} b2b ${a.b2bArtist}` : a.name
    ),
  };
  
  attended.push(attendedEvent);
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attended));
}

export function unmarkEventAsAttended(eventId: string): void {
  const attended = getAttendedEvents();
  const filtered = attended.filter(e => e.eventId !== eventId);
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(filtered));
}

export function isEventAttended(eventId: string): boolean {
  const attended = getAttendedEvents();
  return attended.some(e => e.eventId === eventId);
}

export function getAttendanceStats() {
  const attended = getAttendedEvents();
  
  // Group by venue
  const venueStats = attended.reduce((acc, event) => {
    acc[event.venueName] = (acc[event.venueName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get favorite venue
  const favoriteVenue = Object.entries(venueStats)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || null;
  
  // Group by month
  const monthlyStats = attended.reduce((acc, event) => {
    const month = new Date(event.date).toLocaleString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: attended.length,
    favoriteVenue,
    venueStats,
    monthlyStats,
    events: attended.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  };
}