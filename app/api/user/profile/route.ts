import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserProfile } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('spotify_access_token');

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const profile = await getUserProfile(accessToken.value);
    
    if (profile.error) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 401 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}