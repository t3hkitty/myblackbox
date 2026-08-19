/**
 * Automated Task & Bio Timestamp Pair Engine
 * 
 * Protocol:
 * 1. Scans raw Google Tasks or Zettel log entries for creation, start, and done/complete keywords.
 * 2. Inferred Work Started: Task creation timestamp automatically infers "Work Started" (T1).
 * 3. Work Completed: Marking a task complete or logging "done" matches nearest created task (T2) and calculates elapsed duration.
 * 4. Auto-detects Bio / Toilet single-tap events & duration pairs:
 *    - If Duration >= 180 seconds (3 mins): Auto-classifies as 💩 Bowel Movement / Poop (#poo, #bio_event).
 *    - If Duration < 180 seconds (< 3 mins): Auto-classifies as 🚽 Urination / Pee (#pee, #hydration).
 */

import { formatDuration, getZettelTimestamp } from '../utils/timeUtils';

const START_REGEX = /\b(start|started|begin|began|starting|t1|create|created|add|added|new|working)\b/i;
const DONE_REGEX = /\b(done|complete|completed|finish|finished|stop|stopped|end|ended|t2|closed|resolved)\b/i;
const BIO_REGEX = /\b(bio|toilet|restroom|bathroom|washroom|poop|pee)\b/i;

/**
 * Extracts clean topic title by stripping start/done/creation keywords
 */
export function extractTaskTopic(title = '') {
  return title
    .replace(START_REGEX, '')
    .replace(DONE_REGEX, '')
    .replace(/^(task|log|item|event|created task|started task):\s*/i, '')
    .trim() || 'General Activity';
}

export function isStartTask(title = '') {
  return START_REGEX.test(title);
}

export function isDoneTask(title = '') {
  return DONE_REGEX.test(title);
}

export function isBioTask(title = '') {
  return BIO_REGEX.test(title);
}

/**
 * Automatically pairs an incoming task list or set of entries by matching task creation (start) to completion (done).
 */
export function autoPairTasksFromList(rawTasks = []) {
  if (!rawTasks || rawTasks.length === 0) return { pairs: [], unpairedStarts: [] };

  // Sort chronologically by creation/update timestamp (oldest first)
  const sorted = [...rawTasks].sort((a, b) => {
    const tA = new Date(a.createdAt || a.created || a.updated || a.startIso || Date.now()).getTime();
    const tB = new Date(b.createdAt || b.created || b.updated || b.startIso || Date.now()).getTime();
    return tA - tB;
  });

  const pairs = [];
  const startStack = [];

  for (const item of sorted) {
    const title = item.title || item.content || '';
    const itemCreationTimeIso = item.createdAt || item.created || item.startIso || item.updated || new Date().toISOString();
    const itemCompletionTimeIso = item.completed || item.updated || itemCreationTimeIso;

    const isCompletedStatus = item.status === 'completed' || !!item.completed || isDoneTask(title);
    const isCreationOrStart = !isCompletedStatus && (isStartTask(title) || item.status === 'needsAction' || !!item.createdAt);

    if (isCreationOrStart) {
      // Inferred Work Started at Creation Timestamp
      startStack.push({
        ...item,
        title,
        topic: extractTaskTopic(title),
        isBio: isBioTask(title),
        startIso: itemCreationTimeIso
      });
    } else if (isCompletedStatus) {
      const doneTopic = extractTaskTopic(title);
      const isBioDone = isBioTask(title);

      // Find nearest preceding matching start task (or any bio start if bio done)
      let matchIdx = -1;
      for (let i = startStack.length - 1; i >= 0; i--) {
        const candidate = startStack[i];
        if (isBioDone && candidate.isBio) {
          matchIdx = i;
          break;
        } else if (!isBioDone && (candidate.topic.toLowerCase() === doneTopic.toLowerCase() || !doneTopic)) {
          matchIdx = i;
          break;
        }
      }

      // If no exact topic match found, take the nearest preceding start task
      if (matchIdx === -1 && startStack.length > 0) {
        matchIdx = startStack.length - 1;
      }

      if (matchIdx !== -1) {
        const matchedStart = startStack.splice(matchIdx, 1)[0];
        const tStart = new Date(matchedStart.startIso).getTime();
        const tDone = new Date(itemCompletionTimeIso).getTime();
        const durationSeconds = Math.max(1, Math.round((tDone - tStart) / 1000));

        const isToiletPair = matchedStart.isBio || isBioDone;
        let detectedBioType = null;

        if (isToiletPair) {
          // If duration >= 180 seconds (3 mins), detect as POOP, otherwise PEE!
          if (durationSeconds >= 180) {
            detectedBioType = 'POOP';
          } else {
            detectedBioType = 'PEE';
          }
        }

        const pairObj = {
          id: `autopair_${matchedStart.id || Math.random().toString(36).substring(2, 7)}_${item.id || Math.random().toString(36).substring(2, 7)}_${Math.random().toString(36).substring(2, 6)}`,
          topic: matchedStart.topic || doneTopic || 'Task Pair',
          startTitle: matchedStart.title,
          doneTitle: title,
          startIso: matchedStart.startIso,
          doneIso: itemCompletionTimeIso,
          durationSeconds,
          durationFormatted: formatDuration(durationSeconds),
          isToiletPair,
          detectedBioType, // 'POOP' | 'PEE' | null
          tags: isToiletPair
            ? (detectedBioType === 'POOP' ? ['#poo', '#bio_event', '#excretion', '#telemetry'] : ['#pee', '#hydration', '#excretion', '#telemetry'])
            : ['#blackbox_task', '#creation_time_pair']
        };

        pairs.push(pairObj);
      }
    }
  }

  return {
    pairs: pairs.reverse(), // Newest pairs first
    unpairedStarts: startStack
  };
}

