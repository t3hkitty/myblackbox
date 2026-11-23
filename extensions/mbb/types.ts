/**
 * 🐾 MBB Extended Task Engine & Domain Contracts
 * Tasks.org parity, Anti-Overwhelm States ('skip' and 'half'),
 * Emoji folder parsing (<emoji>//<folder>/<subfolder>/<title>),
 * Roman Numeral Tickers, Superseding Auto-Stop States,
 * and Stage Director profiles & rollups.
 */

export type TaskPriority = 0 | 1 | 2 | 3;
export type MBBTaskStatus = 'needsAction' | 'completed' | 'half' | 'skipped';
export type MBBTaskType = 'task' | 'ticker' | 'timer' | 'event';

export interface StageProfileItem {
  stage_key: string;
  threshold: number;
  label: string;
  done_message: string; // supports {title}, {duration}, {hours}, {count}, {roman}
}

export interface StageDirectorProfile {
  id: string;
  name: string;
  trigger_type: 'duration_minutes' | 'tick_count';
  stages: StageProfileItem[];
}

export interface MBBTaskMetadata {
  priority?: TaskPriority;
  dueTime?: string; // HH:mm format
  tags?: string[];
  recurrence?: string; // RFC 5545 RRULE string e.g. FREQ=DAILY;INTERVAL=1
  recurrenceBase?: 'due_date' | 'completion_date';
  defer_until?: string; // ISO 8601 or YYYY-MM-DD
  estimatedMinutes?: number;
  
  // Anti-overwhelm & status
  status?: MBBTaskStatus;
  history?: Array<{
    action: 'created' | 'completed' | 'half' | 'skipped' | 'ticked' | 'stopped';
    timestamp: string;
    note?: string;
  }>;

  // Emoji folder path details
  emoji?: string;
  folderPath?: string[]; // e.g. ['jokes', 'true']
  cleanTitle?: string;

  // Roman Numeral Ticker & Timers
  type?: MBBTaskType;
  count?: number;
  roman?: string;
  started_at?: string;
  stopped_by?: string;
  duration_minutes?: number;

  // Cascading states & Superseding Auto-Stop
  emits_state?: string[]; // e.g. ['sleep'] or ['broke_fast', 'meal']
  auto_stop_on?: string[]; // e.g. ['sleep'] or ['broke_fast']

  // Stage Director
  stage_profile_id?: string;
  max_stage?: string;
  stages_reached?: string[]; // e.g. ['digestion', 'autophagy_16h']

  [key: string]: unknown;
}

export interface MBBTask {
  id: string;
  title: string; // Full string e.g. "🤣//jokes/true"
  notes?: string; // Body minus YAML frontmatter
  rawNotes?: string;
  status: MBBTaskStatus;
  type: MBBTaskType;
  due?: string;
  defer_until?: string;
  completed?: string;
  updated?: string;
  parent?: string;
  position?: string;
  metadata: MBBTaskMetadata;
}

export interface EmojiFolderNode {
  name: string;
  emoji?: string;
  fullPath: string;
  tasks: MBBTask[];
  subfolders: Record<string, EmojiFolderNode>;
}

export interface WeeklyStageSummary {
  stageKey: string;
  label: string;
  count: number;
}
