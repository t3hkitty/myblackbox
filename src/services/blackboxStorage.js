/**
 * LocalStorage & Data Persistence Service for myBlackbox
 * Supports custom & loadable mood sets, sip & pee configuration, log entries, state exports,
 * rich multi-mood sample telemetry data, and 1-tap Nuke/Bomb sample data tools.
 */

import { getZettelTimestamp } from '../utils/timeUtils';

const STORAGE_KEYS = {
  LOGS: 'blackbox_logs_v1',
  MOOD_SETS: 'blackbox_mood_sets_v1',
  ACTIVE_MOOD_SET_ID: 'blackbox_active_mood_set_v1',
  SIP_SETTINGS: 'blackbox_sip_settings_v1',
  EBOOK_SESSIONS: 'blackbox_ebook_sessions_v1',
  BLACKBOX_TASKS: 'blackbox_tasks_v1',
  GOALS: 'blackbox_goals_v1',
  TASK_LIST_CONFIG: 'blackbox_task_list_config_v1'
};

// Default Configurable & Loadable Mood Sets (Daylio inspired)
export const DEFAULT_MOOD_SETS = [
  {
    id: 'standard_5',
    name: 'Standard 5-Point Scale',
    description: 'Classic balanced 5-tier mood tracker',
    moods: [
      { id: 'rad', emoji: '😍', label: 'Rad', weight: 2, color: '#10b981' },
      { id: 'good', emoji: '😊', label: 'Good', weight: 1, color: '#3b82f6' },
      { id: 'meh', emoji: '😐', label: 'Meh', weight: 0, color: '#f59e0b' },
      { id: 'bad', emoji: '😔', label: 'Low', weight: -1, color: '#ec4899' },
      { id: 'awful', emoji: '😭', label: 'Distress', weight: -2, color: '#ef4444' }
    ]
  },
  {
    id: 'energy_vibe',
    name: 'Energy & Vibe Flow',
    description: 'Focuses on focus, stamina and mental power',
    moods: [
      { id: 'hyped', emoji: '⚡', label: 'Peak Energy', weight: 2, color: '#facc15' },
      { id: 'charged', emoji: '🔋', label: 'Fully Charged', weight: 1, color: '#10b981' },
      { id: 'drained', emoji: '🪫', label: 'Low Battery', weight: -1, color: '#f97316' },
      { id: 'sleepy', emoji: '💤', label: 'Sleepy / Tired', weight: -1, color: '#a855f7' },
      { id: 'burned', emoji: '💥', label: 'Burnout / Crash', weight: -2, color: '#dc2626' }
    ]
  },
  {
    id: 'nuanced_emotional',
    name: 'Detailed Emotional Spectrum',
    description: '7-tier granular emotional capture',
    moods: [
      { id: 'loved', emoji: '🥰', label: 'Grateful / Loved', weight: 2, color: '#ec4899' },
      { id: 'happy', emoji: '😄', label: 'Joyful', weight: 2, color: '#10b981' },
      { id: 'calm', emoji: '🙂', label: 'Calm / Content', weight: 1, color: '#06b6d4' },
      { id: 'blank', emoji: '😶', label: 'Numb / Neutral', weight: 0, color: '#64748b' },
      { id: 'anxious', emoji: '😟', label: 'Anxious / Worried', weight: -1, color: '#f59e0b' },
      { id: 'sad', emoji: '😢', label: 'Sad / Low', weight: -1, color: '#6366f1' },
      { id: 'furious', emoji: '😡', label: 'Frustrated / Angry', weight: -2, color: '#ef4444' }
    ]
  }
];

