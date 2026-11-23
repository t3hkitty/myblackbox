/**
 * 🐾 MBB Tasker & kittlibr:// Protocol Deep Link Ingestion
 * Translates Android Tasker / MacroDroid intents & kittlibr:// captures
 * directly into MBB Tasks and syncs with Google Tasks without webhook overhead.
 */

import { mbbTaskStore } from '../tasks/store';
import { syncTaskToGoogleTasks, logSyncDiagnostic } from '../services/googleDriveAuthEngine';
import { TaskPriority } from '../tasks/types';

export interface TaskerCapturePayload {
  title?: string;
  notes?: string;
  quote?: string;
  book?: string;
  priority?: number;
  tags?: string[];
  due?: string;
  source?: string;
  category?: string;
  [key: string]: unknown;
}

export class TaskerIntentService {
  /**
   * Ingests a kittlibr:// or mbb:// intent payload directly into MBB Task Board
   * and dispatches to Google Tasks (gtasks) if connected.
   */
  public static ingestTask(
    payload: TaskerCapturePayload,
    source: 'kittlibr' | 'tasker_intent' | 'geofence' | 'routine' = 'tasker_intent'
  ) {
    const rawTitle = payload.title || payload.book || payload.quote || 'New Ingested Task';
    const notes = payload.notes || payload.quote || '';
    
    // Parse priority (0-3)
    let priority: TaskPriority = 0;
    if (payload.priority !== undefined) {
      const p = Number(payload.priority);
      if (p === 1 || p === 2 || p === 3) priority = p as TaskPriority;
    }

    // Default tags based on source
    const tags = Array.isArray(payload.tags) ? [...payload.tags] : [];
    if (source === 'kittlibr') {
      if (!tags.includes('kittlibr')) tags.push('kittlibr');
      if (!tags.includes('reading')) tags.push('reading');
    } else if (source === 'geofence') {
      if (!tags.includes('geofence')) tags.push('geofence');
    } else if (source === 'routine') {
      if (!tags.includes('routine')) tags.push('routine');
    }
    if (!tags.includes('tasker')) tags.push('tasker');

    const created = mbbTaskStore.addTask({
      title: rawTitle,
      notes,
      status: 'needsAction',
      due: payload.due,
      metadata: {
        priority,
        tags,
        source: payload.source || source,
        category: payload.category
      }
    });

    logSyncDiagnostic(
      'TASKER_INTENT_INGESTED',
      `Direct Tasker ingest: "${rawTitle}" via ${source}`,
      'SUCCESS',
      { taskId: created.id, source, payload }
    );

    // Sync directly to Google Tasks live list ('blackbox')
    try {
      syncTaskToGoogleTasks(rawTitle, 'blackbox', notes);
    } catch (e) {
      console.warn('Google Tasks sync deferred:', e);
    }

    return created;
  }

  /**
   * Setup global deep link listener for kittlibr:// and intent broadcast messages
   */
  public static setupGlobalIntentListeners(): () => void {
    const handleCustomIntent = (e: CustomEvent) => {
      const detail = e.detail;
      if (!detail) return;

      if (detail.protocol === 'kittlibr' || detail.action === 'capture' || detail.source === 'kittlibr') {
        TaskerIntentService.ingestTask(detail.params || detail.payload || detail, 'kittlibr');
      } else if (detail.action === 'tasker' || detail.source === 'tasker') {
        TaskerIntentService.ingestTask(detail.params || detail.payload || detail, 'tasker_intent');
      }
    };

    window.addEventListener('mbb-intent-capture' as any, handleCustomIntent as any);
    window.addEventListener('kittlibr-capture' as any, handleCustomIntent as any);

    return () => {
      window.removeEventListener('mbb-intent-capture' as any, handleCustomIntent as any);
      window.removeEventListener('kittlibr-capture' as any, handleCustomIntent as any);
    };
  }
}
