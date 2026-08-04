/**
 * Auto Tag Suggestions Engine
 * Analyzes text input in real-time to suggest relevant Zettel tags.
 */

const KEYWORD_TAG_MAP = [
  { keywords: ['water', 'sip', 'drink', 'hydrat', 'fluid', 'bottle', 'cup', 'oz', 'gallon'], tag: '#sip' },
  { keywords: ['headache', 'pain', 'migraine', 'ache', 'sore'], tag: '#headache' },
  { keywords: ['med', 'pill', 'dose', 'vitamin', 'supplement', 'advil', 'tylenol', 'rx'], tag: '#meds' },
  { keywords: ['choc', 'cocoa', 'sweet', 'candy', 'snack'], tag: '#chocolate' },
  { keywords: ['read', 'book', 'author', 'chapter', 'epub', 'page', 'novel'], tag: '#reading' },
  { keywords: ['focus', 'deep', 'work', 'code', 'build', 'study', 'flow', 'pomodoro'], tag: '#deep_work' },
  { keywords: ['anxi', 'stress', 'overwhelm', 'worry', 'panic', 'nervous'], tag: '#anxiety' },
  { keywords: ['happy', 'joy', 'great', 'awesome', 'excited', 'stoked', 'rad'], tag: '#happy' },
  { keywords: ['tired', 'sleep', 'fatigue', 'exhaust', 'nap', 'rest'], tag: '#sleep' },
  { keywords: ['journal', 'reflect', 'thought', 'idea', 'brain dump', 'dump'], tag: '#journal' },
  { keywords: ['task', 'todo', 'finish', 'complete', 'project', 'roundtoit'], tag: '#task' },
  { keywords: ['walk', 'run', 'gym', 'workout', 'fit', 'exercise'], tag: '#fitness' }
];

export function getAutoTagSuggestions(text = '', currentTags = []) {
  if (!text || typeof text !== 'string') return [];

  const lowerText = text.toLowerCase();
  const suggestions = new Set();

  KEYWORD_TAG_MAP.forEach(item => {
    const hasKeywordMatch = item.keywords.some(kw => lowerText.includes(kw));
    if (hasKeywordMatch && !currentTags.includes(item.tag)) {
      suggestions.add(item.tag);
    }
  });

  return Array.from(suggestions);
}
