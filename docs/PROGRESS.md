# Voltex — Progress

**This is the handoff file.** A new session resumes by reading this top-to-bottom.

- **Branch:** `brand-first-catalog-nav` (forked from `admin-curate-tool` / `multi-brand-catalog`).
- **Live site:** https://voltex-electricals-psi.vercel.app
- **Plan:** `~/.claude/plans/so-there-were-a-goofy-cascade.md` (brand-first nav restructure).
- **Brief:** `website_redesign_prompt.md` (the client requirements)
- **Plans (historical):** `~/.claude/plans/okay-so-now-we-quizzical-parrot.md` (mobile viewport + search + Water Geysers), `~/.claude/plans/velvet-baking-lollipop.md` (Phase 0 + A–D), `~/.claude/plans/pr-2-merged-one-synthetic-hinton.md` (A–D file:line detail)

> **Branch trap, corrected.** The previous note here said `main` was current and `multi-brand-catalog` was stale — as of this session it's the other way round: `multi-brand-catalog` (`6bfeed7`) carries the merged curation-tool work (PR #9) that `main` (`6770be8`, PR #8 only) doesn't have yet. **Check both `origin/main` and `origin/multi-brand-catalog` logs before assuming either is current** — this has flipped once already and will again once someone merges one into the other.

## Latest (2026-09-16) — four new brands (Multifab, AO Smith, Almonard, Wipro)

**What and why.** Client dropped raw scraped data for four new brands into `Products/<brand>/` plus their logos into `Logos/`, and asked for them wired in exactly like the existing six: Multifab and Wipro under Lighting, AO Smith under Water Geysers, Almonard under Fans (as Industrial Fans) — with the brand-first flow (category → brand → listing) working unchanged, and a new homepage row for industrial products.

- **Three new ETL adapters** in `scripts/normalize.mjs` (`adaptMultifab`, `adaptAoSmith`, `adaptWipro`), one per raw scrape shape — see `docs/data-model.md` for the full column-mapping detail of each. Almonard's two products were transcribed by hand into `Products/almonard/fans.json` (schema A) since its CSV scrape was page fragments with no usable columns, not a product table.
- **Two new lighting subcategories**: `Surface Lights` and `Linear Lights` added to `SUBCATEGORY_ORDER.Lighting` (`src/data/taxonomy.js`) — Multifab's surface-mount and linear-batten fixtures didn't fit any existing bucket without being misleading.
- **Brand entries** (`src/data/brands.js`): fixed the pre-existing `multifar` typo/slug to `multifab` (was a stub with no logo), gave `wipro` and `almonard` real logos (were `logo: null` text-chip stubs), added a new `ao-smith` entry. Logos copied from `Logos/` into `public/brands/` — `almonard.png` (236×29) and `AOSmith-logo.png` (200×70) are low-res for the brand-chooser's `xl` slot (up to 144px tall); flagged, not fixed, pending a higher-res source from the client.
- **Homepage**: new "Built for industry" section under "Popular across the range" (`Home.jsx`) — Almonard's 2 air circulators + 2 Wipro high-bay/wellglass luminaires, via `getIndustrialPicks()` (`src/data/products.js`), which backfills from any other Industrial-duty fan or Professional & Commercial Lighting product if a named model is ever removed, so the row can't silently shrink or misrepresent stock. `Section` gained an optional `blurb` line under its title (used here only).
- **No price/SKU/description in Multifab and Wipro's raw data** — both scrapes are name+image(+spec-table for Multifab) only, same "thin" `quality` treatment as Havells/Polycab.
- Note on naming: the client referred to this brand verbally as "Elmonard," but the files, logo, and the brand's real name are all **Almonard** — used the real name.

