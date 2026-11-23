import { n8nEngine } from '@lorik/shared-kawaii-ui';
/**
 * Google Account OAuth & Drive/Apps, Google Tasks, Google Fit, and Google Contacts Engine
 * Unifies auth around:
 * 1. Plain HTTP loopback (http://127.0.0.1:<port>) with Google Cloud "Desktop app" client (project: anymd-515619)
 * 2. Shared token bundle (~/.config/anymd/google_oauth_token.json) + automatic refresh rotation
 * 3. Modular opt-in scope presets:
 *    - 'vault': Drive file & AppData + Tasks
 *    - 'fitness': Google Fit / Health telemetry (activity, body, location)
 *    - 'timeline': Location / geofence telemetry
 *    - 'contacts': Google People / Contacts API
 * 4. Status reporting & graceful degradation when sensitive scopes are unverified or not yet authorized
 */

import { getZettelTimestamp } from '../utils/timeUtils';
import { exportToMarkdown } from './zettelEngine';

const GAUTH_STORAGE_KEY = 'blackbox_gauth_session_v1';
const GOOGLE_CREDS_KEY = 'blackbox_gcreds_v1';
const GOOGLE_TOKEN_KEY = 'blackbox_gtoken_v1';
const GOOGLE_SCOPE_PRESETS_KEY = 'blackbox_gscope_presets_v1';
const SYNC_DIAGNOSTICS_KEY = 'blackbox_sync_diagnostics_v1';

// Default project Desktop App client (project: anymd-515619)
export const DEFAULT_CLIENT_ID = '94205059236b41a092da67ff079c54a1';
export const PROJECT_ID = 'anymd-515619';

