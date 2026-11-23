/**
 * 🐾 Telemeowtrics Input Adapters
 * Modular capture adapters for Tasker/MacroDroid `Send Intent`, `kittlibr://capture`,
 * `mbb://ticker/<slug>`, `mbb://state/<state_name>`, and somatic telemetry:
 * - Fitness & activity summaries (Google Fit / Health Connect equivalent)
 * - Timeline / location / geofence logs
 * - Contact & relationship context
 * 
 * Appends flat .md notes with YAML frontmatter and Zettelkasten-ID (`YYYYMMDD-HHMM` Pacific Time)
 * into `meow-vault/inbox` or `meow-vault/telemetry`, queuing cleanly offline.
 */

import { AnyMDVaultStorageAPI, IntentEvent } from './host/AnyMDExtensionHostTypes';
import { mbbEngineStore } from './mbbEngine';

export interface TelemeowtricsPayload {
  source?: string; // 'tasker' | 'macrodroid' | 'clipboard' | 'broadcast' | 'deeplink' | 'somatic'
  title?: string;
  body?: string;
  tags?: string[];
  slug?: string;
  state?: string;
  category?: 'fitness' | 'timeline' | 'contacts' | string;
  meta?: Record<string, unknown>;
}

export class TelemeowtricsAdapter {
  private storage: AnyMDVaultStorageAPI;
  private offlineQueue: TelemeowtricsPayload[] = [];

  constructor(storage: AnyMDVaultStorageAPI) {
    this.storage = storage;
    this.loadQueue();
  }

