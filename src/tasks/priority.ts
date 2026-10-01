/**
 * 🐾 MBB Priority & Theme Mapping 🌸
 * High-Density Kawaii Brutalist Color Tokens 🐱
 */

import { TaskPriority } from './types';

export const PRIORITY_MAP: Record<TaskPriority, { label: string; color: string; emoji: string }> = {
  0: { label: 'None', color: '#64748B', emoji: '🌸' },
  1: { label: 'Low', color: '#818CF8', emoji: '💜' },
  2: { label: 'Medium', color: '#F59E0B', emoji: '✨' },
  3: { label: 'High', color: '#A855F7', emoji: '🐾' },
};

export function mapPriorityToColor(priority: TaskPriority = 0): string {
  return PRIORITY_MAP[priority]?.color || PRIORITY_MAP[0].color;
}