// Rich Multi-Mood Sample Telemetry Entries
export const SAMPLE_LOGS = [
  {
    id: 'sample_rad_1',
    zettelId: '20260803-1000',
    timestamp: '2026-08-03T17:00:00.000Z',
    title: 'Super Happy Focus Flow 😍',
    type: 'mood',
    mood: { id: 'rad', emoji: '😍', label: 'Rad', weight: 2, color: '#10b981' },
    content: 'Completed 2 hours of deep work! Drank 8 sips of water and took a morning walk in natural sunlight.',
    tags: ['#sip', '#deep_work', '#walk', '#telemetry', '#sample_data'],
    isSample: true,
    createdPT: '20260803-1000'
  },
  {
    id: 'sample_good_1',
    zettelId: '20260803-1130',
    timestamp: '2026-08-03T18:30:00.000Z',
    title: 'Good Energy & Reading Session 😊',
    type: 'mood',
    mood: { id: 'good', emoji: '😊', label: 'Good', weight: 1, color: '#3b82f6' },
    content: 'Enjoyed 30 minutes reading Project Hail Mary. Took morning meds on schedule.',
    tags: ['#reading', '#meds', '#sip', '#sample_data'],
    isSample: true,
    createdPT: '20260803-1130'
  },
  {
    id: 'sample_meh_1',
    zettelId: '20260803-1300',
    timestamp: '2026-08-03T20:00:00.000Z',
    title: 'Midday Meh Slump 😐',
    type: 'mood',
    mood: { id: 'meh', emoji: '😐', label: 'Meh', weight: 0, color: '#f59e0b' },
    content: 'Felt flat and distracted after lunch. High screen time without outdoor breaks.',
    tags: ['#screen_time', '#slump', '#sample_data'],
    isSample: true,
    createdPT: '20260803-1300'
  },
  {
    id: 'sample_low_1',
    zettelId: '20260803-1445',
    timestamp: '2026-08-03T21:45:00.000Z',
    title: 'Low Battery & Heavy Head 😔',
    type: 'mood',
    mood: { id: 'bad', emoji: '😔', label: 'Low', weight: -1, color: '#ec4899' },
    content: 'Dehydration detected. Only drank 2 sips all afternoon. High heat outdoors.',
    tags: ['#dehydration', '#headache', '#weather', '#sample_data'],
    isSample: true,
    createdPT: '20260803-1445'
  },
  {
    id: 'sample_distress_1',
    zettelId: '20260803-1620',
    timestamp: '2026-08-03T23:20:00.000Z',
    title: 'Severe Stress & Distress State 😭',
    type: 'mood',
    mood: { id: 'awful', emoji: '😭', label: 'Distress', weight: -2, color: '#ef4444' },
    content: 'Unexpected surge of anxiety during deadline crunch. Missed afternoon water sip targets.',
    tags: ['#anxiety', '#dehydration', '#crash', '#sample_data'],
    isSample: true,
    createdPT: '20260803-1620'
  },
  {
    id: 'sample_angry_1',
    zettelId: '20260803-1750',
    timestamp: '2026-08-04T00:50:00.000Z',
    title: 'Frustrated / Angry State 😡',
    type: 'mood',
    mood: { id: 'furious', emoji: '😡', label: 'Frustrated', weight: -2, color: '#ef4444' },
    content: 'Interrupted while recording microlog telemetry. High noise levels in environment.',
    tags: ['#noise', '#frustration', '#sample_data'],
    isSample: true,
    createdPT: '20260803-1750'
  }
];

// Default Sip & Pee Telemetry Settings
export const DEFAULT_SIP_SETTINGS = {
  sipVolumeMl: 15,
  unit: 'ml',
  dailySipTarget: 40,
  todaySipCount: 12,
  todayPeeCount: 3
};

export function getLogs() {
  const data = localStorage.getItem(STORAGE_KEYS.LOGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(SAMPLE_LOGS));
    return SAMPLE_LOGS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse logs', e);
    return SAMPLE_LOGS;
  }
}

export function saveLog(newLog) {
  const currentLogs = getLogs();
  const updated = [newLog, ...currentLogs];
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  return updated;
}

export function deleteLog(logId) {
  const currentLogs = getLogs();
  const updated = currentLogs.filter(l => l.id !== logId);
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  return updated;
}

export function deleteMultipleLogs(logIds) {
  const currentLogs = getLogs();
  const idSet = new Set(logIds);
  const updated = currentLogs.filter(l => !idSet.has(l.id));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  return updated;
}

