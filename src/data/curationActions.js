const MAX_UID_LENGTH = 512;

export function updateCuration(current, action) {
  const removed = [...(current.removed ?? [])];
  const removedImages = { ...(current.removedImages ?? {}) };
  // Price overrides for scraped products. Only written back when non-empty so
  // an untouched curation.json keeps its original two-key shape.
  const prices = { ...(current.prices ?? {}) };
  const out = () => (Object.keys(prices).length ? { removed, removedImages, prices } : { removed, removedImages });

  if (action.type === "remove") {
    if (!Array.isArray(action.items) || action.items.length > 2000 ||
        action.items.some((item) => !item || typeof item.uid !== "string" || !item.uid || item.uid.length > MAX_UID_LENGTH ||
          typeof item.title !== "string" || !item.title || item.title.length > 200)) throw new Error("Invalid products");
    const existing = new Set(removed.map((item) => item.uid));
    for (const item of action.items) {
      if (!existing.has(item.uid)) { removed.push({ uid: item.uid, title: item.title }); existing.add(item.uid); }
    }
  } else if (action.type === "restore") {
    if (typeof action.uid !== "string" || !action.uid || action.uid.length > MAX_UID_LENGTH) throw new Error("Invalid product");
    return { ...out(), removed: removed.filter((item) => item.uid !== action.uid) };
  } else if (action.type === "images") {
    if (typeof action.uid !== "string" || !action.uid || action.uid.length > MAX_UID_LENGTH ||
        !Array.isArray(action.urls) || action.urls.length > 500 ||
        action.urls.some((url) => typeof url !== "string" || url.length > 2048)) throw new Error("Invalid images");
    if (action.urls.length) removedImages[action.uid] = [...new Set(action.urls)];
    else delete removedImages[action.uid];
  } else if (action.type === "price") {
    if (typeof action.uid !== "string" || !action.uid || action.uid.length > MAX_UID_LENGTH ||
        (action.price !== null && !(Number.isInteger(action.price) && action.price >= 0 && action.price <= 10_000_000))) throw new Error("Invalid price");
    if (action.price) prices[action.uid] = action.price;
    else delete prices[action.uid];
  } else {
    throw new Error("Invalid action");
  }

  return out();
}
