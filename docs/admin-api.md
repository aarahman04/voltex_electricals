# Admin API contract

Backend for `/admin`. The UI is built against this file; don't change the backend from the UI branch.

- Production: `POST|GET /api/admin` (`api/admin.js`, a Vercel Function). Each write is **one commit to `main`** via the GitHub Git Data API; the Vercel rebuild after it publishes the change (~1–2 min).
- Dev (`npm run dev`): `/__admin` (`vite.config.js` `adminPlugin`). Same requests and responses, but it writes files on disk and re-runs the ETL, so Vite hot-reloads the change. **There is no login in dev**: `GET` always returns `authenticated: true` and `login` always succeeds.
- Endpoint constant for the UI: `const ADMIN_URL = import.meta.env.DEV ? "/__admin" : "/api/admin";`
- All bodies are JSON. All responses are JSON with `Cache-Control: no-store`.
- All validation is in `src/data/adminActions.js` (`applyAdminAction`), shared by both. Error text in `error` is written for non-technical people and can be shown as is.

## Auth

Session cookie `voltex_admin` (HttpOnly, Secure, SameSite=Strict, `Path=/api`, 7 days). The browser handles it; use `credentials: "same-origin"` on `fetch`. Env vars: `ADMIN_USERNAME`/`ADMIN_PASSWORD` (fall back to `CURATE_*`), `CURATION_GITHUB_TOKEN`.

POSTs from another origin get `403 {"error":"Invalid origin"}`.

## Reads

### `GET ADMIN_URL`
Signed out: `{ "authenticated": false }`. Signed in:
```json
{
  "authenticated": true,
  "curation": { "removed": [{ "uid": "havells--fan-1", "title": "Havells Fan" }], "removedImages": { "<uid>": ["<image url>"] }, "prices": { "<uid>": 2500 } },
  "products": [ { "id": "a7k2m9", "title": "...", "brand": "philips", "category": "Lighting", "subcategory": "Chandeliers", "tags": ["crystal"], "color": "Gold", "model": null, "price": 18500, "description": "", "images": ["/products/admin/a7k2m9-x1y2z3.webp"], "createdAt": "2026-10-03T...Z", "updatedAt": "2026-10-03T...Z" } ],
  "taxonomy": { "categories": { "Decor": ["Wall Art"], "Lighting": ["Chandeliers"] } }
}
```
`curation.prices` is absent when empty. `products` is the admin-added products only (the scraped catalogue comes from `src/data/products.js`).

### `GET ADMIN_URL?ids` (public)
`{ "removed": [{ "uid": "havells--fan-1" }] }`. Used by `main.jsx`. Don't touch.

## Writes: `POST ADMIN_URL`

Every successful write responds **200** with the new full state, in the same shape as the signed-in `GET`, plus:
```json
{ "ok": true, "changed": true, "created": [{ "id": "a7k2m9", "uid": "admin--a7k2m9" }], "authenticated": true, "curation": {}, "products": [], "taxonomy": {} }
```
`changed` is `false` when the request was a no-op (nothing committed). `created` is only filled by `publish`. **Replace your local copy of the state with the response.**

> **Shape change vs the old /curate API:** the curation lists used to be the top level of the response (`data.removed`). They are now under `data.curation` (`data.curation.removed`, `data.curation.removedImages`). `/api/curation`, `/__curate` and `Curate.jsx` no longer exist; `src/pages/admin/RemoveProducts.jsx` is the port.

### `login` / `logout`
```json
{ "type": "login", "username": "...", "password": "..." }   // 200 {"ok":true} + cookie | 401 {"error":"Incorrect username or password"} | 503 {"error":"Admin login is not configured"}
{ "type": "logout" }                                          // 200 {"ok":true}
```
Any other action while signed out: `401 {"error":"Sign in to use admin"}`.

### `upload`: one photo
Send one request per photo, **before** `publish`/`update`.
```json
{ "type": "upload", "data": "<base64 of a WebP file, no data: prefix>" }
```
→ `200 { "ok": true, "blobSha": "92d24f4cc4d2a857e7282654069b7ddfe37f10e1" }`

- The photo **must be WebP** (checked by its bytes) and ≤ 3,000,000 bytes decoded (the request body is capped at ~4.2 MB; base64 adds ~33%). `src/lib/admin/resizeImage.js` prepares photos with compressorjs: long edge ≤ 2000 px, WebP quality 0.80, stepping quality and then the edge down until it fits. See `docs/admin-image-quality.md`.
- Nothing goes live from an upload. `blobSha` is a handle you pass to `publish`/`update`. Unused uploads are harmless.
- Errors: `400 {"error":"Invalid photo: expected a WebP image"}`, `400 "Invalid photo: too large"`.

### `publish`: add new products (1–50 per request, one commit)
```json
{
  "type": "publish",
  "products": [{
    "title": "Crystal Chandelier 8-Arm",
    "brand": null,
    "category": "Lighting",
    "subcategory": "Chandeliers",
    "tags": ["crystal", "living room"],
    "color": "Gold",
    "model": null,
    "price": 18500,
    "description": "",
    "images": [{ "blobSha": "92d24f4c..." }, { "blobSha": "5a1c0e7b..." }]
  }]
}
```
Returns the common response; `created[i]` lines up with `products[i]`. The server assigns `id` (and the final photo names). The live uid is `admin--<id>` and never changes, even if the brand is assigned later.

