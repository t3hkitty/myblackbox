/**
 * User-Managed Gemini AI Service
 * Manages user's personal Google Gemini API key and connects it to AI features:
 * - Real-time LLM book rating guesstimator
 * - Blackbox root-cause troubleshooting analysis
 * - Daily journal scene prompt synthesis
 */

const GEMINI_KEY_STORAGE = 'blackbox_gemini_api_key_v1';

export function getStoredGeminiKey() {
  return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
}

export function saveGeminiKey(key) {
  if (key) {
    localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
  }
}

/**
 * Tests connectivity of user-provided Gemini API key
 */
export async function testGeminiKeyConnectivity(apiKey) {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Please enter an API key.' };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with "OK"' }] }]
      })
    });

    const data = await response.json();
    if (response.ok && data.candidates) {
      return { success: true, message: '🟢 Gemini API Key is valid & connected!' };
    } else {
      return { success: false, message: `🔴 Error: ${data.error?.message || 'Invalid API Key'}` };
    }
  } catch (err) {
    return { success: false, message: `🔴 Network Error: ${err.message}` };
  }
}

/**
 * Generates an LLM-powered book rating analysis using Gemini
 */
export async function generateGeminiBookRating(bookData) {
  const apiKey = getStoredGeminiKey();
  if (!apiKey) return null; // Fallback to algorithmic engine

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Analyze this reader's book experience and predict a rating from 1.0 to 5.0 stars with 3 bullet point rationales:
Book: "${bookData.title}" by ${bookData.author}
Series: ${bookData.seriesName || 'N/A'}
Webnovel: ${bookData.isWebnovel ? 'Yes' : 'No'}
Mood Before: ${bookData.moodBefore?.emoji || 'N/A'} ${bookData.moodBefore?.label || 'N/A'}
Mood After: ${bookData.moodAfter?.emoji || 'N/A'} ${bookData.moodAfter?.label || 'N/A'}
1 Thing to Change: "${bookData.changeOneThing || 'None'}"
Would Read More: "${bookData.wouldReadMore || 'N/A'}"

Return JSON format: {"rating": 4.5, "rationales": ["rationale 1", "rationale 2", "rationale 3"]}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();
    if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      const jsonText = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(jsonText);
      return {
        rating: Math.min(5.0, Math.max(1.0, parsed.rating)),
        stars: '★'.repeat(Math.floor(parsed.rating)) + '☆'.repeat(5 - Math.floor(parsed.rating)),
        rationales: parsed.rationales.map(r => `(Gemini AI) ${r}`)
      };
    }
  } catch (err) {
    console.warn('Gemini API call failed, using fallback rating engine', err);
  }
  return null;
}
