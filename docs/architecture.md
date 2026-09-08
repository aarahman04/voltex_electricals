# Architecture

Vite 8 + React 19 + React Router 7 + Framer Motion 13 + Tailwind v4. No TypeScript, no test runner, `oxlint` only. 4 runtime deps.

## Routes (live — Phase 4–7 done)

| Path | Page | Notes |
|---|---|---|
| `/` | `Home` | eager |
| `/products` | `AllProducts` | full catalogue, category + brand + spec filters (`<Listing>`) |
| `/c/:category` | `CategoryHub` | "Choose your fan" subcategory plate; coming-soon tiles dimmed |
| `/c/:category/:subcategory` | `CategoryListing` | `<Listing>` grid, `BrandRail`, URL-synced filters |
| `/product/:uid` | `ProductDetail` | gallery, `BrandMark`, specs (variant options + `specs[]`), related + more-from-brand |
| `/brands` | `Brands` | brand cards + coming-soon |
| `/brand/:brandSlug` | `BrandPage` | grouped by category |
| `/search` | `Search` | `searchProducts` results piped through `<Listing>` |
| `/enquiry` | `Enquiry` | localStorage list, replaces `/cart` |
| `/about` · `/contact` | | Contact shows the enquiry list + pre-fills the message |
| `*` | `NotFound` | |

All except `Home` are `React.lazy` under one `<Suspense>`. `<Routes>` is no longer keyed by pathname — scroll-to-top is a `useEffect` on `location.pathname` in `App`.

## Layer map

```
index.html ─ Google Fonts, meta
  main.jsx ─ StrictMode > BrowserRouter > App
    App.jsx ─ ShopNoticeProvider > EnquiryProvider > MotionConfig
      Header ─ logo, nav (Products mega-menu / Brands / About / Contact), search overlay (/ or ⌘K), enquiry count
      SearchOverlay ─ live results from searchProducts, Enter → /search
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

`products`, `getCategories()`, `getProductsByCategory(cat)`, `getProductsBySubcategory(cat, sub)`, `getSubcategories(cat)` → `[{name,image,score,count}]`, `getProductImage(p)`, `getProductById(uidOrId)`, `getRelatedProducts(p,n=4)` (other brands first), `getMoreFromBrand(p,n=4)`, `getBrands()` → `[{slug,name,count,status,tint,logo}]`, `getBrandsForCategory(cat)`, `getProductsByBrand(slug)`, `getCategoryCounts()`, `searchProducts(query,limit)`, `getFacets(cat)` → `[{key,id,label,kind,values}]` (adds a `__category` facet when `cat` is null), `hasOptionValue(p,key,value)` (handles `__brand` / `__category`), `getFeaturedProducts(limit)`, `getHeroFeature()`, `getCategoryFeature(cat)`.

`taxonomy.js` also exports `PUBLISHED`, `isPublished(cat)`, `orderedSubcategories(cat, dataSubs)` (merges canonical order + coming-soon), `COMING_SOON`.

**Rule: every count on screen is computed from `products`, never a literal.**

## Component inventory (Phase 4–7 done)

| Kept | Rewritten (light + plate) | New |
|---|---|---|
| `swatchColors.js`, `SwatchRow`, `ShopNotice` context, `image.js`, `kelvin.js`, `specSummary.js` | `Header` (+ `MegaMenu`, `MobileNav`), `Footer`, `ProductCard`, `FilterPanel`, `BrandRail`, `Toggle`, `VariantSelector`, `KelvinBar`, `Toast`, `Home`, `CategoryListing`, `ProductDetail`, `Brands`, `BrandPage`, `About`, `Contact` | `Listing` (shared filtered grid), `SearchOverlay`, `BrandMark`, `CategoryHub`, `AllProducts`, `Search`, `Enquiry`, `NotFound`, `enquiry.js` + `EnquiryProvider` |

Deleted: `CylinderCarousel`, `Skeleton`, `Cart`.

## Build / deploy

Not yet configured. Phase 8 adds `vercel.json` (SPA rewrite, asset caching, security headers) + `public/robots.txt`. Listing pages must paginate or window past ~200 items — Crompton lighting alone is ~320.
