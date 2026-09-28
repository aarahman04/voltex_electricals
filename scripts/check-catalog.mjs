import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const root = new URL("../Products/normalized/", import.meta.url);
let count = 0;
const published = new Set();
for (const brand of readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  for (const file of readdirSync(new URL(`${brand.name}/`, root)).filter((name) => name.endsWith(".json") && !name.endsWith(".lite.json"))) {
    const full = JSON.parse(readFileSync(new URL(`${brand.name}/${file}`, root)));
    const lite = JSON.parse(readFileSync(new URL(`${brand.name}/${file.replace(/\.json$/, ".lite.json")}`, root)));
    assert.deepEqual(full.map((p) => p.id), lite.map((p) => p.id));
    assert.deepEqual(full.map((p) => p.images?.primary), lite.map((p) => p.images?.primary));
    if (brand.name === "ao-smith") {
      for (const product of full) assert.match(product.images.primary, /^https:\/\/www\.aosmithindia\.com\/wp-content\/uploads\//);
    }
    for (const product of full) published.add(`${brand.name}--${product.id}`);
    count += full.length;
  }
}
assert.ok(count > 0);
const removed = JSON.parse(readFileSync(new URL("../Products/curation.json", import.meta.url))).removed;
for (const product of removed) assert.ok(!published.has(product.uid), `${product.uid} is still published`);
console.log(`${count} products match between the storefront and /curate`);
