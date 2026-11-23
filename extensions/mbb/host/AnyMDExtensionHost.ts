/**
 * 🐱 AnyMD Extension Host Implementation
 * Manages extension lifecycles, vault storage abstraction (localStorage fallback or native SAF),
 * UI mount slots, and protocol/broadcast event routing.
 */

import {
  AnyMDExtensionContext,
  AnyMDExtensionBundle,
  AnyMDVaultStorageAPI,
  AnyMDEventRouterAPI,
  UIMountDescriptor,
  UIMountSlotId,
  VaultFile,
  VaultStorageQuery,
  IntentEvent,
  IntentListener
} from './AnyMDExtensionHostTypes';

export class AnyMDLocalVaultStorage implements AnyMDVaultStorageAPI {
  private vaultPrefix: string;
  private watchers: Map<string, Array<(event: 'created' | 'updated' | 'deleted', file: VaultFile) => void>> = new Map();

  constructor(vaultPrefix = 'meow-vault') {
    this.vaultPrefix = vaultPrefix;
  }

  public getPacificTimestamp(date = new Date()): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(date);
    const m: Record<string, string> = {};
    for (const p of parts) {
      m[p.type] = p.value;
    }
    return `${m.year}${m.month}${m.day}-${m.hour}${m.minute}`;
  }

  private getKey(path: string): string {
    const clean = path.replace(/^\/+/, '');
    return `anymd_vault:${clean.startsWith(this.vaultPrefix) ? clean : `${this.vaultPrefix}/${clean}`}`;
  }

  private parseMarkdown(rawContent: string): { frontmatter: Record<string, unknown>; content: string } {
    const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
    const match = rawContent.match(FRONTMATTER_REGEX);
    let frontmatter: Record<string, unknown> = {};
    let content = rawContent;

    if (match) {
      content = rawContent.slice(match[0].length).trim();
      const yamlStr = match[1];
      for (const line of yamlStr.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const colIdx = trimmed.indexOf(':');
        if (colIdx === -1) continue;
        const key = trimmed.slice(0, colIdx).trim();
        let val: any = trimmed.slice(colIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        } else if (val.startsWith('[') && val.endsWith(']')) {
          val = val.slice(1, -1).split(',').map((s: string) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
        } else if (val === 'true') {
          val = true;
        } else if (val === 'false') {
          val = false;
        } else if (!isNaN(Number(val)) && val !== '') {
          val = Number(val);
        }
        frontmatter[key] = val;
      }
    }
    return { frontmatter, content };
  }

  private serializeMarkdown(content: string, frontmatter?: Record<string, unknown>): string {
    if (!frontmatter || Object.keys(frontmatter).length === 0) {
      return content;
    }
    const lines: string[] = [];
    for (const [k, v] of Object.entries(frontmatter)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        lines.push(`${k}: [${v.map(i => typeof i === 'string' ? `"${i}"` : String(i)).join(', ')}]`);
      } else if (typeof v === 'string') {
        lines.push(`${k}: "${v}"`);
      } else {
        lines.push(`${k}: ${v}`);
      }
    }
    return `---\n${lines.join('\n')}\n---\n\n${content}`;
  }

  public async readFile(path: string): Promise<VaultFile | null> {
    if (typeof localStorage === 'undefined') return null;
    const key = this.getKey(path);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { frontmatter, content } = this.parseMarkdown(raw);
    return {
      path,
      filename: path.split('/').pop() || path,
      frontmatter,
      content,
      rawContent: raw,
      updatedAt: (frontmatter.updated_at as string) || new Date().toISOString()
    };
  }

  public async writeFile(path: string, content: string, frontmatter: Record<string, unknown> = {}): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const key = this.getKey(path);
    const isNew = !localStorage.getItem(key);
    const enrichedFrontmatter = {
      ...frontmatter,
      updated_at: new Date().toISOString()
    };
    const raw = this.serializeMarkdown(content, enrichedFrontmatter);
    localStorage.setItem(key, raw);

    const vaultFile: VaultFile = {
      path,
      filename: path.split('/').pop() || path,
      frontmatter: enrichedFrontmatter,
      content,
      rawContent: raw,
      updatedAt: enrichedFrontmatter.updated_at
    };

    // Trigger watchers
    for (const [folder, listeners] of this.watchers.entries()) {
      if (path.includes(folder) || folder === '*') {
        listeners.forEach(cb => cb(isNew ? 'created' : 'updated', vaultFile));
      }
    }
  }

  public async deleteFile(path: string): Promise<boolean> {
    if (typeof localStorage === 'undefined') return false;
    const key = this.getKey(path);
    const existed = localStorage.getItem(key) !== null;
    if (existed) {
      const old = await this.readFile(path);
      localStorage.removeItem(key);
      if (old) {
        for (const [folder, listeners] of this.watchers.entries()) {
          if (path.includes(folder) || folder === '*') {
            listeners.forEach(cb => cb('deleted', old));
          }
        }
      }
      return true;
    }
    return false;
  }

  public async listFiles(folder = ''): Promise<VaultFile[]> {
    if (typeof localStorage === 'undefined') return [];
    const files: VaultFile[] = [];
    const prefix = `anymd_vault:${this.vaultPrefix}/${folder}`.replace(/\/+$/, '');
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const relPath = k.replace(`anymd_vault:`, '');
          const { frontmatter, content } = this.parseMarkdown(raw);
          files.push({
            path: relPath,
            filename: relPath.split('/').pop() || relPath,
            frontmatter,
            content,
            rawContent: raw,
            updatedAt: (frontmatter.updated_at as string) || new Date().toISOString()
          });
        }
      }
    }
    return files;
  }

  public async queryFiles(query: VaultStorageQuery): Promise<VaultFile[]> {
    const all = await this.listFiles(query.folder || '');
    return all.filter(file => {
      if (query.status && file.frontmatter.status !== query.status) return false;
      if (query.type && file.frontmatter.type !== query.type) return false;
      if (query.tags && query.tags.length > 0) {
        const fTags = (file.frontmatter.tags as string[]) || [];
        if (!query.tags.some(t => fTags.includes(t))) return false;
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        const matchesTitle = String(file.frontmatter.title || '').toLowerCase().includes(s);
        const matchesContent = file.content.toLowerCase().includes(s);
        if (!matchesTitle && !matchesContent) return false;
      }
      return true;
    });
  }

  public async readSidecar(path: string): Promise<Record<string, unknown> | null> {
    const sidecarPath = `.anymd/${path}.json`;
    const f = await this.readFile(sidecarPath);
    if (!f) return null;
    try {
      return JSON.parse(f.content);
    } catch {
      return null;
    }
  }

  public async writeSidecar(path: string, data: Record<string, unknown>): Promise<void> {
    const sidecarPath = `.anymd/${path}.json`;
    await this.writeFile(sidecarPath, JSON.stringify(data, null, 2), { sidecar_for: path });
  }

  public watch(folder: string, callback: (event: 'created' | 'updated' | 'deleted', file: VaultFile) => void): () => void {
    if (!this.watchers.has(folder)) {
      this.watchers.set(folder, []);
    }
    this.watchers.get(folder)!.push(callback);
    return () => {
      const list = this.watchers.get(folder) || [];
      this.watchers.set(folder, list.filter(cb => cb !== callback));
    };
  }
}

