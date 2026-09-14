# Roadmap — deliberately not built yet

In rough priority order. None of this blocks the redesign.

## Data enrichment
- **Thin brands (Havells, Polycab)** carry only name + image + URL. Raw HTML page dumps exist locally at `Products/{havells_output,polycab_output}/debug_html/` (gitignored) — a future scraper pass can extract specs, variants, and model numbers from them.
- **Polycab scrape is capped at 12 products per category** — near-uniform counts prove it's partial. Re-scrape for the full range.
- **Philips option keys are case-fragmented** in the source (`Watt`/`Wattage`/`wattage`). The ETL folds them; the underlying scrape should be cleaned.
- **Structured specs**: only Philips carries any (`<table>` in `body_html`, ~10–18% of products). No brand has a features list or PDF/document links.

## Catalogue expansion
- **Parked categories** (`_parked.json`): Appliances, Pumps, Water Heating, Kitchen — ~400 Crompton items, already normalized. Publish by adding to `PUBLISHED` in `taxonomy.js` + a category card. Only Crompton stocks them today.
- **Electrical category** (switches, sockets, MCB, wiring) — in the brief's mega-menu example, no data yet.
- **"Shop by Need"** discovery section (Cooling / Lighting / Home Electrical / Commercial / Industrial) — build once the catalogue spans enough categories to make it meaningful.

## Commerce
- **Prices** are normalized and stored but not rendered (decision D4). A single flag flips them on when Voltex has its own pricing.
- **Enquiry submission** is not wired to a backend — `/enquiry` and `/contact` are previews. Needs a form endpoint / email integration.
- Accounts, real cart, checkout — not in scope.

## Brand assets
- **Brand logos** — 3 of 14 in: `public/brands/{crompton.png,havells.svg,philips.png}`. The remaining 11 still use tinted wordmark chips. Drop a real logo into `public/brands/<slug>.{svg,png}` and set `brand.logo` — `<BrandMark/>` renders it on the same tinted plate, so nothing reflows.

## Platform
- **Data bundle size** — `catalog.js` uses an eager `import.meta.glob`, so all normalized JSON (~2 MB, 467 KB gzip) is in the main chunk. Fine at 1,438 products; at 5,000+ split it per category with a lazy glob + an async query API, or move to a fetched endpoint (the `products.js` comment already anticipates this).
- **Deploy** — `vercel.json` (SPA rewrite, asset caching, security headers) and `robots.txt` are in. Still open: custom domain + DNS, and a CSP (the app pulls Google Fonts and product images from brand CDNs, so it needs its own pass).
- **Slug-based category routes** — `/c/:category/:subcategory` matches on the raw display name (`/c/Lighting/Downlighters%20%26%20Spotlights`). Links are encoded via `categoryPath()`/`subcategoryPath()`, but real slugs (`/c/lighting/downlighters-and-spotlights`) with a slug↔name lookup in `taxonomy.js` would be cleaner. Deferred: it changes every category URL.
- **OG image** — meta tags exist, no image asset.
- **Sitemap** — none.