/**
 * Creates a formatted Zettel entry for an auto-paired task or bio event
 */
export function createZettelFromAutoPair(pair) {
  if (pair.isToiletPair) {
    if (pair.detectedBioType === 'POOP') {
      return {
        title: `💩 Auto-Detected Bowel Excretion (Poop): ${pair.durationFormatted}`,
        type: 'microlog',
        content: `### 💩 Automated Toilet Telemetry Pair:\n- **Creation Work Started (T1)**: ${pair.startIso}\n- **Work Completed (T2)**: ${pair.doneIso}\n- **Elapsed Toilet Time**: ${pair.durationFormatted} (${pair.durationSeconds}s)\n- **Classification**: 💩 **Poop / Bowel Movement** (Duration ≥ 3 mins)`,
        tags: ['#poo', '#bio_event', '#excretion', '#telemetry'],
        metadata: { bioType: 'poop', durationSeconds: pair.durationSeconds }
      };
    } else {
      return {
        title: `🚽 Auto-Detected Urination (Pee): ${pair.durationFormatted}`,
        type: 'microlog',
        content: `### 🚽 Automated Toilet Telemetry Pair:\n- **Creation Work Started (T1)**: ${pair.startIso}\n- **Work Completed (T2)**: ${pair.doneIso}\n- **Elapsed Toilet Time**: ${pair.durationFormatted} (${pair.durationSeconds}s)\n- **Classification**: 🚽 **Pee / Urination** (Duration < 3 mins)`,
        tags: ['#pee', '#hydration', '#excretion', '#telemetry'],
        metadata: { bioType: 'pee', durationSeconds: pair.durationSeconds }
      };
    }
  }

  return {
    title: `Task Pair Complete: ${pair.topic}`,
    type: 'task',
    content: `### ⏱️ Task Work Inferred from Creation to Completion:\n- **Creation / Work Started (T1)**: ${pair.startIso}\n- **Work Completed (T2)**: ${pair.doneIso}\n- **Calculated Duration**: ${pair.durationFormatted} (${pair.durationSeconds}s)`,
    tags: pair.tags,
    metadata: { taskTitle: pair.topic, durationSeconds: pair.durationSeconds }
  };
}
