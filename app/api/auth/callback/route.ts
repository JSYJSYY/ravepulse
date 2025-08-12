import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, getUserProfile } from '@/lib/spotify';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Only create Supabase client if credentials are provided
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                 process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url' &&
                 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
                 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key'
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null;

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
      throw new Error(tokenData.error_description || 'Failed to get access token');
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

    // Store user info in Supabase (optional - for persistence)
    if (supabase) {
      const { error: supabaseError } = await supabase
        .from('users')
        .upsert({
          spotify_id: userProfile.id,
          display_name: userProfile.display_name,
          email: userProfile.email,
          image_url: userProfile.images?.[0]?.url,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'spotify_id'
        });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
      }
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/success`);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=authentication_failed`);
  }
}