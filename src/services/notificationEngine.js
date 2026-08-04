/**
 * Native Browser Web Notifications Engine
 * Provides OS/Chrome native desktop notifications for task timers, hydration alerts, and due items.
 * Supports 1-click master toggle on the navbar dashboard.
 */

const NOTIFICATION_TOGGLE_KEY = 'blackbox_notifications_enabled_v1';

export function getNotificationEnabledState() {
  const stored = localStorage.getItem(NOTIFICATION_TOGGLE_KEY);
  if (stored === null) return false; // Off by default until user toggles ON
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
          alert('Browser Notification permission was denied. Please allow notifications in Chrome site settings.');
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
