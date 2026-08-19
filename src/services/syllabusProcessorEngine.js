/**
 * Syllabus Processor Engine: Granular Task Breakdown & Reading/Writing Speed Pace Adjuster
 * 
 * Features:
 * 1. Syllabus Parsing: Splits raw course syllabi/prompts into actionable micro-tasks.
 * 2. Granular Breakdown: Automatically splits essays/papers into Outline, Draft, and Edit sub-tasks.
 * 3. Pace Presets (Slow / Standard / Fast): Adjusts reading & writing time allocations.
 * 4. Group Assignment Linkage: Assigns sub-tasks to classmates (#person_name).
 */

export const PACE_PRESETS = {
  SLOW: { id: 'SLOW', label: '🐢 Slow / Meticulous', readingWpm: 150, writingWpm: 15, multiplier: 1.75, description: 'Dense academic texts, deep research & technical drafting' },
  STANDARD: { id: 'STANDARD', label: '⚖️ Standard / Average', readingWpm: 250, writingWpm: 30, multiplier: 1.0, description: 'Standard course textbooks & typical essay assignments' },
  FAST: { id: 'FAST', label: '🐇 Fast / Skimmer', readingWpm: 400, writingWpm: 50, multiplier: 0.65, description: 'Light reading, quick outlines, skimming & summaries' }
};

/**
 * Calculates estimated reading time in minutes based on page count and pace preset
 */
export function calculateReadingTime(pagesCount, paceKey = 'STANDARD') {
  const spec = PACE_PRESETS[paceKey] || PACE_PRESETS.STANDARD;
  const totalWords = (pagesCount || 1) * 250; // Avg 250 words per page
  const mins = Math.ceil((totalWords / spec.readingWpm) * spec.multiplier);
  return Math.max(5, mins);
}

/**
 * Calculates estimated writing time in minutes based on word count and pace preset
 */
export function calculateWritingTime(wordsCount, paceKey = 'STANDARD') {
  const spec = PACE_PRESETS[paceKey] || PACE_PRESETS.STANDARD;
  const mins = Math.ceil(((wordsCount || 500) / spec.writingWpm) * spec.multiplier);
  return Math.max(15, mins);
}

/**
 * Parses raw syllabus text into granular task objects
 */
export function parseSyllabusTasks(syllabusText, courseCode = 'CS101', paceKey = 'STANDARD') {
  if (!syllabusText || !syllabusText.trim()) return [];

  const lines = syllabusText.split(/\r?\n/).filter(l => l.trim().length > 0);
  const parsedTasks = [];

  lines.forEach((line, idx) => {
    const clean = line.trim();
    if (clean.length < 3) return;

    // Detect Reading Tasks
    const readMatch = clean.match(/read(ing)?[:\s]+(?:ch|chapter)?\s*(\d+)?\s*(?:pp\.?|pages)?\s*(\d+)?[-–]?(\d+)?/i);
    if (readMatch) {
      const startPg = parseInt(readMatch[3], 10) || 1;
      const endPg = parseInt(readMatch[4], 10) || (startPg + 15);
      const pageCount = Math.max(1, endPg - startPg + 1);
      const estMins = calculateReadingTime(pageCount, paceKey);

      parsedTasks.push({
        id: `task_read_${Date.now()}_${idx}`,
        title: `📖 ${courseCode}: Read Pages ${startPg}-${endPg} (${pageCount} pgs)`,
        category: 'reading',
        estimatedMinutes: estMins,
        details: `Syllabus Reading: ${clean} (Pace: ${PACE_PRESETS[paceKey].label})`,
        tags: [`#${courseCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`, '#reading', '#school_task', '#academic']
      });
      return;
    }

    // Detect Essay / Writing Tasks
    const writeMatch = clean.match(/(essay|paper|write|writing|report|thesis)[:\s]+(\d+)?\s*(words|pages)?/i);
    if (writeMatch) {
      const targetWords = parseInt(writeMatch[2], 10) || 1000;
      const totalMins = calculateWritingTime(targetWords, paceKey);

      // Granular 3-step breakdown
      parsedTasks.push({
        id: `task_write_outline_${Date.now()}_${idx}`,
        title: `✍️ ${courseCode}: Outline & Research (${targetWords}w paper)`,
        category: 'writing',
        estimatedMinutes: Math.ceil(totalMins * 0.3),
        details: `Structure outline & citations for: ${clean}`,
        tags: [`#${courseCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`, '#writing', '#outline', '#school_task']
      });
      parsedTasks.push({
        id: `task_write_draft_${Date.now()}_${idx}`,
        title: `✍️ ${courseCode}: First Draft (${targetWords} words)`,
        category: 'writing',
        estimatedMinutes: Math.ceil(totalMins * 0.5),
        details: `Draft body paragraphs & argument for: ${clean}`,
        tags: [`#${courseCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`, '#writing', '#draft', '#school_task']
      });
      parsedTasks.push({
        id: `task_write_edit_${Date.now()}_${idx}`,
        title: `✍️ ${courseCode}: Proofread & Format Submission`,
        category: 'writing',
        estimatedMinutes: Math.ceil(totalMins * 0.2),
        details: `Final grammar check & bibliography for: ${clean}`,
        tags: [`#${courseCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`, '#writing', '#editing', '#school_task']
      });
      return;
    }

    // Default Assignment / Project Task
    parsedTasks.push({
      id: `task_gen_${Date.now()}_${idx}`,
      title: `📝 ${courseCode}: ${clean.length > 50 ? clean.substring(0, 50) + '...' : clean}`,
      category: 'assignment',
      estimatedMinutes: 45,
      details: clean,
      tags: [`#${courseCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`, '#assignment', '#school_task']
    });
  });

  return parsedTasks;
}
