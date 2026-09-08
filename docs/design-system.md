# Design system — "Modular Plate"

The identity comes from the **Indian modular switch plate**: a strict grid of modules (1M / 2M / 4M / 6M) separated by hairline seams, each carrying a tiny indicator LED. That grid does structural work — category cards, the mega-menu, and filter groups all snap to it. Boldness is spent only on the plate and its LEDs; everything else stays quiet.

Implemented in `src/index.css` (Tailwind v4, `@theme` block — there is no `tailwind.config.js`).

## Tokens

```
--ink        #131A24   body + heading text
--ink-muted  #5A6472   metadata, counts, captions
--paper      #F6F5F2   page ground (warm neutral, not cream)
--surface    #FFFFFF   cards, plate modules, image beds
--seam       #E4E2DC   1px seams and borders — the plate's defining line
--amber      #EE7A1B   accent: active state, primary button, LED glow
--amber-tint #FDF2E4   selected-filter fill, soft highlight
--live       #12B76A   "in catalogue" indicator dot only
```

Kelvin gradient — `#FFD9A0` (2700K) → `#FFFFFF` (4000K) → `#CFE6FF` (6500K) — reserved for lighting contexts only, via the existing `src/lib/kelvin.js` math. Amber is never a background wash.

## Type

| Role | Face | Use |
|---|---|---|
| Display | **Archivo** (`wdth` 110–125, `wght` 700–800) | hero + section headings, logo. Uppercase only for hero and small labels. |
| Body | **Instrument Sans** | prose, nav, product names |
| Data | **IBM Plex Mono** | model numbers, sweep (mm), wattage, Kelvin, product counts |

Display↔body contrast is carried by **width + weight**, not by adding a serif. Loaded via Google Fonts `<link>` in `index.html`.

Retained utilities: `.nameplate` (retuned for light — was `wdth 125 / 800` on dark), `.spec` (mono metadata, 11px, tracked, uppercase).

## Plate primitives

```css
.plate  { display:grid; gap:1px; background:var(--seam);
          border:1px solid var(--seam); border-radius:14px; overflow:hidden; }
.plate > .module { background:var(--surface); }         /* --span: 1M/2M/4M/6M */
.led    { width:8px; height:8px; border-radius:50%; background:var(--seam);
          transition:background .2s, box-shadow .2s; }
.module:hover .led, .module[data-active] .led,
.led[data-on] { background:var(--amber);
                box-shadow:0 0 8px 1px color-mix(in srgb, var(--amber) 55%, transparent); }
```

Buttons are switch-inspired, not skeuomorphic: primary is an ink fill that lights a small amber indicator at its leading edge on hover and lifts 1px. `.switch-btn`.

## Motion

One orchestrated moment: on first paint the plate's LEDs light left-to-right — `@keyframes power-up`, 60ms stagger, ~600ms total — then hold. Everything else is quiet: card lift, image scale on hover, arrow slide-in, menu fade. No carousels, no 3D, no ambient movement.

`prefers-reduced-motion: reduce` (already in `index.css`) skips the power-up and all transforms. `<MotionConfig reducedMotion="user">` stays in `App.jsx`.

## What's removed from the old system

- The entire dark palette (`--color-ground #262c2e` … `--color-filament #f2a63b`).
- `CylinderCarousel` — the spinning 3D drum. Brief kills it explicitly.
- `--font-sans: "Hanken Grotesk"`, `--font-mono: "DM Mono"` → replaced.
- `.thin-scroll` / `.no-scrollbar` — kept, still used on rails and filter panels.
