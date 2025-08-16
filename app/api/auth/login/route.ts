import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/spotify';

export async function GET() {
  try {
    const authUrl = getAuthorizationUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Spotify authorization error:', error);
    
    // Return an HTML page with error message and setup instructions
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>RavePulse - Configuration Required</title>
          <style>
            body { 
              font-family: monospace; 
              background: black; 
              color: #00FFFF; 
              padding: 20px; 
              line-height: 1.6;
            }
            .container { 
              max-width: 800px; 
              margin: 0 auto; 
              background: rgba(0,0,0,0.8); 
              padding: 30px; 
              border: 1px solid #00FFFF; 
              border-radius: 8px;
            }
            h1 { color: #FF69B4; }
            .code { 
              background: rgba(0,255,255,0.1); 
              padding: 10px; 
              border-left: 3px solid #00FFFF; 
              margin: 10px 0; 
            }
            .error { color: #FF6B6B; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎵 RavePulse Configuration Required</h1>
            <p class="error">Missing Spotify API credentials!</p>
            
            <h2>Setup Instructions:</h2>
            <ol>
              <li>Create a <code>.env.local</code> file in the project root directory</li>
              <li>Add the following environment variables:</li>
            </ol>
            
            <div class="code">
# Spotify API (get from https://developer.spotify.com/dashboard)<br>
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id<br>
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret<br>
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://127.0.0.1:4000/api/auth/callback<br>
<br>
# App URL<br>
NEXT_PUBLIC_APP_URL=http://127.0.0.1:4000
            </div>
            
            <h3>How to get Spotify credentials:</h3>
            <ol>
              <li>Go to <a href="https://developer.spotify.com/dashboard" style="color: #FF69B4;">Spotify Developer Dashboard</a></li>
              <li>Create a new app</li>
              <li>Set redirect URI to: <code>http://127.0.0.1:4000/api/auth/callback</code></li>
              <li>Copy your Client ID and Client Secret</li>
            </ol>
            
            <p>After adding the credentials, restart the development server and try again.</p>
            
            <p><a href="/" style="color: #00FFFF;">← Back to Home</a></p>
          </div>
        </body>
      </html>
    `;
    
    return new NextResponse(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}