export class AnyMDEventRouter implements AnyMDEventRouterAPI {
  private protocolHandlers: Map<string, Set<IntentListener>> = new Map();
  private broadcastHandlers: Map<string, Set<IntentListener>> = new Map();

  public registerProtocol(protocol: string, handler: IntentListener): () => void {
    const protoClean = protocol.toLowerCase().replace(/:$/, '');
    if (!this.protocolHandlers.has(protoClean)) {
      this.protocolHandlers.set(protoClean, new Set());
    }
    this.protocolHandlers.get(protoClean)!.add(handler);
    return () => {
      this.protocolHandlers.get(protoClean)?.delete(handler);
    };
  }

  public registerBroadcast(action: string, handler: IntentListener): () => void {
    if (!this.broadcastHandlers.has(action)) {
      this.broadcastHandlers.set(action, new Set());
    }
    this.broadcastHandlers.get(action)!.add(handler);
    return () => {
      this.broadcastHandlers.get(action)?.delete(handler);
    };
  }

  public async dispatch(event: IntentEvent): Promise<void> {
    if (event.protocol) {
      const handlers = this.protocolHandlers.get(event.protocol.toLowerCase().replace(/:$/, ''));
      if (handlers) {
        for (const h of handlers) {
          await h(event);
        }
      }
    }
    if (event.action) {
      const handlers = this.broadcastHandlers.get(event.action);
      if (handlers) {
        for (const h of handlers) {
          await h(event);
        }
      }
    }
  }

