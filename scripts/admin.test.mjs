import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import handler from "../api/admin.js";
import { ADMIN_PATHS, AdminInputError, applyAdminAction } from "../src/data/adminActions.js";

/* ------------------------------------------------------------------ reducer */

const empty = () => ({
  curation: { removed: [], removedImages: {} },
  products: [],
  taxonomy: { categories: {} },
});
const sha = (c) => c.repeat(40);
const counter = () => { let n = 0; return () => `a${++n}`; };
const deps = () => ({ newId: counter(), now: () => "2026-10-03T00:00:00.000Z" });
const draft = (extra = {}) => ({
  title: "Crystal Chandelier 8-Arm", brand: null, category: "Lighting", subcategory: "Chandeliers",
  tags: ["crystal", "Crystal", " living room "], color: "Gold", model: "", price: 18500, description: "",
  images: [{ blobSha: sha("a") }, { blobSha: sha("b") }], ...extra,
});

test("publish assigns ids, names photos, records the taxonomy and normalises fields", () => {
  const result = applyAdminAction(empty(), { type: "publish", products: [draft(), draft({ title: "Wall Lamp", brand: "philips", price: null, subcategory: "Pendant Clusters" })] }, deps());
  assert.equal(result.message, "Admin: add 2 products");
  assert.deepEqual(result.created.map((c) => c.uid), ["admin--a1", "admin--a4"]);
  const [first, second] = result.products;
  assert.deepEqual(first.tags, ["crystal", "living room"]);
  assert.equal(first.model, null);
  assert.equal(first.color, "Gold");
  assert.deepEqual(first.images, ["/products/admin/a1-a2.webp", "/products/admin/a1-a3.webp"]);
  assert.equal(second.brand, "philips");
  assert.equal(second.price, null);
  assert.deepEqual(result.files.add.map((f) => f.path), [
    "public/products/admin/a1-a2.webp", "public/products/admin/a1-a3.webp",
    "public/products/admin/a4-a5.webp", "public/products/admin/a4-a6.webp",
  ]);
  assert.deepEqual(result.taxonomy.categories, { Lighting: ["Chandeliers", "Pendant Clusters"] });
});

test("publish folds a typed category onto an existing one and creates new ones", () => {
  const first = applyAdminAction(empty(), { type: "publish", products: [draft({ category: "lighting" }), draft({ category: "Decor", subcategory: "Wall Art" })] }, deps());
  assert.deepEqual(first.products.map((p) => p.category), ["Lighting", "Decor"]);
  const again = applyAdminAction(first, { type: "publish", products: [draft({ category: "DECOR", subcategory: "wall art" })] }, deps());
  assert.equal(again.products.at(-1).category, "Decor");
  assert.equal(again.products.at(-1).subcategory, "Wall Art");
  assert.deepEqual(again.taxonomy.categories.Decor, ["Wall Art"]);
});

test("publish rejects bad input with a friendly AdminInputError", () => {
  const bad = (product, pattern) => assert.throws(
    () => applyAdminAction(empty(), { type: "publish", products: [product] }, deps()), (error) => error instanceof AdminInputError && pattern.test(error.message),
  );
  bad(draft({ title: "  " }), /name/);
  bad(draft({ price: 1.5 }), /price/);
  bad(draft({ price: 10_000_001 }), /price/);
  bad(draft({ category: "Light/ing" }), /category/);
  bad(draft({ subcategory: "" }), /type/);
  bad(draft({ brand: "Philips Lighting" }), /brand/);
  bad(draft({ images: [] }), /photos/);
  bad(draft({ images: [{ blobSha: "nope" }] }), /photo/);
  bad(draft({ images: ["/products/admin/x.webp"] }), /photo/);
  bad(draft({ images: Array.from({ length: 13 }, (_, i) => ({ blobSha: String(i).padStart(40, "0") })) }), /photos/);
  assert.throws(() => applyAdminAction(empty(), { type: "publish", products: [] }, deps()), /Invalid list/);
  assert.throws(() => applyAdminAction(empty(), { type: "nope" }, deps()), /Invalid action/);
});

