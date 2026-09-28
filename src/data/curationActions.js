export function updateCuration(current, action) {
  const removed = [...(current.removed ?? [])];
  const removedImages = { ...(current.removedImages ?? {}) };

  if (action.type === "remove") {
    if (!Array.isArray(action.items) || action.items.length > 2000 ||
        action.items.some((item) => !item || typeof item.uid !== "string" || !item.uid || item.uid.length > 200 ||
          typeof item.title !== "string" || !item.title || item.title.length > 200)) throw new Error("Invalid products");
    const existing = new Set(removed.map((item) => item.uid));
    for (const item of action.items) {
      if (!existing.has(item.uid)) { removed.push({ uid: item.uid, title: item.title }); existing.add(item.uid); }
    }
  } else if (action.type === "restore") {
    if (typeof action.uid !== "string" || !action.uid || action.uid.length > 200) throw new Error("Invalid product");
    return { removed: removed.filter((item) => item.uid !== action.uid), removedImages };
  } else if (action.type === "images") {
    if (typeof action.uid !== "string" || !action.uid || action.uid.length > 200 ||
        !Array.isArray(action.urls) || action.urls.length > 500 ||
        action.urls.some((url) => typeof url !== "string" || url.length > 2048)) throw new Error("Invalid images");
    if (action.urls.length) removedImages[action.uid] = [...new Set(action.urls)];
    else delete removedImages[action.uid];
  } else {
    throw new Error("Invalid action");
  }

  return { removed, removedImages };
}
