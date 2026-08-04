/**
 * Zettelkasten & Flat-File Serialization Engine
 * Converts micrologs, mood events, sips, and book reviews into clean Markdown with YAML Frontmatter
 * and Notion database compatible structures.
 */

import JSZip from 'jszip';
import { getZettelTimestamp } from '../utils/timeUtils';

/**
 * Creates a standard microlog Zettel entry
 */
export function createMicrologZettel({
  title,
  content = '',
  type = 'microlog', // 'microlog' | 'mood' | 'sip' | 'task' | 'ebook_review'
  mood = null,
  tags = [],
  metadata = {},
  customTimestamp = null
}) {
  const dateObj = customTimestamp ? new Date(customTimestamp) : new Date();
  const zettelId = getZettelTimestamp(dateObj);

  // Default context tags
  const allTags = Array.from(new Set(['#telemetry', '#zettel', `#${type}`, ...tags.map(t => t.startsWith('#') ? t : `#${t}`)]));

  const entry = {
    id: `${zettelId}_${Math.random().toString(36).substring(2, 7)}`,
    zettelId,
    timestamp: dateObj.toISOString(),
    title: title || `${type.toUpperCase()} - ${zettelId}`,
    type,
    content,
    mood,
    tags: allTags,
    metadata,
    createdPT: zettelId
  };

  return entry;
}

/**
 * Converts a log entry to Zettelkasten Markdown format (.md)
 */
export function exportToMarkdown(entry) {
  const frontmatter = `---
zettel_id: "${entry.zettelId}"
timestamp_pt: "${entry.createdPT}"
type: "${entry.type}"
mood: "${entry.mood ? `${entry.mood.emoji} ${entry.mood.label}` : 'N/A'}"
tags: [${entry.tags.map(t => `"${t}"`).join(', ')}]
metadata: ${JSON.stringify(entry.metadata || {}, null, 2)}
---

# ${entry.zettelId} - ${entry.title}

${entry.mood ? `> **Mood State**: ${entry.mood.emoji} **${entry.mood.label}** (Score: ${entry.mood.weight})\n` : ''}

${entry.content}

## Context & Tags
${entry.tags.join(' ')}

*Exported from myBlackbox Microlog Protocol at ${entry.createdPT} PT*
`;

  return frontmatter;
}

/**
 * Downloads a single Zettel as a .md file
 */
export function downloadMarkdownFile(entry) {
  const markdownText = exportToMarkdown(entry);
  const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${entry.zettelId}_${entry.type}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Packages ALL logs into individual .md files and downloads a ZIP archive
 */
export async function downloadAllMarkdownZIP(logs) {
  if (!logs || logs.length === 0) {
    alert('No Zettel logs available to export.');
    return;
  }

  const zip = new JSZip();
  const folder = zip.folder(`blackbox_zettel_logs_${getZettelTimestamp()}`);

  logs.forEach(log => {
    const mdContent = exportToMarkdown(log);
    const fileName = `${log.zettelId}_${log.type}_${log.id.substring(0, 6)}.md`;
    folder.file(fileName, mdContent);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `blackbox_zettel_all_logs_${getZettelTimestamp()}.zip`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Formats and downloads entry as Google Keep Note format
 */
export function exportToGoogleKeep(entry) {
  const keepNote = {
    title: `[Keep Note] ${entry.title} (${entry.zettelId} PT)`,
    textContent: `${entry.content}\n\n#blackbox #keep ${entry.tags.join(' ')}`,
    color: 'DEFAULT',
    isArchived: false,
    isPinned: true,
    userEditedTimestampUsec: Date.now() * 1000
  };

  const blob = new Blob([JSON.stringify(keepNote, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `keep_note_${entry.zettelId}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Simulates / formats entry for Google Drive sync folder structure
 */
export function exportToGoogleDrive(entry) {
  const mdContent = exportToMarkdown(entry);
  const drivePath = `GoogleDrive/myBlackbox_logs/${entry.zettelId}_${entry.type}.md`;
  
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${entry.zettelId}_${entry.type}_gdrive.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

