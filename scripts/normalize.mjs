/**
 * Voltex data ETL — `npm run data:build`
 *
 * Reads the raw brand datasets in Products/<brand>/ (three incompatible
 * schemas) and writes one normalized shape the app can load:
 *
 *   Products/normalized/<brand>/fans.json
 *   Products/normalized/<brand>/lighting.json   (published — catalog.js globs these)
 *   Products/normalized/_parked.json            (non-core: appliances, pumps, kitchen)
 *   Products/normalized/report.md               (what happened, for review)
 *
 * Node only, zero dependencies, idempotent. Prices are normalized and kept
 * on the record but the app never renders them (decision D4).
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "Products");
const OUT = join(SRC, "normalized");

/* ------------------------------------------------------------------ config */

const BRANDS = [
  { slug: "orient", name: "Orient Electric", schema: "A", dir: "orient" },
  { slug: "atomberg", name: "Atomberg", schema: "B", dir: "atomberg", raw: "atomberg_all_products_raw.json" },
  { slug: "crompton", name: "Crompton", schema: "B", dir: "crompton", raw: "crompton_all_products_raw.json" },
  { slug: "philips", name: "Philips", schema: "B", dir: "philips", raw: "philips_all_products_raw.json" },
  { slug: "havells", name: "Havells", schema: "C", dir: "havells_output", csv: ["havells_fans.csv", "havells_lighting.csv"] },
  { slug: "polycab", name: "Polycab", schema: "C", dir: "polycab_output", csv: ["polycab_fans.csv", "polycab_lighting.csv"] },
];

// Schema B: product_type (lowercased) -> [category, subcategory].
// Anything not listed is parked with reason `type:<product_type>`.
const TYPE_MAP = {
  // --- fans
  "ceiling fans": ["Fans", "Ceiling Fans"],
  "best energy-efficient fans in sri lanka": ["Fans", "Ceiling Fans"], // SEO title leaked into product_type
  "exhaust fans": ["Fans", "Exhaust Fans"],
  "wall fans": ["Fans", "Wall Fans"],
  "wall mounted fans": ["Fans", "Wall Fans"],
  "pedestal fans": ["Fans", "Pedestal Fans"],
  "table fans": ["Fans", "Table Fans"],
  "personal fan": ["Fans", "Table Fans"],
  "personal fans": ["Fans", "Table Fans"],
  // --- lighting
  "ceiling light": ["Lighting", "Ceiling Lights"],
  "ceiling lights": ["Lighting", "Ceiling Lights"],
  "intellisense lights": ["Lighting", "Smart Lighting"],
  "smart light": ["Lighting", "Smart Lighting"],
  "bulbs": ["Lighting", "LED Bulbs & Lamps"],
  "light bulb": ["Lighting", "LED Bulbs & Lamps"],
  "led lamps": ["Lighting", "LED Bulbs & Lamps"],
  "outdoor lights": ["Lighting", "Street & Outdoor Lights"],
  "professional outdoor lighting": ["Lighting", "Street & Outdoor Lights"],
  "professional outdoor": ["Lighting", "Street & Outdoor Lights"],
  "professional high mast & poles": ["Lighting", "Street & Outdoor Lights"],
  "professional indoor commercial": ["Lighting", "Professional & Commercial Lighting"],
  "professional industry": ["Lighting", "Professional & Commercial Lighting"],
  "battens": ["Lighting", "Battens"],
  "battens tube lights": ["Lighting", "Battens"],
  "tube light": ["Lighting", "Battens"],
  "led torch": ["Lighting", "Portable Lighting"],
  "emergency light": ["Lighting", "Portable Lighting"],
  "rope and strip lights": ["Lighting", "Strip & Rope Lights"],
  "strip light": ["Lighting", "Strip & Rope Lights"],
  "rope light": ["Lighting", "Strip & Rope Lights"],
  "light strip": ["Lighting", "Strip & Rope Lights"],
  "wall light": ["Lighting", "Wall Lights"],
  "bathroom light": ["Lighting", "Wall Lights"],
  "picture light": ["Lighting", "Wall Lights"],
  "wall washer": ["Lighting", "Wall Lights"],
  "step light": ["Lighting", "Wall Lights"],
  "surface light": ["Lighting", "Wall Lights"],
  "pendant light": ["Lighting", "Pendant Lights"],
  "chandelier": ["Lighting", "Chandeliers"],
  "magnetic track": ["Lighting", "Track Lights"],
  "track light": ["Lighting", "Track Lights"],
  "table lamp": ["Lighting", "Lamps & Lanterns"],
  "floor lamp": ["Lighting", "Lamps & Lanterns"],
  "desk light": ["Lighting", "Lamps & Lanterns"],
  "bed side light": ["Lighting", "Lamps & Lanterns"],
};

