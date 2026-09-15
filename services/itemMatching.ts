import { z } from 'zod';

export const matchSchema = z.object({
  match: z.boolean(),
  confidence: z.number().min(0).max(100),
  reason: z.string(),
  matchingFeatures: z.array(z.string()),
});

export type MatchResult = z.infer<typeof matchSchema>;

function tokenize(text: string): Set<string> {
  const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'near', 'by', 'for', 'with', 'and', 'or', 'of', 'to', 'my', 'item', 'lost', 'found']);
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopWords.has(w))
  );
}

export function localMatch(
  lost: { name?: string; category: string; brand?: string | null; color?: string | null; locationLost: string; description: string },
  found: { name?: string; category: string; brand?: string | null; color?: string | null; foundLocation: string; description: string }
): MatchResult {
  let score = 20;
  const f: string[] = [];

  const lostCat = (lost.category || 'Other').toLowerCase();
  const foundCat = (found.category || 'Other').toLowerCase();

  // Category match
  if (lostCat === foundCat) {
    score += 25;
    f.push('matching category');
  } else if (
    (lostCat.includes('electronics') && foundCat.includes('accessories')) ||
    (lostCat.includes('accessories') && foundCat.includes('electronics')) ||
    (lostCat.includes('documents') && foundCat.includes('id card')) ||
    (lostCat.includes('id card') && foundCat.includes('documents'))
  ) {
    score += 15;
    f.push('related category');
  }

  // Name & Description Token overlap
  const lostTokens = tokenize(`${lost.name || ''} ${lost.description || ''}`);
  const foundTokens = tokenize(`${found.name || ''} ${found.description || ''}`);

  let tokenMatches = 0;
  lostTokens.forEach((t) => {
    if (foundTokens.has(t)) tokenMatches++;
  });

  if (tokenMatches >= 2) {
    score += 35;
    f.push(`${tokenMatches} matching key descriptors`);
  } else if (tokenMatches === 1) {
    score += 25;
    f.push('matching key term');
  }

  // Direct substring check on name
  const lostName = (lost.name || '').toLowerCase().trim();
  const foundName = (found.name || '').toLowerCase().trim();
  if (lostName && foundName) {
    if (lostName === foundName || lostName.includes(foundName) || foundName.includes(lostName)) {
      score += 20;
      if (!f.some((x) => x.includes('descriptors') || x.includes('term'))) {
        f.push('matching item name');
      }
    }
  }

  // Brand match
  const lostBrand = (lost.brand || '').toLowerCase().trim();
  const foundBrand = (found.brand || '').toLowerCase().trim();
  if (lostBrand && foundBrand && lostBrand !== 'unknown' && foundBrand !== 'unknown') {
    if (lostBrand === foundBrand || lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand)) {
      score += 20;
      f.push('matching brand');
    }
  }

  // Color match
  const lostColor = (lost.color || '').toLowerCase().trim();
  const foundColor = (found.color || '').toLowerCase().trim();
  if (lostColor && foundColor && lostColor !== 'unknown' && foundColor !== 'unknown') {
    if (lostColor === foundColor || lostColor.includes(foundColor) || foundColor.includes(lostColor)) {
      score += 15;
      f.push('matching color');
    }
  }

  // Location match
  const locL = (lost.locationLost || '').toLowerCase();
  const locF = (found.foundLocation || '').toLowerCase();
  if (locL && locF) {
    const locLTokens = tokenize(locL);
    const locFTokens = tokenize(locF);
    let locMatch = false;
    locLTokens.forEach((t) => {
      if (locFTokens.has(t)) locMatch = true;
    });

    if (locL === locF || locL.includes(locF) || locF.includes(locL) || locMatch) {
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