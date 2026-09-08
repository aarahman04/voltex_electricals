# Architecture

Vite 8 + React 19 + React Router 7 + Framer Motion 13 + Tailwind v4. No TypeScript, no test runner, `oxlint` only. 4 runtime deps.

## Routes (target — Phase 4+)

| Path | Page | Notes |
|---|---|---|
| `/` | `Home` | eager |
| `/products` | `AllProducts` | full catalogue, all filters |
| `/c/:category` | `CategoryHub` | **new** — "Choose your fan" subcategory chooser |
| `/c/:category/:subcategory` | `CategoryListing` | product grid + filters, URL-synced |
| `/product/:uid` | `ProductDetail` | |
| `/brands` | `Brands` | |
| `/brand/:slug` | `BrandPage` | |
| `/search` | `Search` | **new** |
| `/enquiry` | `Enquiry` | **new** — replaces `/cart` |
| `/about` | `About` | |
| `/contact` | `Contact` | |
| `*` | `NotFound` | **new** — none exists today |

Current branch routes (`multi-brand-catalog`): `/`, `/category/:categoryName`, `/product/:id`, `/brands`, `/brand/:brandSlug`, `/about`, `/contact`, `/cart`. All except Home are `React.lazy` under one `<Suspense>`.

## Layer map

```
index.html ─ Google Fonts, meta
  main.jsx ─ StrictMode > BrowserRouter > App
    App.jsx ─ EnquiryProvider > ShopNoticeProvider > MotionConfig
      Header ─ logo, nav (Products/Categories/Brands/About/Contact), search trigger, enquiry count
      main / Routes (keyed by pathname, scroll-to-top on change)
      Footer

  src/data/
    catalog.js   ─ import.meta.glob("/Products/normalized/*/*.json") → normalized array
    brands.js    ─ 14-brand registry, resolveBrand(), getBrandBySlug()
    taxonomy.js  ─ canonical tree, SUBCATEGORY_ALIASES, canonicalSubcategory(), PUBLISHED
    products.js  ─ query API over catalog.js (see below)

  src/lib/
    image.js       ─ cdnImage(url, width)
    kelvin.js      ─ TONES, kelvinToRgb/Css, nearestTone
    specSummary.js ─ normalizeOption, displayTitle, specSummary

  scripts/
    normalize.mjs  ─ the ETL (Node, build-time only)
```

## Query API — `src/data/products.js`

Existing (kept): `products`, `getCategories()`, `getProductsByCategory(cat)`, `getSubcategories(cat)` → `[{name,image,score,count}]`, `getProductImage(p)`, `getProductById(uidOrId)`, `getRelatedProducts(p, n=4)`, `getBrands()` → `[{slug,name,count,status}]`, `getBrandsForCategory(cat)`, `getProductsByBrand(slug)`, `getFacets(cat)` → `[{key,id,label,kind,values}]`, `hasOptionValue(p,key,value)`.

To add (Phase 2): `searchProducts(query)`, `getCategoryCounts()`, subcategory-scoped variants for `CategoryListing`.

To remove: `getShowcaseProducts()` (dies with the carousel), `getHeroFeature()` (already unused).

**Rule: every count on screen is computed from `products`, never a literal.**

## Component inventory

| Keep as-is | Rewrite (light + plate) | New | Delete |
|---|---|---|---|
| `swatchColors.js`, `Toggle`, `SwatchRow`, `VariantSelector`, `KelvinBar`, `Toast`, `ShopNotice` context | `Header`, `Footer`, `ProductCard`, `FilterPanel`, `BrandRail`, `Home`, `CategoryListing`, `ProductDetail`, `Brands`, `BrandPage` | `CategoryHub`, `MegaMenu`, `BrandMark`, `Search`, `Enquiry` + `EnquiryContext`, `NotFound`, plate primitives | `CylinderCarousel`, `Skeleton` (unused), `Cart` (→ `Enquiry`) |

## Build / deploy

Not yet configured. Phase 8 adds `vercel.json` (SPA rewrite, asset caching, security headers) + `public/robots.txt`. Listing pages must paginate or window past ~200 items — Crompton lighting alone is ~320.
