# Admin photo quality

`src/lib/admin/resizeImage.js` prepares every photo added in `/admin` (Add and Edit). Same exported `resizeImage(file) → Promise<Blob>` as before.

## Pipeline

[compressorjs](https://github.com/fengyuanchen/compressorjs) 1.4.0, `mimeType: "image/webp"`, `checkOrientation: true`, `retainExif: false`, `strict` (see below). Constants at the top of the file:

| Constant | Value | Why |
|---|---|---|
| `MAX_EDGE` | 2000 px | long edge |
| `QUALITY_STEPS` | 0.80, 0.74, 0.68, 0.60 | tried in order until the photo fits |
| `FALLBACK_EDGES` | 1600, 1280, 1000 | last resort, at the lowest quality |
| `MAX_BYTES` | 3,000,000 | `api/admin.js` rejects photos over 3,000,000 bytes (`MAX_UPLOAD_BYTES`); base64 makes that ~4.0 MB on the wire against a 4.2 MB body cap |

- The result is checked by its bytes (`RIFF....WEBP`), not `blob.type`. Anything else raises "This browser can't prepare photos for upload…" instead of uploading it.
- `strict` is only on when the input type differs from WebP. compressorjs' strict mode returns the *original file* if re-encoding came out bigger, which for a same-type input would publish the original EXIF/GPS.
- Errors are plain language (unreadable file, too large after shrinking, browser can't encode WebP).
- The old ceiling was 3 MiB (3,145,728), which was above the server's 3,000,000 limit, so a photo in between got a server error.

## No JPEG fallback

WebP canvas encoding returned real WebP in Chromium 151 and Playwright WebKit 26.5 (Safari engine), including through compressorjs, EXIF-rotated input, and a full add → publish run in both. compressorjs' README still says Safari doesn't support WebP conversion, older iOS versions are known not to, and no real iOS device was available. If staff report the "can't prepare photos" message, the fix is a JPEG path: accept `FFD8FF` in the upload validation (api + vite plugin), carry a `.jpg` extension through `adminActions.js` `newImagePath`, and extend `resizeImage.js` to retry with `image/jpeg`.

## Measurements (headless Chromium 151, same machine)

"Old" = previous pipeline (`createImageBitmap` → canvas, 1600 px, q0.82). SSIM is against a Lanczos downscale of the original at 2000 px long edge (outputs upscaled to match), so it rewards detail kept. Higher is better.

| Photo | Original | Old | New 2000 / q0.85 | **New 2000 / q0.80 (chosen)** |
|---|---|---|---|---|
| Chandelier, real, 4128×2752 | 5.4 MB | 93 KB, SSIM .949 | 119 KB, .964 | **96 KB, .962** |
| Chandelier, real, 4857×3238 | 2.8 MB | 219 KB, .922 | 293 KB, .975 | **239 KB, .970** |
| Chandelier, real, 3844×3844 | 2.9 MB | 363 KB, .725 | 541 KB, .780 | **446 KB, .775** |
| Label + grille, synthetic 12 MP | 4.3 MB | 349 KB, .379 | 188 KB, .687 | **142 KB, .685** |
| Same, EXIF orientation 6 | 4.6 MB | 385 KB, .350 | 215 KB, .681 | **161 KB, .680** |
| Noisy high-ISO, synthetic 12 MP | 9.7 MB | 563 KB, .380 | 505 KB, .702 | **373 KB, .693** |
| Synthetic 50 MP | 22 MB | 565 KB, .248 | 44 KB, .904 | **32 KB, .899** |
| Kuhl 1200 px (already small) | 36 KB | 21 KB | 23 KB | **19 KB** |

At 100% zoom the old output shows moiré and shredded small print (fine lettering, wire grille); the new output keeps them legible. Real chandelier crystals and filaments are visibly crisper at the larger size. 0.80 vs 0.85 is not distinguishable by eye on these photos but is ~19% lighter. Most of the gain comes from the new draw path (an `<img>` element decodes at reduced scale; `createImageBitmap` + bilinear `drawImage` aliases) and the larger edge, not from the quality number. An `imageSmoothingQuality = "high"` hint was tried and dropped: no effect in Chromium, worse and heavier in WebKit.

EXIF orientation 6 comes out upright (1500×2000) in Chromium and WebKit; all outputs had no EXIF/GPS. The ceiling was never hit by these photos, so the retry ladder is covered by unit tests (`scripts/admin.test.mjs`).

## Storefront impact

- `ProductCard` renders `cdnImage(url, 600)` and `ProductDetail` uses `cdnImage(url, 1000)` for the main image and `cdnImage(url, 160)` for thumbnails. `cdnImage` only resizes `cdn.shopify.com` URLs, so **admin photos are served at full size everywhere**: no `srcset`, no thumbnail. Cards are `loading="lazy"`; `Listing` shows 24 per page.
- Measured at 360px (DPR 2), Chromium: a Shopify card averages ~36 KB; an admin card is 32–96 KB for the photos above (one 446 KB on a dense photo). `/products` first page with 2 admin cards: 1.25 MB total images; a detail page with 2 admin photos loads each at full size (96 + 161 KB) for both the hero and the 160 px thumbnail.
- Today there are few admin products, so the effect is small. If admin products fill a page, 24 admin cards would be roughly 2.5–10 MB against ~0.9 MB for Shopify cards, which will hurt on mobile data.
- Smallest fix, not built: send same-origin `/products/admin/` URLs through Vercel Image Optimization in `cdnImage` (`/_vercel/image?url=…&w=…&q=75`) with an `images` block in `vercel.json`. About 10 lines, no upload-time pipeline.
