import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, getUserProfile } from '@/lib/spotify';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=no_code`);
  }

  try {
    // Get access token from Spotify
    const tokenData = await getAccessToken(code);
    
    if (tokenData.error) {
      console.error('Token error:', tokenData);
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }

    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData);
      throw new Error('No access token received from Spotify');
    }

    // Get user profile from Spotify
    const userProfile = await getUserProfile(tokenData.access_token);

    // Store tokens in cookies (in production, use secure session management)
    const cookieStore = await cookies();
    cookieStore.set('spotify_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in,
    });

    cookieStore.set('spotify_refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // User info is stored in cookies only
    // In production, consider using a proper session management solution

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/success`);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=authentication_failed`);
  }
}