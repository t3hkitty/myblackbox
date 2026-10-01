/**
 * 🐾 MBB Temporal Merging Engine
 * Combines date-only due strings with optional dueTime ⏰
 */

/**
 * Combines a date-only due string (YYYY-MM-DD or RFC 3339) with optional HH:mm dueTime.
 * Returns ISO 8601 string.
 */
export function getCombinedDueDateTime(due?: string, dueTime?: string): string | undefined {
  if (!due) return undefined;

  const datePart = due.split('T')[0]; // Extract YYYY-MM-DD
  if (!datePart || !/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return due;
  }

  if (dueTime && /^\d{2}:\d{2}$/.test(dueTime)) {
    return `${datePart}T${dueTime}:00.000Z`;
  }

  return `${datePart}T00:00:00.000Z`;
}