  public async dispatchUri(uri: string): Promise<boolean> {
    try {
      const cleanUri = uri.trim();
      let protocol = '';
      if (cleanUri.startsWith('mbb://')) protocol = 'mbb';
      else if (cleanUri.startsWith('kittlibr://')) protocol = 'kittlibr';
      else if (cleanUri.startsWith('web+mbb://')) protocol = 'web+mbb';
      else return false;

      const dummyUrl = cleanUri.replace(/^[a-z0-9+]+:\/\//i, 'http://host/');
      const parsed = new URL(dummyUrl);
      const segments = parsed.pathname.split('/').filter(Boolean);
      const action = parsed.host !== 'host' ? parsed.host : (segments[0] || 'default');
      const slug = parsed.host !== 'host' ? segments[0] : (segments[1] || undefined);

      const params: Record<string, unknown> = {};
      parsed.searchParams.forEach((v, k) => {
        params[k] = v;
      });

      const event: IntentEvent = {
        protocol,
        action,
        slug,
        stateName: action === 'state' ? slug : undefined,
        payload: params,
        rawUri: uri,
        timestamp: new Date().toISOString()
      };

      await this.dispatch(event);
      return true;
    } catch (err) {
      console.error('[AnyMDEventRouter] dispatchUri failed:', err);
      return false;
    }
  }
}

export class AnyMDExtensionHost {
  private static instance: AnyMDExtensionHost;
  public storage: AnyMDVaultStorageAPI;
  public router: AnyMDEventRouterAPI;
  private uiMounts: Map<UIMountSlotId, Map<string, UIMountDescriptor>> = new Map([
    ['quickbar', new Map()],
    ['taskboard-modal', new Map()],
    ['settings-panel', new Map()]
  ]);
  private bundles: Map<string, AnyMDExtensionBundle> = new Map();
  private enabledExtensions: Set<string> = new Set();
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.storage = new AnyMDLocalVaultStorage();
    this.router = new AnyMDEventRouter();
    this.loadState();
  }

  public static getInstance(): AnyMDExtensionHost {
    if (!AnyMDExtensionHost.instance) {
      AnyMDExtensionHost.instance = new AnyMDExtensionHost();
    }
    return AnyMDExtensionHost.instance;
  }

  private loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('anymd_enabled_extensions');
        if (raw) {
          this.enabledExtensions = new Set(JSON.parse(raw));
        } else {
          // MBB enabled by default
          this.enabledExtensions.add('org.anymd.extension.mbb');
        }
      }
    } catch {
      this.enabledExtensions.add('org.anymd.extension.mbb');
    }
  }

  private saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('anymd_enabled_extensions', JSON.stringify([...this.enabledExtensions]));
      }
    } catch (e) {
      console.warn('Failed to save extension states:', e);
    }
  }

  public registerBundle(bundle: AnyMDExtensionBundle) {
    const id = bundle.manifest.id as string;
    this.bundles.set(id, bundle);
    if (this.isExtensionEnabled(id)) {
      this.activateBundle(id);
    }
  }

  public isExtensionEnabled(extensionId: string): boolean {
    return this.enabledExtensions.has(extensionId);
  }

  public async setExtensionEnabled(extensionId: string, enabled: boolean): Promise<void> {
    if (enabled) {
      this.enabledExtensions.add(extensionId);
      this.saveState();
      await this.activateBundle(extensionId);
    } else {
      this.enabledExtensions.delete(extensionId);
      this.saveState();
      await this.deactivateBundle(extensionId);
    }
    this.notifyListeners();
  }

  private async activateBundle(extensionId: string) {
    const bundle = this.bundles.get(extensionId);
    if (!bundle) return;

    const context: AnyMDExtensionContext = {
      extensionId,
      storage: this.storage,
      router: this.router,
      registerUIMount: (descriptor: UIMountDescriptor) => {
        const slotMap = this.uiMounts.get(descriptor.slot);
        if (slotMap) {
          slotMap.set(descriptor.id, descriptor);
          this.notifyListeners();
        }
        return () => {
          slotMap?.delete(descriptor.id);
          this.notifyListeners();
        };
      },
      isEnabled: () => this.isExtensionEnabled(extensionId),
      setEnabled: (enabled) => this.setExtensionEnabled(extensionId, enabled)
    };

    try {
      await bundle.activate(context);
      console.log(`[AnyMDExtensionHost] Activated extension: ${extensionId}`);
    } catch (err) {
      console.error(`[AnyMDExtensionHost] Failed to activate extension ${extensionId}:`, err);
    }
  }

  private async deactivateBundle(extensionId: string) {
    const bundle = this.bundles.get(extensionId);
    if (!bundle) return;

    // Clean up UI mounts registered by this extension (id prefixes)
    for (const [, slotMap] of this.uiMounts.entries()) {
      for (const [mountId] of slotMap.entries()) {
        if (mountId.startsWith(extensionId)) {
          slotMap.delete(mountId);
        }
      }
    }

    try {
      await bundle.deactivate();
      console.log(`[AnyMDExtensionHost] Deactivated extension: ${extensionId}`);
    } catch (err) {
      console.error(`[AnyMDExtensionHost] Failed to deactivate extension ${extensionId}:`, err);
    }
  }

  public getUIMounts(slot: UIMountSlotId): UIMountDescriptor[] {
    const slotMap = this.uiMounts.get(slot);
    if (!slotMap) return [];
    return Array.from(slotMap.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb());
  }
}

export const anyMDExtensionHost = AnyMDExtensionHost.getInstance();
