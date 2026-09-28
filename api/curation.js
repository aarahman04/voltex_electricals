import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { updateCuration } from "../src/data/curationActions.js";

const githubUrl = "https://api.github.com/repos/aarahman04/voltex_electricals/contents/Products/curation.json";
const branch = "main";
const cookieName = "voltex_curator";
const sessionSeconds = 7 * 24 * 60 * 60;

function reply(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function same(a, b) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

function signature(expires) {
  return createHmac("sha256", process.env.CURATE_PASSWORD).update(expires).digest("base64url");
}

function authenticated(request) {
  if (!process.env.CURATE_PASSWORD) return false;
  const value = request.headers.get("cookie")?.split("; ").find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  const [expires, digest] = value?.split(".") ?? [];
  return Boolean(expires && digest && Number(expires) > Date.now() && same(digest, signature(expires)));
}

async function github(method, body) {
  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (process.env.CURATION_GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.CURATION_GITHUB_TOKEN}`;
  if (body) headers["Content-Type"] = "application/json";
  return fetch(`${githubUrl}${method === "GET" ? `?ref=${branch}` : ""}`, {
    method, headers, body: body && JSON.stringify(body), cache: "no-store",
  });
}

async function readCuration() {
  const response = await github("GET");
  if (!response.ok) throw new Error(`GitHub read failed: ${response.status}`);
  const file = await response.json();
  return { sha: file.sha, data: JSON.parse(Buffer.from(file.content.replace(/\s/g, ""), "base64").toString("utf8")) };
}

export default {
  async fetch(request) {
    if (request.method === "GET") {
      try {
        const { data } = await readCuration();
        if (new URL(request.url).searchParams.has("ids")) {
          return reply({ removed: data.removed.map((item) => ({ uid: item.uid })) });
        }
        return reply({ ...data, authenticated: authenticated(request) });
      } catch (error) {
        console.error(error);
        return reply({ error: "Curation is temporarily unavailable" }, 502);
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
      if (Number(request.headers.get("content-length")) > 100_000) throw new Error("Request too large");
      const body = await request.text();
      if (body.length > 100_000) throw new Error("Request too large");
      action = JSON.parse(body);
      if (!action || typeof action !== "object" || Array.isArray(action)) throw new Error("Invalid request");
    } catch {
      return reply({ error: "Invalid request" }, 400);
    }

    if (action.type === "login") {
      if (!process.env.CURATE_USERNAME || !process.env.CURATE_PASSWORD) return reply({ error: "Admin login is not configured" }, 503);
      if (typeof action.username !== "string" || typeof action.password !== "string" ||
          action.username.length > 200 || action.password.length > 200 ||
          !same(action.username, process.env.CURATE_USERNAME) || !same(action.password, process.env.CURATE_PASSWORD)) {
        return reply({ error: "Incorrect username or password" }, 401);
      }
      const expires = String(Date.now() + sessionSeconds * 1000);
      return reply({ ok: true }, 200, {
        "Set-Cookie": `${cookieName}=${expires}.${signature(expires)}; HttpOnly; Secure; SameSite=Strict; Path=/api/curation; Max-Age=${sessionSeconds}`,
      });
    }
    if (action.type === "logout") {
      return reply({ ok: true }, 200, { "Set-Cookie": `${cookieName}=; HttpOnly; Secure; SameSite=Strict; Path=/api/curation; Max-Age=0` });
    }
    if (!authenticated(request)) return reply({ error: "Sign in to curate products" }, 401);
    if (!process.env.CURATION_GITHUB_TOKEN) return reply({ error: "Live curation is not configured" }, 503);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const { sha, data } = await readCuration();
        const next = updateCuration(data, action);
        if (JSON.stringify(next) === JSON.stringify(data)) return reply({ ...next, authenticated: true, ok: true });
        const response = await github("PUT", {
          message: `Curate products: ${action.type}`,
          content: Buffer.from(`${JSON.stringify(next, null, 2)}\n`).toString("base64"),
          sha,
          branch,
        });
        if (response.status === 409) continue;
        if (!response.ok) throw new Error(`GitHub write failed: ${response.status}`);
        return reply({ ...next, authenticated: true, ok: true });
      } catch (error) {
        if (error.message.startsWith("Invalid")) return reply({ error: error.message }, 400);
        console.error(error);
        return reply({ error: "Could not save curation" }, 502);
      }
    }
    return reply({ error: "Another edit was saved. Please try again." }, 409);
  },
};
