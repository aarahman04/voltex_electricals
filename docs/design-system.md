# Voltex design system — Electrical studio

Rebuilt September 2026 around warm white, graphite, copper-orange, and physical electrical materials.

## Foundation

- Display: Archivo, variable width 100, weight 600–750. Large headings use tight spacing.
- Body: Instrument Sans.
- Labels and specifications: IBM Plex Mono.
- Ink: #202526; secondary text: #646b6c; paper: #f7f7f2; surfaces: #ffffff.
- Accessible text accent: #cf561d. Primary promotional actions use #e87536 with dark text.
- Borders: #dedfd8; interactive borders: #bfc3bb.
- Shared page width: 1320px, with 20px phone gutters and fluid tablet/desktop gutters.
- Rounded surfaces distinguish category displays, product images, controls, and the hero.

## Homepage

The hero pairs the oversized “Life, switched on.” headline with a framed, shoppable residential interior. On phones, the headline sits above the complete 3:2 room image. The fan, wall light and table lamp link to the exact catalogue models used as generation references. A physical light switch changes the scene brightness, lamp glow and animated current. The room is illustrative; product pages provide actual specifications and finishes.

“Good things, well chosen.” uses a second shoppable 3:2 room with an Atomberg fan, Philips table lamp and two Orient COB downlighters. Both COB fixtures link to the same catalogue model. The image keeps its proportions beside the copy on desktop and stacks above the copy on phones. Text links provide another way to open each product. Both scenes share transparent, lightly outlined markers, hover/focus labels and minimum 44px interaction areas.

Sections: interior hero and catalogue search; category collection; interactive light lab; editorial featured products; shopping by need; industrial products; enquiry steps; contact CTA. There is no brand logo strip on the homepage.

The shared logo, header, footer, product cards, catalogue filters, category/brand headers, product gallery, About page and Contact page use the same type and surface treatment.

## Motion and accessibility

- The hero has warm lamp glow and a fine animated current trace. The photograph stays still so clickable objects remain aligned on every screen size.
- The header's motion control pauses ambient CSS animations site-wide and reduces Framer Motion transitions. The hero's separate light switch controls room brightness.
- The user's reduced-motion preference disables ambient motion; Framer Motion also respects it.
- Homepage sections reveal once as they enter view; links, cards and images use restrained hover transitions.
- The light lab is a CSS pendant whose light colour and pool follow the native Kelvin slider.
- Kelvin colour calculations and tone filtering remain in src/lib/kelvin.js.
- Controls retain keyboard focus outlines and semantic labels; the product enquiry buttons remain visible on touch screens.

## Earlier electrical still-life assets

Generated with the built-in image_gen tool, then encoded as WebP with the installed Sharp dependency:

- public/images/electrical-studio-640.webp — phone source, approximately 32 KB.
- public/images/electrical-studio-1280.webp — larger source, approximately 92 KB.

The image uses srcSet, sizes and explicit dimensions. Original generation is retained in the Codex generated_images directory.

### Final generation prompt

Use case: stylized-concept.
Asset type: premium electrical catalogue website hero image, square composition, 1536x1536.
Primary request: Create a striking, meticulously art-directed photorealistic 3D still life about electricity and lighting, for Voltex Electricals.
Subject: One oversized glowing frosted LED bulb with brushed nickel screw base upright in the central foreground, beside a beautifully detailed ivory rectangular modular rocker wall switch plate and a small unbranded ivory electrical circuit breaker with a copper-orange toggle. A single thick burnt-orange insulated electrical cable sweeps through the composition in one elegant large loop, resting across stepped graphite plinths. Keep these objects separate and physically plausible. No exposed live conductors.
Scene/backdrop: seamless dark graphite studio, low geometric plinths in charcoal with softly rounded precision-machined edges.
Composition/framing: square hero image, all three primary objects grouped centrally within the middle 75 percent of the frame, wide breathing space around the group for responsive cropping, bulb largest at center-right, switch left, breaker at lower right. Camera three-quarter view, strong dimensionality, calm balanced asymmetric composition. The image will be displayed next to HTML headline and on phones; no copy area needed, no text in image.
Lighting/mood: warm glowing bulb, soft amber pool of illumination on surfaces, subtle warm reflected glow, controlled studio rim light, rich natural shadows, understated premium industrial design advertisement.
Color palette: charcoal #171c20, ivory #f5f4ef, warm copper-orange #f27d36, brushed silver. Crisp material realism, beautiful tactile surfaces.
Constraints: no words, no lettering, no numbers, no logos, no watermark, no people, no fake UI, no gradients as abstract decorations, no extra lamps, no floating objects. High-end coherent product photography.

