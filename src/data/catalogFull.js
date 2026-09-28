import { resolveBrand } from "./brands.js";
import { canonicalSubcategory } from "./taxonomy.js";

// Full catalogue for /curate, loaded only when an admin opens that route.
// Storefront pages use the lite+lazy split in catalog.js.
const modules = import.meta.glob("/Products/normalized/*/*.json", {
  eager: true,
  import: "default",
});

function folderOf(path) {
  return path.split("/").slice(-2, -1)[0];
}

export const catalogFull = Object.entries(modules)
  .filter(([path]) => !path.endsWith(".lite.json"))
  .flatMap(([path, rows]) => {
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
        quality: raw.quality ?? "rich",
      };
    });
  });
