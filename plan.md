 Voltex Electricals — multi-brand catalogue, shop chrome, new homepage                                           │
│                                                                                                                 │
│ Context                                                                                                         │
│                                                                                                                 │
│ The site currently works, but it is built for exactly one supplier. src/data/products.js                        │
│ statically imports src/data/orient/{fans,lighting}.json, and nothing in the UI mentions a                       │
│ brand — vendor is carried in the data and never shown. Product_Catalog.md says the real                         │
│ business is 14 brands (Orient, Wipro, Philips, Crompton, Starlight, ACE Pro, Multifar, Elite,                   │
│ Atomberg, Almonard, Havells, Kuhl, plus Polycab and Gold Medal uncategorised), and only Orient                  │
│ has data so far. Someone choosing Fans must see which brands we carry, switch between them, and                 │
│ still be able to see every fan at once.                                                                         │
│                                                                                                                 │
│ Three other gaps: the homepage does not capture anyone (a static hero plate), the site does not                 │
│ read as a shop (no cart, no About, no header structure), and the filter sidebar shows a default                 │
│ white scrollbar against the dark panel. This is a design phase — cart is deliberately inert.                    │
│                                                                                                                 │
│ Outcome: a brand-aware catalogue that accepts new brands as a dropped-in JSON file, a homepage                  │
│ whose hero is a rotating cylinder of real products, e-commerce chrome that answers "Coming soon",               │
│ and a docs/ folder that tracks all of it. Deploys to Vercel on your domain.                                     │
│                                                                                                                 │
│ Decisions already taken (from your answers): normalize each brand's subcategories to the                        │
│ master list in Product_Catalog.md; brand rail + brand facet + dedicated brand pages; Kelvin                     │
│ control moves to its own band below the hero; cart chrome + toast with no real cart state.                      │
│                                                                                                                 │
│ ---                                                                                                             │
│                                                                                                                 │
│ Phase 1 — Data layer: brands and taxonomy                                                                       │
│                                                                                                                 │
│ Foundational, no visible change. Verified by product counts staying at 199.                                     │
│                                                                                                                 │
│ - src/data/catalog.js (new). Replaces the two static imports with                                               │
│   import.meta.glob('/Products/*/*.json', { eager: true, import: 'default' }), so                                │
│   Products/<brand>/<category>.json is discovered automatically — adding Crompton means adding                   │
│   a file, not editing code. Each product is normalized once at load into                                        │
│   { uid, id, title, brand, brandSlug, category, subcategory, rawSubcategory, tags, variants, images, sourceUrl }.                                                                                                            │
│   Brand comes from the product's own vendor field, falling back to the folder name; category                    │
│   from its category field. uid is `${brandSlug}--${id}` so two brands can ship the same                         │
│   model slug without colliding.                                                                                 │
│ - Delete src/data/orient/. Products/ becomes the single source of truth — today the same                        │
│   JSON exists in both places, which will drift.                                                                 │
│ - src/data/taxonomy.js (new). Canonical subcategories from Product_Catalog.md plus an                           │
│   alias map, applied per category:                                                                              │
│   - Pedestal & Stand Fans → Pedestal Fans, Personal & Table Fans → Table Fans;                                  │
│     Ceiling Fans, Exhaust Fans, Wall Fans already match.                                                        │
│   - Unmapped names pass through unchanged (Tower Fans, Decorative & Chandelier Fans,                            │
│     Kitchen Fans, Lamps & Lanterns, Street & Outdoor Lights, Wall Lights,                                       │
│     LED Bulbs & Lamps, Track Lights, Professional & Commercial Lighting,                                        │
│     Curtain & String Lights) and are listed in docs/taxonomy.md for you to assign.                              │
│   - Downlighters & Spotlights → COB LED is proposed — Orient's products there are literally                     │
│     "LED COB Downlighter" — but left inactive until you confirm, since it is a judgement call.                  │
│   - rawSubcategory is retained on every product so a mapping can be corrected without a                         │
│     re-import.                                                                                                  │
│ - src/data/brands.js (new). All 14 brands with slug, display name, and a status derived at                      │
│   runtime: brands with products are stocked, the rest render as "Coming soon". This is how the                  │
│   site shows breadth before the data lands.                                                                     │
│ - src/data/products.js (modify). Keeps its current exported API so pages need minimal edits                     │
│   — getCategories, getProductsByCategory, getSubcategories, getFacets, getRelatedProducts,                      │
│   getProductImage, getHeroFeature, getCategoryFeature all stay. getProductById takes a                          │
│   uid. Adds getBrands(), getBrandsForCategory(category), and a brand facet to                                   │
│   getFacets() alongside the existing tone/wattage/sweep facets.                                                 │
│   src/data/imageScores.json stays keyed by raw id and is looked up per product; brands                          │
│   without scores fall back to the primary image, which is already the default behaviour.                        │
│                                                                                                                 │
│ Phase 2 — Shop chrome and site shell                                                                            │
│                                                                                                                 │
│ - src/components/Header.jsx (rewrite of Navbar.jsx). Lockup set on one line —                                   │
│   VOLTEX ELECTRICALS as a single baseline unit with the weight shift carrying the emphasis,                     │
│   not two stacked sizes. Left: catalogue nav (Fans, Lighting, Brands). Right: About, Contact,                   │
│   a search affordance, and a cart button. Mobile keeps the slide-in drawer with everything in it.               │
│ - src/context/ShopNotice.jsx + src/components/Toast.jsx (new). One tiny context exposing                        │
│   notify(message); every cart/search action calls it. Toast is bottom-right, filament accent,                   │
│   auto-dismisses, role="status" so it is announced.                                                             │
│ - New pages: src/pages/About.jsx, Contact.jsx, Cart.jsx (honest empty state — "Your cart                        │
│   is coming soon", routed to browsing).                                                                         │
│ - src/components/Footer.jsx (new, extracted from Home.jsx) with catalogue, brand and                            │
│   company links.                                                                                                │
│                                                                                                                 │
│ Phase 3 — Catalogue: brands surfaced                                                                            │
│                                                                                                                 │
│ - src/components/BrandRail.jsx (new). Sits at the top of a category page: "All brands" plus                     │
│   one chip per brand with its model count; brands without data show a muted "Coming soon" chip.                 │
│   Selecting one sets ?brand=<slug> so the view is shareable, and syncs with the filter facet.                   │
│ - src/pages/CategoryListing.jsx: read ?brand=, render the rail, feed the brand facet                            │
│   through the existing selectedFacets mechanism (no new filtering engine — it reuses                            │
│   hasOptionValue-style matching already there).                                                                 │
│ - src/pages/Brands.jsx (/brands) — every brand as a card with counts and status.                                │
│   src/pages/BrandPage.jsx (/brand/:brandSlug) — that brand's categories and grid.                               │
│ - src/components/ProductCard.jsx: brand name added above the title, plus a quiet                                │
│   Add-to-cart icon button that fires the toast.                                                                 │
│ - src/pages/ProductDetail.jsx: brand shown and linked; primary Add to cart (toast) with                         │
│   Enquire kept as the secondary action.                                                                         │
│ - Scrollbar fix in src/index.css: a .thin-scroll utility                                                        │
│   (scrollbar-width: thin; scrollbar-color: var(--color-conduit) transparent plus the WebKit                     │
│   thumb/track rules) applied to the filter sidebar and the mobile filter sheet.                                 │
│                                                                                                                 │
│ Phase 4 — Homepage that captures                                                                                │
│                                                                                                                 │
│ - src/components/CylinderCarousel.jsx (new) — the hero. Product plates positioned on a 3D                       │
│   cylinder (rotateY(i·θ) translateZ(R) inside a perspective container with                                      │
│   transform-style: preserve-3d), driven by a Framer Motion value.                                               │
│   - Drag or swipe spins it; pointer position adds a slight parallax tilt; it drifts slowly when                 │
│     idle and pauses on hover or focus. Clicking a plate opens that product.                                     │
│   - Populated from real products chosen for photo quality using the existing                                    │
│     imageScores.json, one per subcategory so the wheel shows range, across whatever brands exist.               │
│   - Fallbacks: under prefers-reduced-motion (already honoured globally via MotionConfig)                        │
│     and on small screens it renders as a snap-scrolling rail instead of a 3D wheel. Arrow keys                  │
│     rotate; every plate is a real link, so it works without JavaScript-driven motion.                           │
│ - src/pages/Home.jsx (rewrite): cylinder hero with the existing headline → category tiles                       │
│   (now with brand counts) → brand strip showing who we carry → lighting band carrying the                       │
│   Kelvin instrument, relighting that section and linking into tone-filtered Lighting → subcategory              │
│   rails → footer.                                                                                               │
│                                                                                                                 │
│ Phase 5 — Polish and verification pass                                                                          │
│                                                                                                                 │
│ Responsive checks at 390 / 768 / 1440, keyboard focus order, contrast on the new chrome, and the                │
│ cylinder's reduced-motion and touch paths.                                                                      │
│                                                                                                                 │
│ Phase 6 — Vercel deployment, set up end to end                                                                  │
│                                                                                                                 │
│ The repo has no commits yet and the Vercel CLI is not installed, so this phase covers everything                │
│ between here and a live domain.                                                                                 │
│                                                                                                                 │
│ - vercel.json:                                                                                                  │
│   - SPA rewrite (/(.*) → /index.html) so a refresh on /product/orient--ifloat-neu works.                        │
│     Vercel serves real files first, so hashed assets are unaffected.                                            │
│   - Immutable caching on /assets/* (max-age=31536000, immutable) — safe because Vite                            │
│     fingerprints those filenames — while index.html stays revalidated so deploys take effect.                   │
│   - Baseline security headers (X-Content-Type-Options, Referrer-Policy, frame options).                         │
│   - Chosen over vercel.ts to keep the deploy dependency-free; revisit if config needs logic.                    │
│ - Build contract: framework preset Vite, build npm run build, output dist, install                              │
│   npm install. engines.node pinned in package.json so local and Vercel agree.                                   │
│   Products/ must stay in the repo — it is imported at build time by the glob loader, not                        │
│   fetched at runtime.                                                                                           │
│ - Route code-splitting (React.lazy + Suspense per route in App.jsx): the bundle is                              │
│   already 748 KB / 183 KB gzip and the cylinder hero adds to it. Splitting keeps the homepage                   │
│   payload small on a real connection, with the existing skeletons as the fallback.                              │
│ - Repo and first deploy (I will run the local parts and hand you the rest):                                     │
│   git init is done but there are no commits — stage the app, commit, and create the GitHub repo                 │
│   with gh if you want Git-based deploys, or deploy straight from the CLI. npm i -g vercel,                      │
│   then vercel link and vercel --prod. Anything needing your login (vercel login) I will                         │
│   hand back to you as a ! command to run in-session.                                                            │
│ - Domain: add it in the Vercel project, then point DNS — apex A → 76.76.21.21, www CNAME → cname.vercel-dns.com (exact values confirmed against the dashboard at setup time), with the                                        │
│   redirect direction (apex vs www) set to whichever you prefer.                                                 │
│ - Link previews and crawlers: public/robots.txt, plus og:/twitter: meta and a canonical                         │
│   URL in index.html — the absolute OG image URL gets filled in once the domain is attached.                     │
│ - docs/: README.md (index), architecture.md, data-model.md (how to add a brand —                                │
│   the file to hand anyone doing extraction), taxonomy.md (canonical map + unmapped names                        │
│   awaiting your call), design-system.md (tokens, type, motion), roadmap.md (phase checklist =                   │
│   progress tracking), decisions.md (including the image-scoring finding and the reverted                        │
│   card-frame experiment), deployment.md (the deploy runbook: first deploy, preview vs                           │
│   production, promoting, rolling back, adding the domain).                                                      │
│                                                                                                                 │
│ ---                                                                                                             │
│                                                                                                                 │
│ Verification                                                                                                    │
│                                                                                                                 │
│ - npm run build and npx oxlint clean after each phase.                                                          │
│ - Data integrity after Phase 1: product total still 199 (100 fans + 99 lighting), every                         │
│   product resolves a brand, canonical subcategories present, no duplicate uid.                                  │
│ - Routes: /, /category/Fans, /category/Fans?brand=orient, /brands, /brand/orient,                               │
│   /product/<uid>, /about, /contact, /cart all render; refreshing a deep route works                             │
│   against the production build (npm run preview).                                                               │
│ - Visual: headless Chrome screenshots (the method already used this session —                                   │
│   chrome --headless=new --screenshot, with --force-prefers-reduced-motion for stable frames)                    │
│   at 1440 and in a true 390px iframe, checking documentElement.scrollWidth for horizontal                       │
│   overflow.                                                                                                     │
│ - Interaction: cylinder drags and auto-drifts, falls back to a rail under reduced motion;                       │
│   Add to cart raises the toast on card and detail; brand rail filters and updates the URL; filter               │
│   sidebar scrollbar is dark.                                                                                    │
│ - Adding a brand is proven by dropping a small test JSON into Products/ and confirming it                       │
│   appears in the rail, the facet and /brands with no code change.                                               │
│ - Deploy readiness: npm run build && npm run preview serves the production bundle, deep                         │
│   routes survive a refresh, and no request 404s. After the first deploy, the same route checks run              │
│   against the Vercel preview URL before anything is promoted to production.