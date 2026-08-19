/**
 * Medical & Post-Procedure Exit Paperwork Aftercare Routine Engine
 * 
 * Features:
 * 1. Discharge Paperwork Parsing: Extracts medications, frequency, wound care, activity restrictions, and follow-ups.
 * 2. Routine Schedule Generation: Converts discharge instructions into morning, afternoon, evening, and bedtime routines.
 * 3. Medication Tracker Integration: Generates scheduled dosage alerts and duration countdowns.
 * 4. Recovery Milestones: Generates Days 1-3 (Acute), Days 4-7 (Sub-acute), and Week 2+ check-in tasks.
 */

export const AFTERCARE_CATEGORIES = {
  MEDICATION: { id: 'MEDICATION', label: '💊 Medication & Dosage', icon: '💊', color: '#ec4899' },
  WOUND_CARE: { id: 'WOUND_CARE', label: '🩹 Wound & Dressing Care', icon: '🩹', color: '#f59e0b' },
  ACTIVITY_RESTRICTION: { id: 'ACTIVITY_RESTRICTION', label: '🛑 Activity & Physical Restrictions', icon: '🛑', color: '#ef4444' },
  ICE_HEAT_CYCLE: { id: 'ICE_HEAT_CYCLE', label: '🧊 Ice / Heat Therapy', icon: '🧊', color: '#06b6d4' },
  FOLLOW_UP: { id: 'FOLLOW_UP', label: '📅 Follow-Up & Clinical Checkpoints', icon: '📅', color: '#8b5cf6' },
  NUTRITION_HYDRATION: { id: 'NUTRITION_HYDRATION', label: '💧 Hydration & Diet Instructions', icon: '💧', color: '#10b981' }
};

/**
 * Parses raw text from exit paperwork / discharge documents into structured aftercare routines
 */
export function parseExitPaperwork(rawText, procedureName = 'Procedure / Visit') {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items = [];

  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();

    // 1. Medications
    if (lower.match(/(take|mg|tablet|capsule|pill|dosage|every \d+ hours|daily|twice a day|bid|tid|qid|prn|with food)/i)) {
      items.push({
        id: `med_${Date.now()}_${idx}`,
        category: 'MEDICATION',
        title: `💊 ${line}`,
        type: 'Routine Task',
        frequency: lower.includes('twice') ? 'Twice Daily (Morning/Night)' : lower.includes('every') ? 'Interval-Based' : 'Daily',
        details: line,
        tags: ['#aftercare', '#medication', '#health', '#rx']
      });
      return;
    }

    // 2. Ice / Heat
    if (lower.match(/(ice|heat|cold pack|compress|20 minutes|elevate|elevation)/i)) {
      items.push({
        id: `therapy_${Date.now()}_${idx}`,
        category: 'ICE_HEAT_CYCLE',
        title: `🧊 Ice / Elevation Routine: ${line}`,
        type: 'Care Routine',
        details: line,
        tags: ['#aftercare', '#recovery', '#therapy']
      });
      return;
    }

    // 3. Wound / Dressing Care
    if (lower.match(/(bandage|dressing|incision|gauze|keep clean|dry|ointment|neosporin|soap and water|stitches|sutures)/i)) {
      items.push({
        id: `wound_${Date.now()}_${idx}`,
        category: 'WOUND_CARE',
        title: `🩹 Dressing Care: ${line}`,
        type: 'Hygiene Routine',
        details: line,
        tags: ['#aftercare', '#woundcare', '#hygiene']
      });
      return;
    }

    // 4. Activity Restrictions
    if (lower.match(/(no heavy lifting|do not drive|rest|avoid|limit|no exercise|keep elevated|bed rest|no showering)/i)) {
      items.push({
        id: `restrict_${Date.now()}_${idx}`,
        category: 'ACTIVITY_RESTRICTION',
        title: `🛑 Restriction Alert: ${line}`,
        type: 'Safety Rule',
        details: line,
        tags: ['#aftercare', '#restriction', '#safety']
      });
      return;
    }

    // 5. Follow-Up
    if (lower.match(/(follow up|call clinic|appointment|return in|remove stitches|doctor visit|dr\.|call us if)/i)) {
      items.push({
        id: `followup_${Date.now()}_${idx}`,
        category: 'FOLLOW_UP',
        title: `📅 Follow-Up Checkpoint: ${line}`,
        type: 'Calendar Milestone',
        details: line,
        tags: ['#aftercare', '#followup', '#clinic']
      });
      return;
    }

    // Default: General Recovery Instruction
    if (line.length > 10) {
      items.push({
        id: `care_${Date.now()}_${idx}`,
        category: 'NUTRITION_HYDRATION',
        title: `💧 Care Step: ${line}`,
        type: 'General Care',
        details: line,
        tags: ['#aftercare', '#recovery']
      });
    }
  });

  return items;
}

/**
 * Builds a 3-Day structured daily aftercare schedule (Morning / Afternoon / Evening / Night)
 */
export function buildDailyAftercareSchedule(aftercareItems, procedureName = 'Post-Op Recovery') {
  const morning = [];
  const afternoon = [];
  const evening = [];
  const night = [];

  aftercareItems.forEach(item => {
    if (item.category === 'MEDICATION') {
      morning.push(`💊 AM Dose: ${item.details}`);
      evening.push(`💊 PM Dose: ${item.details}`);
    } else if (item.category === 'WOUND_CARE') {
      morning.push(`🩹 Clean & change dressing: ${item.details}`);
      night.push(`🩹 Inspect dressing before sleep`);
    } else if (item.category === 'ICE_HEAT_CYCLE') {
      morning.push(`🧊 20-min Ice Session`);
      afternoon.push(`🧊 20-min Ice Session`);
      evening.push(`🧊 20-min Ice Session`);
    } else {
      morning.push(`ℹ️ ${item.title}`);
    }
  });

  return {
    procedureName,
    created: new Date().toISOString(),
    morningRoutine: morning,
    afternoonRoutine: afternoon,
    eveningRoutine: evening,
    nightRoutine: night
  };
}
