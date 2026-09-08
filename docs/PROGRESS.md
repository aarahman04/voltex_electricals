# Voltex Redesign v2 — Progress

**This is the handoff file.** A new session resumes by reading this top-to-bottom.

- **Branch:** `redesign-v2` (forked from `multi-brand-catalog`, *not* `main`)
- **Last commit:** _Phases 4–7 — full UI rebuild on Modular Plate_
- **Plan:** `~/.claude/plans/firstly-we-will-be-glittery-peacock.md` (full detail)
- **Brief:** `website_redesign_prompt.md` (the client requirements)

## Start here next session

Phases 0–7 done. The whole UI is rebuilt on the Modular Plate light system. `npm run build` and `npm run lint` are clean. Every route renders against real multi-brand data.

**Phases 4–7 landed as one commit, not four.** `App.jsx` routes reference every new page, so no smaller subset builds on its own; splitting would have produced broken intermediate commits. The per-phase deliverables are listed under "What shipped" below and the docs are current, which is what a resume actually needs.

**Next is Phase 8 — verify + PR.**
1. Manual pass at 360 / 768 / 1440 (browser extension wasn't connected this session, so this is still unverified visually): Home → Products mega-menu → Fans hub ("Choose your fan") → Ceiling Fans → filter by brand → product → Add to enquiry → `/enquiry` → Contact. Check a **thin** product (Havells/Polycab — no variants, no specs: page must not show empty sections) and a **rich** one (Orient COB downlighter).
2. Keyboard pass — visible amber focus rings through header, mega-menu, filters, grid.
3. `prefers-reduced-motion` — LED power-up + card transforms suppressed.
4. Consider splitting the 2.3 MB `products` data chunk (currently its own lazy chunk, 362 KB gzip — acceptable but large). See `roadmap.md`.
5. Open the PR: `redesign-v2` → `main`. It carries **everything since `a204be4`** (multi-brand-catalog was never merged).

## Phase status

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
| 8 | Verify (360/768/1440 + a11y + reduced-motion), open PR to `main` | ⬜ not started | |

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