Field rules (violations are `400 {"error": "..."}`):

| Field | Rule |
|---|---|
| `title` | required, ≤ 200 chars |
| `brand` | `null`/`""` for "No brand", else a brand **slug** from `src/data/brands.js` (`philips`, `ao-smith`, ...). Lowercase letters, digits, hyphens |
| `category`, `subcategory` | required. Letters, digits, spaces and `& ' ( ) , . + -`, ≤ 60 chars. A name that matches an existing one in any casing is folded onto it (`lighting` → `Lighting`). **A new name simply creates a new category / type.** There is no separate "create category" call |
| `tags` | optional, ≤ 20, each ≤ 40 chars, de-duplicated case-insensitively |
| `color`, `model` | optional, ≤ 80 chars. Empty/blank → `null`. `model: null` means the site shows no model code |
| `price` | `null` (no price shown) or a whole number of rupees, 1–10,000,000. `0` is treated as `null` |
| `description` | optional, ≤ 2000 chars |
| `images` | **required, 1–12** items `{ "blobSha": "<40 hex>" }`. The first is the main photo |

### `update`: edit an admin-added product
```json
{ "type": "update", "id": "a7k2m9", "fields": { "brand": "philips", "price": null }, "images": ["/products/admin/a7k2m9-x1y2z3.webp", { "blobSha": "5a1c0e7b..." }] }
```
- `fields` takes any subset of the `publish` fields. Only the keys sent change; `null` clears an optional one. `category` and `subcategory` must be sent **together**.
- `images` is optional. When present it is the **complete new list in display order**: each item is either an existing photo URL (a string, copied from `product.images`) or `{ "blobSha" }` for a new upload. Photos left out are deleted from the repo. 1–12 items.
- Unknown id: `400 {"error":"That product no longer exists"}`.

### `delete`: delete admin-added products
```json
{ "type": "delete", "ids": ["a7k2m9", "b3x8q1"] }
```
1–50 ids (the `id`, not the uid). Their photo files are deleted too. Unknown ids are ignored.

### `price`: set or clear a price on **any** product
```json
{ "type": "price", "uid": "havells--inveno-lx-bldc-ceiling-fan", "price": 2500 }
{ "type": "price", "uid": "admin--a7k2m9", "price": null }
```
`price` is required (`null` clears). For an `admin--…` uid it edits the admin product; for any other uid it is stored in `curation.prices` (applied by the ETL on rebuild). Use this for Manage's inline price box; it works for every row. `400 "Invalid price: whole rupees from 1 to 10,000,000"` otherwise.

### `remove` / `restore` / `images`: unchanged from /curate
```json
{ "type": "remove", "items": [{ "uid": "havells--fan-1", "title": "Havells Fan" }] }   // ≤ 2000 items
{ "type": "restore", "uid": "havells--fan-1" }
{ "type": "images", "uid": "havells--fan-1", "urls": ["<image url to hide>"] }            // [] clears
```
Removing an admin product through `remove` hides it but keeps its record. Manage's **Delete** is the way to erase one.

## Status codes

| Status | Meaning |
|---|---|
| 200 | done (check `changed`) |
| 400 | invalid input; show `error` |
| 401 | not signed in / wrong login |
| 403 | wrong origin |
| 409 | `Another edit was saved at the same moment. Please try again.` (retried 3× server-side first) |
| 502 | GitHub failed. `Could not save. If you just added photos, add them again and retry.` Drafts must be kept |
| 503 | `Live admin is not configured` (env vars missing) |

## What the site does with it (for UI wording)

- **Live timing (production):** `remove` hides immediately on the next page load. `publish`, `update`, `delete`, `price`, `restore` and `images` show after the rebuild, ~1–2 minutes. In dev everything is immediate.
- **Brand:** an admin product with no brand appears under a hidden brand called **Other brands** (listed last in its category's brand list, absent from the Brands page). Assigning a brand later moves it.
- **Categories:** an admin-created category gets its own page `/c/<Name>` and appears in `/products` filters. It is **not** in the header menu, footer or home page until a developer adds it to `PUBLISHED` in `src/data/taxonomy.js`.
- **Price:** shown on product cards and the product page only when set. There is no cart.
- **Model code / colour:** shown on the product page when set, omitted when blank.

## Data the UI needs from the existing code

- Brand choices: `getBrands()` and `BRANDS` from `src/data/brands.js` / `src/data/products.js`. Offer every entry of `BRANDS` except the hidden `other`; "No brand" is `null`.
- Existing categories/types: derive from the catalogue (`getCategories()`, `getSubcategories(category)`) merged with `taxonomy.categories` from the `GET` response, so a type created earlier is offered before any product is left in it.
- Photo thumbnails of admin products are same-origin URLs (`/products/admin/...`). Scraped products use remote URLs via `cdnImage(url, w)` from `src/lib/image.js`.
- A scraped product's uid is `<brandSlug>--<id>` (`product.uid`); an admin product's is `admin--<id>`.
