// Run with: node --test src/lib/admin/product.test.js
import assert from "node:assert/strict";
import { blankProduct, productFields } from "./product.js";

const product = { ...blankProduct(), title: " Chandelier ", category: "Lighting", subcategory: "Chandeliers", images: [new Blob(["photo"])], price: "2500" };
assert.equal(productFields(product).price, 2500);
assert.equal(productFields(product).title, "Chandelier");
assert.equal(productFields(product).brand, null);
assert.equal(productFields({ ...product, price: "" }).price, null);
for (const price of ["2.5", "-1", "0", "10000001", "hello"]) assert.throws(() => productFields({ ...product, price }));
assert.throws(() => productFields({ ...product, title: " " }));
assert.throws(() => productFields({ ...product, images: [] }));
assert.throws(() => productFields({ ...product, images: Array(13).fill("photo") }));