test("update changes only the fields sent and swaps photos", () => {
  const d = deps();
  const published = applyAdminAction(empty(), { type: "publish", products: [draft()] }, d);
  const [{ id, images }] = published.products;
  const updated = applyAdminAction(published, {
    type: "update", id, fields: { brand: "havells", price: null, model: "CH-208" },
    images: [images[1], { blobSha: sha("c") }],
  }, { ...d, now: () => "2026-10-04T00:00:00.000Z" });
  const [product] = updated.products;
  assert.equal(product.brand, "havells");
  assert.equal(product.price, null);
  assert.equal(product.model, "CH-208");
  assert.equal(product.title, "Crystal Chandelier 8-Arm");
  assert.equal(product.updatedAt, "2026-10-04T00:00:00.000Z");
  assert.equal(product.createdAt, "2026-10-03T00:00:00.000Z");
  assert.equal(product.images[0], images[1]);
  assert.equal(product.images.length, 2);
  assert.deepEqual(updated.files.delete, [`public${images[0]}`]);
  assert.deepEqual(updated.files.add.map((f) => f.blobSha), [sha("c")]);

  assert.throws(() => applyAdminAction(published, { type: "update", id, fields: { category: "Fans" } }, d), /together/);
  assert.throws(() => applyAdminAction(published, { type: "update", id: "missing", fields: { price: 5 } }, d), /no longer exists/);
  assert.throws(() => applyAdminAction(published, { type: "update", id, fields: {}, images: ["/products/admin/other.webp"] }, d), /photo/);
});

test("delete removes products and their photo files; unknown ids are ignored", () => {
  const published = applyAdminAction(empty(), { type: "publish", products: [draft(), draft({ title: "Two" })] }, deps());
  const [one, two] = published.products;
  const result = applyAdminAction(published, { type: "delete", ids: [one.id, "ghost"] }, deps());
  assert.deepEqual(result.products.map((p) => p.id), [two.id]);
  assert.deepEqual(result.files.delete, one.images.map((url) => `public${url}`));
  assert.equal(result.message, "Admin: delete 1 product");
});

test("price goes to the product for admin uids and to curation for scraped uids", () => {
  const published = applyAdminAction(empty(), { type: "publish", products: [draft({ price: null })] }, deps());
  const { id } = published.products[0];
  const own = applyAdminAction(published, { type: "price", uid: `admin--${id}`, price: 999 }, deps());
  assert.equal(own.products[0].price, 999);
  assert.equal(own.curation.prices, undefined);
  const scraped = applyAdminAction(own, { type: "price", uid: "havells--fan-1", price: 2500 }, deps());
  assert.deepEqual(scraped.curation.prices, { "havells--fan-1": 2500 });
  const cleared = applyAdminAction(scraped, { type: "price", uid: "havells--fan-1", price: null }, deps());
  assert.equal(cleared.curation.prices, undefined);
  assert.throws(() => applyAdminAction(own, { type: "price", uid: "havells--fan-1", price: -1 }, deps()), /Invalid price/);
  assert.throws(() => applyAdminAction(own, { type: "price", uid: "havells--fan-1" }, deps()), /Invalid price/);
});

test("curation actions keep existing prices", () => {
  const state = { ...empty(), curation: { removed: [], removedImages: {}, prices: { "a--b": 10 } } };
  const result = applyAdminAction(state, { type: "remove", items: [{ uid: "x--y", title: "Y" }] }, deps());
  assert.deepEqual(result.curation.prices, { "a--b": 10 });
  assert.equal(result.message, "Admin: remove 1 product");
  const restored = applyAdminAction(result, { type: "restore", uid: "x--y" }, deps());
  assert.deepEqual(restored.curation, { removed: [], removedImages: {}, prices: { "a--b": 10 } });
});

/* ------------------------------------------------------------ fake GitHub */

const sha1 = (text) => createHash("sha1").update(text).digest("hex");