**Verified:** `npm run data:build` — 253 new products published, **zero** parked and **zero** auto-adopted subcategories from any of the four new brands (report census confirms: Fans/Industrial Fans +2, Lighting subcategories across Multifab/Wipro, Water Geysers/Instant+Storage split for AO Smith). A script checked every one of the 253 new records has a non-empty title, a primary image, and a subcategory that exists in `SUBCATEGORY_ORDER`. `npm run lint` and `npm run build` both clean. **Not verified: appearance** — no browser this session (per client instruction: they're checking manually and will flag anything wrong).

## Latest (2026-09-15) — brand-first browsing, accurate counts, logo fixes

**What and why.** Client removed ~468 unavailable products via the curation tool (down to 1,007 live models across 6 brands), leaving the site's brand list, "coming soon" tiles and stats stale/inaccurate. Separately asked for the browse flow to go category → brand → filtered listing instead of category → subcategory grid, since a shopper who knows they want a Havells fan had no direct path to just Havells' fans.

- **Stats now provably live.** `getBrands()`/`getBrandsForCategory()` (`src/data/products.js`) drop any brand with a 0 count instead of rendering it "coming soon" — down from the static 14-brand list to the 6 actually stocked (Atomberg, Crompton, Havells, Orient, Philips, Polycab). Removed `COMING_SOON` from `taxonomy.js` and every `comingSoon`/`data-coming-soon` branch it fed (`CategoryHub`, `Header` mega-menu, `Brands.jsx`, `index.css`) — nothing on the site claims stock that isn't in `Products/normalized/*/*.json`. Verified the total independently by summing every row in those files directly (1,007), not by trusting the ETL's own prose report.
- **New flow: category → brand → listing.** `CategoryHub.jsx` (`/c/:category`) now renders a brand-chooser instead of a subcategory grid; `BrandListing.jsx` (`/c/:category/:brandSlug`, replaces the deleted `CategoryListing.jsx`) shows one brand's models in that category with Type/spec filters and search, breadcrumb-only navigation back (no brand-switch rail on the listing itself, per client direction). `getSubcategories()` and `getFacets()` in `products.js` gained an optional `brandSlug` scope. Removed the now-dead derived-tile machinery (`DERIVED`, `derivedTile`, `getProductsByDerived`, `getDerivedSubcategories`) and `BrandRail.jsx` — Metal/Industrial fans are still reachable as Build/Duty facet chips inside a brand's listing. Header mega-menu lists brands per category instead of subcategories.
- **Brand logos.** All 6 stocked brands now have real logos in `public/brands/` (were text chips). `BrandMark.jsx` draws a logo bare — no background chip/ring — since a chip behind a real logo read as a box-inside-a-box; the chip stays only for brands still on the text fallback. Three source files needed real fixes, not just CSS: Havells' original SVG had asymmetric, off-centre padding baked into its viewBox (measured by rendering to PNG and diffing the opaque-pixel bounding box against the canvas — 59% height fill, 27%/15% left/right margins); Philips' SVG had a full opaque white artboard rect hiding that the actual wordmark only filled 18% of its height. Both `public/brands/*.svg` viewBoxes are now cropped tight to real, measured ink. Havells was later replaced with a cleaner source PNG entirely (`public/brands/havells.png`) once the client provided one. `logoScale` on a `BRANDS` entry (`src/data/brands.js`) is the documented, measured escape hatch for a logo that's still shape-disadvantaged (a compact lockup vs. a wide wordmark) even after a tight crop. The brand-chooser's logo size (`BrandMark` `xl`) uses a `clamp()`, not a flat px cap, so it scales with viewport instead of being flatly too big on a phone or too small on a desktop card.
- **LEDs only light on real interaction.** Several `.led` indicators were wired to light automatically on page load (`power-up` class) or via an always-on `data-live`/`data-on` flag that no longer meant anything once every listed brand is, by construction, in catalogue. Now dim until hover/focus on every clickable card (brand-chooser, Brands page, Home category tiles) and — for the mega-menu, where the LED isn't itself the click target — a `.led-row` CSS hook lights it for hovering anywhere in that category's whole panel (including its brand list), not just its title row.
- **Removed guessed product colour.** `SwatchRow` (finish-colour dots on every product card) and `VariantSelector`'s colour-circle fallback both derived a swatch hex from the option's text via a keyword-matching guess (`swatchColors.js`, deleted) — demonstrably wrong for some names (a "Warm White" bulb rendered near-white, not warm amber). Colour circles now render only for genuine light-tone options, backed by real Kelvin math (`lib/kelvin.js`, same source as the KelvinBar) — every other option (finish, size, wattage) is a plain text button like the rest.
- **Brand page ("See all").** `BrandPage.jsx`'s per-category "All N →" link moved from the section header (above the 8-product preview, easy to miss) to a full-width button below the grid, for every category, every brand.
- Brand lists now sort alphabetically, not by model count.

**Verified:** `npm run build` and `npm run lint` clean throughout. Total product count (1,007) verified independently by summing `Products/normalized/*/*.json` rows, not by trusting `report.md`'s prose. Havells/Philips logo crops verified by rendering the patched SVGs back to PNG and re-measuring the ink bounding box (symmetric margins, ~93% fill). **Not verified: appearance.** No working Chrome extension this session (same gap as every prior session on this project) — nothing above has been seen actually rendered by the agent; the client did the only real visual QA, over several rounds of screenshot feedback (the Havells off-centre logo, the too-small Philips mark, the always-lit LEDs) that drove several of the fixes above.

## Latest (2026-09-12, later) — product gallery latency, route/nav motion

**What and why.** Client reported the product-image swipe taking 4-5 seconds per image and the site generally feeling static — page navigation and lazy-loaded routes had no transition, so waits read as the page stalling rather than working.

- **Gallery swipe latency — root cause.** The active gallery image only started its network request when it *became* active (`cdnImage(images[activeImage], 1000)` inside the rendered `<img>`), so every swipe paid for a fresh Shopify CDN request + resize before anything appeared. Fixed with `usePreloadNeighbors()` in `ProductDetail.jsx` — warms the browser's own cache for the next and previous frame (the two a swipe can actually land on) as a side effect whenever the active image changes, via a plain `new Image().src`. By the time a swipe lands on that frame, the request is already in flight or finished.
- **`cdnImage()` now requests WebP and a device-pixel-ratio-aware width** (`src/lib/image.js`) instead of a bare `width=`. Shopify's CDN auto-negotiates format from the browser's own `Accept` header — real `<img>` tags get WebP for free (confirmed ~40% smaller: 76,508 → 46,662 bytes on a sample product photo at the same width); `curl` without an explicit `Accept: image/webp` header doesn't, which is a testing quirk, not a real-world gap. DPR-aware width means a 2x phone screen doesn't get a soft, upscaled 1x image.
- **Gallery transition tightened**: `mode="popLayout"` (was `"wait"`) so the incoming frame starts sliding in immediately rather than waiting for the outgoing one to finish fading out first, plus a direction-aware slide (`custom={direction}`, ±40px on the axis of the swipe) instead of a plain cross-fade — reads as a swipe, not a flicker. `fetchpriority="high"` added to the active image.
- **Route navigation now has a fade-up entrance** (`App.jsx`, `motion.div` keyed on `location.pathname`, 220ms) instead of the previous page's content just snapping to the next. No exit animation deliberately — with lazy-loaded route chunks, waiting for the outgoing page to finish leaving before the next one can even start loading would make navigation feel *slower*, the opposite of the ask.
- **Suspense fallback replaced** — a blank `min-h-[60vh]` div during a lazy chunk's first load (only happens once per chunk, then it's cached) is now a thin amber sweep bar (`RouteLoading` in `App.jsx`), so a chunk load reads as "loading" rather than "nothing happened."
- Header hamburger drawer, mega-menu, search overlay, mobile filter sheet and the product grid were already animated (checked, not touched) — the "everything should animate" ask was already met there; the actual gaps were the gallery and route changes.

