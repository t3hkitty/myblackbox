/**
 * 🐾 MBB Task Board Types & Domain Contracts
 * Kawaiian Aesthetics & Anti-Slop Strict Types 🐱
 */

export type TaskPriority = 0 | 1 | 2 | 3;

export interface GoogleTasksV1Item {
  id?: string;
  title?: string;
  updated?: string;
  selfLink?: string;
  parent?: string;
  position?: string;
  notes?: string;
  status?: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  deleted?: boolean;
  hidden?: boolean;
  links?: Array<{
    type?: string;
    description?: string;
    link?: string;
  }>;
  etag?: string;
}

export interface MBBTaskMetadata {
  priority?: TaskPriority;
  dueTime?: string; // HH:mm format
  tags?: string[];
  recurrence?: string; // RFC 5545 RRULE string e.g. FREQ=DAILY;INTERVAL=1
  recurrenceBase?: 'due_date' | 'completion_date';
  estimatedMinutes?: number;
  [key: string]: unknown; // Allow non-destructive extra custom frontmatter keys
}

export interface MBBTask {
  id: string;
  title: string;
  notes?: string; // Plaintext body minus YAML frontmatter
  rawNotes?: string; // Original full Google Tasks notes string
  status: 'needsAction' | 'completed';
  due?: string; // YYYY-MM-DD or ISO 8601 string
  completed?: string; // ISO 8601 string
  updated?: string; // ISO 8601 string
  parent?: string;
  position?: string;
  metadata: MBBTaskMetadata;
}

export type TaskFilterTab = 'active' | 'completed' | 'all';

export interface TaskFilterOptions {
  tab: TaskFilterTab;
  searchQuery?: string;
  selectedTag?: string;
  selectedPriority?: TaskPriority;
}
