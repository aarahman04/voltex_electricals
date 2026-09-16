import { resolveBrand } from "./brands.js";
import { canonicalSubcategory } from "./taxonomy.js";

// Every Products/normalized/<brand>/<category>.lite.json is discovered at
// build time and bundled eagerly — these are written by `npm run data:build`
// (scripts/normalize.mjs) and hold only the fields list/search/facet pages
// read (id, title, vendor, category, subcategory, tags, variants, primary
// image). The full sibling `<category>.json` (description, specs, full
// image gallery — the bulk of the payload) is loaded lazily, per file, only
// when a product detail page actually needs it. See loadProductDetail below.
const liteModules = import.meta.glob("/Products/normalized/*/*.lite.json", {
  eager: true,
  import: "default",
});
const fullModules = import.meta.glob(
  ["/Products/normalized/*/*.json", "!/Products/normalized/*/*.lite.json"],
  { import: "default" },
);

function folderOf(path) {
  // "/Products/normalized/orient/fans.lite.json" -> "orient"
  return path.split("/").slice(-2, -1)[0];
}

// uid -> where its full record lives, filled in alongside `catalog` below.
const fullSourceByUid = new Map();

// One normalisation pass at load. Every downstream helper and page reads this
// shape and only this shape.
export const catalog = Object.entries(liteModules).flatMap(([path, rows]) => {
  const folder = folderOf(path);
  const fullPath = path.replace(/\.lite\.json$/, ".json");
  return (rows ?? []).map((raw) => {
    const brand = resolveBrand(raw.vendor, folder);
    const uid = `${brand.slug}--${raw.id}`;
    fullSourceByUid.set(uid, { path: fullPath, id: raw.id });
    return {
      uid,
      id: raw.id,
      title: raw.title,
      brand: brand.name,
      brandSlug: brand.slug,
      vendor: raw.vendor,
      category: raw.category,
      subcategory: canonicalSubcategory(raw.subcategory),
      tags: raw.tags ?? [],
      variants: raw.variants ?? [],
      images: raw.images ?? {},
      // Detail-only fields: safe empty defaults so every existing `??`/`&&`
      // guard in ProductDetail.jsx keeps working before loadProductDetail
      // resolves.
      sourceUrl: undefined,
      description: "",
      specs: [],
    };
  });
});

const detailCache = new Map();

// Lazily fetches the description/specs/full gallery for one product, from
// the same file its lite record came from. Cached per uid so revisiting a
// product (or its own re-render) never re-fetches.
export async function loadProductDetail(uid) {
  if (detailCache.has(uid)) return detailCache.get(uid);
  const src = fullSourceByUid.get(uid);
  const importer = src && fullModules[src.path];
  if (!importer) return null;
  const rows = await importer();
  const raw = (rows ?? []).find((r) => r.id === src.id);
  if (!raw) return null;
  const detail = {
    sourceUrl: raw.sourceUrl,
    description: raw.description ?? "",
    specs: raw.specs ?? [],
    images: raw.images ?? {},
  };
  detailCache.set(uid, detail);
  return detail;
}