function fakeGithub(initialFiles) {
  const repo = {
    head: "c0", n: 0, interfere: 0, commits: { c0: { files: new Map(Object.entries(initialFiles)), parent: null, message: "init" } },
    trees: new Map(), blobs: new Map(), log: [],
  };
  const api = "https://api.github.com/repos/aarahman04/voltex_electricals";
  const files = () => repo.commits[repo.head].files;
  const respond = (data, status = 200) => Response.json(data, { status });

  const fetchImpl = async (url, options = {}) => {
    const method = options.method ?? "GET";
    const path = String(url).replace(api, "");
    const body = options.body ? JSON.parse(options.body) : null;
    repo.log.push(`${method} ${path.split("?")[0]}`);
    assert.equal(options.headers.Authorization, "Bearer test-token");

    if (method === "GET" && path === "/git/ref/heads/main") return respond({ object: { sha: repo.head } });
    if (method === "GET" && path.startsWith("/git/commits/")) return respond({ tree: { sha: `t:${path.split("/").pop()}` } });
    if (method === "GET" && path.startsWith("/contents/")) {
      const [file, query] = path.slice("/contents/".length).split("?ref=");
      const tree = repo.commits[query === "main" ? repo.head : query]?.files ?? new Map();
      if (options.headers.Accept === "application/vnd.github.raw+json") {
        const text = tree.get(file);
        return text === undefined ? respond({ message: "Not Found" }, 404) : new Response(text);
      }
      // Metadata: a file object, or a directory's direct children.
      if (tree.has(file)) return respond({ type: "file", path: file });
      const children = [...tree.keys()].filter((p) => p.startsWith(`${file}/`) && !p.slice(file.length + 1).includes("/"));
      return children.length ? respond(children.map((p) => ({ type: "file", path: p }))) : respond({ message: "Not Found" }, 404);
    }
    if (method === "POST" && path === "/git/blobs") {
      const id = sha1(body.content);
      repo.blobs.set(id, body.content);
      return respond({ sha: id }, 201);
    }
    if (method === "POST" && path === "/git/trees") {
      const next = new Map(repo.commits[body.base_tree.slice(2)].files);
      for (const entry of body.tree) {
        if (entry.sha === null) {
          if (!next.delete(entry.path)) return respond({ message: "path not found" }, 422);
        } else if (entry.sha) {
          if (!repo.blobs.has(entry.sha)) return respond({ message: "blob missing" }, 422);
          next.set(entry.path, `blob:${entry.sha}`);
        } else next.set(entry.path, entry.content);
      }
      const id = `tree${++repo.n}`;
      repo.trees.set(id, next);
      return respond({ sha: id }, 201);
    }
    if (method === "POST" && path === "/git/commits") {
      const id = `c${++repo.n}`;
      repo.commits[id] = { files: repo.trees.get(body.tree), parent: body.parents[0], message: body.message };
      return respond({ sha: id }, 201);
    }
    if (method === "PATCH" && path === "/git/refs/heads/main") {
      if (repo.interfere > 0) {
        repo.interfere -= 1;
        const id = `c${++repo.n}`;
        repo.commits[id] = { files: new Map(files()), parent: repo.head, message: "someone else" };
        repo.head = id;
      }
      if (repo.commits[body.sha].parent !== repo.head) return respond({ message: "Update is not a fast forward" }, 422);
      assert.equal(body.force, false);
      repo.head = body.sha;
      return respond({ ok: true });
    }
    throw new Error(`Unexpected GitHub call: ${method} ${path}`);
  };
  return { repo, files, fetchImpl, commitCount: () => Object.keys(repo.commits).length };
}

const webp = (tag) => Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), Buffer.from(tag)]).toString("base64");
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

