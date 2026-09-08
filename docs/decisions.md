# Decisions

Append-only. Newest first. Each entry: the choice, the reason, and what it rules out.

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
