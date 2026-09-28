import assert from "node:assert/strict";
import test from "node:test";
import handler from "../api/curation.js";

test("admin removes selected products and preserves existing curation", async () => {
  const fetchBefore = global.fetch;
  process.env.CURATE_USERNAME = "test-admin";
  process.env.CURATE_PASSWORD = "test-password";
  process.env.CURATION_GITHUB_TOKEN = "test-token";
  let saved = { removed: [{ uid: "old--one", title: "Old" }], removedImages: { "old--one": ["https://example.com/old.png"] } };
  let sha = "initial";
  global.fetch = async (_url, options) => {
    if (options.method === "GET") return Response.json({ sha, content: Buffer.from(JSON.stringify(saved)).toString("base64") });
    assert.equal(options.headers.Authorization, "Bearer test-token");
    const body = JSON.parse(options.body);
    assert.equal(body.sha, sha);
    saved = JSON.parse(Buffer.from(body.content, "base64").toString());
    sha = "next";
    return Response.json({ ok: true });
  };

  const url = "https://www.voltexelectricals.co.in/api/curation";
  const post = (action, cookie, origin = "https://www.voltexelectricals.co.in") => handler.fetch(new Request(url, {
    method: "POST", headers: { origin, cookie: cookie ?? "", "Content-Type": "application/json" }, body: JSON.stringify(action),
  }));
  try {
    assert.equal((await post({ type: "remove", items: [] })).status, 401);
    assert.equal((await post({ type: "login", username: "test-admin", password: "wrong" })).status, 401);
    const login = await post({ type: "login", username: "test-admin", password: "test-password" });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    assert.match(login.headers.get("set-cookie"), /HttpOnly; Secure; SameSite=Strict/);
    assert.equal((await post({ type: "remove", items: [] }, cookie, "https://other.example")).status, 403);

    const result = await post({ type: "remove", items: [
      { uid: "brand--one", title: "One" }, { uid: "brand--two", title: "Two" },
    ] }, cookie);
    assert.equal(result.status, 200);
    assert.equal((await result.json()).authenticated, true);
    assert.deepEqual(saved.removed.map((item) => item.uid), ["old--one", "brand--one", "brand--two"]);
    assert.deepEqual(saved.removedImages, { "old--one": ["https://example.com/old.png"] });
    const live = await handler.fetch(new Request(url));
    assert.deepEqual((await live.json()).removed, saved.removed);
    assert.equal((await post({ type: "remove", items: [{ uid: "brand--one", title: "One" }] }, cookie)).status, 200);
    assert.equal(saved.removed.length, 3);
    assert.equal((await post({ type: "images", uid: "brand--two", urls: ["https://example.com/two.png"] }, cookie)).status, 200);
    assert.deepEqual(saved.removedImages["brand--two"], ["https://example.com/two.png"]);
    assert.equal((await post({ type: "images", uid: "brand--two", urls: [] }, cookie)).status, 200);
    assert.equal(saved.removedImages["brand--two"], undefined);
    assert.equal((await post({ type: "restore", uid: "brand--one" }, cookie)).status, 200);
    assert.deepEqual(saved.removed.map((item) => item.uid), ["old--one", "brand--two"]);

    const longUid = "crompton--crompton-rapidjet-plus-turbo-6-l-5-star-rated-storage-water-heater-with-nano-polybond-technology-powerful-3000w-heating-element-rust-proof-body-and-advanced-3-level-safety-with-free-installation-and-connection-pipes-white";
    assert.equal(longUid.length, 231);
    assert.equal((await post({ type: "remove", items: [{ uid: longUid, title: "Crompton Rapidjet Plus Turbo" }] }, cookie)).status, 200);
    assert.equal((await post({ type: "images", uid: longUid, urls: ["https://example.com/long.png"] }, cookie)).status, 200);
    assert.equal((await post({ type: "restore", uid: longUid }, cookie)).status, 200);
    assert.equal((await post({ type: "remove", items: [{ uid: "x".repeat(513), title: "Too long" }] }, cookie)).status, 400);
  } finally {
    global.fetch = fetchBefore;
    delete process.env.CURATE_USERNAME;
    delete process.env.CURATE_PASSWORD;
    delete process.env.CURATION_GITHUB_TOKEN;
  }
});
