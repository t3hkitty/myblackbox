/**
 * IFTTT (If This Then That) Webhook Integration Engine
 * Dispatches real-time outbound webhooks to IFTTT Maker Service for smart home & app automation.
 * Generates inbound cURL & Webhook triggers for iOS Shortcuts, Alexa, and Tasker.
 */

const IFTTT_CONFIG_KEY = 'blackbox_ifttt_config_v1';

export const DEFAULT_IFTTT_CONFIG = {
  webhookKey: '',
  eventName: 'blackbox_microlog',
  autoDispatchEnabled: true
};

export function getIftttConfig() {
  const data = localStorage.getItem(IFTTT_CONFIG_KEY);
  if (!data) return DEFAULT_IFTTT_CONFIG;
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_IFTTT_CONFIG;
  }
}

export function saveIftttConfig(config) {
  localStorage.setItem(IFTTT_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Dispatches a telemetry event payload to IFTTT Maker Webhook endpoint
 * Endpoint: https://maker.ifttt.com/trigger/{event_name}/with/key/{webhook_key}
 */
export async function dispatchIftttEvent(entry) {
  const config = getIftttConfig();
  if (!config.webhookKey || !config.webhookKey.trim() || !config.autoDispatchEnabled) {
    return { dispatched: false, reason: 'No IFTTT Webhook key configured.' };
  }

  const eventName = config.eventName || 'blackbox_microlog';
  const url = `https://maker.ifttt.com/trigger/${eventName}/with/key/${config.webhookKey.trim()}`;

  const payload = {
    value1: `${entry.zettelId} PT - ${entry.title}`,
    value2: entry.mood ? `${entry.mood.emoji} ${entry.mood.label}` : (entry.tags ? entry.tags.join(' ') : entry.type),
    value3: (entry.content || '').substring(0, 250)
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { dispatched: true, message: `Dispatched to IFTTT event "${eventName}"` };
    } else {
      return { dispatched: false, message: `IFTTT Webhook returned status ${response.status}` };
    }
  } catch (err) {
    console.warn('IFTTT Webhook dispatch failed (Network / CORS)', err);
    return { dispatched: false, message: `Network error: ${err.message}` };
  }
}

/**
 * Test IFTTT Webhook ping
 */
export async function testIftttWebhook(webhookKey, eventName = 'blackbox_microlog') {
  if (!webhookKey || !webhookKey.trim()) {
    return { success: false, message: 'Please enter an IFTTT Webhook Key.' };
  }

  const url = `https://maker.ifttt.com/trigger/${eventName.trim()}/with/key/${webhookKey.trim()}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value1: 'Test Event from myBlackbox Microlog Protocol',
        value2: '😍 Rad (Test State)',
        value3: 'Testing IFTTT webhook integration'
      })
    });

    if (response.ok) {
      return { success: true, message: `⚡ Successfully dispatched test ping to IFTTT event "${eventName}"!` };
    } else {
      return { success: false, message: `🔴 IFTTT Error: Status ${response.status}` };
    }
  } catch (err) {
    return { success: false, message: `🔴 IFTTT Network error: ${err.message}` };
  }
}
