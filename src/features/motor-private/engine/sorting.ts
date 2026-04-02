import { DetailedQuoteBreakdown } from "../types";

export interface ComparisonQuote {
  insurerId: string;
  insurerName: string;
  quote: DetailedQuoteBreakdown;
  riderIds: string[];
}

/**
 * PURE FUNCTION: Generates a deterministic signature based on the insurers present.
 * Identifies if a fundamentally new payload of quotes has arrived.
 */
export function generateQuoteSignature(quotes: ComparisonQuote[]): string {
  if (!quotes || quotes.length === 0) return "";
  return quotes.map((q) => q.insurerId).sort().join(",");
}

/**
 * PURE FUNCTION: Sorts quotes by cheapest totalPayable.
 * Returns the price-based rank as an array of insurerIds.
 */
export function computePriceBasedRank(quotes: ComparisonQuote[]): string[] {
  if (!quotes || quotes.length === 0) return [];
  return [...quotes]
    .sort((a, b) => a.quote.totalPayable - b.quote.totalPayable)
    .map((q) => q.insurerId);
}

/**
 * PURE FUNCTION: Enforces a previously locked order onto a set of quotes.
 */
export function sortQuotesByLockedRank(
  quotes: ComparisonQuote[],
  lockedRank: string[]
): ComparisonQuote[] {
  if (!quotes || quotes.length === 0) return [];
  if (lockedRank.length === 0) return quotes; // fallback

  return [...quotes].sort((a, b) => {
    const indexA = lockedRank.indexOf(a.insurerId);
    const indexB = lockedRank.indexOf(b.insurerId);
    
    // Safefall for unidentified insurers
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });
}
