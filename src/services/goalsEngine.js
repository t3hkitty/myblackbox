/**
 * Goals, Habits & Nourishment-to-Activity Correlation Engine
 * Features:
 * - Telemetry Goal Suggestions based on frequently logged tags
 * - Gentle Nourishment-to-Activity correlation (fuel -> focus blocks)
 */

export const DEFAULT_GOALS = [
  {
    id: 'goal_1',
    title: 'Daily Hydration Target',
    linkedTag: '#sip',
    targetPerDay: 8,
    currentCount: 0,
    streak: 3
  },
  {
    id: 'goal_2',
    title: 'Deep Focus Work Block',
    linkedTag: '#deep_work',
    targetPerDay: 2,
    currentCount: 0,
    streak: 5
  },
  {
    id: 'goal_3',
    title: 'Reading Session',
    linkedTag: '#reading',
    targetPerDay: 1,
    currentCount: 0,
    streak: 2
  }
];

export function getSuggestedGoalsFromLogs(logs = [], currentGoals = []) {
  if (!logs || logs.length === 0) return [];

  const existingGoalTags = new Set(currentGoals.map(g => g.linkedTag));

  // Count tag frequencies
  const tagCounts = {};
  logs.forEach(l => {
    if (l.tags) {
      l.tags.forEach(t => {
        if (!existingGoalTags.has(t) && t !== '#telemetry' && t !== '#quick_note') {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        }
      });
    }
  });

  // Convert to suggested goals
  return Object.entries(tagCounts)
    .filter(([_, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag, count]) => {
      const cleanName = tag.replace('#', '').replace('_', ' ');
      const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      return {
        id: `sug_goal_${tag}`,
        title: `Daily ${capitalized} Target`,
        linkedTag: tag,
        targetPerDay: 2,
        currentCount: count,
        streak: 1
      };
    });
}

export function analyzeNourishmentToActivity(logs = []) {
  if (!logs || logs.length === 0) return null;

  const nourishmentLogs = logs.filter(l => l.tags && (l.tags.includes('#nourishment') || l.tags.includes('#fuel') || l.tags.includes('#snack') || l.tags.includes('#chocolate')));
  const activityLogs = logs.filter(l => l.tags && (l.tags.includes('#deep_work') || l.tags.includes('#task') || l.tags.includes('#fitness')));

  if (nourishmentLogs.length === 0) return null;

  return {
    nourishmentCount: nourishmentLogs.length,
    activityCount: activityLogs.length,
    recentFuel: nourishmentLogs[0],
    message: `You logged ${nourishmentLogs.length} nourishment fuel entry(s) which correlated with ${activityLogs.length} productive activity session(s).`
  };
}
