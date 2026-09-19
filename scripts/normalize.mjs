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

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "Products");
const OUT = join(SRC, "normalized");
const CURATION_PATH = join(SRC, "curation.json");

function loadCuration() {
  try {
    const raw = JSON.parse(readFileSync(CURATION_PATH, "utf8"));
    return {
      removed: new Set((raw.removed ?? []).map((r) => r.uid)),
      removedImages: raw.removedImages ?? {},
    };
  } catch {
    return { removed: new Set(), removedImages: {} };
  }
}

/* ------------------------------------------------------------------ config */

const BRANDS = [
  { slug: "orient", name: "Orient Electric", schema: "A", dir: "orient" },
  { slug: "atomberg", name: "Atomberg", schema: "B", dir: "atomberg", raw: "atomberg_all_products_raw.json" },
  { slug: "crompton", name: "Crompton", schema: "B", dir: "crompton", raw: "crompton_all_products_raw.json" },
  { slug: "philips", name: "Philips", schema: "B", dir: "philips", raw: "philips_all_products_raw.json" },
  { slug: "havells", name: "Havells", schema: "C", dir: "havells_output", csv: ["havells_fans.csv", "havells_lighting.csv"] },
  { slug: "polycab", name: "Polycab", schema: "C", dir: "polycab_output", csv: ["polycab_fans.csv", "polycab_lighting.csv"] },
  { slug: "almonard", name: "Almonard", schema: "A", dir: "almonard" },
  {
    slug: "multifab",
    name: "Multifab",
    schema: "multifab",
    dir: "multifab",
    csv: { indoor: "multtifabled-indoor-light.csv", outdoor: "multtifabled-outdoor.csv" },
  },
  { slug: "ao-smith", name: "AO Smith", schema: "aosmith", dir: "ao smith", csv: "aosmithindia_gysers.csv" },
  { slug: "wipro", name: "Wipro", schema: "wipro", dir: "wipro", csv: "wiprolighting.csv" },
  {
    slug: "breezalit",
    name: "Breezalit",
    schema: "breezalit",
    dir: "breezalit fans",
    csv: {
      bldc: "breezalitfans_bldc_fans.csv",
      ceiling: "breezalitfans_ceiling_fans.csv",
      exhaust: "breezalitfans_exhaust_fans.csv",
    },
  },
  { slug: "kuhl", name: "Kuhl", schema: "kuhl", dir: "khul", csv: "kuhl_all_fans.csv" },
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
  // --- water geysers (Crompton only for now — see decisions D5/D23;
  // Immersion Rods deliberately left parked, they aren't geysers)
  "storage water heaters": ["Water Geysers", "Storage Water Heaters"],
  "instant water heaters": ["Water Geysers", "Instant Water Heaters"],
  "gas geyser": ["Water Geysers", "Gas Geysers"],
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
    const path = join(SRC, brand.dir, file);
    if (!existsSync(path)) continue;
    const rows = JSON.parse(readFileSync(path, "utf8"));
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

// Schema "multifab" — CSV scrape with generic column names (x-el, x-el 2, …).
// Same product name repeated at different wattages is one product with
// several variants, not several products, so rows are grouped by the raw
// name before anything else.
const MULTIFAB_TAGLINE_MAP = [
  [/junction|downlight|spotlight/i, "Downlighters & Spotlights"],
  [/panel/i, "Panel Lights"],
  [/surface/i, "Surface Lights"],
  [/track/i, "Track Lights"],
  [/mirror|wall spotlight/i, "Wall Lights"],
  [/batten/i, "Battens"],
  [/linear/i, "Linear Lights"],
];

function multifabTitleCaseWord(word) {
  const upper = word.toUpperCase();
  if (["LED", "RGB", "COB", "CCT", "PGB"].includes(upper)) return upper;
  if (/\d/.test(word) || /-/.test(word)) return upper;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function multifabTitle(raw) {
  const cleaned = raw
    .trim()
    .replace(/ADUJSTABLE/gi, "ADJUSTABLE")
    .replace(/\bWAL\b/gi, "WALL")
    .replace(/\(/g, " (")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned
    .split(" ")
    .map((word) => {
      const paren = word.startsWith("(") && word.endsWith(")");
      const core = paren ? word.slice(1, -1) : word;
      const cased = multifabTitleCaseWord(core);
      return paren ? `(${cased})` : cased;
    })
    .join(" ");
}

function multifabUpscale(url) {
  return url.replace(/rs=w:388,h:194/, "rs=w:1200,h:600");
}

// A wattage/size spec line like "1W  38x23  31  100" zipped against the
// header "Watt|Size (mm)|Cut Size(mm)|Std.Pkg" — one variant plus one spec
// row per line, so multiple wattages of the same fixture stay distinguishable.
function multifabParseSpecLine(headers, line) {
  const tokens = line.trim().split(/\s{2,}/).filter(Boolean);
  const wattage = tokens[0];
  if (!wattage) return null;
  const options = { Wattage: wattage };
  const rest = [];
  for (let i = 1; i < headers.length; i++) {
    const header = (headers[i] ?? "").trim();
    const value = tokens[i];
    if (!header || !value || value === "-") continue;
    const isSize = /size/i.test(header);
    const unit = /\(mm\)/i.test(header) ? " mm" : "";
    if (isSize && !options.Size) options.Size = `${value}${unit}`;
    const label = header.replace(/\s*\([^)]*\)/, "").trim();
    rest.push(`${label} ${value}${unit}`);
  }
  return {
    variant: { options, sku: null, price: 0 },
    spec: rest.length ? { label: wattage, value: rest.join(" · ") } : null,
  };
}

function multifabClassifyExtra(headers, value, variants, specs) {
  const v = value.trim();
  if (!v) return;
  if (/^\d[\d.]*(\+\d+)?(x\d+)?w\b/i.test(v)) {
    const parsed = multifabParseSpecLine(headers, v);
    if (parsed) {
      variants.push(parsed.variant);
      if (parsed.spec) specs.push(parsed.spec);
    }
    return;
  }
  if (/^cct/i.test(v)) {
    specs.push({ label: "Colour temperature", value: v.replace(/^cct\s*&\s*colors?:\s*/i, "").trim() });
    return;
  }
  if (/^(blue|green|red|pink|yellow|purple|amber|rgb|3in1|tiranga|color available)/i.test(v)) {
    specs.push({ label: "Colours", value: v.replace(/^color available in\s*/i, "").trim() });
    return;
  }
  if (/^(model:|also available)/i.test(v)) {
    specs.push({ label: "Note", value: v });
    return;
  }
  // "Watt| Size…" header text, "Features", "Send an Enquiry", mailto/http
  // links and blanks carry no product data — deliberately dropped.
}

function adaptMultifab(brand, report) {
  const published = [];
  const EXCLUDE = new Set(["x-el", "x-el 2", "x-el 3", "x-el src", "x-el 4", "x-el 14", "x-el 15", "x-el href"]);
  const files = [
    { key: "indoor", subcategory: null },
    { key: "outdoor", subcategory: "Street & Outdoor Lights" },
  ];

  for (const { key, subcategory: fixedSub } of files) {
    const csvFile = brand.csv[key];
    const rows = parseCsv(readFileSync(join(SRC, brand.dir, csvFile), "utf8"));
    const groups = new Map();
    for (const row of rows) {
      const name = row["x-el"]?.trim();
      if (!name) continue;
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(row);
    }

    for (const [name, groupRows] of groups) {
      const headers = (groupRows[0]["x-el 4"] || "")
        .split("|")
        .map((h) => h.trim());
      const variants = [];
      const specs = [];
      const images = [];
      let tagline = "";

      for (const row of groupRows) {
        const img = multifabUpscale((row["x-el src"] || "").trim());
        if (img && !images.includes(img)) images.push(img);
        if (row["x-el 14"]?.trim()) tagline = row["x-el 14"].trim();
        for (const col of Object.keys(row)) {
          if (EXCLUDE.has(col)) continue;
          multifabClassifyExtra(headers, row[col] || "", variants, specs);
        }
      }

      let subcategory = fixedSub;
      if (!subcategory) {
        const match = MULTIFAB_TAGLINE_MAP.find(([re]) => re.test(tagline));
        if (!match) throw new Error(`Multifab: no subcategory mapping for tagline "${tagline}" (product "${name}")`);
        subcategory = match[1];
      }

      published.push({
        id: slugify(name),
        title: multifabTitle(name),
        vendor: brand.name,
        tags: [],
        priceMin: 0,
        priceMax: 0,
        variants: variants.length ? variants : [{ options: {}, sku: null, price: 0 }],
        images: { primary: images[0] ?? null, gallery: images },
        sourceUrl: "https://multtifabled.co.in",
        category: "Lighting",
        subcategory,
        rawSubcategory: tagline || subcategory,
        description: "",
        specs,
        quality: variants.length ? "rich" : "thin",
      });
    }
    report.push(`- ${brand.name}: ${csvFile} -> ${rows.length} rows, ${groups.size} products`);
  }

  return { published, parked: [] };
}

// Schema "aosmith" — WooCommerce grid scrape. Thin: name + image + price.
function adaptAoSmith(brand, report) {
  const rows = parseCsv(readFileSync(join(SRC, brand.dir, brand.csv), "utf8"));
  const published = [];
  for (const r of rows) {
    const name = r["woocommerce-loop-product_title"]?.trim();
    if (!name) continue;
    const href = r["view-detail href"]?.trim();
    const id = href?.split("/").filter(Boolean).pop() || slugify(name);
    const isInstant = /insta|ews|fast-?on|forcenxt|minibot|zip/i.test(name);
    const badge = r["acoplw-blockText"]?.trim();
    const price = priceInt(r["woocommerce-Price-amount"]);
    published.push({
      id,
      title: name,
      vendor: brand.name,
      tags: badge ? [badge] : [],
      priceMin: price,
      priceMax: price,
      variants: [{ options: {}, sku: null, price: 0 }],
      images: { primary: r["attachment-woocommerce_thumbnail src"] || null, gallery: [r["attachment-woocommerce_thumbnail src"]].filter(Boolean) },
      sourceUrl: href || undefined,
      category: "Water Geysers",
      subcategory: isInstant ? "Instant Water Heaters" : "Storage Water Heaters",
      rawSubcategory: "geyser",
      description: r["col-sm-3"]?.trim() || "",
      specs: [],
      quality: "thin",
    });
  }
  report.push(`- ${brand.name}: ${brand.csv} -> ${rows.length} products (Water Geysers)`);
  return { published, parked: [] };
}

// Schema "wipro" — index scrape: name + image + product URL only. Subcategory
// is read off the URL's own section path, which is the only classification
// the raw data carries.
const WIPRO_SECTION_MAP = [
  [/^modern-workspaces\/2x2$/, "Panel Lights"],
  [/^modern-workspaces\/downlight$/, "Downlighters & Spotlights"],
  [/^modern-workspaces\/linear$/, "Linear Lights"],
  [/^modern-workspaces\/collaborative-range$/, "Pendant Lights"],
  [/^modern-workspaces\/(architectual-solution|acoustic-solution)$/, "Professional & Commercial Lighting"],
  [/^indoor-workspaces\/modern-work-spaces$/, "Professional & Commercial Lighting"],
  [/^outdoor\//, "Street & Outdoor Lights"],
  [/^industrial-solutions\//, "Professional & Commercial Lighting"],
];

function adaptWipro(brand, report) {
  const rows = parseCsv(readFileSync(join(SRC, brand.dir, brand.csv), "utf8"));
  const published = [];
  for (const r of rows) {
    const name = r.name?.trim();
    const href = r["proBx href"]?.trim();
    if (!name || !href) continue;
    const parts = href.split("/products/")[1]?.split("/") ?? [];
    const sectionKey = parts.slice(0, 2).join("/");
    const match = WIPRO_SECTION_MAP.find(([re]) => re.test(sectionKey));
    if (!match) throw new Error(`Wipro: no subcategory mapping for section "${sectionKey}" (product "${name}")`);
    published.push({
      id: parts[parts.length - 1] || slugify(name),
      title: name,
      vendor: brand.name,
      tags: [],
      priceMin: 0,
      priceMax: 0,
      variants: [{ options: {}, sku: null, price: 0 }],
      images: { primary: r["lazy src"] || null, gallery: [r["lazy src"]].filter(Boolean) },
      sourceUrl: href,
      category: "Lighting",
      subcategory: match[1],
      rawSubcategory: sectionKey,
      description: "",
      specs: [],
      quality: "thin",
    });
  }
  report.push(`- ${brand.name}: ${brand.csv} -> ${rows.length} products (Lighting)`);
  return { published, parked: [] };
}

// Schema "breezalit" — WooCommerce store: BLDC, Ceiling, and Exhaust fans.
function adaptBreezalit(brand, report) {
  const published = [];
  const files = [
    { key: "bldc", subcategory: "Ceiling Fans", isBldc: true },
    { key: "ceiling", subcategory: "Ceiling Fans", isBldc: false },
    { key: "exhaust", subcategory: "Exhaust Fans", isBldc: false },
  ];

  let totalRows = 0;

  for (const { key, subcategory, isBldc } of files) {
    const csvFile = brand.csv[key];
    const filePath = join(SRC, brand.dir, csvFile);
    if (!existsSync(filePath)) continue;
    const rows = parseCsv(readFileSync(filePath, "utf8"));
    totalRows += rows.length;

    for (const r of rows) {
      const titleRaw = r["woocommerce-LoopProduct-link"]?.trim();
      if (!titleRaw) continue;
      const title = titleRaw.replace(/\s+/g, " ");

      const href = r["image-fade_in_back href"]?.trim();
      const id = href?.split("/").filter(Boolean).pop() || slugify(title);

      const thumb = r["attachment-woocommerce_thumbnail src"]?.trim();
      const hover = r["show-on-hover src"]?.trim();

      const upscale = (url) => (url ? url.replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/, "$1") : null);
      const primaryImg = upscale(thumb) || thumb || null;
      const hoverImg = upscale(hover) || hover || null;
      const gallery = [primaryImg, hoverImg].filter(Boolean);

      const tags = [subcategory];
      if (isBldc || /\bbldc\b/i.test(title)) {
        tags.push("BLDC", "BLDC Fans");
      }
      if (r.onsale === "Sale!") {
        tags.push("Sale");
      }

      const specs = [];
      if (isBldc || /\bbldc\b/i.test(title)) {
        specs.push({ label: "Motor", value: "BLDC" });
      }

      const bladeMatch = title.match(/(\d+)[-\s]*blades?/i);
      if (bladeMatch) {
        specs.push({ label: "Blades", value: bladeMatch[1] });
      }

      const sweepMatch = title.match(/(\d+)\s*(mm|inch|["”])/i);
      if (sweepMatch) {
        let sizeVal = sweepMatch[0].trim();
        if (sizeVal.includes("”")) sizeVal = sizeVal.replace("”", '"');
        specs.push({ label: "Sweep Size", value: sizeVal });
      }

      const variants = [{
        options: sweepMatch ? { Size: sweepMatch[0].trim().replace("”", '"') } : {},
        sku: null,
        price: 0,
      }];

      published.push({
        id,
        title,
        vendor: brand.name,
        tags,
        priceMin: 0,
        priceMax: 0,
        variants,
        images: { primary: primaryImg, gallery },
        sourceUrl: href || undefined,
        category: "Fans",
        subcategory,
        rawSubcategory: subcategory,
        description: "",
        specs,
        quality: specs.length ? "rich" : "thin",
      });
    }
  }

  report.push(`- ${brand.name}: ${totalRows} products across BLDC, Ceiling, and Exhaust fans`);
  return { published, parked: [] };
}

// Schema "kuhl" — Kühl BLDC Stylish Fans catalogue scrape.
function adaptKuhl(brand, report) {
  const published = [];
  const parked = [];
  const rows = parseCsv(readFileSync(join(SRC, brand.dir, brand.csv), "utf8"));

  for (const r of rows) {
    const tg1 = r["theme_green"]?.trim();
    const tg2 = r["theme_green 2"]?.trim();
    const sweep = r["theme_green 3"]?.trim();
    const href = r["product href"]?.trim();
    const src = r["product src"]?.trim();
    const desc = r["card_body"]?.trim() || "";
    const price = priceInt(r["P_price"]);

    if (!href && !tg1) continue;

    const id = href?.split("/").filter(Boolean).pop() || slugify(`${tg1} ${tg2}`);
    const title = [tg1, tg2].filter(Boolean).join(" ").replace(/\s+/g, " ");

    const record = {
      id,
      title,
      vendor: brand.name,
      tags: [],
      priceMin: price,
      priceMax: price,
      variants: [],
      images: { primary: src || null, gallery: src ? [src] : [] },
      sourceUrl: href || undefined,
      description: desc,
      specs: [],
      quality: "rich",
    };

    if (/brizo/i.test(href) || /brizo/i.test(src)) {
      record.category = "Appliances";
      record.subcategory = "Air Coolers";
      record.rawSubcategory = "air cooler";
      record.reason = "type:air cooler";
      parked.push(record);
      continue;
    }

    let subcategory = "Ceiling Fans";
    if (/ventis/i.test(href) || /ventis/i.test(src)) {
      subcategory = "Exhaust Fans";
    } else if (/inspira-w1/i.test(href)) {
      subcategory = "Wall Fans";
    } else if (/inspira-t1/i.test(href) || /hawaii/i.test(href)) {
      subcategory = "Table Fans";
    } else if (/inspira-p[12]/i.test(href) || /exzel-h[123]/i.test(href)) {
      subcategory = "Pedestal Fans";
    }

    record.category = "Fans";
    record.subcategory = subcategory;
    record.rawSubcategory = subcategory;

    const specs = [
      { label: "Motor", value: "BLDC" },
    ];
    if (sweep) {
      specs.push({ label: "Sweep Size", value: sweep });
    }

    const bladeMatch = desc.match(/(\d+)\s*blades?/i);
    if (bladeMatch) {
      specs.push({ label: "Blades", value: bladeMatch[1] });
    }

    const wattMatch = desc.match(/(\d+)[-\s]*watt/i);
    if (wattMatch) {
      specs.push({ label: "Wattage", value: `${wattMatch[1]}W` });
    }

    record.specs = specs;

    const tags = [subcategory, "BLDC", "BLDC Fans"];
    if (/5[-\s]?star/i.test(desc)) tags.push("5 Star");
    if (/remote/i.test(desc)) tags.push("Remote Control");
    if (/down\s*light|night\s*light|with\s*light/i.test(desc)) tags.push("With Light");
    record.tags = tags;

    if (sweep && sweep.includes("/")) {
      const unitMatch = sweep.match(/[a-zA-Z]+/);
      const unit = unitMatch ? ` ${unitMatch[0]}` : " mm";
      const sizes = sweep.replace(/[a-zA-Z]+/g, "").split("/").map((s) => s.trim()).filter(Boolean);
      record.variants = sizes.map((s) => ({
        options: { Size: `${s}${unit}` },
        sku: null,
        price,
      }));
    } else if (sweep) {
      record.variants = [{
        options: { Size: sweep },
        sku: null,
        price,
      }];
    } else {
      record.variants = [{
        options: {},
        sku: null,
        price,
      }];
    }

    published.push(record);
  }

  report.push(`- ${brand.name}: ${rows.length} rows -> ${published.length} Fans, ${parked.length} parked`);
  return { published, parked };
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
const curation = loadCuration();
let curatedOutTotal = 0;
const seenCurationUids = new Set();

const ADAPTERS = {
  A: adaptA,
  B: adaptB,
  C: adaptC,
  multifab: adaptMultifab,
  aosmith: adaptAoSmith,
  wipro: adaptWipro,
  breezalit: adaptBreezalit,
  kuhl: adaptKuhl,
};

for (const brand of BRANDS) {
  const adapt = ADAPTERS[brand.schema];
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

  // Curation: drop rows an admin removed via /curate, and trim rows' galleries
  // to only the images an admin kept. See Products/curation.json.
  const curated = [];
  let curatedOut = 0;
  for (const p of unique) {
    const uid = `${brand.slug}--${p.id}`;
    if (curation.removed.has(uid)) {
      seenCurationUids.add(uid);
      curatedOut++;
      continue;
    }
    const removedImages = curation.removedImages[uid];
    if (removedImages) {
      seenCurationUids.add(uid);
      const gallery = (p.images.gallery ?? []).filter((url) => !removedImages.includes(url));
      p.images = { primary: gallery[0] ?? null, gallery };
    }
    curated.push(p);
  }
  if (curatedOut) { report.push(`  curated out: ${curatedOut} product(s) removed via /curate`); curatedOutTotal += curatedOut; }

  const byCat = {};
  for (const p of curated) (byCat[p.category] ??= []).push(p);
  mkdirSync(join(OUT, brand.slug), { recursive: true });
  for (const [cat, list] of Object.entries(byCat)) {
    const filename = cat.toLowerCase().replace(/\s+/g, "-");
    writeFileSync(join(OUT, brand.slug, `${filename}.json`), JSON.stringify(list, null, 1));
    // "Lite" sibling: only the fields list/search/facet pages ever read.
    // catalog.js eager-bundles this one; ProductDetail lazy-loads the full
    // file above for description/specs/full gallery, so those heavy fields
    // never ship to browsers just browsing the catalogue.
    const lite = list.map((p) => ({
      id: p.id,
      title: p.title,
      vendor: p.vendor,
      category: p.category,
      subcategory: p.subcategory,
      tags: p.tags,
      variants: p.variants,
      images: { primary: p.images?.primary ?? null },
    }));
    writeFileSync(join(OUT, brand.slug, `${filename}.lite.json`), JSON.stringify(lite, null, 1));
  }
  allParked.push(...parked.map((p) => ({ ...p, brand: brand.name, brandSlug: brand.slug })));
  publishedTotal += curated.length;
}

const staleCurationUids = [...curation.removed, ...Object.keys(curation.removedImages)]
  .filter((uid) => !seenCurationUids.has(uid));

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
  `- curated out: ${curatedOutTotal}`,
);
if (staleCurationUids.length) {
  report.push(`- stale curation uid(s) (no longer in raw data): ${staleCurationUids.join(", ")}`);
}

writeFileSync(join(OUT, "report.md"), report.join("\n") + "\n");

console.log(`data:build — ${publishedTotal} published, ${allParked.length} parked, ${dupesTotal} dupes dropped, ${curatedOutTotal} curated out`);
console.log(`see ${join("Products", "normalized", "report.md")}`);
