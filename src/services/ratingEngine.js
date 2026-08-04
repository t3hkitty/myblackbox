/**
 * Ebook AI-Driven Rating Engine & Review Serialization
 * Calculates an algorithmic book rating guesstimate (1.0 - 5.0) tailored to this specific reader,
 * based on mood shifts, author history, series context, and reader survey answers.
 */

import { exportToMarkdown } from './zettelEngine';
import { getZettelTimestamp, formatDuration } from '../utils/timeUtils';
import { generateGeminiBookRating } from './geminiService';

export function calculateAiBookRating({
  title,
  author,
  isWebnovel,
  seriesName,
  moodBefore,
  moodAfter,
  changeOneThing,
  wouldReadMore,
  hasReadAuthorBefore,
  pastBooksCount = 0,
  additionalComments = ''
}) {
  let score = 3.5; // Baseline score
  const rationales = [];

  // Mood improvement calculation
  if (moodBefore && moodAfter) {
    const moodDiff = (moodAfter.weight || 0) - (moodBefore.weight || 0);
    if (moodDiff > 0) {
      score += 0.6;
      rationales.push(`(+) Mood improved from ${moodBefore.emoji} to ${moodAfter.emoji} during session (+0.6)`);
    } else if (moodDiff < 0) {
      score -= 0.5;
      rationales.push(`(-) Mood dropped from ${moodBefore.emoji} to ${moodAfter.emoji} during reading (-0.5)`);
    } else {
      rationales.push(`(=) Mood remained stable (${moodAfter.emoji})`);
    }
  }

  // Would read more like this
  if (wouldReadMore === 'yes') {
    score += 0.5;
    rationales.push('(+) Reader stated they would read more books like this (+0.5)');
  } else if (wouldReadMore === 'no') {
    score -= 0.8;
    rationales.push('(-) Reader expressed no desire to read similar titles (-0.8)');
  }

  // Author familiarity
  if (hasReadAuthorBefore) {
    score += 0.3;
    rationales.push(`(+) Reader has previous reading history with author "${author}" (+0.3)`);
  }

  // Webnovel / Series multiplier
  if (isWebnovel) {
    score += 0.2;
    rationales.push('(+) Webnovel format matches reader preference profile (+0.2)');
  }

  // Sentiment analysis on "change one thing"
  if (changeOneThing && changeOneThing.length > 5) {
    if (/nothing|perfect|loved it|none/i.test(changeOneThing)) {
      score += 0.4;
      rationales.push('(+) "Change 1 thing" feedback was empty or highly positive (+0.4)');
    } else if (/slow|pacing|boring|ending|character/i.test(changeOneThing)) {
      score -= 0.3;
      rationales.push(`(-) Minor critique identified in feedback ("${changeOneThing.substring(0, 30)}...") (-0.3)`);
    }
  }

  // Clamp score between 1.0 and 5.0
  const finalRating = Math.min(5.0, Math.max(1.0, Math.round(score * 10) / 10));

  return {
    rating: finalRating,
    stars: '★'.repeat(Math.floor(finalRating)) + (finalRating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(finalRating)),
    rationales
  };
}

/**
 * Formats a completed Ebook Review into a Zettelkasten Markdown Card
 */
export function generateEbookReviewZettel(data) {
  const zettelId = getZettelTimestamp(new Date(data.endTime || Date.now()));
  const aiRating = calculateAiBookRating(data);

  const durationStr = formatDuration(data.sessionDurationSeconds || 0);

  const markdownContent = `---
zettel_id: "${zettelId}"
type: "ebook_review"
book_title: "${data.title}"
author: "${data.author}"
series: "${data.seriesName || 'N/A'}"
is_webnovel: ${data.isWebnovel ? true : false}
ai_rating: ${aiRating.rating}
tags: ["#reading", "#ebook", "#review", "#zettel", "#telemetry"]
---

# 📚 ${data.title} ${data.seriesName ? `(${data.seriesName})` : ''}
**Author**: ${data.author} | **Type**: ${data.isWebnovel ? 'Webnovel / Serial' : 'Ebook / Novel'}

### 🤖 AI Predicted Rating: ${aiRating.stars} (${aiRating.rating} / 5.0)
> **Rating Rationale**:
${aiRating.rationales.map(r => `- ${r}`).join('\n')}

---

### ⏱️ Reading Session Telemetry
- **Start Time**: ${data.startTimePT || 'N/A'}
- **End Time**: ${data.endTimePT || 'N/A'}
- **Total Duration**: ${durationStr}
- **Logged Mood Shift**: ${data.moodBefore?.emoji || 'N/A'} ➔ ${data.moodAfter?.emoji || 'N/A'}

---

### 📝 Reader Review Survey
1. **Mood (Before & After)**: Started ${data.moodBefore?.emoji || 'N/A'} (${data.moodBefore?.label}), Ended ${data.moodAfter?.emoji || 'N/A'} (${data.moodAfter?.label})
2. **1 Thing You'd Change**: ${data.changeOneThing || 'None'}
3. **Would You Read More Like This?**: ${data.wouldReadMore ? data.wouldReadMore.toUpperCase() : 'N/A'}
4. **Additional Comments**: ${data.additionalComments || 'None'}

### 📖 Synopsis & Context
${data.synopsis || 'No synopsis provided.'}

*Zettel Card Created at ${zettelId} PT via myBlackbox Ebook Protocol*
`;

  return {
    id: `${zettelId}_book_${Math.random().toString(36).substring(2, 6)}`,
    zettelId,
    timestamp: new Date().toISOString(),
    title: `BOOK REVIEW: ${data.title} by ${data.author}`,
    type: 'ebook_review',
    content: markdownContent,
    mood: data.moodAfter,
    tags: ['#reading', '#ebook', '#review', '#zettel', '#telemetry'],
    metadata: {
      bookTitle: data.title,
      author: data.author,
      rating: aiRating.rating,
      durationSeconds: data.sessionDurationSeconds,
      wouldReadMore: data.wouldReadMore
    },
    aiRating,
    rawReviewData: data
  };
}
