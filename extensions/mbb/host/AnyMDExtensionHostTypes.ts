/**
 * 🐱 AnyMD Extension Host API Contracts & Types
 * Formal host interfaces for modular, toggleable extensions (extensions/mbb/)
 */

export interface VaultFile {
  path: string; // e.g. "meow-vault/tasks/20261122-1618.md"
  filename: string;
  frontmatter: Record<string, unknown>;
  content: string; // Markdown body minus frontmatter
  rawContent: string;
  updatedAt: string;
}

export interface VaultStorageQuery {
  folder?: string;
  tags?: string[];
  status?: string;
  type?: string;
  search?: string;
}

export interface AnyMDVaultStorageAPI {
  readFile(path: string): Promise<VaultFile | null>;
  writeFile(path: string, content: string, frontmatter?: Record<string, unknown>): Promise<void>;
  deleteFile(path: string): Promise<boolean>;
  listFiles(folder?: string): Promise<VaultFile[]>;
  queryFiles(query: VaultStorageQuery): Promise<VaultFile[]>;
  readSidecar(path: string): Promise<Record<string, unknown> | null>;
  writeSidecar(path: string, data: Record<string, unknown>): Promise<void>;
  watch(folder: string, callback: (event: 'created' | 'updated' | 'deleted', file: VaultFile) => void): () => void;
  getPacificTimestamp(date?: Date): string; // YYYYMMDD-HHMM in America/Los_Angeles
}

export type UIMountSlotId = 'quickbar' | 'taskboard-modal' | 'settings-panel';

export interface UIMountDescriptor {
  slot: UIMountSlotId;
  id: string;
  title: string;
  component: React.ComponentType<any>;
  order?: number;
}

export interface IntentEvent {
  protocol?: string; // 'mbb:' | 'kittlibr:' | 'broadcast:'
  action: string;    // 'ticker' | 'state' | 'capture' | 'broadcast'
  slug?: string;
  stateName?: string;
  payload: Record<string, unknown>;
  rawUri?: string;
  timestamp: string;
}

export type IntentListener = (event: IntentEvent) => void | Promise<void>;

export interface AnyMDEventRouterAPI {
  registerProtocol(protocol: string, handler: IntentListener): () => void;
  registerBroadcast(action: string, handler: IntentListener): () => void;
  dispatch(event: IntentEvent): Promise<void>;
  dispatchUri(uri: string): Promise<boolean>;
}

export interface AnyMDExtensionContext {
  extensionId: string;
  storage: AnyMDVaultStorageAPI;
  router: AnyMDEventRouterAPI;
  registerUIMount(descriptor: UIMountDescriptor): () => void;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
}

export interface AnyMDExtensionBundle {
  manifest: Record<string, unknown>;
  activate(context: AnyMDExtensionContext): Promise<void> | void;
  deactivate(): Promise<void> | void;
}
