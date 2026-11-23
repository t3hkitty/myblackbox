/**
 * 🐾 MBB Tasks.org-Parity & Ticker Engine
 * Handles tasks, tickers (type: ticker), auto-stop cascades, Stage Director triggers,
 * Skip ('skip'), and Half-Completed ('half') states.
 */

import { MBBTask, MBBTaskMetadata, WeeklyStageSummary } from './types';
import { serializeMBBNotesField } from './mbbFrontmatter';
import { parseEmojiFolderPath } from './emojiFolders';
import { toRomanNumeral, formatDurationHuman } from './roman';
import { loadStageProfiles, evaluateStageProgress, renderDoneMessage } from './stageDirector';
import { calculateNextRecurrence } from './tasks/recurrence';

const STORE_KEY = 'mbb_engine_tasks_v2';
type MBBStoreListener = (tasks: MBBTask[]) => void;

export class MBBEngineStore {
  private tasks: MBBTask[] = [];
  private listeners: Set<MBBStoreListener> = new Set();

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent);
    }
  }

  private loadFromStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        this.tasks = JSON.parse(raw);
      } else {
        // Seed initial friendly tasks if empty
        const initial = this.getInitialSampleTasks();
        this.tasks = initial;
        this.saveToStorage();
      }
    } catch (e) {
      console.error('Failed to load MBB tasks from storage:', e);
      this.tasks = [];
    }
  }

  private saveToStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORE_KEY, JSON.stringify(this.tasks));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save MBB tasks to storage:', e);
    }
  }

  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key === STORE_KEY) {
      this.loadFromStorage();
      this.notifyListeners();
    }
  };

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.tasks]));
  }

  public subscribe(listener: MBBStoreListener): () => void {
    this.listeners.add(listener);
    listener([...this.tasks]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getTasks(): MBBTask[] {
    return [...this.tasks];
  }

  public getTaskById(id: string): MBBTask | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  public addTask(taskInput: {
    title: string;
    notes?: string;
    type?: MBBTask['type'];
    priority?: 0 | 1 | 2 | 3;
    due?: string;
    defer_until?: string;
    tags?: string[];
    recurrence?: string;
    stage_profile_id?: string;
    auto_stop_on?: string[];
    emits_state?: string[];
    metadata?: Partial<MBBTaskMetadata>;
  }): MBBTask {
    const parsedPath = parseEmojiFolderPath(taskInput.title);
    const nowIso = new Date().toISOString();

    const metadata: MBBTaskMetadata = {
      priority: taskInput.priority ?? 0,
      tags: taskInput.tags || [],
      recurrence: taskInput.recurrence,
      defer_until: taskInput.defer_until,
      emoji: parsedPath.emoji,
      folderPath: parsedPath.folderPath,
      cleanTitle: parsedPath.cleanTitle,
      type: taskInput.type || 'task',
      status: 'needsAction',
      stage_profile_id: taskInput.stage_profile_id,
      auto_stop_on: taskInput.auto_stop_on,
      emits_state: taskInput.emits_state,
      count: taskInput.type === 'ticker' ? 0 : undefined,
      roman: taskInput.type === 'ticker' ? '' : undefined,
      history: [
        {
          action: 'created',
          timestamp: nowIso
        }
      ],
      ...(taskInput.metadata || {})
    };

    const newTask: MBBTask = {
      id: `mbb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: taskInput.title,
      notes: taskInput.notes || '',
      rawNotes: serializeMBBNotesField(taskInput.notes || '', metadata),
      status: 'needsAction',
      type: taskInput.type || 'task',
      due: taskInput.due,
      defer_until: taskInput.defer_until,
      updated: nowIso,
      metadata
    };

    this.tasks = [newTask, ...this.tasks];
    this.saveToStorage();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<MBBTask>): MBBTask | null {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const existing = this.tasks[idx];
    const newMetadata = {
      ...existing.metadata,
      ...(updates.metadata || {})
    };

    const updatedTask: MBBTask = {
      ...existing,
      ...updates,
      metadata: newMetadata,
      updated: new Date().toISOString()
    };

    // Keep rawNotes serialized with newest metadata
    updatedTask.rawNotes = serializeMBBNotesField(updatedTask.notes || '', updatedTask.metadata);

    this.tasks[idx] = updatedTask;
    this.saveToStorage();
    return updatedTask;
  }

  public deleteTask(id: string): boolean {
    const initialLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    if (this.tasks.length !== initialLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * 1. TICKER TICK: Increments count, updates Roman numeral, sets started_at if first tick.
   */
  public tick(id: string): MBBTask | null {
    const task = this.getTaskById(id);
    if (!task || task.status === 'completed') return null;

    const currentCount = Number(task.metadata?.count || 0) + 1;
    const roman = toRomanNumeral(currentCount);
    const nowIso = new Date().toISOString();
    const startedAt = task.metadata?.started_at || nowIso;

    // Check Stage Director milestone if applicable
    let stagesReached = [...(task.metadata?.stages_reached || [])];
    let maxStage = task.metadata?.max_stage;

    if (task.metadata?.stage_profile_id) {
      const profiles = loadStageProfiles();
      const profile = profiles.find((p) => p.id === task.metadata?.stage_profile_id);
      if (profile && profile.trigger_type === 'tick_count') {
        const evalResult = evaluateStageProgress(profile, currentCount);
        evalResult.reachedStages.forEach((s) => {
          if (!stagesReached.includes(s.stage_key)) {
            stagesReached.push(s.stage_key);
          }
        });
        if (evalResult.highestStage) {
          maxStage = evalResult.highestStage.label;
        }
      }
    }

    const history = [
      ...(task.metadata?.history || []),
      { action: 'ticked' as const, timestamp: nowIso, note: `Tick ${roman} (#${currentCount})` }
    ];

    return this.updateTask(id, {
      metadata: {
        ...task.metadata,
        count: currentCount,
        roman,
        started_at: startedAt,
        stages_reached: stagesReached,
        max_stage: maxStage,
        history
      }
    });
  }

  /**
   * 2. HALF-COMPLETED STATE ('half'):
   * Sets status to 'half' without guilt, preserves task for later completion.
   */
  public setHalfCompleted(id: string): MBBTask | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    const nowIso = new Date().toISOString();
    const history = [
      ...(task.metadata?.history || []),
      { action: 'half' as const, timestamp: nowIso, note: 'Marked Half-Completed' }
    ];

    return this.updateTask(id, {
      status: 'half',
      metadata: {
        ...task.metadata,
        status: 'half',
        history
      }
    });
  }

  /**
   * 3. SKIP STATE ('skip'):
   * Advances recurring task to next interval without guilt or showing overdue.
   * Defers one-off tasks by 7 days.
   */
  public skipTask(id: string): { updatedTask: MBBTask; spawnedTask?: MBBTask } | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    const nowIso = new Date().toISOString();
    const history = [
      ...(task.metadata?.history || []),
      { action: 'skipped' as const, timestamp: nowIso, note: 'Skipped without guilt' }
    ];

    if (task.metadata?.recurrence) {
      // Advance recurring start/due to next RRULE interval
      const nextDue = calculateNextRecurrence({
        rrule: task.metadata.recurrence,
        baseDate: task.due || nowIso.split('T')[0],
        completionDate: nowIso,
        recurrenceBase: task.metadata.recurrenceBase || 'due_date'
      });

      const updated = this.updateTask(id, {
        due: nextDue,
        status: 'needsAction',
        metadata: {
          ...task.metadata,
          status: 'needsAction',
          history
        }
      });
      return updated ? { updatedTask: updated } : null;
    } else {
      // Defer one-off task by 7 days
      const d = task.due ? new Date(task.due) : new Date();
      d.setDate(d.getDate() + 7);
      const nextDue = d.toISOString().split('T')[0];

      const updated = this.updateTask(id, {
        due: nextDue,
        status: 'needsAction',
        defer_until: nextDue,
        metadata: {
          ...task.metadata,
          defer_until: nextDue,
          history
        }
      });
      return updated ? { updatedTask: updated } : null;
    }
  }

  /**
   * 4. COMPLETE / DONE REPROCESSOR:
   * Calculates elapsed duration, formats Stage Director milestone messages,
   * updates notes, and triggers superseding auto-stop if emits_state is set.
   */
  public completeTask(id: string, stoppedBy?: string): { completedTask: MBBTask; spawnedTask?: MBBTask } | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    const completionDate = new Date().toISOString();
    let durationMinutes = task.metadata?.duration_minutes || 0;

    // Calculate duration if started_at exists
    if (task.metadata?.started_at) {
      const startMs = new Date(task.metadata.started_at).getTime();
      const endMs = new Date(completionDate).getTime();
      durationMinutes = Math.max(1, Math.round((endMs - startMs) / 60000));
    }

    // Evaluate Stage Director milestones on completion
    let stagesReached = [...(task.metadata?.stages_reached || [])];
    let maxStage = task.metadata?.max_stage;
    const milestoneMessages: string[] = [];

    if (task.metadata?.stage_profile_id) {
      const profiles = loadStageProfiles();
      const profile = profiles.find((p) => p.id === task.metadata?.stage_profile_id);
      if (profile) {
        const testVal = profile.trigger_type === 'duration_minutes' ? durationMinutes : (task.metadata?.count || 0);
        const evalResult = evaluateStageProgress(profile, testVal);

        evalResult.reachedStages.forEach((s) => {
          if (!stagesReached.includes(s.stage_key)) {
            stagesReached.push(s.stage_key);
          }
          const msg = renderDoneMessage(s.done_message, {
            title: task.title,
            durationMinutes,
            count: task.metadata?.count,
            roman: task.metadata?.roman
          });
          milestoneMessages.push(msg);
        });

        if (evalResult.highestStage) {
          maxStage = evalResult.highestStage.label;
        }
      }
    }

    // Reprocess body notes with rich summary
    let newNotes = task.notes || '';
    const summaryHeader = `\n\n### 🏁 MBB Completion Reprocessor Log\n- **Completed**: ${completionDate}\n` +
      (task.type === 'ticker' ? `- **Total Ticks**: ${task.metadata?.count || 0} (${task.metadata?.roman || 'N/A'})\n` : '') +
      (durationMinutes > 0 ? `- **Duration**: ${formatDurationHuman(durationMinutes)}\n` : '') +
      (stoppedBy ? `- **Stopped By**: \`${stoppedBy}\`\n` : '') +
      (milestoneMessages.length > 0 ? `\n#### 🎯 Milestone Messages\n${milestoneMessages.map((m) => `- ${m}`).join('\n')}\n` : '');

    newNotes = (newNotes + summaryHeader).trim();

    const history = [
      ...(task.metadata?.history || []),
      { action: 'completed' as const, timestamp: completionDate, note: stoppedBy ? `Stopped by ${stoppedBy}` : 'Completed' }
    ];

    const updated = this.updateTask(id, {
      status: 'completed',
      completed: completionDate,
      notes: newNotes,
      metadata: {
        ...task.metadata,
        status: 'completed',
        duration_minutes: durationMinutes,
        stopped_by: stoppedBy,
        stages_reached: stagesReached,
        max_stage: maxStage,
        history
      }
    });

    if (!updated) return null;

    // Trigger superseding cascade stops if task emits_state
    if (updated.metadata?.emits_state && updated.metadata.emits_state.length > 0) {
      this.handleEmittedState(updated.metadata.emits_state, updated.title);
    }

    // Auto-recurrence spawn
    let spawnedTask: MBBTask | undefined = undefined;
    if (updated.metadata?.recurrence) {
      const nextDue = calculateNextRecurrence({
        rrule: updated.metadata.recurrence,
        baseDate: updated.due,
        completionDate: completionDate,
        recurrenceBase: updated.metadata.recurrenceBase || 'due_date'
      });

      spawnedTask = this.addTask({
        title: updated.title,
        notes: task.notes, // Original notes without the completion log
        type: updated.type,
        priority: updated.metadata.priority,
        due: nextDue,
        tags: updated.metadata.tags,
        recurrence: updated.metadata.recurrence,
        stage_profile_id: updated.metadata.stage_profile_id,
        auto_stop_on: updated.metadata.auto_stop_on,
        emits_state: updated.metadata.emits_state
      });
    }

    return { completedTask: updated, spawnedTask };
  }

  /**
   * 5. SUPERSEDING AUTO-STOP STATES:
   * Closes any active task/ticker listening via auto_stop_on when state fires.
   */
  public handleEmittedState(states: string[], triggerSource: string) {
    const activeTasks = this.tasks.filter((t) => t.status === 'needsAction' || t.status === 'half');
    for (const task of activeTasks) {
      const listeners = task.metadata?.auto_stop_on || [];
      const hasMatch = states.some((s) => listeners.includes(s));
      if (hasMatch) {
        console.log(`[MBBEngine] Auto-stopping task "${task.title}" due to emitted state(s):`, states);
        this.completeTask(task.id, triggerSource);
      }
    }
  }

  /**
   * 6. WEEKLY STAGE ROLLUP SUMMARY:
   * Aggregates stages_reached across notes/tasks completed in the last 7 days.
   */
  public getWeeklyStageRollup(): WeeklyStageSummary[] {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const tallies: Record<string, { label: string; count: number }> = {};

    const profiles = loadStageProfiles();
    const stageLabelMap = new Map<string, string>();
    profiles.forEach((p) => {
      p.stages.forEach((s) => stageLabelMap.set(s.stage_key, s.label));
    });

    for (const task of this.tasks) {
      if (task.completed) {
        const compTime = new Date(task.completed).getTime();
        if (now - compTime <= sevenDaysMs) {
          const reached = task.metadata?.stages_reached || [];
          reached.forEach((sk) => {
            if (!tallies[sk]) {
              tallies[sk] = {
                label: stageLabelMap.get(sk) || sk,
                count: 0
              };
            }
            tallies[sk].count += 1;
          });
        }
      }
    }

    return Object.entries(tallies).map(([stageKey, item]) => ({
      stageKey,
      label: item.label,
      count: item.count
    }));
  }

  private getInitialSampleTasks(): MBBTask[] {
    const nowIso = new Date().toISOString();
    return [
      {
        id: 'mbb_sample_1',
        title: '🤣//jokes/true',
        notes: 'Review true jokes folder hierarchy',
        rawNotes: '',
        status: 'needsAction',
        type: 'task',
        metadata: {
          priority: 2,
          tags: ['humor', 'mbb'],
          emoji: '🤣',
          folderPath: ['jokes'],
          cleanTitle: 'true'
        }
      },
      {
        id: 'mbb_sample_2',
        title: '💊//health/Took a sip',
        notes: 'Hydration micro-ticker with Roman numeral tracking',
        rawNotes: '',
        status: 'needsAction',
        type: 'ticker',
        metadata: {
          priority: 1,
          type: 'ticker',
          count: 3,
          roman: 'III',
          started_at: nowIso,
          stage_profile_id: 'hydration_ticker',
          auto_stop_on: ['sleep'],
          emoji: '💊',
          folderPath: ['health'],
          cleanTitle: 'Took a sip'
        }
      },
      {
        id: 'mbb_sample_3',
        title: '🌙//health/Went to bed',
        notes: 'Superseding event that cascades auto-stop on active tickers',
        rawNotes: '',
        status: 'needsAction',
        type: 'event',
        metadata: {
          priority: 3,
          type: 'event',
          emits_state: ['sleep'],
          emoji: '🌙',
          folderPath: ['health'],
          cleanTitle: 'Went to bed'
        }
      },
      {
        id: 'mbb_sample_4',
        title: '🥗//health/Ate lunch',
        notes: 'Breaks fasting session and auto-stops fasting tickers',
        rawNotes: '',
        status: 'needsAction',
        type: 'event',
        metadata: {
          priority: 2,
          type: 'event',
          emits_state: ['broke_fast', 'meal'],
          emoji: '🥗',
          folderPath: ['health'],
          cleanTitle: 'Ate lunch'
        }
      }
    ];
  }
}

export const mbbEngineStore = new MBBEngineStore();