## Validation

Use `npx vite build` to compile UI changes without running the catalogue normalization prebuild step. Use `npm run lint` for source checks. Preview through `npm run dev -- --host 127.0.0.1`.


## October redesign: generated brand assets

The website uses the confirmed name **Voltex Electricals**. Assets were generated with the built-in image generation tool, then trimmed/resized and encoded with Sharp for delivery.

- Earlier logo: `public/images/voltex-logo.webp` (760 × 164, transparent), retained as a source. The current header, mobile navigation and footer use `public/images/voltex-wordmark.webp` (760 × 131): VOLTEX without an additional emblem. The shared Lockup component places a small, spaced ELECTRICALS subtitle below the image. The footer uses a CSS white treatment.
- Interior: `public/images/voltex-living-1440.webp` and `public/images/voltex-living-720.webp`. Illustrative residential interior used on the About page and as the source for the shoppable collection room; it does not depict an actual Voltex location.
- The electrical still life is used in the Contact page's connection artwork.

### Final logo prompt

Use case: logo-brand. Asset: professional website header logo for an electrical appliances dealer.
Create one exceptional, clean horizontal logo on a truly transparent background, tightly composed with modest clear space. Exact text: "VOLTEX" (V O L T E X) in refined custom geometric uppercase sans serif, deep charcoal #202526, with smaller widely tracked "ELECTRICALS" beneath. A compact memorable copper-orange #CF561D emblem to the left, constructed from two precise folded conductor strokes forming a V, subtly suggesting an electrical current or a circuit connection. Confident architectural brand identity, understated Swiss industrial precision, highly readable at 170px total width. Flat solid shapes, crisp edges, no gradients, no glow, no shadows, no mockup, no bevel, no frame, no additional text. Wordmark and emblem should have beautifully balanced proportions. Horizontal 3.8:1 composition.

### Final interior prompt

Use case: photorealistic-natural. Asset: an editorial interior photograph for Voltex Electricals' About page. A refined, realistic contemporary Indian home interior at dusk, tactile warm ivory limewashed walls, warm oak, charcoal details, one beautifully simple modern three-blade ceiling fan clearly visible on the ceiling, a glowing floor lamp beside a rust upholstered lounge chair, gentle warm recessed ceiling lights, subtle daylight through sheer curtains, a low table, very spare and welcoming. Architectural Digest editorial photography, carefully composed generous negative space, believable physical products, no people, no text, no logos. Wide landscape 3:2 composition. Palette warm stone, graphite and tiny terracotta accents. Understated luxurious atmosphere, natural grain, no excessive decor, no orange colour cast, no glowing circuit effects. This is an illustrative home, not a showroom.

### Current presentation

The brand strip is removed. Product cards use contained image stages, category labels, persistent 44px enquiry controls and visible detail links. A saved product also shows a text confirmation. Brands pair their existing logos with actual catalogue products and can be filtered by product category. Discovery combines an editorial room image with products; the industrial section has a large lead product with animated airflow and a complementary list. About, Contact, catalogue headers, product detail and enquiry pages share the ivory/charcoal/copper visual language. Mobile filters are portalled above the page, lock background scrolling, contain keyboard focus and close with Escape. The selected project type is included in the WhatsApp enquiry draft. Motion uses the installed Framer Motion package and CSS; reduced-motion preferences are respected.

### October 2 visual refinement

`src/design-refresh.css` contains the current presentation, loaded after the existing catalogue styles. Palette: warm paper #f8f7f3, stone #efede7, graphite #242727, copper #bb5425, warm action #ec884a. Archivo remains the display face, Instrument Sans the body face, and IBM Plex Mono the utility face. Keep generated artwork and the logo as image assets; use SVG/CSS only for circuit and airflow motion. Site structure and manufacturer data stay in the existing React catalogue.

### Shoppable room assets and implementation

`src/shoppable-hero.css` is loaded after the redesign styles. The shared clickable regions are in `src/components/RoomHotspots.jsx`; their percentages are tied to uncropped 3:2 artwork.

- Hero: `public/images/shoppable-room-1440.webp` and `public/images/shoppable-room-720.webp`.
- Collection: `public/images/collection-room-1440.webp` and `public/images/collection-room-720.webp`.
- Current wordmark: `public/images/voltex-wordmark.webp`.

