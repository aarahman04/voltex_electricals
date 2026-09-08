# Taxonomy

Source of truth: `Product_Catalog.md` (transcribed from the client's handwritten stock list) for the **canonical spine**, reconciled with scraped subcategory strings via an alias map + auto-adopt.

Lives in `src/data/taxonomy.js`.

## Published categories

```
PUBLISHED = ["Fans", "Lighting"]
```

Everything else the ETL produces (Appliances, Pumps, Water Heating, Kitchen — all Crompton) is normalized into `_parked.json` and not shown. Adding one later = adding it to this array.

## Canonical tree

### Fans
| Canonical subcategory | Source | Data? |
|---|---|---|
| Ceiling Fans | orient, atomberg, crompton, havells, polycab | yes |
| Exhaust Fans | orient, crompton, atomberg, havells, polycab | yes |
| Pedestal Fans | `Pedestal & Stand Fans` (orient), atomberg, havells, polycab | yes |
| Table Fans | `Personal & Table Fans` (orient), atomberg, havells, polycab | yes |
| Wall Fans | orient, crompton, atomberg, havells, polycab | yes |
| Industrial Fans | **derived** — `Duty: Industrial` | yes (5) |
| Metal Fans | **derived** — `Build: Metal` | yes (9) |
| _auto-adopted:_ Tower Fans, Kitchen Fans, Decorative & Chandelier Fans, Air Circulator, Farrata Fan | scraped, unmapped | yes |

**Metal Fans and Industrial Fans are attributes, not subcategories.** No brand files a "Metal Fans" product type; the fans that are metal are already correctly Wall, Exhaust, Ceiling or Pedestal fans, and a product can't be asked to pick one. So `scripts/normalize.mjs` derives two variant options on every Fans product — `Build: "Metal"` from the title (`/\bmetal(lic|lique|lion)?\b/i`, scoped to Fans so Crompton's Cromdeco metal pendants and Havells' Metallique torch can't leak in) and `Duty: "Industrial"` from title plus tags — and `DERIVED` in `taxonomy.js` turns them into ordinary live tiles.

`/c/Fans/Metal Fans` is the same route and the same `<Listing>`; `CategoryListing` just selects on the attribute instead of on `subcategory`. The Polycab *Aerobliss Metal Wall Fan* is listed under **both** Wall Fans and Metal Fans, and counted once in each. The facet the tile is defined by is dropped from that page's filters — you're already standing in it.

### Lighting
| Canonical subcategory | Source | Data? |
|---|---|---|
| Panel Lights | orient, `Panel Light`/`LED Panels` (crompton, philips, havells, polycab) | yes |
| Backlight | orient — promoted by title from Panel Lights | yes (4) |
| COB LED | `LED COB` (havells, polycab); crompton + philips promoted out of Ceiling Lights | yes (42) |
| Elevation LED | — | **coming soon** |
| _auto-adopted:_ Downlighters & Spotlights, LED Bulbs & Lamps, Lamps & Lanterns, Street & Outdoor Lights, Wall Lights, Track Lights, Curtain & String Lights, Professional & Commercial Lighting, Battens, Strip/Rope Lights | scraped, unmapped | yes |

## Alias map (`SUBCATEGORY_ALIASES`)

Raw string → canonical. Case-folded before lookup. Grows as the ETL `report.md` surfaces new raw strings.

```
"Pedestal & Stand Fans"  → "Pedestal Fans"
"Personal & Table Fans"  → "Table Fans"
"Personal Fan"           → "Table Fans"
"Personal Fans"          → "Table Fans"
"Ceiling Fan"            → "Ceiling Fans"
"Wall Fan"               → "Wall Fans"
"Exhaust Fan"            → "Exhaust Fans"
"Table Fan"              → "Table Fans"
"Pedestal Fan"           → "Pedestal Fans"
"Ceiling Mounting Fans"  → "Ceiling Fans"
"Panel Light"            → "Panel Lights"
"LED Panels"             → "Panel Lights"
"LED Batten" / "Battens" / "LED Battens" → "Battens"
"LED COB" / "COB LED"    → "COB LED"
"LED Bulb" / "Bulbs"     → "LED Bulbs & Lamps"
"Downlight" / "LED Downlighter" → "Downlighters & Spotlights"
"LED Spotlight"          → "Downlighters & Spotlights"
"Rope and Strip Lights" / "Ropes and Strips" / "strip light" → "Strip & Rope Lights"
"Outdoor Lights" / "Outdoor" → "Street & Outdoor Lights"
```

(This list is authored in Phase 2 against the actual `report.md` output — the entries above are the known set from exploration.)

## Rules

1. **Auto-adopt** — a raw subcategory with no alias becomes its own canonical entry. No product is ever unreachable.
2. **Coming soon** — a canonical entry with zero products renders as a dimmed module with an unlit LED and no count. Not a link. **Elevation LED is the only one left**: zero matches anywhere in `Products/` (only the marketing verb "elevate"). Backlight, Metal Fans and Industrial Fans all had data under other labels and are now live.
3. **`rawSubcategory` is always retained** on the product — a bad mapping is fixed here and takes effect on next `npm run data:build`, no re-scrape.
4. **A promotion moves rows, it never makes or loses them.** `reclassify()` in `scripts/normalize.mjs` relabels only, and runs before dedupe. Totals stay **1,438 published / 412 parked** — check `report.md` after any change here.
5. **Derived tiles are attributes** (rule above). A product belongs to exactly one subcategory and to any number of derived tiles.

### Promotions the ETL performs

| Promotion | Rule | Effect |
|---|---|---|
| Backlight | `category === "Lighting"` and title matches `/backlit\|backlite/i` | Panel Lights 21 → 17; Backlight 0 → 4 |
| COB LED | schema B, currently `Ceiling Lights`, and handle matches `/led-cob\|-cob$/` or tags carry `Categories_COB Light` / `cob-lights` | COB LED 16 → 42 (philips 17, crompton 9 joined havells 4 + polycab 12) |

Two deliberate exclusions:

- **Not `/backlight/i`.** That would capture Philips' *"Wi-Fi HDMI Sync Box + TV Backlight Strip"*, which is a TV bias light and correctly Smart Lighting. Verified: it is the only row the wider pattern would have wrongly moved.
- **COB is scoped to Ceiling Lights.** Two Philips COB models typed `smart light`, and one with a blank product type (parked), are left alone — Smart Lighting is a deliberate category, and touching the parked row would move the totals.

## Brand roster

`src/data/brands.js` — 14 brands, matching `Product_Catalog.md` exactly:

| With data (6) | Coming soon (8) |
|---|---|
| Orient, Atomberg, Crompton, Philips, Havells, Polycab | Wipro, Starlight, ACE Pro, Almonard, Multifar, Elite, Kuhl, Gold Medal |

`resolveBrand(vendor, folder)` resolution order: exact name match → vendor starts-with a brand name → explicit vendor-alias map (`"Consumer Products"` → Crompton, Philips casings → Philips) → folder slug → synthesized.
