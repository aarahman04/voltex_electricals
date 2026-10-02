# Voltex Admin — add / remove / manage products on the live site

## Context

Today `/curate` (src/pages/Curate.jsx) lets a logged-in user remove products and junk gallery images on the live site. It works through `api/curation.js`, a Vercel Function that checks `CURATE_USERNAME`/`CURATE_PASSWORD`, then commits `Products/curation.json` to `main` via the GitHub Contents API using `CURATION_GITHUB_TOKEN`. `src/main.jsx` fetches `/api/curation?ids` before render and hides removed products right away. Vercel then rebuilds, and the ETL (`scripts/normalize.mjs`) bakes the removal in.

The owner now wants this renamed **Admin** at `/admin`, with the same single login and three sections:

1. **Add**: products from the godown that aren't on any brand site. Photo, name, brand (existing or "No brand", assignable later), category and type (pick one, or create a new one), tags, colour, model code (optional; shows nothing when blank) and price (optional). Each product goes into a draft list. The owner reviews the list, then presses **Publish**, and the products appear in `/products`.
2. **Remove**: today's Curate remove and image clean-up, moved here.
3. **Manage**: set or clear a **price** on any product. Edit an admin-added product's fields (including assigning a brand later). Delete an admin-added product.

**Price**: product cards and the detail page show a price only when one is set. There is no cart, and enquiry stays the only flow.

**Out of scope**: the header mega-menu. A new top-level category is **not** added to `PUBLISHED`; the developer promotes it later.

**Decisions** (confirmed with the user):
- **Backend**: GitHub commits. There is no database. Images and JSON live in the repo, and changes go live after the Vercel rebuild (~1–2 min). Removals stay instant through the existing overlay.
- **Categories**: new values can be created at both levels.
- **Devices**: works on phone and desktop. Staff photograph a product in the godown and add it on the spot.
- **Old tool**: `/curate` is retired and its features move into `/admin`. The "curation" concept stays internally (`Products/curation.json`, `curationActions.js`); only the user-facing name and route change.

## Branch / workspace

Astra has uncommitted styling work in `C:\Users\aarah\voltex_electricals` (Home.jsx, ShoppableHero, RoomHotspots, App.jsx). **Don't touch that tree.**
- `git worktree add ../voltex_admin -b admin-section origin/main` → all admin work happens in `C:\Users\aarah\voltex_admin`.
- `npm install` there. When the PR is opened, use `--base main` (the GitHub default branch is wrong, see [[voltex-deploy-facts]]).
- Copy this plan into the branch as `docs/admin-plan.md` (first commit) so both agents read the same spec.

## Data design

### New committed files
- `Products/admin/products.json` holds the admin-added products (raw source, hand-editable):
  ```json
  [{ "id": "a7k2m9", "title": "Crystal Chandelier 8-Arm", "brand": "philips" | null,
     "category": "Lighting", "subcategory": "Chandeliers", "tags": ["crystal","living room"],
     "color": "Gold" | null, "model": "CH-208" | null, "price": 18500 | null,
     "description": "" , "images": ["/products/admin/a7k2m9-1.webp", "..."],
     "createdAt": "2026-10-03T…Z", "updatedAt": "…" }]
  ```
  `id` is 6–8 random lowercase alphanumerics, generated server-side and never changed.
- `Products/admin/taxonomy.json` holds admin-created categories and types: `{ "categories": { "Decor": ["Wall Art"] , "Lighting": ["Pendant Clusters"] } }`. It's needed so a new type can be picked before any product uses it.
- `public/products/admin/<id>-<n>.webp` holds the uploaded photos. They are resized in the browser to ≤1600px on the long edge, WebP at quality 0.82 (~150–400 KB each).
- `Products/curation.json` gains `prices: { "<uid>": 12500 }`, the price overrides for **scraped** products. Admin products keep their price in `products.json`.

### ETL (`scripts/normalize.mjs`)
- Add an `adaptAdmin` adapter, plus a `BRANDS` entry `{ slug: "admin", name: "Admin", schema: "admin", dir: "admin" }`. It emits standard normalized records:
  - `vendor`: the brand's display name, or `""` when there is no brand.
  - `variants: [{ options: color ? { Color: color } : {}, sku: model ?? null, price }]`
  - `specs`: a `Model code` row when there is a model code, and a `Colour` row when there is a colour.
  - `images: { primary: images[0] ?? null, gallery: images }`, plus `tags`, `description`, `quality: "rich"`.
  - Unknown category or subcategory values pass through as-is. They are **not** parked.