test("admin API: login, upload, publish, update, price, delete, remove — one commit each", async () => {
  const fetchBefore = global.fetch;
  process.env.CURATE_USERNAME = "test-admin";
  process.env.CURATE_PASSWORD = "test-password";
  process.env.CURATION_GITHUB_TOKEN = "test-token";
  const gh = fakeGithub({
    [ADMIN_PATHS.curation]: json({ removed: [{ uid: "old--one", title: "Old" }], removedImages: {} }),
    [ADMIN_PATHS.products]: json([]),
    [ADMIN_PATHS.taxonomy]: json({ categories: {} }),
  });
  global.fetch = gh.fetchImpl;

  const url = "https://www.voltexelectricals.co.in/api/admin";
  const post = (action, cookie, origin = "https://www.voltexelectricals.co.in") => handler.fetch(new Request(url, {
    method: "POST", headers: { origin, cookie: cookie ?? "", "Content-Type": "application/json" }, body: JSON.stringify(action),
  }));
  const read = (path) => JSON.parse(gh.files().get(path));
  try {
    // auth
    assert.equal((await post({ type: "publish", products: [] })).status, 401);
    assert.equal((await post({ type: "login", username: "test-admin", password: "wrong" })).status, 401);
    const login = await post({ type: "login", username: "test-admin", password: "test-password" });
    assert.equal(login.status, 200);
    assert.match(login.headers.get("set-cookie"), /HttpOnly; Secure; SameSite=Strict; Path=\/api;/);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    assert.equal((await post({ type: "publish", products: [] }, cookie, "https://other.example")).status, 403);

    // reads
    assert.deepEqual(await (await handler.fetch(new Request(url))).json(), { authenticated: false });
    assert.deepEqual(await (await handler.fetch(new Request(`${url}?ids`))).json(), { removed: [{ uid: "old--one" }] });
    const snapshot = await (await handler.fetch(new Request(url, { headers: { cookie } }))).json();
    assert.equal(snapshot.authenticated, true);
    assert.deepEqual(snapshot.products, []);

    // upload: only WebP, becomes a blob but not a commit
    assert.equal((await post({ type: "upload", data: Buffer.from("not an image").toString("base64") }, cookie)).status, 400);
    assert.equal((await post({ type: "upload", data: "***" }, cookie)).status, 400);
    const commitsBeforeUpload = gh.commitCount();
    const first = await (await post({ type: "upload", data: webp("one") }, cookie)).json();
    const second = await (await post({ type: "upload", data: webp("two") }, cookie)).json();
    assert.match(first.blobSha, /^[0-9a-f]{40}$/);
    assert.equal(gh.commitCount(), commitsBeforeUpload);

    // publish: a single commit with the JSON files and both photos
    const published = await post({ type: "publish", products: [{
      title: "Crystal Chandelier", brand: null, category: "Decor", subcategory: "Wall Art", tags: ["crystal"],
      color: "Gold", model: null, price: 18500, images: [{ blobSha: first.blobSha }, { blobSha: second.blobSha }],
    }] }, cookie);
    assert.equal(published.status, 200);
    const body = await published.json();
    assert.equal(body.changed, true);
    assert.match(body.created[0].uid, /^admin--[a-z0-9]{6}$/);
    assert.equal(gh.commitCount(), commitsBeforeUpload + 1);
    assert.equal(gh.repo.commits[gh.repo.head].message, "Admin: add 1 product");
    const [product] = read(ADMIN_PATHS.products);
    assert.equal(product.id, body.created[0].id);
    assert.deepEqual(read(ADMIN_PATHS.taxonomy), { categories: { Decor: ["Wall Art"] } });
    assert.equal(product.images.length, 2);
    for (const image of product.images) assert.match(gh.files().get(`public${image}`), /^blob:[0-9a-f]{40}$/);
    assert.deepEqual(read(ADMIN_PATHS.curation).removed, [{ uid: "old--one", title: "Old" }]);

    // update: brand later, one photo dropped
    const commitsBeforeUpdate = gh.commitCount();
    const updated = await post({ type: "update", id: product.id, fields: { brand: "philips", model: "CH-1" }, images: [product.images[0]] }, cookie);
    assert.equal(updated.status, 200);
    assert.equal(gh.commitCount(), commitsBeforeUpdate + 1);
    assert.equal(read(ADMIN_PATHS.products)[0].brand, "philips");
    assert.equal(gh.files().has(`public${product.images[1]}`), false);
    assert.equal(gh.files().has(`public${product.images[0]}`), true);

    // price on a scraped product lands in curation.json
    assert.equal((await post({ type: "price", uid: "havells--fan-1", price: 2500 }, cookie)).status, 200);
    assert.deepEqual(read(ADMIN_PATHS.curation).prices, { "havells--fan-1": 2500 });
    assert.equal((await post({ type: "price", uid: "havells--fan-1", price: 1.5 }, cookie)).status, 400);

    // no-op writes make no commit
    const commitsBeforeNoop = gh.commitCount();
    assert.equal((await (await post({ type: "price", uid: "havells--fan-1", price: 2500 }, cookie)).json()).changed, false);
    assert.equal(gh.commitCount(), commitsBeforeNoop);

    // existing curation actions still work through the same endpoint
    assert.equal((await post({ type: "remove", items: [{ uid: "brand--one", title: "One" }] }, cookie)).status, 200);
    assert.deepEqual(read(ADMIN_PATHS.curation).removed.map((i) => i.uid), ["old--one", "brand--one"]);
    assert.equal((await post({ type: "restore", uid: "brand--one" }, cookie)).status, 200);

    // a lost race is retried on the new head
    gh.repo.interfere = 1;
    assert.equal((await post({ type: "price", uid: `admin--${product.id}`, price: 20000 }, cookie)).status, 200);
    assert.equal(read(ADMIN_PATHS.products)[0].price, 20000);
    gh.repo.interfere = 3;
    assert.equal((await post({ type: "price", uid: `admin--${product.id}`, price: 21000 }, cookie)).status, 409);

    // delete removes the record and its remaining photo
    assert.equal((await post({ type: "delete", ids: [product.id] }, cookie)).status, 200);
    assert.deepEqual(read(ADMIN_PATHS.products), []);
    assert.equal(gh.files().has(`public${product.images[0]}`), false);

    // a photo file already missing from the repo doesn't block update or delete
    const third = await (await post({ type: "upload", data: webp("three") }, cookie)).json();
    const fourth = await (await post({ type: "upload", data: webp("four") }, cookie)).json();
    const again = await (await post({ type: "publish", products: [{
      title: "Lamp", brand: null, category: "Lighting", subcategory: "Table Lamps", images: [{ blobSha: third.blobSha }, { blobSha: fourth.blobSha }],
    }] }, cookie)).json();
    const [lamp] = again.products;
    gh.files().delete(`public${lamp.images[1]}`); // someone removed the file by hand
    const trimmed = await post({ type: "update", id: lamp.id, fields: {}, images: [lamp.images[0]] }, cookie);
    assert.equal(trimmed.status, 200);
    assert.deepEqual(read(ADMIN_PATHS.products)[0].images, [lamp.images[0]]);
    gh.files().delete(`public${lamp.images[0]}`);
    assert.equal((await post({ type: "delete", ids: [lamp.id] }, cookie)).status, 200);
    assert.deepEqual(read(ADMIN_PATHS.products), []);

    // invalid input is a 400, not a 502
    assert.equal((await post({ type: "publish", products: [{ title: "", category: "Fans", subcategory: "Ceiling Fans", images: [] }] }, cookie)).status, 400);
    assert.equal((await post({ type: "update", id: "ghost", fields: { price: 5 } }, cookie)).status, 400);
    assert.equal((await post({ type: "remove", items: [{ uid: "x".repeat(513), title: "Too long" }] }, cookie)).status, 400);

    // the old CURATE_* names and the new ADMIN_* names both work; ADMIN_* wins
    process.env.ADMIN_PASSWORD = "other-password";
    assert.equal((await post({ type: "login", username: "test-admin", password: "test-password" })).status, 401);
    assert.equal((await post({ type: "login", username: "test-admin", password: "other-password" })).status, 200);
  } finally {
    global.fetch = fetchBefore;
    for (const name of ["CURATE_USERNAME", "CURATE_PASSWORD", "CURATION_GITHUB_TOKEN", "ADMIN_PASSWORD"]) delete process.env[name];
  }
});