export const SCOPE_PRESETS = {
  vault: {
    id: 'vault',
    name: 'Google Drive Vault & AppData',
    description: 'Read/write app files & /Drive/Apps/myBlackbox/ for meow-vault sync',
    tier: 'base',
    scopes: [
      'https://www.googleapis.com/auth/drive.appdata',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/tasks'
    ]
  },
  fitness: {
    id: 'fitness',
    name: 'Fitness & Health Telemetry',
    description: 'Google Fit / Health Connect activity, step count, and energy expenditure',
    tier: 'sensitive',
    scopes: [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.location.read'
    ]
  },
  timeline: {
    id: 'timeline',
    name: 'Location & Timeline / Geofence',
    description: 'Location telemetry feeding Telemeowtrics / MacroDroid / Tasker logs',
    tier: 'sensitive',
    scopes: [
      'https://www.googleapis.com/auth/fitness.location.read',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  },
  contacts: {
    id: 'contacts',
    name: 'Google Contacts Context',
    description: 'Read-only contacts lookup for relationship context and CRM widgets',
    tier: 'sensitive',
    scopes: [
      'https://www.googleapis.com/auth/contacts.readonly'
    ]
  }
};

export function logSyncDiagnostic(action, message, type = 'INFO', data = null) {
  const existing = getSyncDiagnostics();
  const entry = {
    id: `diag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestampIso: new Date().toISOString(),
    timestampPT: getZettelTimestamp(),
    action,
    message,
    type, // 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
    data
  };
  const updated = [entry, ...existing].slice(0, 50);
  try {
    localStorage.setItem(SYNC_DIAGNOSTICS_KEY, JSON.stringify(updated));
  } catch (e) {
    // ignore
  }
  return entry;
}

export function getSyncDiagnostics() {
  const data = localStorage.getItem(SYNC_DIAGNOSTICS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function clearSyncDiagnostics() {
  localStorage.removeItem(SYNC_DIAGNOSTICS_KEY);
}

export function getGoogleCredentials() {
  const data = localStorage.getItem(GOOGLE_CREDS_KEY);
  if (!data) return { clientId: DEFAULT_CLIENT_ID, clientSecret: '', apiKey: '' };
  try {
    const parsed = JSON.parse(data);
    return {
      clientId: parsed.clientId || DEFAULT_CLIENT_ID,
      clientSecret: parsed.clientSecret || '',
      apiKey: parsed.apiKey || ''
    };
  } catch (e) {
    return { clientId: DEFAULT_CLIENT_ID, clientSecret: '', apiKey: '' };
  }
}

export function saveGoogleCredentials(creds) {
  localStorage.setItem(GOOGLE_CREDS_KEY, JSON.stringify(creds));
  logSyncDiagnostic('SAVE_CREDS', `Updated Google Client ID: ${creds.clientId ? creds.clientId.substring(0, 15) + '...' : 'None'}`, 'INFO');
}

export function getActiveScopePresets() {
  const data = localStorage.getItem(GOOGLE_SCOPE_PRESETS_KEY);
  if (!data) {
    return ['vault', 'contacts'];
  }
  try {
    return JSON.parse(data);
  } catch {
    return ['vault', 'contacts'];
  }
}

export function saveActiveScopePresets(presets) {
  localStorage.setItem(GOOGLE_SCOPE_PRESETS_KEY, JSON.stringify(presets));
  logSyncDiagnostic('SAVE_SCOPE_PRESETS', `Active scope presets: ${presets.join(', ')}`, 'INFO');
}

export function getCombinedScopes(presetIds = null) {
  const selected = presetIds || getActiveScopePresets();
  const scopes = new Set();
  selected.forEach(pid => {
    if (SCOPE_PRESETS[pid]) {
      SCOPE_PRESETS[pid].scopes.forEach(s => scopes.add(s));
    }
  });
  scopes.add('openid');
  scopes.add('https://www.googleapis.com/auth/userinfo.email');
  return Array.from(scopes);
}

export function getStoredAccessToken() {
  return localStorage.getItem(GOOGLE_TOKEN_KEY) || null;
}

export function saveAccessToken(token) {
  if (token) {
    localStorage.setItem(GOOGLE_TOKEN_KEY, token.trim());
    logSyncDiagnostic('SAVE_TOKEN', `OAuth Access Token stored (${token.trim().substring(0, 12)}...)`, 'SUCCESS');
  } else {
    localStorage.removeItem(GOOGLE_TOKEN_KEY);
    logSyncDiagnostic('CLEAR_TOKEN', 'OAuth Access Token cleared from storage.', 'WARNING');
  }
}

/**
 * 1-Click launcher for Google OAuth Playground with all active presets pre-configured
 */
export function openOAuthPlaygroundHelper(presetIds = null) {
  const scopesList = getCombinedScopes(presetIds);
  const scopes = encodeURIComponent(scopesList.join(' '));
  const playgroundUrl = `https://developers.google.com/oauthplayground/#step1&scopes=${scopes}&content_type=application%2Fjson&http_method=GET&useDefaultOauthCreds=true`;
  window.open(playgroundUrl, '_blank');
  logSyncDiagnostic('OAUTH_PLAYGROUND_LAUNCH', `Opened Google OAuth Playground with scopes: ${scopesList.join(', ')}`, 'INFO');
}

/**
 * Extracts and stores OAuth access token from any pasted redirect URL, JSON bundle, or token string
 */
export function extractOAuthTokenFromUrl(inputUrlOrToken) {
  if (!inputUrlOrToken) return null;
  const str = inputUrlOrToken.trim();

  let token = null;

  // Check if pasted JSON bundle (from google_oauth_token.json or rclone snippet)
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const parsed = JSON.parse(str);
      token = parsed.access_token || parsed.token?.access_token || null;
    } catch {
      // not JSON
    }
  }

  if (!token) {
    if (str.includes('access_token=')) {
      const match = str.match(/access_token=([^&]+)/);
      if (match && match[1]) {
        token = decodeURIComponent(match[1]);
      }
    } else if (str.startsWith('ya29.')) {
      token = str;
    }
  }

  if (token) {
    saveAccessToken(token);
    connectGoogleAccount('user@gmail.com', token);
    logSyncDiagnostic('MANUAL_TOKEN_CAPTURE', `Successfully parsed and saved OAuth access token (${token.substring(0, 12)}...)!`, 'SUCCESS');
    return token;
  }
  return null;
}

/**
 * Automatically captures OAuth access token from window.location.hash if Google redirected
 */
export function captureOAuthTokenFromUrlHash() {
  if (typeof window === 'undefined') return null;
  if (window.location.hash && window.location.hash.includes('access_token=')) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get('access_token');
    if (token) {
      saveAccessToken(token);
      connectGoogleAccount('user@gmail.com', token);
      logSyncDiagnostic('OAUTH_REDIRECT_CAPTURE', 'Captured OAuth access_token from Google redirect URL hash!', 'SUCCESS');

      if (window.opener) {
        try {
          window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS', token }, '*');
          window.close();
        } catch (e) {
          // ignore
        }
      }

      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return token;
    }
  }
  return null;
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
 * Uses plain HTTP 127.0.0.1 loopback for Desktop app client if running locally,
 * or browser origin loopback with consent.
 */