- The uid for an admin product is `admin--<id>`. It stays the same when the brand changes later. In the ETL this is just `brand.slug === "admin"`.
- Curation `prices` is applied after `removedImages`: `p.price = prices[uid]`. Admin records set `p.price` from their own field. A `price` field is added to the **lite** projection (lines ~958-967) so cards get it.
- Report line: `admin products: N`.

### Runtime (`src/data`)
- `catalog.js`: for `folder === "admin"`, `uid = \`admin--${raw.id}\``, and brand resolves from `raw.vendor`. An empty vendor resolves to the pseudo brand below. `catalog` carries `price: raw.price ?? null`.
- `brands.js`: add `{ slug: "other", name: "Other brands", tint: "#EEECE7", logo: null, hidden: true }`. `resolveBrand("", "admin")` returns it.
  - `getBrands()` in `products.js` skips `hidden` brands, so the /brands page and the home strip are unchanged.
  - `getBrandsForCategory` keeps it, sorted last, so unbranded products can be reached from the category → brand flow.
  - `ProductCard` hides the brand line when `brandSlug === "other"`.
- `taxonomy.js`:
  - Import `Products/admin/taxonomy.json` and export `ADMIN_CATEGORIES` (top-level names not in `PUBLISHED`).
  - `isPublished(c)` also accepts those names, so `/c/<NewCat>` and its brand listing work.
  - `PUBLISHED` stays unchanged, so the header, footer and home grid are untouched until the developer adds the category.
  - `/products` already derives categories from the data (`getFacets(null)` `__category`), so new categories show there automatically. Verify this.
  - New subcategories already work: `orderedSubcategories` appends any type it doesn't know.
- `products.js`: no search change is needed. Model code is already searchable through `variants[].sku`, and colour through the option values.

### Price display
- `src/lib/price.js`: `formatPrice(n)` uses `new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })` and returns `null` when there is no price or it is ≤ 0.
- `ProductCard.jsx`: after `.product-spec`, add `{price && <p className="product-price spec">{price}</p>}`. Style it in `design-refresh.css` with the existing tokens.
- `ProductDetail.jsx` (lines ~194-209): when a price exists, show it big, with the existing "availability on enquiry" line under it. Otherwise keep `Pricing & availability on enquiry` as it is.
- Footer and About copy ("Prices on enquiry") stay as they are.

## API: `api/admin.js` (replaces `api/curation.js`)

Same file pattern and auth code as `api/curation.js`:
- Keep the `CURATE_USERNAME`/`CURATE_PASSWORD`/`CURATION_GITHUB_TOKEN` env var names, so the owner doesn't have to reconfigure Vercel. The code reads `ADMIN_*` first and falls back to `CURATE_*`.
- Cookie `voltex_admin`, `Path=/api`.
- Origin check, timingSafeEqual and HMAC session stay as they are.

| Request | Auth | Purpose |
|---|---|---|
| `GET /api/admin?ids` | public | `{ removed:[{uid}] }`, the instant-hide overlay (main.jsx) |
| `GET /api/admin` | — | `{ authenticated, curation, products, taxonomy }` (data only when authenticated) |
| `POST {type:"login"/"logout"}` | — | same as today |
| `POST {type:"upload", data:"<base64 webp>"}` | yes | Body ≤ 4 MB. Checks the WebP magic bytes (`RIFF....WEBP`), creates a git blob (`POST /git/blobs`) and returns `{ blobSha }`. The blob is not live until a publish references it. |
| `POST {type:"publish", products:[…draft with images:[{blobSha}]]}` | yes | Adds new products: assigns ids, maps blobs to paths, adds new categories/types to taxonomy.json. **One commit.** |
| `POST {type:"update", id, fields, images?}` | yes | Edits an admin product (brand, name, category, tags, colour, model, price, description, add/remove/reorder images). |
| `POST {type:"delete", ids:[…]}` | yes | Deletes admin products and their image files. |
| `POST {type:"price", uid, price|null}` | yes | Sets or clears the price on a scraped product (curation.json `prices`). |
| `POST {type:"remove"/"restore"/"images", …}` | yes | Existing curation actions, delegated unchanged to `updateCuration`. |

