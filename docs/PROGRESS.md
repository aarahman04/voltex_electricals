# Voltex Redesign v2 — Progress

**This is the handoff file.** A new session resumes by reading this top-to-bottom.

- **Branch:** `redesign-v2` (forked from `multi-brand-catalog`, *not* `main`)
- **Last commit:** _Phase 0 — docs scaffold + track raw brand data_
- **Plan:** `~/.claude/plans/firstly-we-will-be-glittery-peacock.md` (full detail)
- **Brief:** `website_redesign_prompt.md` (the client requirements)

## Start here next session

Phase 0 is done: branch created, raw brand data committed, docs scaffolded. **Next is Phase 1 — the ETL script** (`scripts/normalize.mjs`). Nothing in `src/` has changed yet; the app still renders the old dark single-brand-shaped UI from the `multi-brand-catalog` branch. Do not touch components until the data layer (Phases 1–2) is real, or you will be building against Orient-only data.

## Phase status

| # | Phase | Status | Commit |
|---|---|---|---|
| 0 | `docs/` scaffold + track raw `Products/` data | ✅ done | _this commit_ |
| 1 | ETL — `scripts/normalize.mjs` → `Products/normalized/` | ⬜ not started | |
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

## Known gaps / watch-outs

- **The five new brand datasets do not load yet.** `catalog.js` globs `/Products/*/*.json`; pointing it at the raw dumps would ingest Crompton's 5.6 MB file and emit garbage. Phase 1 must land first.
- `multi-brand-catalog` was never merged to `main`. The eventual PR merges *everything* since `a204be4`.
- Prices exist in some scraped data but are **not to be rendered** — enquiry-only. See `decisions.md`.
- `Products/orient/` is git-tracked; the other five folders were untracked until Phase 0.
