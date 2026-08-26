import { n8nEngine } from '@lorik/shared-kawaii-ui';

const CUSTOM_WEBHOOK_CONFIG_KEY = 'blackbox_custom_webhook_config_v1';

export const DEFAULT_CUSTOM_WEBHOOK_CONFIG = {
  url: 'http://localhost:5678/webhook/mbb-telemetry',
  autoDispatch: true,
  secretAuthHeader: ''
};

export function getCustomWebhookConfig() {
  const data = localStorage.getItem(CUSTOM_WEBHOOK_CONFIG_KEY);
  if (!data) return DEFAULT_CUSTOM_WEBHOOK_CONFIG;
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_CUSTOM_WEBHOOK_CONFIG;
  }
}

export function saveCustomWebhookConfig(config) {
  localStorage.setItem(CUSTOM_WEBHOOK_CONFIG_KEY, JSON.stringify(config));
  // Update the shared n8n Engine base URL to match if they change it
  if (config.url) {
    const urlObj = new URL(config.url);
    const baseUrl = urlObj.origin + urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/'));
    n8nEngine.config = { baseUrl };
  }
}

export async function dispatchCustomWebhook(entry) {
  const config = getCustomWebhookConfig();
  if (!config.autoDispatch) {
    return { dispatched: false, reason: 'Auto-dispatch disabled.' };
  }

  const payload = {
    event: 'myblackbox_telemetry',
    source: 'myBlackbox Microlog v1.0',
    timestamp: entry.zettelId || new Date().toISOString(),
    title: entry.title || '',
    type: entry.type || 'microlog',
    tags: entry.tags || [],
    content: entry.content || '',
    mood: entry.mood || null
  };

  // We extract the webhook ID from the configured URL (e.g., the last path segment)
  const webhookId = config.url.split('/').pop() || 'mbb-telemetry';

  n8nEngine.fireAndForget(webhookId, payload);
  return { dispatched: true, reason: 'Dispatched via n8n Engine' };
}

export const testCustomWebhookPing = async () => true;