**Commit mechanism:** use the Git Data API so each action is one atomic commit, even when it touches many files.
1. `GET /git/ref/heads/main` → read the head commit and its tree.
2. Read the current JSON files through the Contents API at that commit.
3. Apply the pure reducer.
4. `POST /git/trees` with `base_tree`. Each file entry is either `{path, mode:"100644", type:"blob", sha}` for uploaded images, `{content}` for JSON, or `sha:null` for a deletion.
5. `POST /git/commits`, then `PATCH /git/refs/heads/main` (non-force).
6. If the ref update fails with 422 (a non-fast-forward), retry up to 3 times.

Commit messages: `Admin: add 4 products`, `Admin: update price`, `Admin: remove 3 products`, and so on.

**Pure reducer:** add `src/data/adminActions.js`, `applyAdminAction({ curation, products, taxonomy }, action, { newId, now }) → { curation, products, taxonomy, files: { add:[{path, blobSha}], delete:[path] } }`.
- It does all validation: string lengths, price as an integer from 0 to 10,000,000, at most 12 images per product, image paths only under `/products/admin/`, category and type names ≤ 60 chars, at most 50 products per publish.
- `curation` actions delegate to `updateCuration`.
- Both `api/admin.js` and the dev plugin use it.

**Dev mode:** `vite.config.js` gets `adminPlugin()` (renamed from `curatePlugin`, `apply:'serve'`), mounted at `/__admin`.
- It runs the same reducer and writes files to disk. Uploads are written to `public/products/admin/` straight away under a temp name and renamed on publish.
- It then runs the ETL. Login is always accepted in dev.

**Retire:** `api/curation.js`, `src/pages/Curate.jsx`, the `/curate` route and `/__curate`. Update `main.jsx` to fetch `/api/admin?ids` or `/__admin?ids`. Rename `scripts/curation.test.mjs` to `scripts/admin.test.mjs`, which covers both the reducer and the handler with a mocked fetch. `catalogFull.js` stays, since Remove still uses it.

Add `Disallow: /admin` to `public/robots.txt`. `/admin` pages get `<meta name="robots" content="noindex">`.

## Admin UI (`src/pages/admin/*`, mobile-first, no new dependencies)

`/admin` is a lazy route in `App.jsx`. It renders without the store Header/Footer, using a minimal admin top bar: logo · **Add · Remove · Manage** tabs · Sign out.
- **Login screen**: username, password, show/hide, an error line, then `GET /api/admin` to check the session.
- **Add**:
  - Big "Take photo / choose photos" button: `<input type=file accept="image/*" capture="environment" multiple>`. Thumbnails can be reordered (the first is the main photo) and removed.
  - Form: Name\*, Brand (select: existing brands from `BRANDS` that have products, plus "No brand"), Category\* (select plus "+ New category"), Type\* (select filtered by category plus "+ New type"), Tags (chip input; Enter or comma adds a tag), Colour, Model code, Price (₹, optional), Description (optional).
  - **Add to list** validates, then clears the form but **keeps brand, category and type**, which makes a batch of chandeliers fast.
  - **Bulk photos mode**: pick N photos and get N drafts sharing the brand, category and type. Each draft then only needs a name and price, edited inline in the list.
  - **Draft list** (a review panel or sheet): cards with thumbnail and fields, each with Edit, Duplicate and Remove. A "Publish N products" button opens a confirm step, then shows progress ("Uploading photo 3/9… Saving…") and finally "Published — live in about 2 minutes".
  - Drafts, including image blobs, persist in **IndexedDB** (`src/lib/admin/drafts.js`), so a refresh or a lost phone signal doesn't lose work. A failed publish leaves the drafts in place.
- **Remove**: a port of Curate.jsx's existing UI: search, filters, selection, remove, the image clean-up drawer and the Removed tab with restore. Keep the logic and restyle it to the admin shell.
- **Manage**:
  - Search over the whole catalogue with a filter chip for "Added by admin" and "No brand".
  - Each row: thumbnail, name, brand, current price, and **Set price** inline.
  - Admin products also get an **Edit** sheet (the same form as Add, including images) and **Delete**.
  - A "Needs a brand" chip lists the unbranded admin products.
- Image prep: `src/lib/admin/resizeImage.js` uses `createImageBitmap` → canvas → `toBlob('image/webp', 0.82)`. It respects EXIF orientation (`imageOrientation:'from-image'`).
- Styling: reuse the existing tokens and classes in `index.css` and `design-refresh.css` (plate, switch-btn, spec, field focus). Touch targets are ≥ 44px, and the layout is a single column at 360px.

## Work split

