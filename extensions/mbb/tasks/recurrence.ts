/**
 * 🐾 MBB Recurrence Engine
 * RFC 5545 RRULE interval calculator 🔄
 */

export interface RecurrenceOptions {
  rrule: string; // e.g. FREQ=DAILY;INTERVAL=1 or FREQ=WEEKLY;INTERVAL=2
  baseDate?: string; // YYYY-MM-DD or ISO 8601 string
  completionDate?: string; // ISO 8601 string
  recurrenceBase?: 'due_date' | 'completion_date';
}

/**
 * Calculates next due date based on RRULE string and base recurrence trigger.
 */
export function calculateNextRecurrence(options: RecurrenceOptions): string {
  const { rrule, baseDate, completionDate, recurrenceBase = 'due_date' } = options;

  let start: Date;
  if (recurrenceBase === 'completion_date' && completionDate) {
    start = new Date(completionDate);
  } else if (baseDate) {
    start = new Date(baseDate);
  } else {
    start = new Date();
  }

  if (isNaN(start.getTime())) {
    start = new Date();
  }

  // Parse basic RRULE fields
  const parts = rrule.split(';').reduce((acc, part) => {
    const [key, val] = part.split('=');
    if (key && val) acc[key.toUpperCase()] = val.toUpperCase();
    return acc;
  }, {} as Record<string, string>);

  const freq = parts['FREQ'] || 'DAILY';
  const interval = parseInt(parts['INTERVAL'] || '1', 10);

  const nextDate = new Date(start.getTime());

  switch (freq) {
    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + interval * 7);
      break;
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + interval);
      break;
  }

  return nextDate.toISOString().split('T')[0];
}