export function deleteAllSampleLogs() {
  const currentLogs = getLogs();
  const updated = currentLogs.filter(l => !l.isSample && !l.id.includes('sample'));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  return updated;
}

export function nukeAllLogs() {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  return [];
}

export function bulkUpdateLogs(logIds, { addTag, appendText, prependText }) {
  const currentLogs = getLogs();
  const idSet = new Set(logIds);

  const updated = currentLogs.map(log => {
    if (!idSet.has(log.id)) return log;

    let updatedTags = log.tags ? [...log.tags] : [];
    if (addTag && addTag.trim()) {
      const cleanTag = addTag.trim().startsWith('#') ? addTag.trim() : `#${addTag.trim()}`;
      if (!updatedTags.includes(cleanTag)) {
        updatedTags.push(cleanTag);
      }
    }

    let updatedContent = log.content || '';
    if (prependText && prependText.trim()) {
      updatedContent = `${prependText.trim()}\n\n${updatedContent}`;
    }
    if (appendText && appendText.trim()) {
      updatedContent = `${updatedContent}\n\n${appendText.trim()}`;
    }

    return {
      ...log,
      tags: updatedTags,
      content: updatedContent
    };
  });

  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  return updated;
}

export function getMoodSets() {
  const data = localStorage.getItem(STORAGE_KEYS.MOOD_SETS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.MOOD_SETS, JSON.stringify(DEFAULT_MOOD_SETS));
    return DEFAULT_MOOD_SETS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_MOOD_SETS;
  }
}

export function saveMoodSet(moodSet) {
  const moodSets = getMoodSets();
  const existingIdx = moodSets.findIndex(m => m.id === moodSet.id);
  let updated = [];
  if (existingIdx >= 0) {
    updated = [...moodSets];
    updated[existingIdx] = moodSet;
  } else {
    updated = [...moodSets, moodSet];
  }
  localStorage.setItem(STORAGE_KEYS.MOOD_SETS, JSON.stringify(updated));
  return updated;
}

export function getActiveMoodSetId() {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_MOOD_SET_ID) || 'standard_5';
}

export function setActiveMoodSetId(id) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_MOOD_SET_ID, id);
}

export function getSipSettings() {
  const data = localStorage.getItem(STORAGE_KEYS.SIP_SETTINGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SIP_SETTINGS, JSON.stringify(DEFAULT_SIP_SETTINGS));
    return DEFAULT_SIP_SETTINGS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_SIP_SETTINGS;
  }
}

export function saveSipSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SIP_SETTINGS, JSON.stringify(settings));
}

export const DEFAULT_TASK_LIST_CONFIG = {
  liveListName: 'blackbox',
  backlogListName: 'roundtoit'
};

export function getTaskListConfig() {
  const data = localStorage.getItem(STORAGE_KEYS.TASK_LIST_CONFIG);
  if (!data) return DEFAULT_TASK_LIST_CONFIG;
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_TASK_LIST_CONFIG;
  }
}

export function saveTaskListConfig(config) {
  localStorage.setItem(STORAGE_KEYS.TASK_LIST_CONFIG, JSON.stringify(config));
}

export function getStoredGoals() {
  const data = localStorage.getItem(STORAGE_KEYS.GOALS);
  if (!data) {
    return null;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function saveGoal(goal) {
  const goals = getStoredGoals() || [];
  const idx = goals.findIndex(g => g.id === goal.id);
  let updated = [];
  if (idx >= 0) {
    updated = [...goals];
    updated[idx] = goal;
  } else {
    updated = [...goals, goal];
  }
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
  return updated;
}

export function clearAllCacheAndReset() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  localStorage.removeItem('blackbox_gcreds_v1');
  localStorage.removeItem('blackbox_gauth_session_v1');
  window.location.reload();
}

export function exportAllDataJSON() {
  const exportData = {
    app: 'myBlackbox Microlog Protocol',
    version: '1.0.0',
    exportTimePT: getZettelTimestamp(),
    logs: getLogs(),
    moodSets: getMoodSets(),
    activeMoodSetId: getActiveMoodSetId(),
    sipSettings: getSipSettings()
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `blackbox_backup_${getZettelTimestamp()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