// Schema C: raw CSV `category` -> canonical subcategory. Unmapped is auto-adopted.
const SUB_ALIASES = {
  "ceiling fan": "Ceiling Fans",
  "ceiling fans": "Ceiling Fans",
  "ceiling mounting fans": "Ceiling Fans",
  "pedestal & stand fans": "Pedestal Fans",
  "personal & table fans": "Table Fans",
  "decorative & chandelier fans": "Decorative Fans",
  "exhaust fan": "Exhaust Fans",
  "exhaust fans": "Exhaust Fans",
  "wall fan": "Wall Fans",
  "wall fans": "Wall Fans",
  "pedestal fan": "Pedestal Fans",
  "pedestal fans": "Pedestal Fans",
  "table fan": "Table Fans",
  "table fans": "Table Fans",
  "personal fans": "Table Fans",
  "air circulator": "Air Circulators",
  "farrata fan": "Farrata Fans",
  "led bulb": "LED Bulbs & Lamps",
  "led lamps": "LED Bulbs & Lamps",
  "downlight": "Downlighters & Spotlights",
  "led downlighter": "Downlighters & Spotlights",
  "led spotlight": "Downlighters & Spotlights",
  "panel light": "Panel Lights",
  "led panels": "Panel Lights",
  "led batten": "Battens",
  "led battens": "Battens",
  "glamtubes": "Battens",
  "led cob": "COB LED",
  "outdoor lights": "Street & Outdoor Lights",
  "outdoor": "Street & Outdoor Lights",
  "rope and strip lights": "Strip & Rope Lights",
  "ropes and strips": "Strip & Rope Lights",
  "portable lighting": "Portable Lighting",
  "smart lighting": "Smart Lighting",
  "home art light": "Home Art Lights",
};

// Schema B: option-name case fragmentation -> one canonical key.
const OPT_KEY_MAP = {
  watt: "Wattage",
  wattage: "Wattage",
  "light color": "Light Color",
  "light colour": "Light Color",
  "body color": "Body Color",
  "body colour": "Body Color",
  colour: "Color",
  heads: "Head",
  "bulb type": "Bulb Type",
  "bulb base": "Bulb Type",
  base: "Bulb Type",
};

/* ------------------------------------------------------------------ helpers */

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const canonKey = (k) => OPT_KEY_MAP[String(k).trim().toLowerCase()] ?? String(k).trim();

const canonSub = (raw) => {
  if (!raw) return raw;
  return SUB_ALIASES[String(raw).trim().toLowerCase()] ?? String(raw).trim();
};

function htmlToText(html) {
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// Pull <tr><td>label</td><td>value</td></tr> pairs out of an HTML spec table.
function specsFromHtml(html) {
  if (!html || !/<table/i.test(html)) return [];
  const specs = [];
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  for (const row of rows) {
    const cells = (row.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) ?? []).map((c) => htmlToText(c));
    if (cells.length < 2 || !cells[0] || !cells[1] || cells[0].length >= 60) continue;
    const label = cells[0].replace(/[\s:–-]+$/, "").trim();
    const value = cells.slice(1).join(" ").trim();
    if (!label || /^specifications?$/i.test(label) || /^details?$/i.test(value)) continue;
    specs.push({ label, value });
  }
  return specs.slice(0, 40);
}

function parseCsv(text) {
  const rows = [];
  let field = "";
  let record = [];
  let inQuotes = false;
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { record.push(field); field = ""; }
    else if (ch === "\n") { record.push(field); rows.push(record); record = []; field = ""; }
    else field += ch;
  }
  if (field.length || record.length) { record.push(field); rows.push(record); }
  const header = rows.shift().map((h) => h.trim());
  return rows
    .filter((r) => r.length > 1 && r.some((c) => c.trim()))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));
}

const priceInt = (v) => {
  const n = Math.round(Number(String(v ?? "").replace(/[^\d.]/g, "")));
  return Number.isFinite(n) ? n : 0;
};

/* ------------------------------------------------------------------ adapters */

// Schema A — orient. Already the target shape; add quality + specs.
function adaptA(brand, report) {
  const out = [];
  for (const file of ["fans.json", "lighting.json"]) {
    const rows = JSON.parse(readFileSync(join(SRC, brand.dir, file), "utf8"));
    for (const p of rows) {
      out.push({
        ...p,
        subcategory: canonSub(p.subcategory) || p.subcategory,
        rawSubcategory: p.subcategory,
        quality: "rich",
        specs: [],
      });
    }
    report.push(`- ${brand.name}: ${file} -> ${rows.length} products`);
  }
  return { published: out, parked: [] };
}

