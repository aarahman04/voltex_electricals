import { resolveBrand } from "./brands.js";
import { canonicalSubcategory } from "./taxonomy.js";

// Every Products/normalized/<brand>/<category>.json is discovered at build
// time. These files are written by `npm run data:build` (scripts/normalize.mjs)
// from the raw brand datasets one folder up. Adding a brand is adding its raw
// data + re-running the build — no import to wire up, no code to touch.
const modules = import.meta.glob("/Products/normalized/*/*.json", {
  eager: true,
  import: "default",
});

function folderOf(path) {
  // "/Products/normalized/orient/fans.json" -> "orient"
  return path.split("/").slice(-2, -1)[0];
}

// One normalisation pass at load. Every downstream helper and page reads this
// shape and only this shape.
export const catalog = Object.entries(modules).flatMap(([path, rows]) => {
  const folder = folderOf(path);
  return (rows ?? []).map((raw) => {
    const brand = resolveBrand(raw.vendor, folder);
    return {
      uid: `${brand.slug}--${raw.id}`,
      id: raw.id,
      title: raw.title,
      brand: brand.name,
      brandSlug: brand.slug,
      vendor: raw.vendor,
      category: raw.category,
      subcategory: canonicalSubcategory(raw.subcategory),
      rawSubcategory: raw.rawSubcategory ?? raw.subcategory,
      tags: raw.tags ?? [],
      variants: raw.variants ?? [],
      images: raw.images ?? {},
      sourceUrl: raw.sourceUrl,
      description: raw.description ?? "",
      specs: raw.specs ?? [],
      // "rich" — variants, options, sometimes specs. "thin" — name + image
      // only (scraped brands). Product detail shows fewer sections for thin.
      quality: raw.quality ?? "rich",
    };
  });
});
