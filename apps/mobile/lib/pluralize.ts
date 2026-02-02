/**
 * Pluralizes gender names for display in "seeking" context.
 * Handles word replacements within strings (e.g., "Trans Man" → "Trans Men").
 */
export function pluralizeGender(name: string): string {
  return name.replace(/\bMan\b/g, 'Men').replace(/\bWoman\b/g, 'Women');
}
