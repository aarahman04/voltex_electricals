import { TONES } from "./kelvin.js";

const TONE_NAMES = new Set(TONES.map((t) => t.name));

// The catalogue writes the same sweep four ways: "1200MM", "1200mm",
// "1200 MM". They are one value.
export function normalizeOption(value) {
  return String(value).replace(/\s+/g, "").toUpperCase();
}

function distinct(product, key) {
  const values = new Map();
  for (const v of product.variants ?? []) {
    const value = v.options?.[key];
    if (!value || value === "Default Title") continue;
    values.set(normalizeOption(value), value);
  }
  return [...values.values()];
}

function plural(count, noun) {
  const suffix = /(?:s|sh|ch|x|z)$/.test(noun) ? "es" : "s";
  return `${count} ${noun}${count === 1 ? "" : suffix}`;
}

// Marketing runs after a pipe: "Ecotech Swift BLDC Ceiling Fan | 5 Star |
// Powerful Airflow 380 CMM". The model name is the part before it.
export function displayTitle(product) {
  return String(product?.title ?? "")
    .split("|")[0]
    .trim();
}

// What a model offers, in the catalogue's own units. Replaces price as the
// card's second line: sweep and finish for fans, wattage and tone for
// lighting.
export function specSummary(product) {
  const parts = [];

  const wattage = distinct(product, "Wattage");
  if (wattage.length > 1) parts.push(plural(wattage.length, "wattage"));

  const size = distinct(product, "Size");
  if (size.length > 1) {
    parts.push(
      product.category === "Fans"
        ? plural(size.length, "sweep")
        : plural(size.length, "size"),
    );
  } else if (size.length === 1) {
    parts.push(normalizeOption(size[0]));
  }

  const colors = distinct(product, "Color");
  if (colors.length > 1) {
    const allTones = colors.every((c) => TONE_NAMES.has(c));
    parts.push(plural(colors.length, allTones ? "tone" : "finish"));
  } else if (colors.length === 1 && parts.length === 0) {
    parts.push(colors[0]);
  }

  return parts.slice(0, 2).join(" · ");
}
