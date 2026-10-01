/**
 * 🐾 MBB Google Tasks REST API Adapter
 * Bidirectional transformation pipeline between Google API and MBB Task AST 🔄
 */

import { GoogleTasksV1Item, MBBTask } from './types';
import { parseNotesField, serializeNotesField } from './frontmatter';
import { getCombinedDueDateTime } from './temporal';

export class TaskSyncEngine {
  /**
   * Converts a Google Tasks API payload item into a native MBBTask domain object.
   */
  public static fromGoogleTask(item: GoogleTasksV1Item): MBBTask {
    const { notes, metadata } = parseNotesField(item.notes || '');

    return {
      id: item.id || `gtask_${Date.now()}`,
      title: item.title || '',
      notes: notes,
      rawNotes: item.notes || '',
      status: item.status || 'needsAction',
      due: item.due,
      completed: item.completed,
      updated: item.updated,
      parent: item.parent,
      position: item.position,
      metadata: metadata,
    };
  }

  /**
   * Converts an MBBTask domain object into a Google Tasks REST API update payload.
   */
  public static toGoogleTaskPayload(task: MBBTask): GoogleTasksV1Item {
    const serializedNotes = serializeNotesField(task.notes || '', task.metadata || {});
    const dueDateTime = getCombinedDueDateTime(task.due, task.metadata?.dueTime);

    const payload: GoogleTasksV1Item = {
      id: task.id,
      title: task.title,
      notes: serializedNotes,
      status: task.status,
      due: dueDateTime,
      completed: task.completed,
      updated: task.updated,
      parent: task.parent,
      position: task.position,
    };

    return payload;
  }
}
