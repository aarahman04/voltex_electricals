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

Colour temperature is **not** a token. It lives entirely in `src/lib/kelvin.js` — `TONES` (`#ffb45e` 2700K → `#ffe3bd` 4000K → `#d4e8ff` 6500K), `kelvinToCss()` for any point between them, and `productTone(product)` for the tone a lighting model is sold in. It is continuous, so a set of CSS steps could only disagree with the JS, and did; the `--tone-*` tokens are gone. Reserved for lighting contexts only. Amber is never a background wash.

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

### The indicator states, and where each is real

The LED only ever marks something true. Both hooks are now driven from JSX:

| State | Meaning | Set by |
|---|---|---|
| `.led[data-on]` | this circuit exists | mega-menu category heads |
| `.led[data-live]` | **in catalogue** — green | stocked brands on `/brands` and in `BrandRail`; unlit for coming-soon, which replaced the old dashed border + "Soon" tag |
| `.module[data-active]` | the category you are currently inside | `MegaMenu`, from the pathname (`Header` sits outside `<Routes>`, so `useParams()` is empty there). Amber-tint fill + amber leading edge |

`data-active` is set in exactly one place because that is the only place the state exists. `CategoryListing`'s sibling-type row already excludes the current type, so there is nothing there to mark — adding an indicator would be decoration, which the brief rules out.

### Light as state

Two places render actual light. Both are bound to a value the user is setting or buying, never ambient:

- **The hero lamp** (`.lamp` / `.lamp-glow` / `.lamp-photo`, `HeroLamp` in `Home.jsx`). At rest the bloom sits at 0.12; hover or keyboard focus takes it to 0.34 and scales it 1.22 over 450ms — a lamp warming, not a button flicking. Colour is `kelvinToCss(2700)`, real warm white, not the amber accent. The photo picks up a matching drop-shadow so the fixture reads as emitting. It is a `<Link>` to its own product, which also gives the glow a keyboard trigger.
- **The Kelvin bulb** (`.bulb`, inside `KelvinBar`). A lit disc whose fill and halo track the slider continuously via `kelvinToCss(kelvin)`. The one bulb on the site; it earns its place by showing a number nobody can picture. No filament, no screw base, no clip-art.
- **Lighting product cards** warm in their own tone on hover (`productTone()`). Fans, and lighting sold in several tones, keep the plain lift — there is no single temperature to show.

Selected tone swatches bloom in their own Kelvin colour in **both** `FilterPanel` and `VariantSelector`. Finish swatches keep the amber ring: a finish has no colour temperature.

### The lockup

`Lockup` (`src/components/Lockup.jsx`) is the single source for the header, the mobile drawer and the footer — it was re-implemented three times. Hovering or focusing the mark warms "ELECTRICALS" to amber with a soft text-glow over 180ms; "Voltex" stays ink. Behaviour is one rule, `.lockup-sub`.

### Overlays

`MobileNav` and `SearchOverlay` render through `Portal` into `<body>`. They must: `<header>` carries `backdrop-blur-md`, and a `backdrop-filter` makes an element the containing block for every `position: fixed` descendant — so both overlays were clamped to the 64px header box and the drawer opened as an empty, see-through sliver. Each is now a single keyed `motion` child of its `AnimatePresence` (a bare Fragment gave framer-motion nothing to track, so exits never ran) at `z-[85]`, above `Toast`'s `z-[80]`.

Sort is a segmented switch, not a `<select>` — it was the last native OS widget in the app, and with three options it reads better in the same chip language the filters use.

## Motion

One orchestrated moment: on first paint the plate's LEDs light left-to-right — `@keyframes power-up`, 60ms stagger, ~600ms total — then hold. Everything else is quiet: card lift, image scale on hover, arrow slide-in, menu fade. No carousels, no 3D, no ambient movement.

`prefers-reduced-motion: reduce` (already in `index.css`) skips the power-up and all transforms. `<MotionConfig reducedMotion="user">` stays in `App.jsx`.

## What's removed from the old system

- The entire dark palette (`--color-ground #262c2e` … `--color-filament #f2a63b`).
- `CylinderCarousel` — the spinning 3D drum. Brief kills it explicitly.
- `--font-sans: "Hanken Grotesk"`, `--font-mono: "DM Mono"` → replaced.
- `.thin-scroll` / `.no-scrollbar` — kept, still used on rails and filter panels.