**Verified:** `npm run lint` and `npm run build` clean. Headless-Chromium smoke test (home → product detail → products → category → 404) — zero console/page errors. Screenshot of the product gallery confirms it renders and the 1/2 counter and swipe controls are intact. WebP negotiation confirmed manually with `curl -H "Accept: image/webp"` against a live Shopify CDN URL from the catalogue.

**Not done, flagged for later:** the product-data JS chunk is 2.4 MB (375 KB gzipped) and loads on every route, since `products.js` is imported everywhere — this is the other real lever on load speed but is a data-layer/code-splitting change, out of scope for this pass (already tracked as a `roadmap.md` item). Havells/Polycab images come straight from their own CDNs with no resize API, but sampled at 5-10 KB already, so they weren't the bottleneck. No real iPhone/Safari test of the swipe feel (no device or Chrome extension this session) — the preload fix is structural and should hold regardless of device, but a real-phone spot-check is still worth doing.

## Latest (2026-09-12) — mobile viewport, search everywhere, Water Geysers

**What and why.** Client reported the mobile site rendering "zoomed out" with blank margins and a pannable page, search only working from the home page, and asked for a Water Geysers category from the Crompton data. See D23–D25 in `decisions.md` for the full reasoning; short version:

- **Mobile zoom-out root cause found and fixed at source**: the header row (logo + search/enquiry/menu icons) was permanently ~60px wider than a 360–390px viewport with no shrink path, which is what forces mobile browsers to zoom the whole page out. Confirmed with a headless-Chromium scan of every route at 360/390/768/1280px (`document.documentElement.scrollWidth` vs `innerWidth`) before and after — all routes clean now at all four widths. Fixed: smaller logo lockup + tighter header spacing under `sm:`. Added `overflow-x: clip` on `html`/`body` as a regression safety net (not the fix itself).
- **iOS input auto-zoom** fixed — `@media (pointer: coarse) { input,select,textarea { font-size: 16px !important } }` in `src/index.css`.
- **Real scroll lock** — `src/lib/useScrollLock.js` (position:fixed at scroll offset) replaces the `body{overflow:hidden}` iOS ignores, used by `SearchOverlay` and the mobile drawer.
- **Search on every page** — header search button is now a wide input-look pill with placeholder text from `md` up (still an icon on mobile); `/search` re-syncs its field when the URL query changes and gained an explicit Search button.
- **Water Geysers published** (Crompton only: Storage 21, Instant 17, Gas 1 = 39 models; Immersion Rods intentionally left parked). `PUBLISHED` in `taxonomy.js` now has three categories; every "Fans and Lighting"-shaped grid or copy string (`Home.jsx`, `Header.jsx` mega-menu, `Footer.jsx`, `About.jsx`, `AllProducts.jsx`, `CategoryHub.jsx`) now derives from `PUBLISHED` via the new `categoryList()` helper instead of naming two categories.

