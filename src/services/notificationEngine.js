/**
 * Native Browser Web Notifications Engine & TTS Voice Announcer
 * Provides OS/Chrome native desktop notifications and Text-To-Speech (TTS) audio announcements
 * for Popcorn time notices, meeting snoozes, work shift alerts, and hydration goals.
 */

const NOTIFICATION_TOGGLE_KEY = 'blackbox_notifications_enabled_v1';
const TTS_MUTE_KEY = 'blackbox_tts_mute_v1';

export function getNotificationEnabledState() {
  const stored = localStorage.getItem(NOTIFICATION_TOGGLE_KEY);
  if (stored === null) return false;
  return stored === 'true';
}

export function setNotificationEnabledState(enabled) {
  localStorage.setItem(NOTIFICATION_TOGGLE_KEY, String(enabled));
}

export async function toggleNativeNotifications() {
  const currentState = getNotificationEnabledState();
  const newState = !currentState;

  if (newState) {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Browser Notification permission was denied. Please allow notifications in browser site settings.');
          setNotificationEnabledState(false);
          return false;
        }
      }
    } else {
      alert('Web Notifications are not supported in this browser.');
      setNotificationEnabledState(false);
      return false;
    }
  }

  setNotificationEnabledState(newState);
  return newState;
}

export function sendNativeNotification(title, body, icon = '🔔') {
  const isEnabled = getNotificationEnabledState();
  if (!isEnabled) return;

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`${icon} ${title}`, {
        body: body,
        dir: 'auto'
      });
    } catch (e) {
      console.warn('Native notification failed', e);
    }
  }
}

export function getTtsMuteState() {
  const stored = localStorage.getItem(TTS_MUTE_KEY);
  return stored === 'true';
}

export function setTtsMuteState(muted) {
  localStorage.setItem(TTS_MUTE_KEY, String(muted));
}

export function toggleTtsMute() {
  const muted = !getTtsMuteState();
  setTtsMuteState(muted);
  return muted;
}

export function speakTtsAnnouncement(text, title = 'Popcorn Time Notice') {
  // Always send corresponding browser text notification on browser channel!
  sendNativeNotification(title, text, '🍿');

  const isMuted = getTtsMuteState();
  if (isMuted) return;

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS SpeechSynthesis failed', e);
    }
  }
}
