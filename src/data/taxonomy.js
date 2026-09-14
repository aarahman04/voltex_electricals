// Voltex's canonical product taxonomy.
//
// The spine (SUBCATEGORY_ORDER, COMING_SOON) comes from Product_Catalog.md —
// the client's stock list. Scraped brands each tag their catalogue their own
// way; ALIASES folds those raw strings onto the canonical names so a Ceiling
// Fan from Orient and one from Crompton land in the same bucket. Most of this
// folding already happens in scripts/normalize.mjs; the map here is the
// runtime safety net and the single place to correct a mapping.
//
// rawSubcategory is kept on every product, so a wrong mapping is fixed here,
// rebuilt with `npm run data:build`, and takes effect with no re-scrape.

// Categories the site actually shows. The ETL also produces a "Parked"
// bucket (Crompton appliances, pumps, kitchen) — adding one here plus a
// category card is all it takes to publish it. See docs/roadmap.md.
export const PUBLISHED = ["Fans", "Lighting", "Water Geysers"];
export const isPublished = (category) => PUBLISHED.includes(category);

// "Fans, lighting and water geysers" — for copy that used to hard-code two
// category names. Add a category to PUBLISHED and this sentence updates
// itself; only index.html's static <meta> tags still need a manual touch.
export function categoryList() {
  const names = PUBLISHED.map((c) => c.toLowerCase());
  if (names.length <= 1) return names.join("");
  if (names.length === 2) return names.join(" and ");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

// Display order for the "Choose your …" subcategory chooser. A subcategory
// present in the data but missing here is appended after these, in the order
// it is first seen (auto-adopt) — no product is ever unreachable.
export const SUBCATEGORY_ORDER = {
  Fans: [
    "Ceiling Fans",
    "Exhaust Fans",
    "Pedestal Fans",
    "Table Fans",
    "Wall Fans",
    "Industrial Fans",
    "Metal Fans",
    "Tower Fans",
    "Kitchen Fans",
    "Decorative Fans",
    "Air Circulators",
    "Farrata Fans",
  ],
  Lighting: [
    "Panel Lights",
    "Ceiling Lights",
    "Downlighters & Spotlights",
    "Battens",
    "LED Bulbs & Lamps",
    "COB LED",
    "Backlight",
    "Elevation LED",
    "Wall Lights",
    "Pendant Lights",
    "Chandeliers",
    "Track Lights",
    "Strip & Rope Lights",
    "Street & Outdoor Lights",
    "Portable Lighting",
    "Smart Lighting",
    "Professional & Commercial Lighting",
    "Lamps & Lanterns",
    "Home Art Lights",
    "Curtain & String Lights",
  ],
  "Water Geysers": ["Storage Water Heaters", "Instant Water Heaters", "Gas Geysers"],
};

// Canonical subcategories the client carries but that have no product data
// yet. They render as dimmed "Coming soon" tiles — the site shows its
// intended breadth rather than hiding it (decision D7).
export const COMING_SOON = {
  Fans: [],
  Lighting: ["Elevation LED"],
  "Water Geysers": [],
};

// Tiles backed by an attribute rather than a subcategory. A metal wall fan is
// a Wall Fan that happens to be metal — it stays under Wall Fans and also
// appears here, so these can't be subcategories without the product having to
// pick one. `facet` is the variant-option key the ETL derives (see
// scripts/normalize.mjs); CategoryListing filters on it instead of on
// subcategory when the URL names one of these.
export const DERIVED = {
  Fans: [
    { name: "Metal Fans", facet: "Build", value: "Metal" },
    { name: "Industrial Fans", facet: "Duty", value: "Industrial" },
  ],
};

export function derivedTile(category, name) {
  return (DERIVED[category] ?? []).find((d) => d.name === name) ?? null;
}

// raw (lower-cased, trimmed) -> canonical. Superset of the ETL's map.
const ALIASES = {
  "pedestal & stand fans": "Pedestal Fans",
  "personal & table fans": "Table Fans",
  "decorative & chandelier fans": "Decorative Fans",
  "ceiling fan": "Ceiling Fans",
  "ceiling mounting fans": "Ceiling Fans",
  "exhaust fan": "Exhaust Fans",
  "wall fan": "Wall Fans",
  "wall mounted fans": "Wall Fans",
  "pedestal fan": "Pedestal Fans",
  "table fan": "Table Fans",
  "personal fan": "Table Fans",
  "personal fans": "Table Fans",
  "air circulator": "Air Circulators",
  "farrata fan": "Farrata Fans",
  "led bulb": "LED Bulbs & Lamps",
  "led lamps": "LED Bulbs & Lamps",
  bulbs: "LED Bulbs & Lamps",
  downlight: "Downlighters & Spotlights",
  "led downlighter": "Downlighters & Spotlights",
  "led spotlight": "Downlighters & Spotlights",
  "panel light": "Panel Lights",
  "led panels": "Panel Lights",
  "led batten": "Battens",
  "led battens": "Battens",
  glamtubes: "Battens",
  "led cob": "COB LED",
  "outdoor lights": "Street & Outdoor Lights",
  outdoor: "Street & Outdoor Lights",
  "rope and strip lights": "Strip & Rope Lights",
  "ropes and strips": "Strip & Rope Lights",
  "home art light": "Home Art Lights",
};

// Category and subcategory names are display strings, not slugs — several
// carry spaces or "&" ("Downlighters & Spotlights", "COB LED"). Every link
// that builds a /c/… path goes through these so the segments are always
// percent-encoded; useParams() decodes on the way back, so the case-insensitive
// matching in products.js is unaffected.
export const categoryPath = (category) => `/c/${encodeURIComponent(category)}`;
export const subcategoryPath = (category, subcategory) =>
  `${categoryPath(category)}/${encodeURIComponent(subcategory)}`;

export function canonicalSubcategory(raw) {
  if (!raw) return raw;
  const key = String(raw).trim();
  return ALIASES[key.toLowerCase()] ?? key;
}

// Merge the data-backed subcategories (from products.getSubcategories) with
// the canonical order and the coming-soon placeholders. Returns the list the
// subcategory chooser renders, in display order.
export function orderedSubcategories(category, dataSubs = [], derivedSubs = []) {
  const order = SUBCATEGORY_ORDER[category] ?? [];
  const rank = (name) => {
    const i = order.indexOf(name);
    return i === -1 ? order.length + 1 : i;
  };
  // Derived tiles sit in their existing SUBCATEGORY_ORDER positions, so
  // nothing moves on screen when a "Coming soon" tile becomes a live one.
  const present = [...dataSubs, ...derivedSubs].sort(
    (a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name),
  );
  const presentNames = new Set(present.map((s) => s.name));
  const soon = (COMING_SOON[category] ?? [])
    .filter((name) => !presentNames.has(name))
    .map((name) => ({ name, count: 0, image: null, comingSoon: true }));
  return [...present, ...soon];
}
