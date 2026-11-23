/**
 * 🐾 MBB Emoji Folder Scaffolding
 * Parses `<emoji>//<folder>/<subfolders>/<title>` (e.g., `🤣//jokes/true`) into
 * collapsible hierarchical folder trees while preserving the full path string
 * as the Google Tasks title.
 */

import { MBBTask, EmojiFolderNode } from './types';

export interface ParsedEmojiPath {
  emoji?: string;
  folderPath: string[]; // e.g. ["jokes"]
  cleanTitle: string;   // e.g. "true"
  fullTitle: string;
}

/**
 * Parses path format: `<emoji>//<folder>/<subfolders>/<title>`
 * Examples:
 *   "🤣//jokes/true" -> emoji: "🤣", folderPath: ["jokes"], cleanTitle: "true"
 *   "💊//health/meds/morning" -> emoji: "💊", folderPath: ["health", "meds"], cleanTitle: "morning"
 *   "Regular Task" -> emoji: undefined, folderPath: [], cleanTitle: "Regular Task"
 */
export function parseEmojiFolderPath(title: string): ParsedEmojiPath {
  const clean = title.trim();
  const doubleSlashIdx = clean.indexOf('//');

  if (doubleSlashIdx !== -1) {
    const prefix = clean.slice(0, doubleSlashIdx).trim();
    const remaining = clean.slice(doubleSlashIdx + 2).trim();

    const parts = remaining.split('/').map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      const folderPath = parts.slice(0, -1);
      const cleanTitle = parts[parts.length - 1];
      return {
        emoji: prefix || undefined,
        folderPath,
        cleanTitle,
        fullTitle: clean
      };
    } else if (parts.length === 1) {
      return {
        emoji: prefix || undefined,
        folderPath: [],
        cleanTitle: parts[0],
        fullTitle: clean
      };
    }
  }

  return {
    emoji: undefined,
    folderPath: [],
    cleanTitle: clean,
    fullTitle: clean
  };
}

/**
 * Builds a hierarchical tree from a list of MBB tasks based on their emoji folder paths.
 */
export function buildEmojiFolderTree(tasks: MBBTask[]): EmojiFolderNode {
  const root: EmojiFolderNode = {
    name: 'Root',
    fullPath: '',
    tasks: [],
    subfolders: {}
  };

  for (const task of tasks) {
    const parsed = parseEmojiFolderPath(task.title);
    let currentNode = root;

    if (parsed.folderPath.length === 0) {
      root.tasks.push(task);
      continue;
    }

    let accumulatedPath = '';
    for (let i = 0; i < parsed.folderPath.length; i++) {
      const folderName = parsed.folderPath[i];
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${folderName}` : folderName;

      if (!currentNode.subfolders[folderName]) {
        currentNode.subfolders[folderName] = {
          name: folderName,
          emoji: i === 0 ? parsed.emoji : undefined,
          fullPath: accumulatedPath,
          tasks: [],
          subfolders: {}
        };
      }
      currentNode = currentNode.subfolders[folderName];
    }

    currentNode.tasks.push(task);
  }

  return root;
}
