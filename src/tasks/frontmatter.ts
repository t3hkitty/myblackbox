/**
 * 🐾 Zero-Dependency YAML Frontmatter Engine
 * Non-destructive extraction & recovery for Google Tasks notes 🍙
 */

import { MBBTaskMetadata } from './types';

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const RELOCATED_FRONTMATTER_REGEX = /\n---\r?\n([\s\S]*?)\r?\n---/;

/**
 * Parses simple YAML-like key-value blocks without external dependencies.
 */
function parseSimpleYaml(yamlString: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yamlString.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    let valStr = trimmed.slice(colonIndex + 1).trim();

    // Remove wrapping quotes if present
    if ((valStr.startsWith('"') && valStr.endsWith('"')) || (valStr.startsWith("'") && valStr.endsWith("'"))) {
      valStr = valStr.slice(1, -1);
    }

    // Parse specific types
    if (valStr.startsWith('[') && valStr.endsWith(']')) {
      const items = valStr
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
      result[key] = items;
    } else if (!isNaN(Number(valStr)) && valStr !== '') {
      result[key] = Number(valStr);
    } else if (valStr === 'true') {
      result[key] = true;
    } else if (valStr === 'false') {
      result[key] = false;
    } else {
      result[key] = valStr;
    }
  }

  return result;
}

/**
 * Serializes metadata object back into standard YAML format.
 */
function serializeSimpleYaml(obj: Record<string, unknown>): string {
  const lines: string[] = [];

  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined || val === null) continue;

    if (Array.isArray(val)) {
      lines.push(`${key}: [${val.map((item) => (typeof item === 'string' ? `"${item}"` : String(item))).join(', ')}]`);
    } else if (typeof val === 'string') {
      lines.push(`${key}: "${val}"`);
    } else {
      lines.push(`${key}: ${val}`);
    }
  }

  return lines.join('\n');
}

/**
 * Parses Google Tasks notes field into clean body notes and structured metadata.
 */
export function parseNotesField(rawNotes: string = ''): { notes: string; metadata: MBBTaskMetadata } {
  let notes = rawNotes;
  let metadata: MBBTaskMetadata = {};
  let matchedYaml = '';

  // 1. Try standard header frontmatter
  const match = rawNotes.match(FRONTMATTER_REGEX);
  if (match) {
    matchedYaml = match[1];
    notes = rawNotes.slice(match[0].length);
  } else {
    // 2. Fallback: Check for relocated/appended frontmatter
    const relocatedMatch = rawNotes.match(RELOCATED_FRONTMATTER_REGEX);
    if (relocatedMatch) {
      matchedYaml = relocatedMatch[1];
      notes = rawNotes.replace(relocatedMatch[0], '');
    }
  }

  if (matchedYaml) {
    const parsed = parseSimpleYaml(matchedYaml);
    metadata = { ...parsed } as MBBTaskMetadata;
    if (typeof metadata.priority === 'number' && ![0, 1, 2, 3].includes(metadata.priority)) {
      metadata.priority = 0;
    }
  }

  return { notes: notes.trim(), metadata };
}

/**
 * Re-assembles body text and metadata non-destructively, preserving custom frontmatter keys.
 */
export function serializeNotesField(notes: string = '', metadata: MBBTaskMetadata = {}): string {
  const cleanNotes = notes.trim();
  const yamlString = serializeSimpleYaml(metadata as Record<string, unknown>);

  if (!yamlString) {
    return cleanNotes;
  }

  const frontmatterBlock = `---\n${yamlString}\n---`;
  return cleanNotes ? `${frontmatterBlock}\n${cleanNotes}` : frontmatterBlock;
}
