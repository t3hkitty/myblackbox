/**
 * 🐾 MBB LocalStorage Task Store
 * Cross-window reactive persistence store 🐱
 */

import { MBBTask } from './types';
import { calculateNextRecurrence } from './recurrence';

const STORE_KEY = 'mbb_tasks_sticky_v1';

type StoreListener = (tasks: MBBTask[]) => void;

export class MBBTaskStore {
  private tasks: MBBTask[] = [];
  private listeners: Set<StoreListener> = new Set();

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
      }
    } catch (e) {
      console.error('Failed to load MBB tasks from localStorage:', e);
      this.tasks = [];
    }
  }

  private saveToStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORE_KEY, JSON.stringify(this.tasks));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save MBB tasks to localStorage:', e);
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

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    listener([...this.tasks]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getTasks(): MBBTask[] {
    return [...this.tasks];
  }

  public addTask(task: Omit<MBBTask, 'id' | 'updated'> & { id?: string }): MBBTask {
    const newTask: MBBTask = {
      ...task,
      id: task.id || `mbb_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      updated: new Date().toISOString(),
    };
    this.tasks = [newTask, ...this.tasks];
    this.saveToStorage();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<MBBTask>): MBBTask | null {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const existing = this.tasks[idx];
    const updatedTask: MBBTask = {
      ...existing,
      ...updates,
      metadata: { ...existing.metadata, ...(updates.metadata || {}) },
      updated: new Date().toISOString(),
    };

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

  public completeTask(id: string): { completedTask: MBBTask; spawnedTask?: MBBTask } | null {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return null;

    const completionDate = new Date().toISOString();
    const updated = this.updateTask(id, {
      status: 'completed',
      completed: completionDate,
    });

    if (!updated) return null;

    let spawnedTask: MBBTask | undefined = undefined;

    // Check auto-recurrence spawning
    if (updated.metadata?.recurrence) {
      const nextDue = calculateNextRecurrence({
        rrule: updated.metadata.recurrence,
        baseDate: updated.due,
        completionDate: completionDate,
        recurrenceBase: updated.metadata.recurrenceBase,
      });

      spawnedTask = this.addTask({
        title: updated.title,
        notes: updated.notes,
        status: 'needsAction',
        due: nextDue,
        metadata: { ...updated.metadata },
      });
    }

    return { completedTask: updated, spawnedTask };
  }

  /**
   * 1. TICKER TICK: Increments count, updates Roman numeral
   */
  public tick(id: string): MBBTask | null {
    const task = this.tasks.find((t) => t.id === id);
    if (!task || task.status === 'completed') return null;

    const count = Number(task.metadata?.count || 0) + 1;
    const ROMANS: [number, string][] = [
      [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
      [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let rem = count;
    let roman = '';
    for (const [v, r] of ROMANS) {
      while (rem >= v) {
        roman += r;
        rem -= v;
      }
    }

    return this.updateTask(id, {
      type: 'ticker',
      metadata: {
        ...task.metadata,
        type: 'ticker',
        count,
        roman
      }
    });
  }

  /**
   * 2. HALF-COMPLETED ('half'): Guilt-free partial progress
   */
  public setHalfCompleted(id: string): MBBTask | null {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return null;
    return this.updateTask(id, {
      status: 'half',
      metadata: { ...task.metadata, status: 'half' }
    });
  }

  /**
   * 3. SKIP ('skipped'): Advances recurring or defers 7 days without guilt
   */
  public skipTask(id: string): MBBTask | null {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return null;

    const nowIso = new Date().toISOString();
    if (task.metadata?.recurrence) {
      const nextDue = calculateNextRecurrence({
        rrule: task.metadata.recurrence,
        baseDate: task.due || nowIso.split('T')[0],
        completionDate: nowIso,
        recurrenceBase: task.metadata.recurrenceBase || 'due_date'
      });
      return this.updateTask(id, {
        due: nextDue,
        status: 'needsAction',
        metadata: { ...task.metadata, status: 'needsAction' }
      });
    } else {
      const d = task.due ? new Date(task.due) : new Date();
      d.setDate(d.getDate() + 7);
      const nextDue = d.toISOString().split('T')[0];
      return this.updateTask(id, {
        due: nextDue,
        status: 'needsAction',
        defer_until: nextDue,
        metadata: { ...task.metadata, defer_until: nextDue }
      });
    }
  }

  /**
   * 4. SWEEP ALL / DOUBLE CHECKMARK: Bulk complete all tasks in a list
   */
  public sweepAllActive(): number {
    const active = this.tasks.filter((t) => t.status === 'needsAction' || t.status === 'half');
    const nowIso = new Date().toISOString();
    active.forEach((t) => {
      this.updateTask(t.id, {
        status: 'completed',
        completed: nowIso,
        metadata: { ...t.metadata, status: 'completed' }
      });
    });
    return active.length;
  }
}

export const mbbTaskStore = new MBBTaskStore();
