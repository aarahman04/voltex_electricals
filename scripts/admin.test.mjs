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
      assert.equal(options.headers.Accept, "application/vnd.github.raw+json");
      const text = repo.commits[query === "main" ? repo.head : query]?.files.get(file);
      return text === undefined ? respond({ message: "Not Found" }, 404) : new Response(text);
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