**Claude (Opus 5.5), the hard and risky parts**, part 1, done first:
1. Worktree and branch, plus `docs/admin-plan.md`.
2. `src/data/adminActions.js` reducer, plus tests.
3. `api/admin.js` with the Git Data API atomic commit, upload and retry, plus handler tests with mocked fetch. Delete `api/curation.js`.
4. `vite.config.js` `adminPlugin` at `/__admin`, and the `main.jsx` overlay URL.
5. ETL `adaptAdmin`, prices, the lite `price` field, the empty seed files, `catalog.js` uid/brand/price, the `other` pseudo brand, and `taxonomy.js` `ADMIN_CATEGORIES`/`isPublished`.
6. `formatPrice`, plus the price on ProductCard and ProductDetail.
7. `docs/admin-api.md`, the exact request/response contract for the UI, then push the branch.

**GPT 6.1 sol, the long and tedious UI**, part 2, started after Claude's part 1 is pushed:
- `src/pages/admin/` (AdminApp, Login, AddProducts, DraftList, RemoveProducts ported from Curate.jsx, ManageProducts, ProductForm shared by Add and Edit)
- `src/lib/admin/` (api client, drafts in IndexedDB, resizeImage)
- `/admin` route, styles, delete `Curate.jsx`

**Claude, part 3**: review GPT's diff, run an end-to-end dev test, update `docs/PROGRESS.md`, open the PR with `--base main`.

## Prompts (order: Claude first → GPT after Claude pushes → Claude review)

**Prompt 1 → Claude (send first):**
> Execute part 1 of the plan at `~/.claude/plans/pasted-content-id-c488-as-you-staged-widget.md` (Voltex Admin). Create the worktree `../voltex_admin` on a new branch `admin-section` from `origin/main`, and don't touch Astra's uncommitted files in the main tree. Copy the plan into `docs/admin-plan.md`. Build the following:
> - the `adminActions.js` reducer
> - `api/admin.js`, using the Git Data API so each action is one atomic commit; retire `api/curation.js`
> - the `adminPlugin` dev endpoint at `/__admin`
> - the `main.jsx` overlay URL
> - the ETL `adaptAdmin` adapter, prices, and the lite `price` field
> - the seed files `Products/admin/products.json` and `taxonomy.json`
> - `catalog.js`, plus the "other" pseudo brand in `brands.js`, plus `taxonomy.js` (`ADMIN_CATEGORIES` and `isPublished`)
> - `formatPrice`, plus the price on ProductCard and ProductDetail
> - tests in `scripts/admin.test.mjs`
>
> Then write `docs/admin-api.md` with the exact request/response contract and example payloads for every action, since another model builds the UI from it. Verify with `node --test`, `npm run data:build`, `npm run lint` and `npm run build`. Commit and push the branch, and don't open a PR yet. Report what's verified and what isn't.

