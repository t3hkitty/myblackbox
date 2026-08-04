/**
 * Time Utilities for myBlackbox Zettelkasten Protocol
 * Core Rule 1: Every log starts with Pacific Time serialization tag format (YYYYMMDD-HHMM).
 */

/**
 * Returns current Pacific Time (America/Los_Angeles) formatted as YYYYMMDD-HHMM
 * @param {Date} [dateObj] Optional Date object, defaults to now
 * @returns {string} Zettelkasten timestamp tag e.g. "20260803-1825"
 */
export function getZettelTimestamp(dateObj = new Date()) {
  const options = {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(dateObj);
  
  let year = '', month = '', day = '', hour = '', minute = '';
  for (const part of parts) {
    if (part.type === 'year') year = part.value;
    if (part.type === 'month') month = part.value;
    if (part.type === 'day') day = part.value;
    if (part.type === 'hour') hour = part.value;
    if (part.type === 'minute') minute = part.value;
  }

  // Fallback if hour format includes 24
  if (hour === '24') hour = '00';

  return `${year}${month}${day}-${hour}${minute}`;
}

/**
 * Formats a timestamp into human-readable Pacific Time string
 */
export function formatReadablePT(dateObj = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(dateObj);
}

/**
 * Formats duration in seconds into Xh Ym Zs format
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}