All were made with the built-in image generation tool and encoded with installed Sharp. Original PNGs remain in `C:/Users/aarah/.codex/generated_images/01a0ed46-2f63-7883-8627-cfbd0bb1dcb7/`. The collection image is `exec-28ac61a0-6b0c-4796-a78a-95108422aac7.png`, hero is `exec-04d0194c-06fb-407b-8e69-f026e7dcc40b.png`, and wordmark is `exec-76693ace-d34c-42e2-901b-0cacec27dda1.png`.

Catalogue references: `atomberg--atomberg-renesa-prime-crest-ceiling-fan`, `philips--philips-ornate-table-lamps`, `orient--raya-curve-wall-light` (hero), and `orient--prism-surface-cob-led-downlighter-warm-white` (collection). Each marker opens `/product/<uid>`.

### Collection room: final generation prompt

Use case: precise-object-edit.
Asset type: 3:2 landscape shoppable editorial interior photograph for Voltex.
Input images: Image 1 is the existing living room; keep its camera, architecture, furniture arrangement, sunset window, warm materials and overall realistic photographic mood. Image 2 is the exact Atomberg Renesa Prime Crest black ceiling fan reference. Image 3 is the exact Philips Ornate wooden table lamp reference. Image 4 is the Orient Prism Surface COB downlighter reference (the black cylindrical fixture with gold interior, not its packaging).
Primary request: Carefully update the electrical products in the original room to match our real catalogue, preserving the room itself.
Replace the ceiling fan with the black three-blade fan from image 2 in the same upper-centre position, completely visible.
Replace the existing floor lamp on the right with a matching Philips Ornate TABLE lamp from image 3 on a simple small oak side cabinet behind the rust armchair. Keep the lamp's flared natural wood base/stem and cream fabric shade clearly visible, realistically sized, its centre around 84 percent horizontal and 49 percent vertical.
Replace the two prominent recessed ceiling lights with exactly TWO small surface-mounted COB downlighters from image 4: black cylinders with gold reflector interiors, one in the upper left ceiling at about 16 percent x and 12 percent y, one upper right around 82 percent x and 13 percent y, realistically mounted and glowing warm white. Remove the tiny background ceiling lights and the hanging pendant in the rear hallway, leaving soft ambient light there. Do not add other electrical fixtures.
Keep the complete room view, 3:2 landscape, with generous separation between these electrical products so each can be clicked independently on a small phone screen. The main fan, right table lamp and both COB lights must be easily identifiable. Premium natural architectural photography, believable materials and gentle light, no extreme orange filter.
No product boxes, packaging, text, labels, markers, arrows, logos, watermarks, or people.

## October 3: wordmark, brass and the chandelier surfaces

- **Wordmark:** `src/components/VoltexWordmark.jsx`, outlined paths (no font). The V's apex is left open like a switch contact, with a copper contact line (`--color-copper` #bb5425) in the gap. It takes `currentColor`, so it works on light and dark backgrounds; checked at 18-24px. `Lockup` uses it in the header, mobile menu and footer. `public/favicon.svg` is the V alone on graphite; `public/brands/voltex-exclusive.svg` adds EXCLUSIVE in brass. The old `voltex-wordmark.webp` is no longer referenced.
- **Brass:** `--color-brass` #a8823f (rules, dots, tints), `--color-brass-ink` #8a6a2f (text), `--color-brass-tint` #f3ede1 (plates), `--brass-light` #d2b072 (on graphite). Only on Voltex Exclusive and chandelier surfaces.
- **Scales:** `src/voltex-system.css` defines spacing 4/8/12/16/24/32/48/72 (`--space-1` to `--space-8`) and type 14/16/18/22/28/40/56 (`--text-sm` to `--text-4xl`); new components use them. Existing rules keep their values.
- **Homepage chandelier section:** graphite band, heading left and copy right; a room scene plus six photographs hung from a brass rail on fine drop lines that draw down once in view (static under reduced motion or the motion toggle). Picks are fixed in `CHANDELIER_PICKS` (`src/data/products.js`), all from the clean photographs.
- **Photo cards:** `.catalog-card[data-photo]` uses `object-fit: scale-down` (never enlarged) and no multiply blend; titles get three lines so the VX code shows.
- **Category tints** key off `data-category` instead of `nth-child`, so adding a category doesn't shift colours.
