/**
 * Spotify Web API & Developer Credentials Engine
 * Manages editable Spotify Client ID, Client Secret, Redirect URI, and Access Tokens
 * for Development Mode apps & Production releases.
 */

const SPOTIFY_CREDS_KEY = 'blackbox_spotify_creds_v1';
const SPOTIFY_TOKEN_KEY = 'blackbox_spotify_token_v1';

const DEFAULT_SPOTIFY_CLIENT_ID = '94205059236b41a092da67ff079c54a1';

export function getSpotifyCredentials() {
  const data = localStorage.getItem(SPOTIFY_CREDS_KEY);
  if (!data) {
    return {
      clientId: DEFAULT_SPOTIFY_CLIENT_ID,
      clientSecret: '',
      redirectUri: 'https://localhost:5173/'
    };
  }
  try {
    const parsed = JSON.parse(data);
    return {
      clientId: parsed.clientId || DEFAULT_SPOTIFY_CLIENT_ID,
      clientSecret: parsed.clientSecret || '',
      redirectUri: parsed.redirectUri || 'https://localhost:5173/'
    };
  } catch (e) {
    return {
      clientId: DEFAULT_SPOTIFY_CLIENT_ID,
      clientSecret: '',
      redirectUri: 'https://localhost:5173/'
    };
  }
}

export function saveSpotifyCredentials(creds) {
  localStorage.setItem(SPOTIFY_CREDS_KEY, JSON.stringify(creds));
}

export function getSpotifyAccessToken() {
  return localStorage.getItem(SPOTIFY_TOKEN_KEY) || null;
}

export function saveSpotifyAccessToken(token) {
  if (token) {
    localStorage.setItem(SPOTIFY_TOKEN_KEY, token.trim());
  } else {
    localStorage.removeItem(SPOTIFY_TOKEN_KEY);
  }
}

/**
 * Triggers Spotify Authorization Code PKCE / OAuth Popup
 */
export function triggerSpotifyAuthPopup() {
  const creds = getSpotifyCredentials();
  const clientId = creds.clientId || DEFAULT_SPOTIFY_CLIENT_ID;
  const redirectUri = encodeURIComponent(creds.redirectUri || 'https://localhost:5173/');
  const scopes = encodeURIComponent('user-read-currently-playing user-read-playback-state playlist-modify-public playlist-modify-private');

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}&show_dialog=true`;
  
  window.open(authUrl, 'spotify_auth_popup', 'width=500,height=700');
}
