// Every brand Voltex Electricals carries or intends to carry. This list is
// from Product_Catalog.md. A brand becomes "stocked" the moment
// Products/normalized/<brand>/*.json gives it a model — nothing here needs
// editing to bring one online.
//
// `tint` is a near-white wash for the <BrandMark> wordmark chip. It is NOT
// the brand's real colour — the site stays brand-neutral (brief) and the
// real logos are trademarked. Tints only need to be distinguishable.
// `logo` is null until a real asset lands in public/brands/<slug>.{svg,png};
// <BrandMark> draws it bare, capped to a shared box so every mark occupies
// the same footprint in a grid.
// `logoScale` corrects a logo that reads smaller than the rest at the same
// box height. Two different causes so far:
// - Dead canvas: the source file has built-in padding a tight crop removes.
//   Philips shipped a full artboard rect around a wordmark filling 18% of
//   its height; Havells' original SVG was an off-centre 59%-height crop.
//   Both public/brands/*.{svg,png} are now cropped tight to the actual ink
//   (measured by rendering each asset and comparing its opaque,
//   non-background-white pixel bounding box to its canvas) — Havells since
//   replaced with a cleaner source PNG entirely. No scale needed once tight.
// - Shape: a compact icon+wordmark lockup (Havells) or a square badge
//   (Philips, before its crop) has less area than a wide text-only wordmark
//   (Crompton, Polycab) at the same height, so it still reads small next to
//   them even fully cropped. `logoScale` closes that gap by eye.
// Omit for anything that already matches by eye.
export const BRANDS = [
  { slug: "orient", name: "Orient Electric", tint: "#F4ECDE", logo: "/brands/orient.webp" },
  { slug: "wipro", name: "Wipro", tint: "#F0EDE4", logo: "/brands/wipro.svg" },
  { slug: "philips", name: "Philips", tint: "#E4EDF4", logo: "/brands/philips.svg" },
  { slug: "crompton", name: "Crompton", tint: "#EDE8F0", logo: "/brands/crompton.svg" },
  { slug: "havells", name: "Havells", tint: "#F5E8E6", logo: "/brands/havells.png", logoScale: 1.3 },
  { slug: "atomberg", name: "Atomberg", tint: "#E8EEE9", logo: "/brands/atomberg.jpg" },
  { slug: "almonard", name: "Almonard", tint: "#F2E9E4", logo: "/brands/almonard.png" },
  { slug: "ao-smith", name: "AO Smith", tint: "#E6ECF3", logo: "/brands/ao-smith.png" },
  { slug: "starlight", name: "Starlight", tint: "#ECEAF2", logo: null },
  { slug: "ace-pro", name: "ACE Pro", tint: "#E6EEF0", logo: null },
  { slug: "multifab", name: "Multifab", tint: "#EFEAE2", logo: "/brands/multifab.webp" },
  { slug: "elite", name: "Elite", tint: "#E9ECEF", logo: null },
  { slug: "kuhl", name: "Kuhl", tint: "#E4EFEF", logo: null },
  { slug: "polycab", name: "Polycab", tint: "#EAEEE6", logo: "/brands/polycab.png" },
  { slug: "gold-medal", name: "Gold Medal", tint: "#F3EEDF", logo: null },
];

const BY_SLUG = new Map(BRANDS.map((b) => [b.slug, b]));

// Vendor strings that a prefix match on brand name would miss.
const VENDOR_ALIASES = {
  "consumer products": "crompton", // Crompton's Shopify vendor
  "professional lighting": "crompton",
  "philips lighting online store": "philips",
  "philips lighting online shop": "philips",
};

export function getBrandBySlug(slug) {
  return BY_SLUG.get(slug);
}

// A vendor string off a product ("Orient Electric", "Consumer Products")
// resolved to a known brand: explicit alias, then exact name, then name
// prefix, then the folder the file sits in, then a synthesised brand.
export function resolveBrand(vendor, folderSlug) {
  const name = String(vendor ?? "").trim();
  const lower = name.toLowerCase();

  const aliased = VENDOR_ALIASES[lower];
  if (aliased && BY_SLUG.has(aliased)) return BY_SLUG.get(aliased);

  return (
    BRANDS.find((b) => b.name.toLowerCase() === lower) ||
    BRANDS.find((b) => lower && lower.startsWith(b.name.toLowerCase())) ||
    BY_SLUG.get(folderSlug) ||
    { slug: folderSlug || slugify(name), name: name || folderSlug, tint: "#EEECE7", logo: null }
  );
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
