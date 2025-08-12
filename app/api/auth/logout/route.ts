import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  
  // Clear all auth cookies
  cookieStore.delete('spotify_access_token');
  cookieStore.delete('spotify_refresh_token');
  
  // Redirect to home page
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`);
}