**Prompt 2 → GPT 6.1 sol (send after Claude reports part 1 pushed):**
> You are working in the React 19 + Vite 8 + React Router 7 repo at `C:\Users\aarah\voltex_admin`, on branch `admin-section`, which already exists and is pushed. Run `git pull` first. Read `docs/admin-plan.md` (the section "Admin UI") and `docs/admin-api.md` (the backend contract, which is already built: don't change `api/`, `scripts/`, `src/data/` or `vite.config.js`). Your job is the admin frontend only.
>
> 1. **Route.** Add a lazy `/admin` route in `src/App.jsx`, rendered **outside** the store Header/Footer, with `<meta name="robots" content="noindex">`. Delete the `/curate` route and `src/pages/Curate.jsx`, but first port its Remove features (search and filters, click/shift-click select, remove selected, image clean-up drawer, Removed tab with restore) into `src/pages/admin/RemoveProducts.jsx`. Its API calls now go to the admin endpoint (`import.meta.env.DEV ? "/__admin" : "/api/admin"`).
> 2. **`src/lib/admin/`.**
>    - `api.js`: a fetch wrapper, `credentials: "same-origin"`, JSON errors shown as the server's `error` text.
>    - `drafts.js`: IndexedDB store for draft products including image Blobs. No library; about 60 lines with `indexedDB.open`.
>    - `resizeImage.js`: `createImageBitmap(file, { imageOrientation: "from-image" })` → canvas, long edge ≤ 1600 → `toBlob("image/webp", 0.82)`.
> 3. **`src/pages/admin/`.**
>    - `AdminApp`: the session check through `GET`, the Login screen when signed out, a top bar with tabs **Add · Remove · Manage** and Sign out. The tab is kept in `?tab=`.
>    - `ProductForm`: shared by Add and Edit.
>      - Photos: `<input type="file" accept="image/*" capture="environment" multiple>`, thumbnails, drag or arrow reorder (the first is the main photo), and remove.
>      - Fields: Name\*; Brand (stocked brands from `getBrands()` plus "No brand"); Category\* (existing categories plus admin taxonomy, plus "+ New category"); Type\* (filtered by category, plus "+ New type"); Tags as a chip input (Enter or comma adds a tag); Colour; Model code; Price in ₹ (optional, whole number); Description (optional).
>    - `AddProducts`:
>      - **Add to list** clears the form but keeps brand, category and type.
>      - **Bulk photos** creates one draft per photo with the shared brand, category and type.
>      - `DraftList` shows each draft with Edit, Duplicate and Remove, with name and price editable inline.
>      - **Publish N products** asks for confirmation, then uploads each photo (`type:"upload"`, one request per photo, progress "Uploading photo 3/9"), then sends one `publish` request.
>      - On success it clears the drafts and shows "Published — live on the site in about 2 minutes". On failure the drafts are kept and the error is shown.
>    - `ManageProducts`:
>      - Search the whole catalogue (reuse `matchesQuery` from `src/data/products.js`), with filter chips All / Added by admin / Needs a brand.
>      - Each row: thumbnail, name, brand, price, inline **Set price / Clear**.
>      - Admin products also get **Edit** (ProductForm in a sheet, using `update`) and **Delete** (with a confirm step).
> 4. **Design.**
>    - Mobile-first: a single column at 360px, touch targets ≥ 44px, sticky bottom action bar on phone; it must also work well at 1280px.
>    - Reuse the existing tokens and classes in `src/index.css` and `src/design-refresh.css` (plate, switch-btn, spec, the focus ring). Put new CSS in `src/admin.css`, imported only by AdminApp.
>    - No new npm dependencies.
>    - Use plain language, since the users aren't technical. No jargon like "uid" or "blob".
> 5. **Verify.**
>    - `npm run lint` and `npm run build` are clean.
>    - Run `npm run dev` and go through `/admin` at 360px and 1280px: log in (dev accepts any login); add 3 drafts, one of them through bulk photos; refresh and confirm the drafts are still there; publish and confirm the files appear in `Products/admin/` and `public/products/admin/` and the products show on `/products`; on Manage, set a price on any product, assign a brand to a "No brand" product, and delete one; on Remove, remove one product and restore it.
>    - Commit in logical steps on `admin-section` and push. Don't open a PR, and don't touch any file outside `src/pages/admin/`, `src/lib/admin/`, `src/admin.css`, `src/App.jsx` and the deleted `Curate.jsx`. If the API contract seems wrong or missing something, stop and write it up rather than changing the backend.

**Prompt 3 → Claude (after GPT finishes):**
> GPT finished the admin UI on `admin-section` (part 2 of the plan in `docs/admin-plan.md`). Pull the branch, then:
> - Review its diff against the plan and `docs/admin-api.md`, and fix any real bugs.
> - Run the full verification section end to end in dev.
> - Update `docs/PROGRESS.md`.
> - Open the PR with `--base main`.
>
> Tell me exactly what to check by hand on my phone after the merge.

## Verification

1. `node --test scripts/admin.test.mjs`: the reducer validates input, and publish, update, delete and price produce the expected files and JSON. The handler builds one tree and commit, and retries on 422.
2. Run `npm run data:build` with empty admin files: the published total is unchanged, and `check-catalog.mjs` passes.
3. Seed one admin product by hand, then run `npm run data:build`. Expected: it appears with uid `admin--<id>`; a missing brand gives the "Other brands" tile; a new type shows in the category hub; the price shows on the card and the detail page; no model code means no Model row.
4. `npm run dev`, `/admin` on a 360px viewport:
   - Log in.
   - Add 3 drafts, one of them via bulk photos, then refresh: the drafts are still there.
   - Publish: the files land in `Products/admin/` and `public/products/admin/`, and `/products` shows all 3.
   - Manage: set a price on a Havells fan, assign a brand to the unbranded draft, and delete one.
   - Remove: remove and restore still work.
5. `npm run lint` and `npm run build` are clean. `/curate` now goes to NotFound.
6. After merge (owner sets nothing new, since the env vars are reused), on the live site:
   - Log in at `/admin` and publish 1 test product.
   - Check with `curl` that the commit appears on `main`, and that the product shows in `/assets/products-*.js` after the rebuild.
   - Delete the test product.
