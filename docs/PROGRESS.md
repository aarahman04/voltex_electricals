# Voltex Redesign v2 — Progress

**This is the handoff file.** A new session resumes by reading this top-to-bottom.

- **Branch:** `redesign-v2` (forked from `multi-brand-catalog`, *not* `main`)
- **Last commit:** _Phase 2 — data layer rewired to normalized data_
- **Plan:** `~/.claude/plans/firstly-we-will-be-glittery-peacock.md` (full detail)
- **Brief:** `website_redesign_prompt.md` (the client requirements)

## Start here next session

Phases 0–2 done. The app now loads all **1,438 products across 6 brands** — `npm run dev`, every route returns 200, `npm run build` and `npm run lint` are clean. The UI is still the old dark `multi-brand-catalog` design; it just has real multi-brand data flowing through it now.

**Next is Phase 3 — the design system.** Rewrite `src/index.css`: replace the dark `@theme` with the Modular Plate tokens (see `docs/design-system.md`), swap the Google Fonts `<link>` in `index.html` to Archivo + Instrument Sans + IBM Plex Mono, add the `.plate` / `.led` / `.switch-btn` primitives and `@keyframes power-up`. This commit will make the existing components look broken (dark classes on light tokens) — that is expected; Phases 4–7 rebuild them. Keep `.nameplate` and `.spec` (retune `.nameplate` for light).

## Phase status

| # | Phase | Status | Commit |
|---|---|---|---|
| 0 | `docs/` scaffold + track raw `Products/` data | ✅ done | `a90d20e` |
| 1 | ETL — `scripts/normalize.mjs` → `Products/normalized/` | ✅ done | `fbb871b` |
| 2 | Data layer — `taxonomy.js`, `brands.js`, `catalog.js` glob, `products.js` | ✅ done | _this commit_ |
| 3 | Design system — `index.css` Modular Plate tokens, fonts, plate/LED primitives | ⬜ not started | |
| 4 | Chrome — `Header` (new nav + mega-menu), `Footer`, search overlay, `Enquiry` | ⬜ not started | |
| 5 | Home — new hero, Shop by Category, brand strip, remove `CylinderCarousel` | ⬜ not started | |
| 6 | Category hub `/c/:category` ("Choose your fan") + listing rewrite | ⬜ not started | |
| 7 | Product detail, Brands pages, Search | ⬜ not started | |
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
- `products.js`: added `searchProducts()`, `getCategoryCounts()`. `getShowcaseProducts`/`getHeroFeature` kept until Phase 5 (Home still imports them).
- Build bundles ~2 MB of normalized JSON into the main chunk (467 KB gzip). Acceptable for now; Phase 8 splits it. Noted in `roadmap.md`.

## Known gaps / watch-outs

- **The five new brand datasets do not load yet.** `catalog.js` globs `/Products/*/*.json`; pointing it at the raw dumps would ingest Crompton's 5.6 MB file and emit garbage. Phase 1 must land first.
- `multi-brand-catalog` was never merged to `main`. The eventual PR merges *everything* since `a204be4`.
- Prices exist in some scraped data but are **not to be rendered** — enquiry-only. See `decisions.md`.
- `Products/orient/` is git-tracked; the other five folders were untracked until Phase 0.