/* ------------------------------------------------------------- photo prep */

import { FALLBACK_EDGES, MAX_BYTES, MAX_EDGE, QUALITY_STEPS, fitUnderCeiling, isWebp, prepare } from "../src/lib/admin/resizeImage.js";

const webpBlob = (size, type = "image/webp") => new Blob([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), Buffer.alloc(Math.max(0, size - 12))], { type });
const sized = (size) => ({ size });

test("photo ceiling matches the upload endpoint: 3,000,000 bytes, base64 body under 4.2 MB", () => {
  assert.ok(MAX_BYTES <= 3_000_000);
  assert.ok(Math.ceil(MAX_BYTES / 3) * 4 + 1000 < 4_200_000);
  assert.equal(MAX_EDGE, 2000);
  assert.ok(QUALITY_STEPS.every((q, i) => i === 0 || q < QUALITY_STEPS[i - 1]), "quality steps go down");
});

test("fitUnderCeiling keeps the best settings when the photo already fits", async () => {
  const tried = [];
  const out = await fitUnderCeiling(async (edge, quality) => { tried.push([edge, quality]); return sized(MAX_BYTES); });
  assert.equal(out.size, MAX_BYTES);
  assert.deepEqual(tried, [[MAX_EDGE, QUALITY_STEPS[0]]]);
});

test("fitUnderCeiling lowers quality first, then the edge, and stops at the first fit", async () => {
  const tried = [];
  // Too big until the edge drops to 1600.
  const out = await fitUnderCeiling(async (edge, quality) => { tried.push([edge, quality]); return sized(edge > 1600 ? MAX_BYTES + 1 : 1000); });
  assert.equal(out.size, 1000);
  const lowest = QUALITY_STEPS.at(-1);
  assert.deepEqual(tried, [...QUALITY_STEPS.map((q) => [MAX_EDGE, q]), [1600, lowest]]);

  const early = [];
  await fitUnderCeiling(async (edge, quality) => { early.push([edge, quality]); return sized(quality > QUALITY_STEPS[1] ? MAX_BYTES + 1 : 10); });
  assert.deepEqual(early, [[MAX_EDGE, QUALITY_STEPS[0]], [MAX_EDGE, QUALITY_STEPS[1]]]);
});

