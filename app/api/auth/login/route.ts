import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/spotify';

export async function GET() {
  const authUrl = getAuthorizationUrl();
  return NextResponse.redirect(authUrl);
}