// Schema B — raw Shopify dump (atomberg, crompton, philips).
function adaptB(brand, report) {
  const rows = JSON.parse(readFileSync(join(SRC, brand.dir, brand.raw), "utf8"));
  const published = [];
  const parked = [];
  const parkTally = {};

  for (const p of rows) {
    const type = String(p.product_type || "").trim();
    const mapped = TYPE_MAP[type.toLowerCase()];

    const optNames = (p.options ?? []).map((o) => canonKey(o.name));
    const variants = (p.variants ?? []).map((v) => {
      const options = {};
      [v.option1, v.option2, v.option3].forEach((val, i) => {
        if (val && val !== "Default Title" && optNames[i]) options[optNames[i]] = val;
      });
      return { options, sku: v.sku ?? null, price: priceInt(v.price) };
    });

    const imgs = (p.images ?? [])
      .map((im) => (typeof im === "string" ? im : im?.src))
      .filter(Boolean);
    const prices = variants.map((v) => v.price).filter((n) => n > 0);

    const record = {
      id: p.handle || slugify(p.title),
      title: p.title,
      vendor: brand.name,
      tags: (p.tags ?? []).filter((t) => !/^(brand_|room_|price_|categories?_|origin_|product_)/i.test(t)),
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0,
      variants: variants.length ? variants : [{ options: {}, sku: null, price: 0 }],
      images: { primary: imgs[0], gallery: imgs },
      sourceUrl: p.handle ? `https://${brand.slug}.com/products/${p.handle}` : undefined,
      description: htmlToText(p.body_html).slice(0, 600),
      specs: specsFromHtml(p.body_html),
      quality: "rich",
    };

    if (mapped) {
      record.category = mapped[0];
      record.subcategory = mapped[1];
      record.rawSubcategory = type;
      // Philips files its COB downlights under product_type "Ceiling light",
      // so TYPE_MAP buried ~17 of them in Ceiling Lights. The brand's own
      // handles and category tags say COB; trust those. Checked here rather
      // than in the shared pass below because `Categories_*` tags are stripped
      // out of the record a few lines up. Scoped to Ceiling Lights so a smart
      // COB stays in Smart Lighting, where it belongs.
      if (record.subcategory === "Ceiling Lights" && isCob(record.id, p.tags)) {
        record.subcategory = "COB LED";
      }
      published.push(record);
    } else {
      record.category = "Parked";
      record.subcategory = type || "Unclassified";
      parked.push(record);
      parkTally[type || "(blank)"] = (parkTally[type || "(blank)"] ?? 0) + 1;
    }
  }

  report.push(`- ${brand.name}: ${rows.length} raw -> ${published.length} published, ${parked.length} parked`);
  const parkedList = Object.entries(parkTally).sort((a, b) => b[1] - a[1]);
  if (parkedList.length) {
    report.push(`  parked types: ${parkedList.map(([k, v]) => `${k} (${v})`).join(", ")}`);
  }
  return { published, parked };
}

// Schema C — CSV only (havells, polycab). Thin: name + image + url.
function adaptC(brand, report) {
  const published = [];
  const adopted = new Set();
  for (const csv of brand.csv) {
    const category = /fan/i.test(csv) ? "Fans" : "Lighting";
    const rows = parseCsv(readFileSync(join(SRC, brand.dir, csv), "utf8"));
    for (const r of rows) {
      const rawSub = r.category || "";
      const sub = canonSub(rawSub) || rawSub || category;
      if (!SUB_ALIASES[rawSub.toLowerCase()]) adopted.add(rawSub);
      const urlSlug = (r.product_url || "").split("/").filter(Boolean).pop()?.replace(/\.html?$/, "");
      const img = (r.image_url || "").split("|")[0].trim();
      published.push({
        id: urlSlug && /[a-z]/i.test(urlSlug) ? slugify(urlSlug) : slugify(r.name),
        title: r.name,
        vendor: brand.name,
        tags: [],
        priceMin: priceInt(r.price_text),
        priceMax: priceInt(r.price_text),
        variants: [{ options: {}, sku: r.sku || null, price: 0 }],
        images: { primary: img, gallery: img ? [img] : [] },
        sourceUrl: r.product_url || undefined,
        category,
        subcategory: sub,
        rawSubcategory: rawSub,
        description: "",
        specs: [],
        quality: "thin",
      });
    }
    report.push(`- ${brand.name}: ${csv} -> ${rows.length} products (${category})`);
  }
  if (adopted.size) report.push(`  auto-adopted subcategories: ${[...adopted].join(", ")}`);
  return { published, parked: [] };
}

/* --------------------------------------------------- derived classification */

// A COB downlight, by the brand's own handle or category tag. Takes raw tags
// because the record's tags have already had `Categories_*` stripped.
function isCob(handle, rawTags = []) {
  return (
    /led-cob|-cob$/.test(handle ?? "") ||
    rawTags.some((t) => /^(categories_cob light|cob-lights)$/i.test(t))
  );
}

