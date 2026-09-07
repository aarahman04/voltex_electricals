// Source images are 1500×1500 and run to 3 MB each. The Shopify CDN
// resizes on request, so ask it for the size actually being drawn.
export function cdnImage(url, width) {
  if (!url) return url;
  if (!url.includes("cdn.shopify.com")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}width=${width}`;
}
