/**
 * Journal AI Scene Generator Service
 * Creates aesthetic, uniform visual scene illustrations based on the mood, telemetry,
 * and text of a generated journal entry, replacing random photo uploads with a cohesive artistic scene.
 */

export function buildScenePrompt(journalTitle, mood, tags = [], contentSnippet = '') {
  const moodName = mood?.label || 'Peaceful';
  const moodEmoji = mood?.emoji || '✨';

  // Extract key themes
  const isReading = tags.includes('#reading') || tags.includes('#ebook');
  const isDeepwork = tags.includes('#deep_work') || tags.includes('#workflow');
  const isExercise = tags.includes('#exercise') || tags.includes('#health');

  let themeDetails = [];
  if (isReading) themeDetails.push('open books, warm reading lamp, digital ebook glow');
  if (isDeepwork) themeDetails.push('futuristic glass workstation, glowing telemetry monitors, quiet focus ambient light');
  if (isExercise) themeDetails.push('sunlit nature path, refreshing water bottle, vibrant morning atmosphere');
  if (themeDetails.length === 0) themeDetails.push('aesthetic glassmorphic desk setup, cozy ambient twilight, cup of tea');

  const prompt = `A artistic 3d render digital illustration of a serene visual scene representing a journal entry. ${moodName} mood (${moodEmoji}). Scene features: ${themeDetails.join(', ')}. Soft warm lighting, atmospheric fog, lofi chill aesthetic, high quality render, cinematic composition.`;

  return {
    prompt,
    moodName,
    moodEmoji
  };
}

/**
 * Returns a fallback SVG scene artwork data URL based on the mood
 */
export function getPresetSceneArtwork(moodLabel = 'Peaceful') {
  const colorMap = {
    Rad: '#10b981',
    Good: '#3b82f6',
    Meh: '#f59e0b',
    Low: '#ec4899',
    Distress: '#ef4444'
  };

  const mainColor = colorMap[moodLabel] || '#8b5cf6';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="100%" height="200">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="50%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${mainColor}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.2"/>
      </linearGradient>
    </defs>
    <rect width="800" height="400" fill="url(#bgGrad)"/>
    <circle cx="650" cy="120" r="180" fill="url(#glowGrad)" filter="blur(40px)"/>
    <circle cx="150" cy="300" r="140" fill="${mainColor}" opacity="0.15" filter="blur(30px)"/>
    <path d="M 0 320 Q 200 250 400 320 T 800 280 L 800 400 L 0 400 Z" fill="rgba(255,255,255,0.03)"/>
    <text x="400" y="190" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="bold" opacity="0.95">✨ Journal Telemetry Scene Illustration ✨</text>
    <text x="400" y="230" text-anchor="middle" fill="${mainColor}" font-family="sans-serif" font-size="16" font-weight="600">Theme: ${moodLabel} Ambient State</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
