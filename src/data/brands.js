// Every brand Voltex Electricals carries or intends to carry. This list is
// from Product_Catalog.md. A brand becomes "stocked" the moment
// Products/normalized/<brand>/*.json gives it a model — nothing here needs
// editing to bring one online.
//
// `tint` is a near-white wash for the <BrandMark> wordmark chip. It is NOT
// the brand's real colour — the site stays brand-neutral (brief) and the
// real logos are trademarked. Tints only need to be distinguishable.
// `logo` is null until a real asset lands in public/brands/<slug>.svg;
// <BrandMark> renders the asset when present and the chip otherwise.
export const BRANDS = [
  { slug: "orient", name: "Orient Electric", tint: "#F4ECDE", logo: null },
  { slug: "wipro", name: "Wipro", tint: "#F0EDE4", logo: null },
  { slug: "philips", name: "Philips", tint: "#E4EDF4", logo: null },
  { slug: "crompton", name: "Crompton", tint: "#EDE8F0", logo: null },
  { slug: "havells", name: "Havells", tint: "#F5E8E6", logo: null },
  { slug: "atomberg", name: "Atomberg", tint: "#E8EEE9", logo: null },
  { slug: "almonard", name: "Almonard", tint: "#F2E9E4", logo: null },
  { slug: "starlight", name: "Starlight", tint: "#ECEAF2", logo: null },
  { slug: "ace-pro", name: "ACE Pro", tint: "#E6EEF0", logo: null },
  { slug: "multifar", name: "Multifar", tint: "#EFEAE2", logo: null },
  { slug: "elite", name: "Elite", tint: "#E9ECEF", logo: null },
  { slug: "kuhl", name: "Kuhl", tint: "#E4EFEF", logo: null },
  { slug: "polycab", name: "Polycab", tint: "#EAEEE6", logo: null },
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
