# Voltex Redesign v2 — Progress

**This is the handoff file.** A new session resumes by reading this top-to-bottom.

- **Branch:** `redesign-v2` (forked from `multi-brand-catalog`, *not* `main`)
- **Last commit:** _Phase 1 — ETL (`scripts/normalize.mjs`)_
- **Plan:** `~/.claude/plans/firstly-we-will-be-glittery-peacock.md` (full detail)
- **Brief:** `website_redesign_prompt.md` (the client requirements)

## Start here next session

Phases 0–1 done. The ETL runs (`npm run data:build`) and writes `Products/normalized/` — **1,438 published** products (6 brands) + 412 parked. Review `Products/normalized/report.md` for the subcategory census and parked list.

**Next is Phase 2 — the data layer.** `src/data/catalog.js` still globs `/Products/*/*.json` (the old path, Orient only). Change it to `/Products/normalized/*/*.json`, then rewrite `taxonomy.js` (canonical tree + full alias map + `PUBLISHED`), extend `brands.js` (`tint`, `logo`, vendor-alias map), and add `searchProducts` / `getCategoryCounts` to `products.js`. Still nothing in the visual layer — do not touch components until Phase 2 lands or you build against stale data.

## Phase status

| # | Phase | Status | Commit |
|---|---|---|---|
| 0 | `docs/` scaffold + track raw `Products/` data | ✅ done | `a90d20e` |
| 1 | ETL — `scripts/normalize.mjs` → `Products/normalized/` | ✅ done | _this commit_ |
| 2 | Data layer — `taxonomy.js`, `brands.js`, `catalog.js` glob, `products.js` | ⬜ not started | |
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

## Known gaps / watch-outs

- **The five new brand datasets do not load yet.** `catalog.js` globs `/Products/*/*.json`; pointing it at the raw dumps would ingest Crompton's 5.6 MB file and emit garbage. Phase 1 must land first.
- `multi-brand-catalog` was never merged to `main`. The eventual PR merges *everything* since `a204be4`.
- Prices exist in some scraped data but are **not to be rendered** — enquiry-only. See `decisions.md`.
- `Products/orient/` is git-tracked; the other five folders were untracked until Phase 0.
