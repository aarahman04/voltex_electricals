// Run with: node scripts/hero.test.mjs
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { heroScenes, heroTiming, advanceHero } from "../src/data/heroScenes.js";

assert.equal(heroScenes.length, 5);
const initial = { scene: 0, phase: "settle", product: 0 };
let frame = initial;
const reveals = [];
const transitions = [];
for (let step = 0; step < 40; step++) {
  if (frame.phase === "reveal") reveals.push(`${frame.scene}:${frame.product}`);
  if (["close", "shrink", "slide", "expand"].includes(frame.phase)) transitions.push(frame.phase);
  frame = advanceHero(frame, heroScenes);
}
assert.deepEqual(frame, initial, "The fifth scene must loop back to the original living room");
assert.deepEqual(reveals, heroScenes.flatMap((scene, i) => scene.items.map((_, j) => `${i}:${j}`)), "Every product must reveal once before its scene exits");
assert.deepEqual(transitions, Array(5).fill(["close", "shrink", "slide", "expand"]).flat(), "Labels close before shrinking, sliding left and expanding");
assert.ok(heroTiming.reveal >= 2000, "Products need at least two seconds to read");

for (const scene of heroScenes) {
  for (const width of [720, 1440]) assert.ok(existsSync(`public/images/${scene.image}-${width}.webp`), `${scene.id}: missing responsive image`);
  for (const item of scene.items) {
    const [brand, id] = item.uid.split("--");
    const category = item.type === "Water geyser" ? "water-geysers" : /light|lamp/i.test(item.type) ? "lighting" : "fans";
    const products = JSON.parse(readFileSync(`Products/normalized/${brand}/${category}.lite.json`, "utf8"));
    assert.ok(products.some((product) => product.id === id), `Broken product link: ${item.uid}`);
    assert.ok(item.x > 0 && item.x < 100 && item.y > 0 && item.y < 100, `Hotspot outside ${scene.id}`);
  }
}
// A curated-out product should not strand the timeline on that scene.
assert.equal(advanceHero({ scene: 0, phase: "reveal", product: 0 }, [{ items: [] }]).phase, "close");
console.log("Hero checks passed: five scenes, fifteen product links, ordered reveals and seamless wraparound.");
