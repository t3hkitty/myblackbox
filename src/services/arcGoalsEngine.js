/**
 * Unobtrusive Non-Judgmental AI Arc Goals Synthesizer
 * Core Philosophy: Analyzes telemetry logs and verbalized desires to gently extract overarching
 * long-term "Arc Goals" without deadlines, quotas, or judgment.
 */

const SAMPLE_ARC_GOALS = [
  {
    id: 'arc_1',
    title: '🎨 Creative Flow & Craftsmanship Arc',
    description: 'Nurturing uninterrupted deep focus blocks, writing, and creative projects.',
    linkedTags: ['#deep_work', '#reading', '#desire'],
    confidence: 'High Alignment'
  },
  {
    id: 'arc_2',
    title: '🌿 Mindful Body Wisdom Arc',
    description: 'Listening to natural hunger cues, gentle hydration, and effortless movement.',
    linkedTags: ['#sip', '#pee', '#nourishment'],
    confidence: 'Strong Rhythm'
  },
  {
    id: 'arc_3',
    title: '🌅 Serenity & Quiet Mornings Arc',
    description: 'Protecting morning energy reserves from digital friction and phone notifications.',
    linkedTags: ['#vibe', '#journal', '#attraction'],
    confidence: 'Emerging Arc'
  }
];

export function synthesizeArcGoalsFromLogs(logs = [], desires = []) {
  if ((!logs || logs.length === 0) && (!desires || desires.length === 0)) {
    return SAMPLE_ARC_GOALS;
  }

  // Count occurrence of key themes
  const tagsMap = {};
  logs.forEach(l => {
    if (l.tags) {
      l.tags.forEach(t => {
        tagsMap[t] = (tagsMap[t] || 0) + 1;
      });
    }
  });

  const arcs = [...SAMPLE_ARC_GOALS];

  // If user has strong deep work or reading logs, bump Creative Flow Arc
  if (tagsMap['#deep_work'] || tagsMap['#reading']) {
    arcs[0].confidence = `Active (${(tagsMap['#deep_work'] || 0) + (tagsMap['#reading'] || 0)} Telemetry Ticks)`;
  }

  // If user has sip or nourishment logs, bump Body Wisdom Arc
  if (tagsMap['#sip'] || tagsMap['#pee']) {
    arcs[1].confidence = `Active (${(tagsMap['#sip'] || 0) + (tagsMap['#pee'] || 0)} Hydration Ticks)`;
  }

  return arcs;
}
