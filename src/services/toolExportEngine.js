/**
 * Tool Compatibility & Interoperability Engine
 * Curated catalog of top PKM, note-taking, and telemetry tools with export format specs.
 * Includes "Untested / Best Effort Schema Compatibility" verbiage for seamless developer decoupling.
 */

import JSZip from 'jszip';
import { exportToMarkdown, exportToGoogleKeep } from './zettelEngine';
import { getZettelTimestamp } from '../utils/timeUtils';

export const COMPATIBLE_TOOLS = [
  {
    id: 'obsidian',
    name: 'Obsidian.md',
    category: 'PKM & Zettelkasten',
    fileType: '.md (Markdown + YAML Frontmatter)',
    statusBadge: 'Untested / Standard Schema Compatible',
    icon: '💎',
    description: 'Direct Zettelkasten Vault import. Frontmatter tags & Pacific Time timestamps map to Obsidian graph nodes.',
    formatNote: 'Place exported .md files into your Obsidian vault directory.'
  },
  {
    id: 'joplin',
    name: 'Joplin',
    category: 'Note-Taking & Encrypted Sync',
    fileType: '.md / Raw Markdown Folder',
    statusBadge: 'Untested / Standard Schema Compatible',
    icon: '🐘',
    description: 'Markdown import compatible with Joplin notebook structures and tag hierarchies.',
    formatNote: 'Use File ➔ Import ➔ Markdown (Directory) in Joplin.'
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Database & Knowledge Base',
    fileType: '.csv / Markdown Database Zip',
    statusBadge: 'Untested / Standard Schema Compatible',
    icon: '📑',
    description: 'Exports Notion-compatible database CSV with properties: Zettel ID, Mood, Tags, Type, and Timestamp.',
    formatNote: 'Use Notion ➔ Merge / Import CSV into any database view.'
  },
  {
    id: 'logseq',
    name: 'Logseq',
    category: 'Outliner & Zettelkasten Graph',
    fileType: '.md (Page & Block Tags)',
    statusBadge: 'Untested / Standard Schema Compatible',
    icon: '🪵',
    description: 'Formatted with block-level tags (#telemetry, #zettel, #mood) for Logseq graph queries.',
    formatNote: 'Copy .md files directly to pages/ directory in Logseq graph.'
  },
  {
    id: 'roam',
    name: 'Roam Research',
    category: 'Networked Thought Graph',
    fileType: '.json (Roam JSON Format)',
    statusBadge: 'Untested / Standard Schema Compatible',
    icon: '🧠',
    description: 'Converts Zettel logs into Roam graph JSON pages with bi-directional [[tag]] references.',
    formatNote: 'Use Roam ➔ Import ➔ JSON file.'
  },
  {
    id: 'daylio',
    name: 'Daylio',
    category: 'Mood & Habit Tracker',
    fileType: '.csv (Daylio Schema)',
    statusBadge: 'Untested / Best Effort Export',
    icon: '😄',
    description: 'Converts mood telemetry and tags into Daylio CSV format for habit analysis.',
    formatNote: 'Compatible with Daylio CSV import utilities.'
  },
  {
    id: 'google_keep',
    name: 'Google Keep',
    category: 'Quick Notes & Checklists',
    fileType: '.json / Keep Note Schema',
    statusBadge: 'Untested / Schema Compatible',
    icon: '📝',
    description: 'Packages Zettel logs into Google Keep note cards with labels & pinned status.',
    formatNote: 'Import via Google Takeout or Keep API utilities.'
  },
  {
    id: 'readwise',
    name: 'Readwise / Kindle',
    category: 'Reading Highlights & Reviews',
    fileType: '.md / Book Review Schema',
    statusBadge: 'Untested / Schema Compatible',
    icon: '📖',
    description: 'Exports Ebook Session Zettel cards and micro-tweets in Readwise Markdown format.',
    formatNote: 'Upload .md files to Readwise custom Markdown integration.'
  }
];

/**
 * Generates Notion Database CSV string from logs
 */
export function exportNotionCSV(logs) {
  const headers = ['Zettel ID', 'Title', 'Type', 'Mood Emoji', 'Mood Label', 'Mood Weight', 'Tags', 'Timestamp PT', 'Content'];
  
  const rows = logs.map(l => [
    `"${l.zettelId}"`,
    `"${(l.title || '').replace(/"/g, '""')}"`,
    `"${l.type}"`,
    `"${l.mood?.emoji || ''}"`,
    `"${l.mood?.label || ''}"`,
    `"${l.mood?.weight ?? ''}"`,
    `"${(l.tags || []).join(' ')}"`,
    `"${l.createdPT || ''}"`,
    `"${(l.content || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `blackbox_notion_import_${getZettelTimestamp()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports Roam Research JSON format
 */
export function exportRoamJSON(logs) {
  const roamPages = logs.map(l => ({
    title: `${l.zettelId} - ${l.title}`,
    children: [
      { string: `Mood: ${l.mood ? `${l.mood.emoji} ${l.mood.label}` : 'N/A'}` },
      { string: `Tags: ${l.tags.map(t => `[[${t.replace('#', '')}]]`).join(' ')}` },
      { string: l.content || 'No text note.' }
    ]
  }));

  const blob = new Blob([JSON.stringify(roamPages, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `blackbox_roam_graph_${getZettelTimestamp()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
