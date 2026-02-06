/**
 * Tag-based auto-mapping of learning cards into the Learn library taxonomy.
 * Rules are ordered: first match wins. Supports exact cardIds and case-insensitive tagAny.
 */

export type CardSummary = { id: string; title?: string; summary?: string; tags?: string[] };

export type TagRule = {
  primaryId: string;
  subId: string;
  cardIds?: string[];
  tagAny?: string[];
};

export type TagRulesConfig = { rules: TagRule[] };

function normalizeTag(t: string): string {
  return t.trim().toLowerCase();
}

function cardTagsNormalized(card: CardSummary): string[] {
  const raw = card.tags ?? [];
  return raw.map(normalizeTag).filter(Boolean);
}

/**
 * Returns the first (primaryId, subId) that matches the card, or null.
 * Order: cardIds match first, then tagAny (case-insensitive).
 */
export function getPlacement(
  card: CardSummary,
  rules: TagRule[]
): { primaryId: string; subId: string } | null {
  const tagSet = new Set(cardTagsNormalized(card));

  for (const rule of rules) {
    if (rule.cardIds?.length && rule.cardIds.includes(card.id)) {
      return { primaryId: rule.primaryId, subId: rule.subId };
    }
    if (rule.tagAny?.length) {
      const hasMatch = rule.tagAny.some((r) => tagSet.has(normalizeTag(r)));
      if (hasMatch) return { primaryId: rule.primaryId, subId: rule.subId };
    }
  }
  return null;
}
