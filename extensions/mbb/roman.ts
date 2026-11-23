/**
 * 🐾 MBB Roman Numeral & Duration Utilities
 * Canonical Roman numeral conversions and time formatting.
 */

const ROMAN_NUMERALS: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export function toRomanNumeral(num: number): string {
  if (num <= 0) return '';
  let result = '';
  let remaining = Math.floor(num);
  for (const [val, roman] of ROMAN_NUMERALS) {
    while (remaining >= val) {
      result += roman;
      remaining -= val;
    }
  }
  return result;
}

export function formatDurationHuman(minutes: number): string {
  if (minutes < 1) return '< 1 min';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}
