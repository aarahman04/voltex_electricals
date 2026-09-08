# Decisions

Append-only. Newest first. Each entry: the choice, the reason, and what it rules out.

---

## 2026-09-09 — Taxonomy (Phase B)

### D20 — Metal Fans and Industrial Fans are attributes, not subcategories
`DERIVED` in `taxonomy.js` + `Build`/`Duty` variant options derived in the ETL + one conditional in `CategoryListing`. They render as ordinary live tiles on `/c/Fans`.
**Why:** no brand files a "Metal Fans" product type. The nine fans whose names say metal are already correctly Wall, Exhaust, Ceiling and Pedestal fans — as a subcategory the product would have to pick one, and a metal wall fan would vanish from Wall Fans. As an attribute it appears in both, counted once in each. Costs no new route, no new breadcrumb and no change to the shared `<Listing>`. **Rules out:** ever writing "Metal Fans" into `subcategory`; the tiles' own facet is hidden on their page, since you're already standing in it.

### D21 — Backlight and COB promoted in the ETL, Elevation LED left alone
`reclassify()` promotes 4 Orient "Backlit/Backlite … Recess Panel" models out of Panel Lights; a schema-B rule moves 26 COB downlights out of Ceiling Lights.
**Why:** all three read "Coming soon" while their products sat under other labels — the site was hiding stock it has. `Product_Catalog.md` §1.1 lists Backlight as a sibling of Panel, and Philips/Crompton file COB downlights under `product_type: "Ceiling light"` while their own handles and tags say COB. Elevation LED stays "Coming soon" because it genuinely has zero data — honest, and the tile still shows intended breadth (D7). **Rules out:** matching `/backlight/i`, which would drag in Philips' TV Backlight Strip (a TV bias light, correctly Smart Lighting); and touching parked rows — promotions relabel only, so totals stay 1,438/412.

---

## 2026-09-09 — Lamp, lockup, motif (Phase A)

