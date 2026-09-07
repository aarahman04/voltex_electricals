// Every brand Voltex Electricals carries or intends to carry. Order is the
// order they appear in the rail: stocked brands first is applied at runtime,
// so this list stays in a stable, human-meaningful sequence.
//
// A brand becomes "stocked" the moment a Products/<brand>/*.json file gives
// it at least one model — nothing here needs editing to bring a brand online.
export const BRANDS = [
  { slug: "orient", name: "Orient Electric" },
  { slug: "wipro", name: "Wipro" },
  { slug: "philips", name: "Philips" },
  { slug: "crompton", name: "Crompton" },
  { slug: "havells", name: "Havells" },
  { slug: "atomberg", name: "Atomberg" },
  { slug: "almonard", name: "Almonard" },
  { slug: "starlight", name: "Starlight" },
  { slug: "ace-pro", name: "ACE Pro" },
  { slug: "multifar", name: "Multifar" },
  { slug: "elite", name: "Elite" },
  { slug: "kuhl", name: "Kuhl" },
  { slug: "polycab", name: "Polycab" },
  { slug: "gold-medal", name: "Gold Medal" },
];

const BY_SLUG = new Map(BRANDS.map((b) => [b.slug, b]));

export function getBrandBySlug(slug) {
  return BY_SLUG.get(slug);
}

// A vendor string off a product ("Orient Electric", "Wipro Lighting") mapped
// to a known brand. Falls back to the folder the file sits in, then to a
// brand synthesised from whatever name we were given.
export function resolveBrand(vendor, folderSlug) {
  const name = String(vendor ?? "").trim();
  const lower = name.toLowerCase();

  return (
    BRANDS.find((b) => b.name.toLowerCase() === lower) ||
    BRANDS.find((b) => lower && lower.startsWith(b.name.toLowerCase())) ||
    BY_SLUG.get(folderSlug) ||
    { slug: folderSlug || slugify(name), name: name || folderSlug }
  );
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
