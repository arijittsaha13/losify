import { z } from 'zod';

export const matchSchema = z.object({
  match: z.boolean(),
  confidence: z.number().min(0).max(100),
  reason: z.string(),
  matchingFeatures: z.array(z.string()),
});

export type MatchResult = z.infer<typeof matchSchema>;

export function localMatch(
  lost: { name?: string; category: string; brand?: string | null; color?: string | null; locationLost: string; description: string },
  found: { name?: string; category: string; brand?: string | null; color?: string | null; foundLocation: string; description: string }
): MatchResult {
  let score = 20;
  let f: string[] = [];

  const lostName = (lost.name || '').toLowerCase();
  const foundName = (found.name || '').toLowerCase();

  // Category match
  if (lost.category && found.category && lost.category.toLowerCase() === found.category.toLowerCase()) {
    score += 25;
    f.push('matching category');
  }

  // Name match
  if (lostName && foundName) {
    if (lostName === foundName || lostName.includes(foundName) || foundName.includes(lostName)) {
      score += 35;
      f.push('matching item name');
    }
  }

  // Brand match
  if (lost.brand && found.brand && lost.brand !== 'Unknown' && lost.brand.toLowerCase() === found.brand.toLowerCase()) {
    score += 20;
    f.push('matching brand');
  }

  // Color match
  if (lost.color && found.color && lost.color !== 'Unknown' && lost.color.toLowerCase() === found.color.toLowerCase()) {
    score += 15;
    f.push('matching color');
  }

  // Location match
  if (lost.locationLost && found.foundLocation) {
    const locL = lost.locationLost.toLowerCase();
    const locF = found.foundLocation.toLowerCase();
    if (locL.includes(locF) || locF.includes(locL) || (locL.includes('library') && locF.includes('library'))) {
      score += 15;
      f.push('nearby location');
    }
  }

  const confidence = Math.min(score, 98);
  const isMatch = confidence >= 60;

  return {
    match: isMatch,
    confidence,
    reason: f.length ? `Matched ${f.join(', ')}.` : 'Not enough matching detail.',
    matchingFeatures: f,
  };
}