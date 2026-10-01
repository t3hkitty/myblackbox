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
}

export const mbbTaskStore = new MBBTaskStore();