### D19 — The motif marks state, and light is one of the states
Two hooks activated (`.led[data-live]` = in catalogue, `.module[data-active]` = the category you're in) and three places that render real light: the hero lamp on hover/focus, the KelvinBar bulb tracking the slider, and lighting cards glowing in the tone they're sold in.
**Why:** the brief forbids a "gimmicky electricity themed website", but it does not forbid showing a value — and colour temperature is a value nobody can picture from "4000K". Every lit thing is bound to state the user is setting, buying, or standing in. **Rules out:** decorative bulbs, fake screws, wiring graphics, ambient glow; and indicators in places with no state — `data-active` is set once, in the mega-menu, because that is the only place the state exists.

### D18 — Overlays portal to `<body>`
`MobileNav` and `SearchOverlay` render through `Portal`.
**Why:** `<header>` carries `backdrop-blur-md`. A `backdrop-filter` makes that element the containing block for every `position: fixed` descendant, so both overlays resolved `fixed inset-0` against the 64px header box — the drawer opened as an empty, see-through sliver in production. Each is now one keyed `motion` child of its `AnimatePresence`; a bare Fragment gave framer-motion nothing to track, so exit animations never ran. **Rules out:** dropping the header's blur (the sticky header needs it), and z-index patching — the portal also settles the latent fight with `Toast`.

---

## 2026-09-09 — Deploy fix (Phase 0)

### D17 — SPA rewrite over prerendering; soft 404 accepted
`vercel.json` rewrites `/(.*)` → `/index.html`. Every URL now returns HTTP 200 and the client renders `NotFound` for a path that matches nothing.
**Why:** the deployed site returned Vercel's own `NOT_FOUND` on any direct hit or refresh of an inner URL — a `BrowserRouter` app served as static files has no `index.html` fallback, so `src/pages/NotFound.jsx` was unreachable on a cold load. Vercel resolves real files before rewrites, so `/assets/*` still serves. **Rules out:** correct 404 status codes for missing products, and any SEO that depends on them — fixing that means prerendering or a framework move, which is not worth it for a browse-only catalogue behind an enquiry flow.

### D16 — Category paths encoded through one helper, not slugified
All `/c/…` links go through `categoryPath()` / `subcategoryPath()` in `src/data/taxonomy.js`.
**Why:** `category` and `subcategory` are display strings, not slugs — `"Downlighters & Spotlights"`, `"COB LED"`, `"Metal Fans"` — and 18 call sites interpolated them raw, emitting literal spaces and `&` in the path. `useParams()` decodes on the way back, so matching is untouched. **Rules out:** nothing yet; real slug routing stays open (see `docs/roadmap.md`) but would change every category URL.

---

## 2026-09-08 — Implementation (Phases 3–7)

### D14 — Phases 4–7 shipped as one commit, not four
`App.jsx` imports every new page; no phase-sized subset compiles alone, so four commits would mean three broken ones. The resume aid is `docs/PROGRESS.md` + the `docs/*.md` set, and those are kept current — that is what D9 was actually protecting.
**Why:** a green `npm run build` at every commit matters more than commit granularity. **Rules out:** bisecting the UI rebuild by commit; use the file list in `PROGRESS.md` instead.

### D13 — Header nav: Products (mega-menu) / Brands / About / Contact — no "Categories"
The brief's sample nav lists "Categories" *and* "Products". The Products mega-menu already *is* the category explorer (every published category + its subcategories as a plate), so a separate "Categories" link would point at the same place.
**Why:** the brief's overriding instruction is "much cleaner navigation" and "not a massive list". One door into the taxonomy, not two. **Rules out:** a dedicated `/categories` index page (none exists).

### D12 — One shared `<Listing>` for every product grid
`CategoryListing`, `AllProducts` and `Search` are the same filtered/sorted/URL-synced grid over a different starting set + facet list. Filters live entirely in the querystring (`brand`, `tone`, `wattage`, `size`, `category`, `sub`, `q`, `sort`) so every filtered view is linkable and back/forward works.
**Why:** the brief wants filtering, sorting and search to feel like one system; three copies would drift. **Rules out:** per-page filter state; deep-links like KelvinBar's `/products?category=Lighting&tone=Warm White` depend on this.

### D11 — Motion budget: the LED power-up, card lift, image scale, menu fades — nothing else
`power-up` runs once on the hero category plate and the CategoryHub subcategory plate. Everything else is a ≤200ms transition. `prefers-reduced-motion` kills the power-up and all transforms (already in `index.css`).
**Why:** brief — "prioritise product discovery over decorative animation", "avoid constant movement". **Rules out:** scroll-triggered reveals, stagger-in grids, the old `whileInView` on every card (also a perf win on 300-item lists).

### D10 — Enquiry list is `localStorage` only, ids not objects
`voltex:enquiry` holds an array of `uid` strings; products are re-resolved on read via `getProductById`. No backend.
**Why:** there is no backend and the catalogue is the source of truth — storing snapshots would go stale when data rebuilds. **Rules out:** cross-device sync, persistence of models that later leave the catalogue.

---

## 2026-09-08 — Redesign v2 kickoff

### D9 — Delivery: one branch, phased commits, docs updated per phase
`redesign-v2` off `multi-brand-catalog`. One commit per phase; every phase commit also updates `docs/PROGRESS.md`. Single PR to `main` at the end.
**Why:** user works across many sessions that start cold; the record has to be inside the repo and always current, not in chat history.

### D8 — Visual direction: "Modular Plate"
Identity built from the Indian modular switch plate — strict module grid, hairline seams, indicator LEDs that light on hover/active. Light palette, Archivo + Instrument Sans + IBM Plex Mono. One motion moment: LEDs power up left-to-right on load.
**Why:** the one artifact every Indian electrical customer already knows; the grid does real structural work (category cards, mega-menu, filters) instead of decoration. Rejected: "Light Studio" (too close to how Philips already looks), "Trade Counter" (not premium enough).

### D7 — Taxonomy: canonical spine + auto-adopt
`Product_Catalog.md` (the handwritten stock list) is the canonical tree. Raw subcategory strings map in via an alias map. Unmapped strings are auto-adopted so no product is unreachable. Canonical entries with zero products render dimmed, "Coming soon", not clickable.
**Why:** the business's intended taxonomy (Metal Fans, Industrial Fans, Backlight, COB LED) does not match the scraped subcategories (Tower Fans, Kitchen Fans, Curtain & String Lights). Neither side can be the sole source of truth. Rejected: data-driven-only (labels drift, stock lines never appear), strict-canonical-only (silently hides real products).

### D6 — Thin brands (Havells, Polycab): include, degrade gracefully
447 products with only name + image + URL. Cards render normally; detail-page sections with no data are **omitted, not rendered empty**. Filters just don't match them on attributes they lack.
**Why:** Havells is the second-largest ceiling-fan range (91). Excluding it makes the site more Orient/Crompton-weighted — the opposite of the brief.

### D5 — Non-core Crompton (~400 items): normalize, park, don't publish
Pumps, hobs, geysers, mixers, chimneys, irons. The ETL processes them into `_parked.json` with real categories; the site publishes Fans + Lighting only (`PUBLISHED` in `taxonomy.js`).
**Why:** only Crompton stocks them — publishing now would make those categories look like a Crompton-only store. Parking keeps the work so a future category is a one-line change.

### D4 — Prices: none shown, enquiry-only
All products read "Price on enquiry". Price data is still normalized and stored.
**Why:** coverage is too patchy to look intentional (Havells has none, 34/99 Orient lighting is ₹0), scraped MRP is not Voltex's price, and it goes stale silently. Matches the enquiry-list CTA. Flipping it on later is one config change.

### D3 — Primary CTA: enquiry list replaces cart
"Add to enquiry" + `/enquiry` page + contact handoff. `Cart.jsx` → `Enquiry.jsx`, `localStorage`-backed context.
**Why:** B2B/dealer catalogue with no pricing or checkout. The current empty "cart coming soon" page is a dead end that implies a store that does not exist.

### D2 — Brand marks: typographic tinted chips
`<BrandMark brand={b}/>` renders `brand.logo` if it exists, else the brand name in the display face on a per-brand tinted chip.
**Why:** no logo assets in the repo, and the six brand logos are trademarked. Chips scale to any new brand instantly with zero assets. The slot stays logo-shaped so real logos drop in later without layout change.

### D1 — Scope: full visual rebuild, keep the data layer
Delete `CylinderCarousel`, rewrite every visual component against a new light design system. Keep and extend `catalog.js` / `brands.js` / `taxonomy.js` / `products.js`.
**Why:** the brief explicitly rejects a CSS-only retheme. But the data layer on `multi-brand-catalog` is sound — it already mints `uid`, resolves brands, and canonicalizes subcategories.