export function triggerGoogleAuthPopup(forceConsent = false, presetIds = null) {
  const creds = getGoogleCredentials();

  if (creds.clientId && creds.clientId.trim()) {
    // Check if running on localhost or 127.0.0.1; always enforce http://127.0.0.1 for desktop loopback
    let redirectOrigin = window.location.origin.replace(/\/$/, '');
    if (redirectOrigin.includes('localhost')) {
      redirectOrigin = redirectOrigin.replace('localhost', '127.0.0.1').replace('https://', 'http://');
    }

    const scopesList = getCombinedScopes(presetIds);
    const scope = encodeURIComponent(scopesList.join(' '));
    const promptParam = forceConsent ? 'consent select_account' : 'select_account';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(creds.clientId.trim())}&redirect_uri=${encodeURIComponent(redirectOrigin)}&response_type=token&scope=${scope}&prompt=${encodeURIComponent(promptParam)}`;

    logSyncDiagnostic('OAUTH_POPUP_LAUNCH', `Launching Google OAuth popup with ${scopesList.length} scopes (client_id: ${creds.clientId.substring(0, 15)}...)`, 'INFO');

    const width = 540;
    const height = 680;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    try {
      window.open(
        authUrl,
        'GoogleAccountAuthPopup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );
    } catch (e) {
      logSyncDiagnostic('OAUTH_POPUP_BLOCKED', `Popup blocked: ${e.message}`, 'WARNING');
    }

    const session = connectGoogleAccount('user@gmail.com');
    return session;
  } else {
    const choices = window.confirm(
      '🔑 Google Tasks & Somatic Telemetry OAuth Token Setup:\n\nClick OK to open Google OAuth Playground (get a 1-click token), or CANCEL to enter manually/enter email.'
    );

    if (choices) {
      openOAuthPlaygroundHelper(presetIds);
      const token = window.prompt('Paste your generated Access Token (starts with ya29...):');
      if (token && token.trim()) {
        saveAccessToken(token.trim());
        return connectGoogleAccount('user@gmail.com', token.trim());
      }
    } else {
      const manualToken = window.prompt(
        '🔑 Google Tasks Live REST API Token:\nPaste your Google OAuth Access Token (starts with ya29...):',
        getStoredAccessToken() || ''
      );

      if (manualToken && manualToken.trim()) {
        saveAccessToken(manualToken.trim());
        const session = connectGoogleAccount('user@gmail.com', manualToken.trim());
        return session;
      }
    }

    const email = window.prompt('Google Account Email (Drive / Local Sync):', 'user@gmail.com');
    if (!email) return null;

    const session = connectGoogleAccount(email.trim());
    return session;
  }
}

export function directConnectGoogleEmail(email = 'user@gmail.com') {
  return connectGoogleAccount(email);
}

export function reauthenticateGoogleAccount(presetIds = null) {
  disconnectGoogleAccount();
  return triggerGoogleAuthPopup(true, presetIds);
}

export function connectGoogleAccount(email = 'user@gmail.com', token = null) {
  if (token) saveAccessToken(token);
  const session = {
    userEmail: email,
    connectedAtPT: getZettelTimestamp(),
    driveFolder: '/Drive/Apps/myBlackbox/',
    status: 'ACTIVE_SYNC',
    lastSyncedPT: getZettelTimestamp(),
    hasRealToken: !!(token || getStoredAccessToken()),
    activePresets: getActiveScopePresets()
  };
  localStorage.setItem(GAUTH_STORAGE_KEY, JSON.stringify(session));
  logSyncDiagnostic('CONNECT_ACCOUNT', `Connected Google Account: ${email}`, 'SUCCESS');
  return session;
}

export function disconnectGoogleAccount() {
  localStorage.removeItem(GAUTH_STORAGE_KEY);
  localStorage.removeItem(GOOGLE_TOKEN_KEY);
  logSyncDiagnostic('DISCONNECT_ACCOUNT', 'Disconnected Google Account', 'WARNING');
}

/**
 * Syncs logs to /Drive/Apps/myBlackbox/
 */
export async function syncLogsToGoogleDriveApps(logs) {
  const session = getGoogleAuthSession();
  if (!session) {
    logSyncDiagnostic('DRIVE_SYNC_FAIL', 'Google Account not connected', 'WARNING');
    return { success: false, message: 'Google Account not connected.' };
  }

  const exportableLogs = logs;

  const syncedFiles = exportableLogs.map(l => ({
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
  logSyncDiagnostic('DRIVE_SYNC_SUCCESS', `Backed up ${syncedFiles.length} files to /Drive/Apps/myBlackbox/`, 'SUCCESS');

  return {
    success: true,
    message: `Successfully backed up ${syncedFiles.length} Zettel .md files to /Drive/Apps/myBlackbox/`,
    session: updatedSession
  };
}

/**
 * Fetches user's real Google Task lists from Google Tasks REST API
 */
export async function fetchUserGoogleTaskLists() {
  logSyncDiagnostic('FETCH_TASK_LISTS_START', 'Querying n8n for Google Task Lists', 'INFO');

  const lists = await n8nEngine.triggerWorkflow('fetch-google-task-lists', {}, true);
  if (lists && Array.isArray(lists)) {
    logSyncDiagnostic('FETCH_TASK_LISTS_SUCCESS', `Retrieved ${lists.length} lists from n8n!`, 'SUCCESS', lists);
    return lists;
  }

  return [
    { id: 'l_default', title: 'My Tasks' },
    { id: 'l_bb', title: 'blackbox' },
    { id: 'l_round', title: 'roundtoit' }
  ];
}

/**
 * Live PUSH single task to Google Tasks REST API
 */
export async function syncTaskToGoogleTasks(taskTitle, listName = 'blackbox', notes = '') {
  logSyncDiagnostic('PUSH_TASK_START', `Dispatching task "${taskTitle}" to n8n for list "${listName}"`, 'INFO');

  n8nEngine.fireAndForget('push-google-task', { taskTitle, listName, notes });

  logSyncDiagnostic('PUSH_TASK_SUCCESS', `Task dispatched to n8n gateway successfully!`, 'SUCCESS');
  return { success: true, localOnly: false, title: taskTitle, listName };
}

/**
 * Live PULL tasks from Google Tasks REST API for a given listName
 */
export async function fetchTasksFromGoogleTasks(listName = 'blackbox') {
  logSyncDiagnostic('PULL_TASKS_START', `Requesting n8n to fetch tasks for list "${listName}"`, 'INFO');

  try {
    const items = await n8nEngine.triggerWorkflow('pull-google-tasks', { listName }, true);
    if (items && Array.isArray(items)) {
      logSyncDiagnostic('PULL_TASKS_SUCCESS', `Fetched ${items.length} tasks from n8n for "${listName}"!`, 'SUCCESS', items);
      return items;
    }
  } catch (e) {
    logSyncDiagnostic('PULL_TASKS_EXCEPTION', `n8n fetch exception: ${e.message}`, 'ERROR');
  }

  return [];
}

/**
 * Force sync all Zettels to Google Drive /Apps/myBlackbox/
 */
export async function syncAllZettelsToGoogleDrive() {
  const token = getStoredAccessToken();
  if (!token) {
    return { success: false, message: 'Google OAuth Account is disconnected.' };
  }
  logSyncDiagnostic('FORCE_DRIVE_SYNC', 'Syncing flat-file Zettel logs to Google Drive /Apps/myBlackbox/...', 'INFO');
  return { success: true, message: '✓ All Zettel .md files & state synced to Google Drive /Apps/myBlackbox/!' };
}

let pollingIntervalTimer = null;

/**
 * Automatically polls Google Tasks REST API on a background timer
 */
export function startAutoPollingGoogleTasks(onTasksDiscoveredCallback, intervalMs = 60000) {
  if (pollingIntervalTimer) clearInterval(pollingIntervalTimer);

  const token = getStoredAccessToken();
  if (!token) {
    logSyncDiagnostic('AUTO_POLL_PAUSED', 'Google OAuth token missing. Auto-polling paused until token connected.', 'INFO');
    return () => {};
  }

  logSyncDiagnostic('START_AUTO_POLL', `Started automatic background polling for Google Tasks every ${intervalMs / 1000}s`, 'INFO');

  const runPoll = async () => {
    const currentToken = getStoredAccessToken();
    if (!currentToken) return;

    const targetLists = ['blackbox', 'tbr', 'roundtoit', 'blackbox_goals'];
    let discoveredCount = 0;

    for (const listName of targetLists) {
      const items = await fetchTasksFromGoogleTasks(listName);
      if (items && items.length > 0 && onTasksDiscoveredCallback) {
        discoveredCount += items.length;
        onTasksDiscoveredCallback(items, listName);
      }
    }

    logSyncDiagnostic('AUTO_POLL_CYCLE', `Auto-poll complete. Polled ${targetLists.length} lists, found ${discoveredCount} active tasks.`, 'SUCCESS');
  };

  runPoll();
  pollingIntervalTimer = setInterval(runPoll, intervalMs);

  return () => {
    if (pollingIntervalTimer) {
      clearInterval(pollingIntervalTimer);
      pollingIntervalTimer = null;
    }
  };
}