  private loadQueue() {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem('telemeowtrics_offline_queue');
      if (raw) {
        this.offlineQueue = JSON.parse(raw);
      }
    } catch {
      this.offlineQueue = [];
    }
  }

  private saveQueue() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem('telemeowtrics_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (e) {
      console.warn('Failed to save offline queue:', e);
    }
  }

  /**
   * Generates Zettelkasten-ID in Pacific Time (YYYYMMDD-HHMM)
   */
  public generateZettelId(): string {
    return this.storage.getPacificTimestamp();
  }

  /**
   * Main router for incoming intents & hooks.
   */
  public async handleIntent(event: IntentEvent): Promise<void> {
    const { protocol, action, slug, stateName, payload } = event;

    // 1. Ticker URI: mbb://ticker/<slug>
    if (action === 'ticker' || (protocol === 'mbb' && slug && action === 'ticker')) {
      const tickerSlug = slug || (payload.slug as string) || 'generic';
      await this.handleTickerIntent(tickerSlug, payload);
      return;
    }

    // 2. State URI: mbb://state/<state_name>
    if (action === 'state' || (protocol === 'mbb' && stateName)) {
      const stateToEmit = stateName || slug || (payload.state as string) || 'default';
      this.handleStateIntent(stateToEmit);
      return;
    }

    // 3. Somatic Telemetry URI / Action: mbb://somatic/<category> or action === 'somatic'
    if (action === 'somatic' || (protocol === 'mbb' && slug && (slug === 'fitness' || slug === 'timeline' || slug === 'contacts'))) {
      const category = (slug || payload.category || 'fitness') as string;
      await this.handleSomaticTelemetry(category, payload);
      return;
    }

    // 4. Kittlibr capture: kittlibr://capture
    if (protocol === 'kittlibr' || action === 'capture') {
      await this.captureToVaultNote({
        source: 'kittlibr',
        title: (payload.title as string) || (payload.book as string) || 'Kittlibr Note',
        body: (payload.body as string) || (payload.quote as string) || (payload.text as string) || '',
        tags: ['kittlibr', 'capture'],
        meta: payload
      });
      return;
    }

    // 5. Unified firehose / Tasker broadcast: org.anymd.broadcast.UNIFIED_FIREHOSE
    if (action === 'org.anymd.broadcast.UNIFIED_FIREHOSE' || action === 'org.anymd.broadcast.TASKER_WEBHOOK') {
      const text = (payload.text as string) || (payload.message as string) || JSON.stringify(payload);
      await this.captureToVaultNote({
        source: 'telemeowtrics-firehose',
        title: (payload.title as string) || `Broadcast Capture`,
        body: text,
        tags: ['telemeowtrics', 'firehose'],
        meta: payload
      });
      return;
    }

    // Default fallback capture
    await this.captureToVaultNote({
      source: 'intent-router',
      title: (payload.title as string) || `Capture ${action}`,
      body: JSON.stringify(payload, null, 2),
      tags: ['telemeowtrics'],
      meta: payload
    });
  }

  /**
   * Handles somatic telemetry (fitness, timeline, contacts) into meow-vault/telemetry
   */
  public async handleSomaticTelemetry(category: string, payload: Record<string, unknown>): Promise<void> {
    const zettelId = this.generateZettelId();
    const notePath = `meow-vault/telemetry/${zettelId}-somatic-${category.toLowerCase()}.md`;
    const title = `🐾 Somatic Telemetry: ${category.charAt(0).toUpperCase() + category.slice(1)} (${zettelId})`;

    const lines = [
      `# ${title}`,
      '',
      `- **Captured At (PT)**: \`${zettelId}\``,
      `- **Category**: \`${category}\``,
      `- **Source**: \`${(payload.source as string) || 'telemeowtrics-intent'}\``,
      ''
    ];

    if (category.toLowerCase() === 'fitness') {
      lines.push(`### 🏃 Fitness Metrics`);
      if (payload.steps !== undefined) lines.push(`- **Steps**: ${payload.steps}`);
      if (payload.active_minutes !== undefined) lines.push(`- **Active Minutes**: ${payload.active_minutes}`);
      if (payload.calories !== undefined) lines.push(`- **Calories**: ${payload.calories} kcal`);
      lines.push('');
    } else if (category.toLowerCase() === 'timeline') {
      lines.push(`### 📍 Timeline / Geofence`);
      if (payload.geofence) lines.push(`- **Geofence Zone**: \`${payload.geofence}\``);
      if (payload.coords) lines.push(`- **Coordinates**: \`${payload.coords}\``);
      lines.push('');
    } else if (category.toLowerCase() === 'contacts') {
      lines.push(`### 👥 Contact Telemetry`);
      if (payload.name) lines.push(`- **Contact**: \`${payload.name}\``);
      if (payload.interaction) lines.push(`- **Interaction**: \`${payload.interaction}\``);
      lines.push('');
    }

    lines.push('### 🧬 Raw Telemetry Data');
    lines.push('```json');
    lines.push(JSON.stringify(payload, null, 2));
    lines.push('```');

    await this.storage.writeFile(
      notePath,
      lines.join('\n'),
      {
        title,
        created_pt: zettelId,
        type: `telemeowtrics-${category.toLowerCase()}`,
        category: category.toLowerCase(),
        tags: ['somatic', 'telemeowtrics', category.toLowerCase()],
        source: (payload.source as string) || 'telemeowtrics',
        vault_area: 'telemetry',
        payload
      }
    );
    console.log(`[Telemeowtrics] Somatic note written: ${notePath}`);
  }

  /**
   * Handles mbb://ticker/<slug> by finding matching ticker or creating a new one and incrementing tick.
   */
  public async handleTickerIntent(slug: string, payload: Record<string, unknown>): Promise<void> {
    const tasks = mbbEngineStore.getTasks();
    const existing = tasks.find((t) => t.type === 'ticker' && (t.title.toLowerCase().includes(slug.toLowerCase()) || t.id.includes(slug)));

    if (existing) {
      mbbEngineStore.tick(existing.id);
    } else {
      const newTask = mbbEngineStore.addTask({
        title: `💊//ticker/${slug}`,
        type: 'ticker',
        priority: 1,
        notes: `Ticker created via Telemeowtrics intent slug: ${slug}`,
        metadata: {
          auto_stop_on: ['sleep']
        }
      });
      mbbEngineStore.tick(newTask.id);
    }

    // Also persist log to vault inbox note
    const zettelId = this.generateZettelId();
    const notePath = `meow-vault/inbox/ticker-${slug}-${zettelId}.md`;
    await this.storage.writeFile(
      notePath,
      `Ticked slug \`${slug}\` via Telemeowtrics intent at ${new Date().toISOString()}.\nPayload: ${JSON.stringify(payload)}`,
      {
        title: `Ticker Tick: ${slug}`,
        created_pt: zettelId,
        type: 'ticker-event',
        slug,
        tags: ['telemeowtrics', 'ticker', slug]
      }
    );
  }

  /**
   * Handles mbb://state/<state_name> by cascading auto-stop to matching tickers.
   */
  public handleStateIntent(stateName: string): void {
    console.log(`[Telemeowtrics] Emitting state intent: ${stateName}`);
    mbbEngineStore.handleEmittedState([stateName], `Telemeowtrics State Intent (${stateName})`);
  }

  /**
   * Saves captured text/context into a flat Markdown vault note with Zettelkasten-ID.
   */
  public async captureToVaultNote(entry: TelemeowtricsPayload): Promise<void> {
    try {
      const zettelId = this.generateZettelId();
      const filename = `${zettelId}-${(entry.source || 'note').toLowerCase()}.md`;
      const notePath = `meow-vault/inbox/${filename}`;

      const frontmatter: Record<string, unknown> = {
        title: entry.title || `Capture ${zettelId}`,
        created_pt: zettelId,
        tags: entry.tags || ['inbox'],
        source: entry.source || 'telemeowtrics',
        status: 'draft',
        vault_area: 'inbox',
        ...(entry.meta || {})
      };

      await this.storage.writeFile(notePath, entry.body || '', frontmatter);
      console.log(`[Telemeowtrics] Captured note to vault: ${notePath}`);

      // Process any queued offline items
      await this.flushOfflineQueue();
    } catch (err) {
      console.warn('[Telemeowtrics] Failed to write note directly, queuing offline:', err);
      this.offlineQueue.push(entry);
      this.saveQueue();
    }
  }

  private async flushOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;
    const items = [...this.offlineQueue];
    this.offlineQueue = [];
    this.saveQueue();

    for (const item of items) {
      await this.captureToVaultNote(item);
    }
  }
}