// Runs on every adapter's output, before dedupe, so one rule covers all three
// schemas. Relabels only — it never creates, drops or moves a row between the
// published and parked sets, so the totals are invariant across this pass.
function reclassify(published) {
  for (const p of published) {
    // Orient sells four "Backlit / Backlite … Recess Panel" models that landed
    // in Panel Lights. Product_Catalog.md lists Backlight as a sibling of
    // Panel, not a child. Matching backlit|backlite and NOT backlight is
    // deliberate: /backlight/i would drag in Philips' "TV Backlight Strip",
    // which is a TV bias light and correctly Smart Lighting.
    if (p.category === "Lighting" && /backlit|backlite/i.test(p.title)) {
      p.subcategory = "Backlight";
    }

    // Two attributes on fans, not two subcategories. A metal wall fan is a
    // Wall Fan that happens to be metal — it has to stay findable under Wall
    // Fans and also appear under Metal Fans. Written into every variant's
    // options so getFacets/hasOptionValue pick them up with no new plumbing;
    // VariantSelector skips any key with a single value, so they don't show
    // up as a fake choice on the product page.
    if (p.category !== "Fans") continue;
    const haystack = `${p.title} ${(p.tags ?? []).join(" ")}`;
    const derived = {};
    // Scoped to Fans so Havells' "LTS Metallique Metal Torch" — a light —
    // and Crompton's Cromdeco metal pendants can't leak in.
    if (/\bmetal(lic|lique|lion)?\b/i.test(p.title)) derived.Build = "Metal";
    if (/semi[-\s]?industrial|industrial/i.test(haystack)) {
      derived.Duty = "Industrial";
    }
    if (Object.keys(derived).length === 0) continue;
    for (const v of p.variants ?? []) Object.assign(v.options, derived);
  }
  return published;
}

/* ------------------------------------------------------------------ run */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const report = ["# Data build report", "", `_${new Date().toISOString()}_`, ""];
const allParked = [];
const seenUid = new Map();
let dupesTotal = 0;
let publishedTotal = 0;

for (const brand of BRANDS) {
  const adapt = brand.schema === "A" ? adaptA : brand.schema === "B" ? adaptB : adaptC;
  const { published, parked } = adapt(brand, report);
  reclassify(published);

  // Dedupe by uid — scraped CSVs list some products in more than one section.
  const unique = [];
  let dupes = 0;
  for (const p of published) {
    const uid = `${brand.slug}--${p.id}`;
    if (seenUid.has(uid)) { dupes++; continue; }
    seenUid.set(uid, true);
    unique.push(p);
  }
  if (dupes) { report.push(`  deduped: ${dupes} duplicate uid(s) dropped`); dupesTotal += dupes; }

  const byCat = {};
  for (const p of unique) (byCat[p.category] ??= []).push(p);
  mkdirSync(join(OUT, brand.slug), { recursive: true });
  for (const [cat, list] of Object.entries(byCat)) {
    writeFileSync(join(OUT, brand.slug, `${cat.toLowerCase()}.json`), JSON.stringify(list, null, 1));
  }
  allParked.push(...parked.map((p) => ({ ...p, brand: brand.name, brandSlug: brand.slug })));
  publishedTotal += unique.length;
}

writeFileSync(join(OUT, "_parked.json"), JSON.stringify(allParked, null, 1));

// subcategory census across everything published
const census = {};
for (const brand of BRANDS) {
  for (const file of readdirSync(join(OUT, brand.slug))) {
    for (const p of JSON.parse(readFileSync(join(OUT, brand.slug, file), "utf8"))) {
      const key = `${p.category} / ${p.subcategory}`;
      (census[key] ??= {})[brand.slug] = ((census[key] ?? {})[brand.slug] ?? 0) + 1;
    }
  }
}

report.push("", "## Published subcategory census", "");
for (const [key, brands] of Object.entries(census).sort()) {
  const total = Object.values(brands).reduce((a, b) => a + b, 0);
  report.push(`- **${key}** — ${total}  (${Object.entries(brands).map(([b, n]) => `${b} ${n}`).join(", ")})`);
}

report.push(
  "",
  "## Totals",
  "",
  `- Published: ${publishedTotal}`,
  `- Parked: ${allParked.length}`,
  `- duplicate uids dropped: ${dupesTotal}`,
);

writeFileSync(join(OUT, "report.md"), report.join("\n") + "\n");

console.log(`data:build — ${publishedTotal} published, ${allParked.length} parked, ${dupesTotal} dupes dropped`);
console.log(`see ${join("Products", "normalized", "report.md")}`);
