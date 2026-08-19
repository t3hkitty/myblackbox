import { n8nEngine } from '@lorik/shared-kawaii-ui';

/**
 * N8N Smart Home & Automation Dispatch Engine
 * Replaces old IFTTT logic with local n8n gateway
 */

const IFTTT_CONFIG_KEY = 'blackbox_ifttt_config_v1';

export const DEFAULT_IFTTT_CONFIG = {
  webhookKey: 'n8n-smart-home-webhook-id', // Re-purposed to hold n8n Webhook ID
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

export async function dispatchIftttEvent(entry) {
  const config = getIftttConfig();
  if (!config.autoDispatchEnabled) {
    return { dispatched: false, reason: 'N8N Automation Dispatch disabled.' };
  }

  // Instead of pushing to maker.ifttt.com, we push to local n8n!
  const payload = {
    value1: `${entry.zettelId} PT - ${entry.title}`,
    value2: entry.mood ? `${entry.mood.emoji} ${entry.mood.label}` : (entry.tags ? entry.tags.join(' ') : entry.type),
    value3: (entry.content || '').substring(0, 250),
    originalEntry: entry
  };

  const webhookId = config.webhookKey || 'n8n-smart-home-webhook-id';
  
  n8nEngine.fireAndForget(webhookId, payload);
  return { dispatched: true, reason: 'Dispatched via local n8n gateway instead of IFTTT' };
}
