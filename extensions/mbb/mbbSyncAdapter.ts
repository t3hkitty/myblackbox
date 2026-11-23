/**
 * 🐾 MBB Google Tasks Two-Way Sync Adapter
 * Syncs the full `<emoji>//<folders>/<title>` path string as the Google Tasks `title`
 * and serializes extended YAML frontmatter inside Google Tasks `notes`
 * (status, type, roman, count, rrule, defer_until, stages_reached).
 */

import { GoogleTasksV1Item } from './tasks/types';
import { MBBTask } from './types';
import { parseMBBNotesField, serializeMBBNotesField } from './mbbFrontmatter';
import { getCombinedDueDateTime } from './tasks/temporal';

export class MBBGoogleTasksSyncAdapter {
  /**
   * Transforms a Google Tasks API item into an MBBTask domain object.
   * Full emoji path string is preserved in title; extended metadata is restored from notes frontmatter.
   */
  public static fromGoogleTask(item: GoogleTasksV1Item): MBBTask {
    const { notes, metadata } = parseMBBNotesField(item.notes || '');

    // Map Google status 'completed' -> 'completed' if not already marked as 'half' or 'skipped' in YAML
    let status = metadata.status || (item.status === 'completed' ? 'completed' : 'needsAction');

    return {
      id: item.id || `gtask_${Date.now()}`,
      title: item.title || '',
      notes: notes,
      rawNotes: item.notes || '',
      status: status,
      type: metadata.type || 'task',
      due: item.due,
      defer_until: metadata.defer_until,
      completed: item.completed,
      updated: item.updated,
      parent: item.parent,
      position: item.position,
      metadata: metadata,
    };
  }

  /**
   * Transforms an MBBTask into a Google Tasks REST API payload.
   * The full emoji path string is retained in the `title` field, while
   * custom MBB metadata is serialized into YAML frontmatter inside `notes`.
   */
  public static toGoogleTaskPayload(task: MBBTask): GoogleTasksV1Item {
    const serializedNotes = serializeMBBNotesField(task.notes || '', task.metadata || {});
    const dueDateTime = getCombinedDueDateTime(task.due, task.metadata?.dueTime);

    // Map half/skipped to needsAction in Google Tasks so Google Tasks won't hide them
    const googleStatus: 'needsAction' | 'completed' = task.status === 'completed' ? 'completed' : 'needsAction';

    const payload: GoogleTasksV1Item = {
      id: task.id,
      title: task.title, // e.g. "🤣//jokes/true"
      notes: serializedNotes,
      status: googleStatus,
      due: dueDateTime,
      completed: task.completed,
      updated: task.updated,
      parent: task.parent,
      position: task.position,
    };

    return payload;
  }
}
