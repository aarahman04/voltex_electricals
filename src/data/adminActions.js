import { updateCuration } from "./curationActions.js";

// Pure reducer behind every /admin write. Both api/admin.js (production, GitHub
// commits) and the vite dev plugin (local files) call applyAdminAction, so the
// validation lives in exactly one place. No I/O, no Node-only imports.

export const ADMIN_PATHS = {
  curation: "Products/curation.json",
  products: "Products/admin/products.json",
  taxonomy: "Products/admin/taxonomy.json",
};
// Public URL of an uploaded photo, and where its file lives in the repo.
export const ADMIN_IMAGE_URL_DIR = "/products/admin/";
export const ADMIN_IMAGE_REPO_DIR = "public/products/admin/";
export const ADMIN_UID_PREFIX = "admin--";

export const LIMITS = {
  publishBatch: 50,
  imagesPerProduct: 12,
  tags: 20,
  maxPrice: 10_000_000,
};

// Categories that exist without any admin input. Duplicated from
// taxonomy.js PUBLISHED on purpose: this file must stay importable from Node
// without pulling in the JSON-importing taxonomy module. Only used so a typed
// "lighting" resolves to "Lighting" instead of becoming a second category.
const BUILT_IN_CATEGORIES = ["Fans", "Lighting", "Water Geysers"];

export class AdminInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "AdminInputError";
  }
}

export const emptyProducts = () => [];
export const emptyTaxonomy = () => ({ categories: {} });
export const emptyCuration = () => ({ removed: [], removedImages: {} });

export const serialize = (value) => `${JSON.stringify(value, null, 2)}\n`;

const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9 &'(),.+-]{0,59}$/;
const BRAND_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BLOB_RE = /^[0-9a-f]{40}$/;

const randomId = (length = 6) => {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
};

const squash = (value) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");

function text(value, max, label, { required = false } = {}) {
  const out = squash(value);
  if (!out) {
    if (required) throw new AdminInputError(`Invalid ${label}: it can't be empty`);
    return null;
  }
  if (out.length > max) throw new AdminInputError(`Invalid ${label}: at most ${max} characters`);
  return out;
}

function name(value, label) {
  const out = squash(value);
  if (!NAME_RE.test(out)) {
    throw new AdminInputError(`Invalid ${label}: use letters, numbers, spaces and & ' ( ) , . + - (max 60)`);
  }
  return out;
}

function price(value) {
  if (value === null || value === undefined || value === "") return null;
  if (!Number.isInteger(value) || value < 0 || value > LIMITS.maxPrice) {
    throw new AdminInputError(`Invalid price: whole rupees from 1 to ${LIMITS.maxPrice.toLocaleString("en-IN")}`);
  }
  return value || null;
}

function tags(value) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > LIMITS.tags) throw new AdminInputError(`Invalid tags: at most ${LIMITS.tags}`);
  const seen = new Set();
  const out = [];
  for (const raw of value) {
    const tag = text(raw, 40, "tag");
    if (tag && !seen.has(tag.toLowerCase())) { seen.add(tag.toLowerCase()); out.push(tag); }
  }
  return out;
}

function brand(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || value.length > 40 || !BRAND_RE.test(value)) throw new AdminInputError("Invalid brand");
  return value;
}

// Picks the stored spelling when the name already exists in any casing.
function canonical(candidate, known) {
  return known.find((k) => k.toLowerCase() === candidate.toLowerCase()) ?? candidate;
}

function categoryAndType(input, taxonomy) {
  const rawCategory = name(input.category, "category");
  const category = canonical(rawCategory, [...BUILT_IN_CATEGORIES, ...Object.keys(taxonomy.categories)]);
  const rawType = name(input.subcategory, "type");
  const subcategory = canonical(rawType, taxonomy.categories[category] ?? []);
  return { category, subcategory };
}

// Validates the fields of a product. `partial` (update) only touches keys that
// were sent; otherwise (publish) every field is required/defaulted.
function cleanFields(input, taxonomy, { partial }) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new AdminInputError("Invalid product");
  const has = (key) => Object.hasOwn(input, key);
  const out = {};
  if (!partial || has("title")) out.title = text(input.title, 200, "name", { required: true });
  if (!partial || has("brand")) out.brand = brand(input.brand);
  if (partial && has("category") !== has("subcategory")) {
    throw new AdminInputError("Invalid type: choose the category and the type together");
  }
  if (!partial || has("category")) Object.assign(out, categoryAndType(input, taxonomy));
  if (!partial || has("tags")) out.tags = tags(input.tags);
  if (!partial || has("color")) out.color = text(input.color, 80, "colour");
  if (!partial || has("model")) out.model = text(input.model, 80, "model code");
  if (!partial || has("price")) out.price = price(input.price);
  if (!partial || has("description")) out.description = text(input.description, 2000, "description") ?? "";
  return out;
}

function noteTaxonomy(taxonomy, category, subcategory) {
  const known = taxonomy.categories[category] ?? [];
  if (known.includes(subcategory)) return taxonomy;
  return { ...taxonomy, categories: { ...taxonomy.categories, [category]: [...known, subcategory] } };
}

