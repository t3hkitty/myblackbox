/**
 * 🐾 MBB Stage Director Milestone Engine & Preset Templates
 * Fasting, Workout/Lifting, and Blank Custom presets with token rendering.
 */

import { StageDirectorProfile, StageProfileItem } from './types';
import { formatDurationHuman, toRomanNumeral } from './roman';

export const STAGE_DIRECTOR_STORAGE_KEY = 'mbb_stage_director_profiles_v1';

export const FASTING_PRESET: StageDirectorProfile = {
  id: 'fasting',
  name: 'Intermittent Fasting & Autophagy',
  trigger_type: 'duration_minutes',
  stages: [
    {
      stage_key: 'digestion',
      threshold: 0,
      label: '0h Digestion & Blood Sugar Drop',
      done_message: 'Passed 0h: Digestive baseline established for {title}.'
    },
    {
      stage_key: 'glycogen_depletion',
      threshold: 360, // 6h
      label: '6h Glycogen Depletion',
      done_message: 'Passed 6h ({hours}h): Liver glycogen depleting; shifting towards lipid metabolism.'
    },
    {
      stage_key: 'fat_burning',
      threshold: 720, // 12h
      label: '12h Fat Burning / Early Ketosis',
      done_message: 'Passed 12h: Fat burning activated & early ketone production underway.'
    },
    {
      stage_key: 'autophagy_activation',
      threshold: 960, // 16h
      label: '16h Autophagy Activation',
      done_message: 'Passed 16h: Autophagy activated; cellular recycling of senescent components initiated.'
    },
    {
      stage_key: 'deep_autophagy',
      threshold: 1440, // 24h
      label: '24h Deep Autophagy & Ketosis',
      done_message: 'Passed 24h: Deep autophagy reached; substantial metabolic renewal ({duration}).'
    },
    {
      stage_key: 'peak_autophagy',
      threshold: 2880, // 48h
      label: '48h Peak Autophagy & Immune Renewal',
      done_message: 'Passed 48h ({duration}): Peak autophagy & stem cell immune regeneration.'
    }
  ]
};

export const WORKOUT_PRESET: StageDirectorProfile = {
  id: 'workout',
  name: 'Workout / Lifting Session',
  trigger_type: 'duration_minutes',
  stages: [
    {
      stage_key: 'warmed_up',
      threshold: 30,
      label: '30m Warmed Up',
      done_message: '30m warm-up complete for {title}.'
    },
    {
      stage_key: 'solid_session',
      threshold: 60,
      label: '60m Solid Session',
      done_message: '60m solid training session locked in ({duration}).'
    },
    {
      stage_key: 'deadlift_overkill',
      threshold: 120,
      label: '120m Beast Mode',
      done_message: 'Achievement unlocked: Deadlifted for two many hours ({duration}).'
    }
  ]
};

export const HYDRATION_TICKER_PRESET: StageDirectorProfile = {
  id: 'hydration_ticker',
  name: 'Hydration & Micro-Dosing Ticker',
  trigger_type: 'tick_count',
  stages: [
    {
      stage_key: 'sip_starter',
      threshold: 3,
      label: 'III Sips - Awakened',
      done_message: 'III ticks reached for {title}: Habit loop active!'
    },
    {
      stage_key: 'sip_master',
      threshold: 8,
      label: 'VIII Sips - Super Hydrated',
      done_message: 'VIII ticks ({roman}): Hydration quota fulfilled ({count} ticks)!'
    }
  ]
};

export const BLANK_CUSTOM_PRESET: StageDirectorProfile = {
  id: 'custom_blank',
  name: 'Blank Custom Profile',
  trigger_type: 'duration_minutes',
  stages: [
    {
      stage_key: 'milestone_1',
      threshold: 15,
      label: '15m Milestone',
      done_message: 'Reached 15m for {title} ({duration})!'
    }
  ]
};

export function getDefaultStageProfiles(): StageDirectorProfile[] {
  return [FASTING_PRESET, WORKOUT_PRESET, HYDRATION_TICKER_PRESET];
}

export function loadStageProfiles(): StageDirectorProfile[] {
  try {
    if (typeof localStorage === 'undefined') return getDefaultStageProfiles();
    const raw = localStorage.getItem(STAGE_DIRECTOR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load Stage Director profiles:', err);
  }
  return getDefaultStageProfiles();
}

export function saveStageProfiles(profiles: StageDirectorProfile[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STAGE_DIRECTOR_STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.warn('Failed to save Stage Director profiles:', err);
  }
}

/**
 * Evaluates progress against a profile and returns reached stages and next stage.
 */
export function evaluateStageProgress(
  profile: StageDirectorProfile,
  value: number // minutes for duration_minutes, or count for tick_count
): {
  reachedStages: StageProfileItem[];
  highestStage?: StageProfileItem;
  nextStage?: StageProfileItem;
} {
  const sorted = [...profile.stages].sort((a, b) => a.threshold - b.threshold);
  const reached = sorted.filter(s => value >= s.threshold);
  const highest = reached[reached.length - 1];
  const next = sorted.find(s => value < s.threshold);

  return {
    reachedStages: reached,
    highestStage: highest,
    nextStage: next
  };
}

/**
 * Renders tokens in done_message template: {title}, {duration}, {hours}, {count}, {roman}
 */
export function renderDoneMessage(
  template: string,
  params: {
    title: string;
    durationMinutes?: number;
    count?: number;
    roman?: string;
  }
): string {
  const duration = formatDurationHuman(params.durationMinutes || 0);
  const hours = ((params.durationMinutes || 0) / 60).toFixed(1).replace(/\.0$/, '');
  const count = String(params.count || 0);
  const roman = params.roman || toRomanNumeral(params.count || 0);

  return template
    .replace(/{title}/g, params.title)
    .replace(/{duration}/g, duration)
    .replace(/{hours}/g, hours)
    .replace(/{count}/g, count)
    .replace(/{roman}/g, roman);
}
