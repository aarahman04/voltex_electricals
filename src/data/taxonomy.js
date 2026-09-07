// Each brand tags its own catalogue its own way. This maps a brand's raw
// subcategory onto Voltex's canonical list so a Ceiling Fan from Orient and a
// Ceiling Fan from Crompton land in the same bucket.
//
// rawSubcategory is kept on every product, so a wrong mapping is corrected
// here and takes effect on the next build — no re-import.

// Confirmed aliases. Left side is what a brand shipped; right side is ours.
const ALIASES = {
  "Pedestal & Stand Fans": "Pedestal Fans",
  "Personal & Table Fans": "Table Fans",
};

// Names that pass through unchanged for now and are waiting on a decision.
// Tracked in docs/taxonomy.md.
export const UNMAPPED = [
  "Tower Fans",
  "Decorative & Chandelier Fans",
  "Kitchen Fans",
  "Lamps & Lanterns",
  "Street & Outdoor Lights",
  "Wall Lights",
  "LED Bulbs & Lamps",
  "Track Lights",
  "Professional & Commercial Lighting",
  "Curtain & String Lights",
  "Downlighters & Spotlights", // "→ COB LED" proposed, inactive pending confirmation
];

export function canonicalSubcategory(raw) {
  if (!raw) return raw;
  return ALIASES[raw] ?? raw;
}
