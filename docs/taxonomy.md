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
| Industrial Fans | — | **coming soon** |
| Metal Fans | — | **coming soon** |
| _auto-adopted:_ Tower Fans, Kitchen Fans, Decorative & Chandelier Fans, Air Circulator, Farrata Fan | scraped, unmapped | yes |

### Lighting
| Canonical subcategory | Source | Data? |
|---|---|---|
| Panel Lights | orient, `Panel Light`/`LED Panels` (crompton, philips, havells, polycab) | yes |
| Backlight | — | **coming soon** |
| COB LED | `LED COB` (havells, polycab); `Downlighters & Spotlights` mapping proposed, inactive | partial |
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
2. **Coming soon** — a canonical entry with zero products renders as a dimmed module with an unlit LED and no count. Not a link.
3. **`rawSubcategory` is always retained** on the product — a bad mapping is fixed here and takes effect on next `npm run data:build`, no re-scrape.

## Brand roster

`src/data/brands.js` — 14 brands, matching `Product_Catalog.md` exactly:

| With data (6) | Coming soon (8) |
|---|---|
| Orient, Atomberg, Crompton, Philips, Havells, Polycab | Wipro, Starlight, ACE Pro, Almonard, Multifar, Elite, Kuhl, Gold Medal |

`resolveBrand(vendor, folder)` resolution order: exact name match → vendor starts-with a brand name → explicit vendor-alias map (`"Consumer Products"` → Crompton, Philips casings → Philips) → folder slug → synthesized.
