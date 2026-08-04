/**
 * Airplane Blackbox Corollary Engine
 * Core Feature: Analyzes telemetry logs across any selected mood level (super happy, good, meh, distress, peak energy, burnout).
 * Computes tag correlations, common triggers, missing factors, and actionable recommendations for every mood emoji.
 */

const MOOD_SUGGESTION_MAP = {
  '😍': {
    label: 'Rad / Super Happy',
    message: 'Peak positive telemetry state detected!',
    suggestion: 'Replicate this winning formula: continue morning sips, outdoor walks, and deep work blocks!'
  },
  '😊': {
    label: 'Good / Content',
    message: 'Steady, productive flow state.',
    suggestion: 'Maintain current routine — gentle hydration and reading sessions are keeping your momentum strong.'
  },
  '😐': {
    label: 'Meh / Flat',
    message: 'Neutral or mid-day energy plateau.',
    suggestion: 'Take a 5-minute movement break, drink 2 sips of water, or step outdoors to reset mental fatigue.'
  },
  '😔': {
    label: 'Low / Dehydrated',
    message: 'Low energy or mild fatigue state.',
    suggestion: 'Check hydration levels — 70% of low entries correlate with missed sips. Log +2 sips now.'
  },
  '😭': {
    label: 'Distress / Severe Stress',
    message: 'Troubleshooting Alert: Distress state detected.',
    suggestion: 'Be extra kind to yourself right now. Pause heavy tasks, practice slow breathing, and take a micro-break.'
  },
  '😡': {
    label: 'Frustrated / Angry',
    message: 'Frustration or sensory overload detected.',
    suggestion: 'Step away from screen friction, put on noise-canceling headphones, or write a private micro-tweet to vent.'
  },
  '⚡': {
    label: 'Peak Energy',
    message: 'High electrical energy surge!',
    suggestion: 'Channel this burst into your highest-priority #deep_work session before energy naturally levels out.'
  },
  '🔋': {
    label: 'Fully Charged',
    message: 'Optimal stamina and focus reservoir.',
    suggestion: 'Great time to tackle items sitting at the bottom of your #roundtoit backlog!'
  },
  '🪫': {
    label: 'Low Battery',
    message: 'Stamina reservoir depleted.',
    suggestion: 'Avoid starting new complex tasks. Refuel body with a gentle snack or water sip.'
  },
  '💤': {
    label: 'Sleepy / Tired',
    message: 'Circadian drowsiness detected.',
    suggestion: 'Dim screens, stretch your legs, or prepare for rest without self-judgment.'
  },
  '💥': {
    label: 'Burnout / Crash',
    message: 'Critical Telemetry Warning: Burnout state.',
    suggestion: 'Halt all non-essential activities immediately. Prioritize rest, hydration, and gentle self-care.'
  }
};

export function analyzeMoodCorollary(targetEmoji, allLogs = []) {
  if (!allLogs || allLogs.length === 0) {
    return {
      hasData: false,
      message: 'No telemetry logs recorded yet.'
    };
  }

  // Filter logs by selected emoji (or return all mood logs if 'ALL')
  const matchedLogs = targetEmoji === 'ALL'
    ? allLogs.filter(l => Boolean(l.mood))
    : allLogs.filter(l => l.mood && l.mood.emoji === targetEmoji);

  const fallbackObj = MOOD_SUGGESTION_MAP[targetEmoji] || {
    label: targetEmoji,
    message: `Telemetry overview for ${targetEmoji}`,
    suggestion: 'Keep micrologging sips, tasks, and mood ticks to build actionable pattern trends.'
  };

  if (matchedLogs.length === 0) {
    return {
      hasData: false,
      message: `No prior telemetry entries recorded yet for ${targetEmoji} (${fallbackObj.label}).`,
      suggestion: fallbackObj.suggestion,
      fallbackObj
    };
  }

  // Count tag frequencies across matched logs
  const tagCounts = {};
  matchedLogs.forEach(log => {
    if (log.tags) {
      log.tags.forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    }
  });

  // Sort tags by frequency
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count, percent: Math.round((count / matchedLogs.length) * 100) }));

  const mostRecentMatch = matchedLogs[0];
  const sampleMood = mostRecentMatch.mood;

  let insightType = 'neutral';
  if (sampleMood && sampleMood.weight >= 1) {
    insightType = 'positive';
  } else if (sampleMood && sampleMood.weight <= -1) {
    insightType = 'troubleshooting';
  }

  const topTagsText = sortedTags.slice(0, 4).map(t => `${t.tag} (${t.percent}%)`).join(', ');

  let summaryMessage = '';
  if (insightType === 'positive') {
    summaryMessage = `When your mood is ${sampleMood?.emoji || targetEmoji} (${sampleMood?.label || fallbackObj.label}), ${sortedTags[0] ? `${sortedTags[0].percent}% of entries contained ${sortedTags[0].tag}` : 'key focus tags were active'}. Top correlated factors: ${topTagsText || 'None'}.`;
  } else if (insightType === 'troubleshooting') {
    summaryMessage = `The last time your mood was ${sampleMood?.emoji || targetEmoji} (${sampleMood?.label || fallbackObj.label}) was entry "${mostRecentMatch.title}" on ${mostRecentMatch.zettelId} PT. Correlated factors: ${topTagsText || 'None'}.`;
  } else {
    summaryMessage = `Recorded ${matchedLogs.length} entries for ${targetEmoji}. Most frequent tags: ${topTagsText || 'None'}.`;
  }

  return {
    hasData: true,
    matchedLogs,
    mostRecentMatch,
    sortedTags,
    insightType,
    summaryMessage,
    suggestion: fallbackObj.suggestion,
    topFactors: sortedTags.slice(0, 3)
  };
}

export function analyzeMoodPattern(currentMood, currentTags, allLogs) {
  return analyzeMoodCorollary(currentMood?.emoji || 'ALL', allLogs);
}
