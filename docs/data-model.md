# Data model

## Source data — three incompatible schemas

| Schema | Brands | Form | Products | Loads today? |
|---|---|---|---|---|
| **A** normalized | orient | `Products/orient/{fans,lighting}.json` — hand-cleaned arrays | 199 (100 + 99) | yes — this is the app's contract |
| **B** raw Shopify | atomberg, crompton, philips | `<brand>_all_products_raw.json` (raw `/products.json` dump) + derived CSVs | 61 / 834 / 317 | no |
| **C** thin scrape | havells, polycab | CSV only, no JSON. `debug_html/` holds raw pages (gitignored) | 293 / 154 | no |

Totals: **1,858 raw rows.** After parking non-core Crompton (~400) and fixing misclassified rows, the published catalogue is roughly **1,400** Fans + Lighting products across 6 brands with data.

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