// image items are either {blobSha} (a fresh upload) or, on update only, the
// string URL of a photo the product already has.
function cleanImages(items, existing) {
  if (!Array.isArray(items) || items.length < 1 || items.length > LIMITS.imagesPerProduct) {
    throw new AdminInputError(`Invalid photos: a product needs 1 to ${LIMITS.imagesPerProduct}`);
  }
  const seen = new Set();
  return items.map((item) => {
    if (typeof item === "string") {
      if (!existing?.includes(item) || seen.has(item)) throw new AdminInputError("Invalid photo");
      seen.add(item);
      return item;
    }
    if (!item || typeof item.blobSha !== "string" || !BLOB_RE.test(item.blobSha) || seen.has(item.blobSha)) {
      throw new AdminInputError("Invalid photo");
    }
    seen.add(item.blobSha);
    return { blobSha: item.blobSha };
  });
}

const repoPath = (url) => `public${url}`;

export function applyAdminAction(state, action, deps = {}) {
  const newId = deps.newId ?? randomId;
  const now = deps.now ?? (() => new Date().toISOString());
  if (!action || typeof action !== "object" || Array.isArray(action)) throw new AdminInputError("Invalid request");

  let { curation, products, taxonomy } = state;
  curation = curation ?? emptyCuration();
  products = [...(products ?? emptyProducts())];
  taxonomy = taxonomy ?? emptyTaxonomy();
  const files = { add: [], delete: [] };
  const created = [];
  let message;

  const newImagePath = (id) => `${ADMIN_IMAGE_URL_DIR}${id}-${newId()}.webp`;
  const resolveImages = (id, items) => items.map((item) => {
    if (typeof item === "string") return item;
    const url = newImagePath(id);
    files.add.push({ path: repoPath(url), blobSha: item.blobSha });
    return url;
  });

  const updateProduct = (id, apply) => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new AdminInputError("That product no longer exists");
    products[index] = { ...apply(products[index]), updatedAt: now() };
    return products[index];
  };

  if (action.type === "publish") {
    const list = action.products;
    if (!Array.isArray(list) || list.length < 1 || list.length > LIMITS.publishBatch) {
      throw new AdminInputError(`Invalid list: publish 1 to ${LIMITS.publishBatch} products at a time`);
    }
    for (const draft of list) {
      const fields = cleanFields(draft, taxonomy, { partial: false });
      const images = cleanImages(draft.images, null);
      let id = newId();
      for (let tries = 0; products.some((p) => p.id === id); tries += 1) {
        if (tries > 20) throw new AdminInputError("Could not assign a product id");
        id = newId();
      }
      taxonomy = noteTaxonomy(taxonomy, fields.category, fields.subcategory);
      const timestamp = now();
      products.push({ id, ...fields, images: resolveImages(id, images), createdAt: timestamp, updatedAt: timestamp });
      created.push({ id, uid: `${ADMIN_UID_PREFIX}${id}` });
    }
    message = `Admin: add ${list.length} product${list.length === 1 ? "" : "s"}`;
  } else if (action.type === "update") {
    if (typeof action.id !== "string" || !action.id) throw new AdminInputError("Invalid product");
    const fields = cleanFields(action.fields ?? {}, taxonomy, { partial: true });
    if (fields.category) taxonomy = noteTaxonomy(taxonomy, fields.category, fields.subcategory);
    updateProduct(action.id, (old) => {
      const next = { ...old, ...fields };
      if (action.images !== undefined) {
        const items = cleanImages(action.images, old.images);
        next.images = resolveImages(old.id, items);
        for (const url of old.images) if (!next.images.includes(url)) files.delete.push(repoPath(url));
      }
      return next;
    });
    message = "Admin: update product";
  } else if (action.type === "delete") {
    if (!Array.isArray(action.ids) || action.ids.length < 1 || action.ids.length > LIMITS.publishBatch ||
        action.ids.some((id) => typeof id !== "string" || !id)) throw new AdminInputError("Invalid products");
    const doomed = products.filter((p) => action.ids.includes(p.id));
    for (const p of doomed) for (const url of p.images) files.delete.push(repoPath(url));
    products = products.filter((p) => !action.ids.includes(p.id));
    message = `Admin: delete ${doomed.length} product${doomed.length === 1 ? "" : "s"}`;
  } else if (action.type === "price" && typeof action.uid === "string" && action.uid.startsWith(ADMIN_UID_PREFIX)) {
    if (action.price === undefined) throw new AdminInputError("Invalid price");
    const value = price(action.price);
    updateProduct(action.uid.slice(ADMIN_UID_PREFIX.length), (old) => ({ ...old, price: value }));
    message = "Admin: update price";
  } else if (["remove", "restore", "images", "price"].includes(action.type)) {
    curation = updateCuration(curation, action);
    message = {
      remove: `Admin: remove ${action.items?.length} product${action.items?.length === 1 ? "" : "s"}`,
      restore: "Admin: restore product",
      images: "Admin: update product photos",
      price: "Admin: update price",
    }[action.type];
  } else {
    throw new AdminInputError("Invalid action");
  }

  return { curation, products, taxonomy, files, created, message };
}
