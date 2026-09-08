# Voltex — Progress

**This is the handoff file.** A new session resumes by reading this top-to-bottom.

- **Branch:** `fix-404-and-phase-a-d` (forked from `origin/main`, post-PR#2)
- **Plan:** `~/.claude/plans/velvet-baking-lollipop.md` — Phase 0 (deploy 404) then A–D. Carries `~/.claude/plans/pr-2-merged-one-synthetic-hinton.md` for the A–D file:line detail.
- **Brief:** `website_redesign_prompt.md` (the client requirements)

## Start here next session

**PR #2 is merged.** `origin/main` is the bright multi-brand Modular Plate catalogue.

Current work, in order — one commit per phase:

| # | Phase | Status |
|---|---|---|
| 0 | Deploy 404 — `vercel.json` SPA rewrite, `robots.txt`, encoded category paths | ✅ done |
| A | Mobile menu portal, hero lamp, lockup, structural motif, KelvinBar bulb | ✅ done |
| B | Taxonomy — Backlight, Philips COB, derived Metal/Industrial Fans | ✅ done |
| C | Brand logos into `public/brands/` | ✅ done |
| D | Verify, docs, PR to `main` | ⬜ |

**Phase 0 — what and why.** The deployed site returned Vercel's own `404: NOT_FOUND` on any inner URL opened directly or refreshed (clicking through worked). Cause: a `BrowserRouter` SPA served as static files with no rewrite, so `/c/Fans` matched no file on disk and the app's JS never loaded. Fixed by `vercel.json` (`/(.*)` → `/index.html`, plus immutable `/assets/*` caching and three security headers) and `public/robots.txt`. Also added `categoryPath()` / `subcategoryPath()` to `src/data/taxonomy.js` and routed all 18 `/c/…` link builders through them, because category names are display strings with spaces and `&`. See D16/D17 in `decisions.md`.

**Two Vercel/GitHub settings still need a human** — neither is code, both can silently defeat the fix:
1. GitHub's default branch is `multi-brand-catalog`, 8 commits behind `main`. If Vercel's Production Branch follows it, merging to `main` changes nothing in production. Confirm Vercel → Settings → Git points at `main` (and consider making `main` the GitHub default, so `gh pr create` stops guessing the wrong base).
2. Confirm the Vercel project's framework preset is Vite, output dir `dist`.

The 404 is only reproducible on a real deploy — `vite preview` already rewrites to `index.html`, so it cannot show the bug. Verify on this branch's Vercel preview URL.

**Phase A — what shipped.** New: `Portal.jsx`, `Lockup.jsx`, `productTone()` in `kelvin.js`, `HeroLamp` in `Home.jsx`.
- **A0** `MobileNav` + `SearchOverlay` portal to `<body>` and each became one keyed `motion` child — see D18.
- **A1** the hero photo is a `<Link>` to its product and warms in `kelvinToCss(2700)` on hover/focus.
- **A2** one `Lockup` for header, drawer and footer; "ELECTRICALS" lights amber.
- **A3** `.led[data-live]` on stocked brands (`/brands`, `BrandRail`), `.module[data-active]` on the mega-menu, sort `<select>` replaced with a segmented switch, lighting cards glow in their own tone, tone-swatch bloom unified across `FilterPanel` and `VariantSelector`, search fields share one focus treatment.
- **A4** the KelvinBar bulb.
- Housekeeping: favicon replaced (was Vite's purple bolt), `public/icons.svg` deleted, `--tone-*` tokens dropped — `kelvin.js` is the single source.

**Phase B — what shipped.** `reclassify()` in `scripts/normalize.mjs` (runs per brand, after the adapter, before dedupe), `DERIVED` + `derivedTile()` in `taxonomy.js`, `getProductsByDerived()` + `getDerivedSubcategories()` + a Build/Duty facet in `products.js`, one conditional in `CategoryListing`.

Counts after `npm run data:build`, all confirmed against `report.md`:

| | before | after |
|---|---|---|
| Lighting / Backlight | 0 (coming soon) | **4** (orient) |
| Lighting / Panel Lights | 21 | **17** |
| Lighting / COB LED | 16 | **42** (philips 17 + crompton 9 joined havells 4 + polycab 12) |
| Fans / Metal Fans | 0 (coming soon) | **9**, derived |
| Fans / Industrial Fans | 0 (coming soon) | **5**, derived |
| **Published / parked** | 1,438 / 412 | **1,438 / 412** |

COB came out higher than the plan's ~26 because Crompton had the same misfile as Philips — nine "…Led COB" models typed `Ceiling Lights`. Spot-checks pass: the Polycab *Aerobliss Metal Wall Fan* is still under Wall Fans (43 models) **and** under Metal Fans; Philips' *TV Backlight Strip* stayed in Smart Lighting; no Build/Duty option leaked onto a non-fan. `COMING_SOON` is now just `Lighting: ["Elevation LED"]`.

**Phase C — what shipped.** `logos/` is gone; `public/brands/` holds `crompton.png` (downscaled 4500 → 900px, 123 KB → 30 KB), `havells.svg` (the file was named `.png` but was always an SVG — served as `image/png` the browser rejects it) and `philips.png`. `brand.logo` set for those three in `brands.js`. `<BrandMark>` now keeps the tint plate behind real logos so all 14 marks are one shape — see D22.

**Not yet verified visually.** The Chrome extension was offline again this session, so the 360/768/1440 pass and the keyboard/reduced-motion checks in Phase D still need a human or a working browser tool.

---

## Previously (redesign v2, PR #2)

Phases 0–7 done. The whole UI is rebuilt on the Modular Plate light system. `npm run build` and `npm run lint` are clean. Every route renders against real multi-brand data.

**Phases 4–7 landed as one commit, not four.** `App.jsx` routes reference every new page, so no smaller subset builds on its own; splitting would have produced broken intermediate commits. The per-phase deliverables are listed under "What shipped" below and the docs are current, which is what a resume actually needs.

**PR #2 has since merged.** The visual QA below never ran (Chrome extension was offline); it is folded into Phase D:
1. `npm run dev`, then at 360 / 768 / 1440: Home → Products mega-menu → Fans hub ("Choose your fan") → Ceiling Fans → filter by brand → product → Add to enquiry → `/enquiry` → Contact. Check a **thin** product (Havells/Polycab — no variants/specs: page must not show empty sections) and a **rich** one (Orient COB downlighter).
2. Keyboard pass — visible amber focus rings through header, mega-menu, filters, grid; mobile drawer trap.
3. `prefers-reduced-motion` on — LED power-up + card transforms suppressed.
4. Sanity-check the `/search?q=bldc` link behind the "Energy-efficient fans" need tile actually returns results.
5. Consider the `roadmap.md` items (list windowing, data-chunk split).

## Phase status — redesign v2

| # | Phase | Status | Commit |
|---|---|---|---|
| 0 | `docs/` scaffold + track raw `Products/` data | ✅ done | `a90d20e` |
| 1 | ETL — `scripts/normalize.mjs` → `Products/normalized/` | ✅ done | `fbb871b` |
| 2 | Data layer — `taxonomy.js`, `brands.js`, `catalog.js` glob, `products.js` | ✅ done | _this commit_ |
| 3 | Design system — `index.css` Modular Plate tokens, fonts, plate/LED primitives | ✅ done | _this commit_ |
| 4 | Chrome — `Header` (new nav + mega-menu), `Footer`, search overlay, `Enquiry` | ✅ done | _this commit_ |
| 5 | Home — new hero, Shop by Category, brand strip, remove `CylinderCarousel` | ✅ done | _this commit_ |
| 6 | Category hub `/c/:category` ("Choose your fan") + listing rewrite | ✅ done | _this commit_ |
| 7 | Product detail, Brands pages, Search | ✅ done | _this commit_ |
| 8 | Verify + PR to `main` | 🟡 PR #2 open; visual QA still pending | _this commit_ |

## What shipped so far

**Phase 0**
- `.gitignore` — added `Products/*/debug_html/` (scraper cache, not source).
- Committed raw brand data: `Products/{atomberg,crompton,philips}/` (raw Shopify JSON + derived CSVs), `Products/{havells_output,polycab_output}/` (CSV only).
- Committed `website_redesign_prompt.md`.
- Created `docs/` (this folder).

**Phase 1**
- `scripts/normalize.mjs` — Node ETL, zero deps. `npm run data:build`; also runs as `prebuild`.
- Output committed at `Products/normalized/<brand>/{fans,lighting}.json`, `_parked.json`, `report.md`.
- Adapters: A (orient passthrough), B (atomberg/crompton/philips — `product_type` → canonical via `TYPE_MAP`, unmapped → parked, options case-folded, Philips `<table>` specs lifted), C (havells/polycab CSV — `quality: "thin"`).
- Results: 1,438 published, 412 parked (mostly Crompton pumps/appliances/kitchen), 8 Havells duplicate rows dropped.
- Fan subcategories with data: Ceiling 251, Exhaust 80, Pedestal 51, Table 48, Wall 43, + Air Circulators/Farrata/Kitchen/Decorative/Tower.

**Phase 2**
- `catalog.js` glob → `/Products/normalized/*/*.json`; carries `quality`, `specs`, `description` through.
- `taxonomy.js` rewritten: `SUBCATEGORY_ORDER` (canonical display order), `COMING_SOON` (Industrial/Metal Fans, Backlight, Elevation LED), `PUBLISHED`, `orderedSubcategories()`, superset `ALIASES`.
- `brands.js`: added `tint` + `logo:null` per brand, `VENDOR_ALIASES` (`"Consumer Products"`→crompton, Philips casings).
- `products.js`: added `searchProducts()`, `getCategoryCounts()`.

**Phase 3**
- `src/index.css` — dark `@theme` replaced with the Modular Plate light palette; `.plate` / `.module` / `.led` / `.switch-btn` primitives; `@keyframes power-up` (LED stagger via `--i`, scoped to skip `[data-coming-soon]`).
- `index.html` — fonts swapped to Archivo + Instrument Sans + IBM Plex Mono.

**Phase 4 — chrome**
- `context/enquiry.js` + `EnquiryProvider.jsx` — localStorage-backed (`voltex:enquiry`), resolves ids → products; `useEnquiry()` gives `{items,count,has,add,remove,toggle,clear}`.
- `Header.jsx` — logo, **Products** (mega-menu built from `taxonomy` as a plate) / **Brands** / **About** / **Contact**. No Fans/Lighting top-level. Search overlay opens on the button, `/`, or ⌘K. `MobileNav` is a full-screen right drawer with a category → subcategory drilldown.
- `SearchOverlay.jsx` — live results (`searchProducts`, top 8), Enter → `/search`.
- `Footer.jsx`, `Toast.jsx` — relit.
- `Cart.jsx` → `Enquiry.jsx` (list view, remove/clear, hands off to `/contact`).
- `App.jsx` — 12 routes incl. `*`; `<Suspense>` unchanged; providers `ShopNotice > Enquiry`.

**Phase 5 — home**
- `Home.jsx` rewritten: finding-first hero (headline + large search field + 2-module category plate with the power-up LEDs + hero product photo) → Shop by category (Fans/Lighting cards) → Popular across the range (`getFeaturedProducts(8)`) → Explore by brand → Lighting/Kelvin band → Shop by need (4 tiles) → Why Voltex → enquiry CTA.
- `CylinderCarousel.jsx`, `Skeleton.jsx` deleted; `getShowcaseProducts` → `getFeaturedProducts(limit)`.

**Phase 6 — category hub + listing**
- `CategoryHub.jsx` (`/c/:category`) — "Choose your {fan|light}", a `power-up` plate of subcategory modules (image + count), coming-soon entries dimmed with an unlit LED.
- `Listing.jsx` — shared filtered/sorted/URL-synced grid (facets, sub toggles, `q`, `sort` all in the querystring; mobile bottom-sheet). Used by `CategoryListing`, `AllProducts`, `Search`.
- `CategoryListing.jsx` (`/c/:category/:subcategory`) rewritten light with `BrandRail` + sibling-type chips.
- `AllProducts.jsx` (`/products`) — new, `getFacets(null)` adds a `__category` facet.
- `FilterPanel`, `BrandRail`, `Toggle` relit.

**Phase 7 — detail, brands, search**
- `ProductDetail.jsx` (`/product/:uid`) — gallery, `BrandMark`, breadcrumb, `VariantSelector`, spec table from `specs[]` + variant options, **omits** empty sections (carries thin brands), related (other brands first) + "More from {brand}", Add-to-enquiry.
- `BrandMark.jsx` — logo if `brand.logo`, else tinted wordmark chip.
- `Brands.jsx`, `BrandPage.jsx`, `About.jsx`, `Contact.jsx` relit; Contact renders the enquiry list and pre-fills the message.
- `Search.jsx` (`/search`) — results through `<Listing>`.
- `KelvinBar.jsx` relit; deep-links to `/products?category=Lighting&tone=…`.

## Known gaps / watch-outs

- **Not visually verified.** The Chrome extension was offline this session — Phase 8 still needs the responsive/keyboard/reduced-motion pass.
- `multi-brand-catalog` was never merged to `main`. The eventual PR merges *everything* since `a204be4`.
- Prices exist in some scraped data but are **not rendered** — enquiry-only. See `decisions.md`.
- Data chunk is 2.3 MB (362 KB gzip) in its own lazy chunk. Fine for now; windowing/pagination for >200-item lists is still a `roadmap.md` item (Crompton lighting ≈ 320).
- `Home` "Shop by need" tile "Energy-efficient fans" links to `/search?q=bldc` — depends on "bldc" appearing in product text; verify it returns results.
- Brand logos are all `null` — `<BrandMark>` renders wordmark chips everywhere. Drop real SVGs at `public/brands/<slug>.svg` + set `logo` in `brands.js` when available.
