# Data model

## Source data — three incompatible schemas

| Schema | Brands | Form | Products | Loads today? |
|---|---|---|---|---|
| **A** normalized | orient | `Products/orient/{fans,lighting}.json` — hand-cleaned arrays | 199 (100 + 99) | yes — this is the app's contract |
| **B** raw Shopify | atomberg, crompton, philips | `<brand>_all_products_raw.json` (raw `/products.json` dump) + derived CSVs | 61 / 834 / 317 | no |
| **C** thin scrape | havells, polycab | CSV only, no JSON. `debug_html/` holds raw pages (gitignored) | 293 / 154 | no |
| **A** (hand-authored) | almonard | `Products/almonard/fans.json` — 2 products transcribed by hand from an irregular page-fragment scrape (no usable CSV columns) | 2 | yes |
| **multifab** | multifab | `multtifabled-{indoor-light,outdoor}.csv` — generic scraped column names (`x-el`, `x-el 2`, …); rows grouped by product name into one product with a variant per wattage | 98 (69+43 rows → 96 after 2 uid collisions) | no |
| **aosmith** | ao-smith | `aosmithindia_gysers.csv` — WooCommerce grid scrape (name/image/price/description) | 36 | no |
| **wipro** | wipro | `wiprolighting.csv` — index scrape: name + image + product URL only; subcategory read off the URL's own section path | 119 | no |

Totals: **1,858 raw rows** (six original brands) + **255 rows** across the four brands added 2026-09-16. After parking non-core Crompton (~400) and fixing misclassified rows, the published catalogue is roughly **1,650** Fans + Lighting + Water Geysers products across 10 brands with data.

### Schema A shape (the target)

```json
{
  "id": "linea-tower-fan",
  "title": "Linea Tower Fan",
  "vendor": "Orient Electric",
  "tags": [],
  "priceMin": 0, "priceMax": 0,
  "variants": [{ "options": { "Color": "White" }, "sku": "FG1435", "price": 0 }],
  "images": { "primary": "https://cdn.shopify.com/...", "gallery": ["...", "..."] },
  "sourceUrl": "https://orientelectric.com/products/linea-tower-fan",
  "category": "Fans",
  "subcategory": "Tower Fans"
}
```

### Schema B shape (raw Shopify — needs transform)

Keys: `id` (numeric), `title`, `handle`, `body_html`, `vendor`, `product_type`, `tags`, `variants[]` (`option1..3`, `sku`, `price` as string, `featured_image`), `images[]` (objects: `src`, `width`, `height`, `position`, `variant_ids`), `options[]` (`name`, `values[]`).
No `category`/`subcategory`. No `priceMin/Max`. `vendor` is unreliable: Crompton's is `"Consumer Products"`; Philips has three casings (`"Philips Lighting Online Store"` / `"Philips lighting Online Store"` / `"Philips lighting Online store"`).

### Schema C shape (CSV)

- havells: `category,name,price_text,product_url,image_url` — `price_text` empty in 100% of rows.
- polycab: `category,sku,name,price_text,product_url,image_url` — `sku` is a series name, mostly blank; `price_text` = `"Rs. N"`.
- No variants, options, tags, specs, or description.

## The ETL — `scripts/normalize.mjs`

Run: `npm run data:build`. Node only, zero runtime cost.

**Input:** `Products/<brand>/` (raw, committed).
**Output:** `Products/normalized/<brand>/<category>.json` (Schema A + 2 fields), `Products/normalized/_parked.json`, `Products/normalized/report.md`.

Added fields on the normalized object:
- `quality`: `"rich"` (A, B) | `"thin"` (C) — controls which product-detail sections render.
- `specs`: `[{ label, value }]` — lifted from Philips `body_html` `<table>`s where present, else `[]`.

Adapters:
- **A** — passthrough, already correct.
- **B** — `product_type` → canonical category + subcategory (via `taxonomy.js` maps); `option1..3` named from `options[]` and case-folded (`Watt`/`Wattage`/`wattage` → `Wattage`); first `images[].src` → `images.primary`, rest → `gallery`; `body_html` → plain text `description` + any `<table>` → `specs`. Fixes: 7 Atomberg rows typed `"Best Energy-Efficient Fans in Sri Lanka"` → Ceiling Fans; 8 Philips "fans" (misclassified) → Lighting.
- **C** — parse CSV, `variants: []`, `quality: "thin"`, `category` from the CSV's own column.
- **multifab** — groups CSV rows by exact product name (same fixture at different wattages is one product with several variants, not several rows); a `Watt| Size (mm) | Cut Size(mm) | Std.Pkg`-style header cell zipped against each wattage line produces a `{Wattage, Size}` variant plus a spec row; subcategory comes from the row's own tagline (`x-el 14`, e.g. "Premium LED Panel Light") for indoor rows, fixed to Street & Outdoor Lights for every outdoor row. No price/SKU in the source. Throws on an unrecognized tagline rather than silently parking, since the whole file is one brand's own hand-written taxonomy.
- **aosmith** — thin CSV adapter; `Instant Water Heaters` vs `Storage Water Heaters` split by matching known instant-heater model-name patterns (EWS/FastOn/ForceNXT/InstaPod/MiniBot/Zip) against the title, since the source has no category column at all.
- **wipro** — thin CSV adapter; subcategory read off the product URL's own section path (e.g. `/products/outdoor/bollards/…` → Street & Outdoor Lights) via a fixed section→subcategory map. Throws on an unrecognized section.

**Prices:** normalized to integer INR and stored, **never rendered** (decision D4). Kept so pricing can be switched on later without re-running scrapes.

`report.md` records: per-brand in/out counts, unmapped subcategories (auto-adopted), reclassified rows, parked counts, and any `uid` collisions (should be zero).

## Runtime shape — after `catalog.js`

`catalog.js` globs `/Products/normalized/*/*.json` and normalizes once more into the object every page reads:

| Field | From | Note |
|---|---|---|
| `uid` | `` `${brandSlug}--${id}` `` | primary key, collision-proof across brands |
| `id` | raw slug | React keys, `imageScores` lookup |
| `title` | raw | may carry a `" | "` marketing suffix — use `displayTitle()` |
| `brand` / `brandSlug` | `resolveBrand(vendor, folder)` | display name / slug |
| `vendor` | raw | retained |
| `category` | raw | `"Fans"` / `"Lighting"` |
| `subcategory` | `canonicalSubcategory(raw.subcategory)` | aliased to the canonical tree |
| `rawSubcategory` | raw | so a bad mapping is fixed in `taxonomy.js`, no re-import |
| `tags` / `variants` / `images` / `sourceUrl` | raw | |
| `quality` / `specs` | ETL | new |

## Images

All remote CDN URLs — no local product images anywhere. Hosts: `cdn.shopify.com` (orient, atomberg, crompton, philips), `havells.com/media/...`, `cms.polycab.com/media/...?format=webp`. `cdnImage(url, width)` appends `width=` only for Shopify URLs; others pass through unchanged.

## Options / facets observed

No `Kelvin` or `Sweep` key exists in any dataset. Sweep = `Size` (orient) / `Sweep Size` (atomberg) / embedded in the name (havells, polycab). Colour temperature lives in `Color` / `Light color` values (`"Cool White"`, `"6500K"`), read via `kelvin.js` `TONES`. `getFacets()` only emits a facet when >1 distinct value exists in the category — the brief's "no fake filters" rule, already enforced.