**Verified:** `npm run lint` and `npm run build` clean; `npm run data:build` report shows the expected Water Geysers counts and Crompton parked dropping by 39; headless-Chromium scan (360/390/768/1280px, 14 routes including the new Water Geysers ones) all `scrollWidth === innerWidth`; iPhone-13 emulation confirms `body{position:fixed}` while the search overlay is open, scroll position restored on close, and every input's computed font-size is 16px. **Not verified:** real Safari/iOS (no device or Chrome extension this session) — the headless/emulation checks above are the strongest available proxy.

**Next:** merge this branch (`--base main`, not the GitHub default), then verify on the production URL the way `voltex-deploy-facts.md` describes; a real iPhone check would still be worth ten minutes if one's on hand.

---

## Start here next session

**PR #2 and PR #3 are both merged.** `main` (`7825a78`) is the live site: the multi-brand Modular Plate catalogue, with the deploy fix and Phases A–D on top.

Everything below is a record of what shipped. **The one outstanding task is visual QA** — see the end of this section.

| # | Phase | Status |
|---|---|---|
| 0 | Deploy 404 — `vercel.json` SPA rewrite, `robots.txt`, encoded category paths | ✅ shipped |
| A | Mobile menu portal, hero lamp, lockup, structural motif, KelvinBar bulb | ✅ shipped |
| B | Taxonomy — Backlight, COB, derived Metal/Industrial Fans | ✅ shipped |
| C | Brand logos into `public/brands/` | ✅ shipped |
| D | Verify, docs, PR to `main` | ✅ shipped (PR #3) |

**Phase 0 — what and why.** The deployed site returned Vercel's own `404: NOT_FOUND` on any inner URL opened directly or refreshed (clicking through worked). Cause: a `BrowserRouter` SPA served as static files with no rewrite, so `/c/Fans` matched no file on disk and the app's JS never loaded. Fixed by `vercel.json` (`/(.*)` → `/index.html`, plus immutable `/assets/*` caching and three security headers) and `public/robots.txt`. Also added `categoryPath()` / `subcategoryPath()` to `src/data/taxonomy.js` and routed all 18 `/c/…` link builders through them, because category names are display strings with spaces and `&`. See D16/D17 in `decisions.md`.

**Confirmed fixed in production** (2026-09-09, after PR #3 merged). Vercel's production branch is `main`, so the merge deployed. Checked against the live URL:

- `/`, `/c/Fans`, `/c/Fans/Metal%20Fans`, `/c/Lighting/COB%20LED`, `/c/Lighting/Downlighters%20%26%20Spotlights`, `/brands`, `/products`, `/enquiry` and a bogus `/c/Nonsense` — all **200**, all serving `index.html`. The bogus path now renders the app's own `NotFound`, which was unreachable before.
- Headers present on a deep link: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`. `/assets/*` carries `Cache-Control: public, max-age=31536000, immutable`.
- Static files are not swallowed by the rewrite: `/favicon.svg` → `image/svg+xml`, `/robots.txt` → `text/plain`, `/brands/havells.svg` → `image/svg+xml` (the point of the rename), `/brands/crompton.png` → `image/png`.

Note the 404 is **not reproducible locally** — `vite preview` already falls back to `index.html`, so it can never show the bug. Test against the deployed URL.

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

**Phase D — what was verified, and what wasn't.**

Verified mechanically:
- `rm -rf Products/normalized && npm run data:build` reproduces the committed JSON byte-for-byte (only `report.md`'s timestamp differs) — the ETL is deterministic. **1,438 published / 412 parked**, unchanged.
- `npm run lint` and `npm run build` clean.
- No dead references to `--tone-*`, `icons.svg`, `logos/` or `heroImage`; no import cycle (`taxonomy.js` imports nothing).

Verified against the **live deployment** after merge (see Phase 0 above for the routing and header results). Also confirmed the new build is the one serving: the deployed `/assets/products-*.js` chunk contains 4 `"Backlight"` and 42 `"COB LED"` entries and still carries the Aerobliss metal wall fan, and the deployed stylesheet contains `.bulb`, `.lamp-glow`, `.lockup-sub` and `data-live`.

**Still unverified — needs a human with a browser.** The Chrome extension has been offline in *every* session on this project, and there is no headless browser installed, so **nothing below has ever been seen rendered.** Everything verified above is behaviour and data, never appearance. Don't plan work that depends on the agent seeing the page.
1. **360 / 768 / 1440.** Especially the mobile drawer (A0) — the whole point is that it now opens full-height and opaque with its nav links visible. This is the one change most worth looking at.
2. Hero lamp warms on hover **and** keyboard focus, and Enter opens the product.
3. "ELECTRICALS" lights amber in the header, the footer, and the drawer.
4. The KelvinBar bulb sweeps warm→cool as the slider moves.
5. `/c/Fans` — Metal Fans and Industrial Fans are live tiles with counts (9 and 5), not dimmed; Elevation LED is the only dimmed tile left, on `/c/Lighting`.
6. Hover a lighting card (warm glow) vs a fan card (plain lift).
7. `/brands` — green live dots, and the three real logos sitting at the same size as the eleven chips.
8. Keyboard-only pass; `prefers-reduced-motion: reduce`.

(The 404 fix itself is no longer on this list — it was confirmed against the live site after PR #3 merged.)

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
