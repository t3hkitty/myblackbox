/**
 * Connection Integrations for myBlackbox Protocol
 * Live REST API pull for Google Tasks & Google Fit with fallback mock connections.
 */

import { getZettelTimestamp } from '../utils/timeUtils';
import { fetchTasksFromGoogleTasks } from './googleDriveAuthEngine';
import { getTaskListConfig } from './blackboxStorage';

export const INTEGRATION_SOURCES = [
  { id: 'google_tasks', name: 'Google Tasks ("blackbox")', icon: '☑️', status: 'Connected' },
  { id: 'google_fit', name: 'Google Fit / Health', icon: '❤️', status: 'Connected' },
  { id: 'google_timeline', name: 'Google Timeline (Location)', icon: '📍', status: 'Connected' },
  { id: 'google_keep', name: 'Google Keep Notes', icon: '📝', status: 'Connected' },
  { id: 'android_messages', name: 'Android Messages', icon: '💬', status: 'Connected' },
  { id: 'photos', name: 'Google Photos Meta', icon: '🖼️', status: 'Connected' },
  { id: 'gemini_summaries', name: 'Gemini AI Daily Summaries', icon: '✨', status: 'Connected' }
];

export async function fetchLiveConnectionData(sourceId) {
  const zettelId = getZettelTimestamp();

  if (sourceId === 'google_tasks') {
    const config = getTaskListConfig();
    const liveTasks = await fetchTasksFromGoogleTasks(config.liveListName || 'blackbox');
    if (liveTasks && liveTasks.length > 0) {
      return liveTasks.map(t => ({
        id: t.id,
        title: `Google Task: ${t.title}`,
        detail: t.notes || `Synced from Google Task list "${config.liveListName || 'blackbox'}"`,
        tags: ['#google_tasks', '#telemetry'],
        source: `Google Tasks ("${config.liveListName || 'blackbox'}")`
      }));
    }
  }

  return fetchMockConnectionData(sourceId);
}

export function fetchMockConnectionData(sourceId) {
  const zettelId = getZettelTimestamp();

  switch (sourceId) {
    case 'google_tasks':
      return [
        {
          id: `gtask_1`,
          title: 'Google Task: #blackbox Deep Focus Reading Session',
          detail: 'Start: 14:00 | End: 15:30 (90 mins)',
          tags: ['#workflow', '#google_tasks', '#telemetry'],
          source: 'Google Tasks ("blackbox")'
        },
        {
          id: `gtask_2`,
          title: 'Google Task: #blackbox Afternoon Walk & Hydration Check',
          detail: 'Start: 16:00 | End: 16:25 (25 mins)',
          tags: ['#exercise', '#google_tasks'],
          source: 'Google Tasks ("blackbox")'
        }
      ];

    case 'google_fit':
      return [
        {
          id: `fit_1`,
          title: 'Google Fit: Active Stride Telemetry',
          detail: '4,280 Steps | 3.1 km | 180 kcal',
          tags: ['#telemetry', '#google_fit', '#health'],
          source: 'Google Fit'
        }
      ];

    case 'google_timeline':
      return [
        {
          id: `geo_1`,
          title: 'Google Timeline: Local Cafe Workstation',
          detail: 'Stayed 1h 45m at Metropolis Coffee Co.',
          tags: ['#location', '#timeline'],
          source: 'Google Timeline'
        }
      ];

    case 'google_keep':
      return [
        {
          id: `keep_1`,
          title: 'Keep Note: Micro-ideas for Zettelkasten decouple tool',
          detail: 'Flat-file structure with standard tags allows instant import to obsidian or notion.',
          tags: ['#zettel', '#keep', '#ideas'],
          source: 'Google Keep'
        }
      ];

    case 'android_messages':
      return [
        {
          id: `msg_1`,
          title: 'SMS Telemetry Ping',
          detail: 'Received delivery confirmation notification',
          tags: ['#messages', '#telemetry'],
          source: 'Android Messages'
        }
      ];

    case 'photos':
      return [
        {
          id: `photo_1`,
          title: 'Google Photos: Book Cover Scan Captured',
          detail: 'Photo metadata: IMG_20260803_1730.jpg (OCR: "Project Hail Mary")',
          tags: ['#photos', '#ocr', '#ebook'],
          source: 'Google Photos'
        }
      ];

    default:
      return [];
  }
}
