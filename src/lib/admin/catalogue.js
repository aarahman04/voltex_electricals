import { catalogFull } from "../../data/catalogFull.js";
import { BRANDS } from "../../data/brands.js";

// Use current API records for admin products: their identity stays the same
// when a brand changes, and edits are visible before the site rebuilds.
export function adminCatalogue(state) {
  return [
    ...catalogFull.filter((p) => !p.uid.startsWith("admin--")),
    ...(state.products ?? []).map((p) => ({
      ...p,
      uid: `admin--${p.id}`,
      brand: BRANDS.find((b) => b.slug === p.brand)?.name || "No brand",
      brandSlug: p.brand || "other",
      images: { primary: p.images.find((url) => !state.curation?.removedImages?.[`admin--${p.id}`]?.includes(url)), gallery: p.images },
      variants: [{ sku: p.model, options: { Colour: p.color } }],
    })),
  ];
}
