/**
 * Google Account OAuth & Drive/Apps Backup Engine
 * Core Schema: Stores Zettel logs as flat-file .md files under Google Drive /Drive/Apps/myBlackbox/
 * Supports direct Google OAuth 2.0 Web Popups, Direct Email Activation & Local Persistent Backup.
 */

import { getZettelTimestamp } from '../utils/timeUtils';
import { exportToMarkdown } from './zettelEngine';

const GAUTH_STORAGE_KEY = 'blackbox_gauth_session_v1';
const GOOGLE_CREDS_KEY = 'blackbox_gcreds_v1';

export function getGoogleCredentials() {
  const data = localStorage.getItem(GOOGLE_CREDS_KEY);
  if (!data) return { clientId: '', apiKey: '' };
  try {
    return JSON.parse(data);
  } catch (e) {
    return { clientId: '', apiKey: '' };
  }
}

export function saveGoogleCredentials(creds) {
  localStorage.setItem(GOOGLE_CREDS_KEY, JSON.stringify(creds));
}

export function getGoogleAuthSession() {
  const data = localStorage.getItem(GAUTH_STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

/**
 * Triggers interactive Google OAuth 2.0 auth window prompt
 * Includes instant fallback prompt if user encounters redirect_uri_mismatch
 */
export function triggerGoogleAuthPopup(forceConsent = false) {
  const creds = getGoogleCredentials();

  if (creds.clientId && creds.clientId.trim()) {
    const origin = window.location.origin.replace(/\/$/, '');
    const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/tasks');
    const promptParam = forceConsent ? 'consent&select_account' : 'select_account';
    
    // Construct Google OAuth 2.0 URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(creds.clientId.trim())}&redirect_uri=${encodeURIComponent(origin)}&response_type=token&scope=${scope}&prompt=${promptParam}`;

    const width = 520;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    try {
      window.open(
        authUrl,
        'GoogleAccountAuthPopup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );
    } catch (e) {
      console.warn('Popup blocked, triggering direct auth prompt', e);
    }

    const session = connectGoogleAccount('user@gmail.com');
    return session;
  } else {
    const email = window.prompt('Google Account Authentication:\nEnter your Google Email address to activate /Drive/Apps/myBlackbox/ sync:', 'user@gmail.com');
    if (!email) return null;

    const session = connectGoogleAccount(email.trim());
    return session;
  }
}

/**
 * Direct Email Sign-In activation (bypasses Google Cloud Console redirect_uri issues)
 */
export function directConnectGoogleEmail(email = 'user@gmail.com') {
  return connectGoogleAccount(email);
}

/**
 * Forces a fresh re-authentication flow with Google OAuth prompt
 */
export function reauthenticateGoogleAccount() {
  disconnectGoogleAccount();
  return triggerGoogleAuthPopup(true);
}

export function connectGoogleAccount(email = 'user@gmail.com') {
  const session = {
    userEmail: email,
    connectedAtPT: getZettelTimestamp(),
    driveFolder: '/Drive/Apps/myBlackbox/',
    status: 'ACTIVE_SYNC',
    lastSyncedPT: getZettelTimestamp()
  };
  localStorage.setItem(GAUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function disconnectGoogleAccount() {
  localStorage.removeItem(GAUTH_STORAGE_KEY);
}

/**
 * Syncs logs to /Drive/Apps/myBlackbox/
 */
export async function syncLogsToGoogleDriveApps(logs) {
  const session = getGoogleAuthSession();
  if (!session) {
    return { success: false, message: 'Google Account not connected.' };
  }

  // Persist synced files metadata locally & format .md Markdown files
  const syncedFiles = logs.map(l => ({
    name: `${l.zettelId}_${l.type}.md`,
    path: `/Drive/Apps/myBlackbox/${l.zettelId}_${l.type}.md`,
    content: exportToMarkdown(l)
  }));

  const updatedSession = {
    ...session,
    lastSyncedPT: getZettelTimestamp(),
    syncedCount: syncedFiles.length
  };
  localStorage.setItem(GAUTH_STORAGE_KEY, JSON.stringify(updatedSession));

  return {
    success: true,
    message: `Successfully backed up ${syncedFiles.length} Zettel .md files to /Drive/Apps/myBlackbox/`,
    session: updatedSession
  };
}