test("fitUnderCeiling gives up with a plain message after every step, never returning an oversized photo", async () => {
  let calls = 0;
  await assert.rejects(fitUnderCeiling(async () => { calls += 1; return sized(MAX_BYTES + 1); }), /too large to upload/);
  assert.equal(calls, QUALITY_STEPS.length + FALLBACK_EDGES.length);
});

test("prepare returns WebP bytes, retyping a blob that lost its type", async () => {
  assert.equal(await isWebp(webpBlob(100)), true);
  const out = await prepare({}, async () => webpBlob(500, ""));
  assert.equal(out.type, "image/webp");
  assert.equal(out.size, 500);
});

test("prepare refuses a PNG or JPEG answer to a WebP request instead of uploading it", async () => {
  const png = new Blob([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0, 0])], { type: "image/png" });
  const jpeg = new Blob([Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0])], { type: "image/webp" }); // lying type
  const tiny = new Blob([Buffer.from("RIFF")], { type: "image/webp" });
  for (const bad of [png, jpeg, tiny]) await assert.rejects(prepare({}, async () => bad), /can't prepare photos/);
});

test("prepare passes the shrinking options to the encoder and retries until the photo fits", async () => {
  const seen = [];
  const out = await prepare({}, async (_file, options) => { seen.push(options); return webpBlob(options.quality > 0.7 ? MAX_BYTES + 1 : 2000); });
  assert.deepEqual(seen.map((o) => [o.maxWidth, o.maxHeight, o.quality]), [[2000, 2000, 0.8], [2000, 2000, 0.74], [2000, 2000, 0.68]]);
  assert.equal(out.size, 2000);
});

/* ------------------------------------------------- chandeliers in the selects */

// /admin's Brand and Category selects are built from getBrands() and
// getCategories(), which read the catalogue. These check the inputs those
// read: the Voltex Exclusive manifest, the brand roster and the published list.
test("Chandeliers and Voltex Exclusive are offered in /admin's selects", async () => {
  const { readFileSync } = await import("node:fs");
  const { BRANDS, resolveBrand } = await import("../src/data/brands.js");
  // taxonomy.js imports JSON without an import attribute (Vite-only), so read it as text.
  const taxonomy = readFileSync(new URL("../src/data/taxonomy.js", import.meta.url), "utf8");
  const PUBLISHED = JSON.parse(taxonomy.match(/export const PUBLISHED = (\[.*?\]);/)[1]);
  const chandelierTypes = taxonomy.match(/Chandeliers: \[([^\]]*)\]/)[1];
  const manifest = JSON.parse(readFileSync(new URL("../Products/voltex-exclusive/catalog.json", import.meta.url)));
  const brand = BRANDS.find((b) => b.slug === "voltex-exclusive");
  assert.ok(brand && !brand.hidden, "Voltex Exclusive is a visible brand");
  assert.equal(resolveBrand("Voltex Exclusive", "voltex-exclusive").slug, "voltex-exclusive");
  assert.ok(manifest.some((p) => p.category === "Chandeliers"), "the manifest gives Chandeliers products");
  assert.ok(PUBLISHED.includes("Chandeliers"));
  for (const p of manifest.filter((r) => r.category === "Chandeliers")) assert.ok(chandelierTypes.includes(`"${p.type}"`), p.type);
});

test("the Voltex Exclusive manifest holds only neutral fields", async () => {
  const { readFileSync } = await import("node:fs");
  const text = readFileSync(new URL("../Products/voltex-exclusive/catalog.json", import.meta.url), "utf8");
  assert.doesNotMatch(text, /[㐀-鿿]/, "no CJK text");
  assert.doesNotMatch(text, /\bALE|\bLP\s?\d|\.jpg/i, "no supplier codes, list prices or source file names");
  for (const row of JSON.parse(text)) {
    assert.deepEqual(Object.keys(row).sort(), ["category", "code", "finish", "images", "room", "title", "type"]);
    assert.match(row.code, /^VX-(CH|WL)-\d{4}$/);
  }
});
