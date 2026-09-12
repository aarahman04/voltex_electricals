// Source images are 1500×1500 and run to 3 MB each. The Shopify CDN resizes
// and transcodes on request, so ask it for the size actually being drawn —
// at device pixel ratio, so retina screens don't get a soft upscale — and in
// WebP, which the same photos run 60-80% smaller as. Havells/Polycab images
// come straight from their own CDNs (no resize API); they're already thin
// product shots under 15 KB, so they're passed through untouched.
export function cdnImage(url, width) {
  if (!url) return url;
  if (!url.includes("cdn.shopify.com")) return url;
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const target = Math.round(width * Math.min(dpr, 2));
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}width=${target}&format=webp`;
}
