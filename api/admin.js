import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import {
  ADMIN_PATHS, AdminInputError, applyAdminAction, emptyCuration, emptyProducts, emptyTaxonomy, serialize,
} from "../src/data/adminActions.js";

const repoApi = "https://api.github.com/repos/aarahman04/voltex_electricals";
const branch = "main";
const cookieName = "voltex_admin";
const sessionSeconds = 7 * 24 * 60 * 60;
const MAX_BODY = 100_000;
const MAX_UPLOAD_BODY = 4_200_000; // Vercel Functions cap request bodies at 4.5 MB
const MAX_UPLOAD_BYTES = 3_000_000;

// ADMIN_* wins; the CURATE_* names the old /curate tool used keep working so
// the existing Vercel env vars need no change.
const env = (name) => process.env[`ADMIN_${name}`] ?? process.env[`CURATE_${name}`];

function reply(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function same(a, b) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

function signature(expires) {
  return createHmac("sha256", env("PASSWORD")).update(expires).digest("base64url");
}

function authenticated(request) {
  if (!env("PASSWORD")) return false;
  const value = request.headers.get("cookie")?.split("; ").find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  const [expires, digest] = value?.split(".") ?? [];
  return Boolean(expires && digest && Number(expires) > Date.now() && same(digest, signature(expires)));
}

/* ------------------------------------------------------------------ GitHub */

class GithubError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function github(path, { method = "GET", body, raw = false } = {}) {
  const headers = { Accept: raw ? "application/vnd.github.raw+json" : "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  const token = process.env.CURATION_GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";
  return fetch(`${repoApi}${path}`, { method, headers, body: body && JSON.stringify(body), cache: "no-store" });
}

async function githubJson(path, options) {
  const response = await github(path, options);
  if (!response.ok) throw new GithubError(`GitHub ${options?.method ?? "GET"} ${path} failed: ${response.status}`, response.status);
  return response.json();
}

async function readJsonFile(path, ref, fallback) {
  const response = await github(`/contents/${path}?ref=${ref}`, { raw: true });
  if (response.status === 404) return fallback;
  if (!response.ok) throw new GithubError(`GitHub read ${path} failed: ${response.status}`, response.status);
  return JSON.parse(await response.text());
}

// Everything the reducer needs, read at one commit so the three files agree.
async function snapshot() {
  const ref = await githubJson(`/git/ref/heads/${branch}`);
  const head = ref.object.sha;
  const commit = await githubJson(`/git/commits/${head}`);
  const [curation, products, taxonomy] = await Promise.all([
    readJsonFile(ADMIN_PATHS.curation, head, emptyCuration()),
    readJsonFile(ADMIN_PATHS.products, head, emptyProducts()),
    readJsonFile(ADMIN_PATHS.taxonomy, head, emptyTaxonomy()),
  ]);
  return { head, tree: commit.tree.sha, state: { curation, products, taxonomy } };
}

// One commit holding every changed file. Returns false when the ref moved
// underneath us (someone else saved first) so the caller can retry.
async function commit(snap, result) {
  const entries = [];
  for (const key of ["curation", "products", "taxonomy"]) {
    if (JSON.stringify(result[key]) !== JSON.stringify(snap.state[key])) {
      entries.push({ path: ADMIN_PATHS[key], mode: "100644", type: "blob", content: serialize(result[key]) });
    }
  }
  for (const file of result.files.add) entries.push({ path: file.path, mode: "100644", type: "blob", sha: file.blobSha });
  for (const path of result.files.delete) entries.push({ path, mode: "100644", type: "blob", sha: null });
  if (!entries.length) return "unchanged";

  const tree = await githubJson("/git/trees", { method: "POST", body: { base_tree: snap.tree, tree: entries } });
  const created = await githubJson("/git/commits", { method: "POST", body: { message: result.message, tree: tree.sha, parents: [snap.head] } });
  const update = await github(`/git/refs/heads/${branch}`, { method: "PATCH", body: { sha: created.sha, force: false } });
  if (update.status === 422 || update.status === 409) return "conflict";
  if (!update.ok) throw new GithubError(`GitHub ref update failed: ${update.status}`, update.status);
  return "committed";
}

/* ------------------------------------------------------------------ handler */

const isWebp = (bytes) => bytes.length > 12 && bytes.toString("latin1", 0, 4) === "RIFF" && bytes.toString("latin1", 8, 12) === "WEBP";

async function upload(action) {
  if (typeof action.data !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(action.data)) throw new AdminInputError("Invalid photo");
  const bytes = Buffer.from(action.data, "base64");
  if (bytes.length > MAX_UPLOAD_BYTES) throw new AdminInputError("Invalid photo: too large");
  if (!isWebp(bytes)) throw new AdminInputError("Invalid photo: expected a WebP image");
  const blob = await githubJson("/git/blobs", { method: "POST", body: { content: action.data, encoding: "base64" } });
  return blob.sha;
}

const view = ({ curation, products, taxonomy }) => ({ authenticated: true, curation, products, taxonomy });

export default {
  async fetch(request) {
    if (request.method === "GET") {
      try {
        if (new URL(request.url).searchParams.has("ids")) {
          const curation = await readJsonFile(ADMIN_PATHS.curation, branch, emptyCuration());
          return reply({ removed: curation.removed.map((item) => ({ uid: item.uid })) });
        }
        if (!authenticated(request)) return reply({ authenticated: false });
        return reply(view((await snapshot()).state));
      } catch (error) {
        console.error(error);
        return reply({ error: "Admin is temporarily unavailable" }, 502);
      }
    }
    if (request.method !== "POST") return reply({ error: "Method not allowed" }, 405, { Allow: "GET, POST" });

    const origin = request.headers.get("origin");
    try {
      if (origin && new URL(origin).origin !== new URL(request.url).origin) return reply({ error: "Invalid origin" }, 403);
    } catch {
      return reply({ error: "Invalid origin" }, 403);
    }
    let action;
    try {
      if (Number(request.headers.get("content-length")) > MAX_UPLOAD_BODY) throw new Error("Request too large");
      const body = await request.text();
      if (body.length > MAX_UPLOAD_BODY) throw new Error("Request too large");
      action = JSON.parse(body);
      if (!action || typeof action !== "object" || Array.isArray(action)) throw new Error("Invalid request");
      if (action.type !== "upload" && body.length > MAX_BODY) throw new Error("Request too large");
    } catch {
      return reply({ error: "Invalid request" }, 400);
    }

    if (action.type === "login") {
      if (!env("USERNAME") || !env("PASSWORD")) return reply({ error: "Admin login is not configured" }, 503);
      if (typeof action.username !== "string" || typeof action.password !== "string" ||
          action.username.length > 200 || action.password.length > 200 ||
          !same(action.username, env("USERNAME")) || !same(action.password, env("PASSWORD"))) {
        return reply({ error: "Incorrect username or password" }, 401);
      }
      const expires = String(Date.now() + sessionSeconds * 1000);
      return reply({ ok: true }, 200, {
        "Set-Cookie": `${cookieName}=${expires}.${signature(expires)}; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=${sessionSeconds}`,
      });
    }
    if (action.type === "logout") {
      return reply({ ok: true }, 200, { "Set-Cookie": `${cookieName}=; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=0` });
    }
    if (!authenticated(request)) return reply({ error: "Sign in to use admin" }, 401);
    if (!process.env.CURATION_GITHUB_TOKEN) return reply({ error: "Live admin is not configured" }, 503);

    try {
      if (action.type === "upload") return reply({ ok: true, blobSha: await upload(action) });

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const snap = await snapshot();
        const result = applyAdminAction(snap.state, action);
        const outcome = await commit(snap, result);
        if (outcome === "conflict") continue;
        return reply({ ok: true, changed: outcome === "committed", created: result.created, ...view(result) });
      }
      return reply({ error: "Another edit was saved at the same moment. Please try again." }, 409);
    } catch (error) {
      if (error instanceof AdminInputError || error.message?.startsWith("Invalid")) return reply({ error: error.message }, 400);
      console.error(error);
      return reply({ error: "Could not save. If you just added photos, add them again and retry." }, 502);
    }
  },
};
