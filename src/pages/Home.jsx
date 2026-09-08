import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getBrands,
  getBrandsForCategory,
  getCategoryFeature,
  getFeaturedProducts,
  getHeroFeature,
  getProductsByCategory,
  getSubcategories,
  products,
} from "../data/products.js";
import { PUBLISHED, categoryPath, subcategoryPath } from "../data/taxonomy.js";
import { cdnImage } from "../lib/image.js";
import { kelvinToCss, nearestTone } from "../lib/kelvin.js";
import { displayTitle } from "../lib/specSummary.js";
import KelvinBar from "../components/KelvinBar.jsx";
import ProductCard from "../components/ProductCard.jsx";

const brands = getBrands();
const stocked = brands.filter((b) => b.status === "stocked");
const featured = getFeaturedProducts(8);
const hero = getHeroFeature();

// The hero fixture glows in real 2700K lamplight rather than the amber UI
// accent — warm white is what that lamp actually emits.
const LAMP_KELVIN = 2700;

const NEEDS = [
  {
    label: "Cooling",
    to: categoryPath("Fans"),
    hint: "Ceiling, pedestal, wall & exhaust fans",
  },
  {
    label: "Energy-efficient fans",
    to: "/search?q=bldc",
    hint: "BLDC motors, 5-star rated",
  },
  {
    label: "Everyday lighting",
    to: subcategoryPath("Lighting", "LED Bulbs & Lamps"),
    hint: "Bulbs, battens & panels",
  },
  {
    label: "Commercial & outdoor",
    to: subcategoryPath("Lighting", "Street & Outdoor Lights"),
    hint: "Street, flood & high-bay",
  },
];

export default function Home() {
  const typeCount = useMemo(
    () => new Set(products.map((p) => p.subcategory)).size,
    [],
  );

  return (
    <div>
      <Hero modelCount={products.length} typeCount={typeCount} brandCount={brands.length} />

      <Section title="Shop by category" href="/products" hrefLabel="All products">
        <div className="grid gap-5 md:grid-cols-2">
          {PUBLISHED.map((category) => (
            <CategoryCard key={category} category={category} />
          ))}
        </div>
      </Section>

      <Section title="Popular across the range" href="/products" hrefLabel="Browse all">
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.uid} product={p} />
          ))}
        </div>
      </Section>

      <Section title="Explore by brand" href="/brands" hrefLabel="All brands">
        <div className="flex flex-wrap gap-2.5">
          {stocked.map((b) => (
            <Link
              key={b.slug}
              to={`/brand/${b.slug}`}
              className="rounded-[8px] border border-seam bg-surface px-4 py-2.5 text-sm text-ink transition-colors hover:border-seam-strong"
            >
              {b.name}
              <span className="spec ml-2 text-ink-muted">{b.count}</span>
            </Link>
          ))}
        </div>
      </Section>

      <LightingBand />

      <Section title="Shop by need">
        <div className="plate grid-cols-2 lg:grid-cols-4">
          {NEEDS.map((need, i) => (
            <Link key={need.label} to={need.to} data-interactive className="module p-5">
              <span className="led" style={{ "--i": i }} />
              <p className="mt-3 text-[15px] font-medium text-ink">{need.label}</p>
              <p className="mt-1 text-xs leading-snug text-ink-muted">{need.hint}</p>
            </Link>
          ))}
        </div>
      </Section>

      <WhyVoltex />

      <EnquiryCta />
    </div>
  );
}

function Hero({ modelCount, typeCount, brandCount }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <section className="border-b border-seam bg-surface">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <p className="spec mb-6 text-ink-muted">
            {modelCount} models · {typeCount} types · {brandCount} brands
          </p>
          <h1 className="nameplate text-[2.4rem] uppercase leading-[1.02] text-ink min-[420px]:text-[2.9rem] sm:text-[3.6rem] lg:text-[4rem]">
            Everything electrical.
            <br />
            One place.
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-muted">
            Fans and lighting from {brandCount} brands, filtered by the specs
            that matter — sweep, wattage, finish, light tone.
          </p>

          <form
            onSubmit={submit}
            className="mt-8 flex items-center gap-2 rounded-[12px] border border-seam bg-paper px-4 transition-shadow focus-within:border-amber focus-within:shadow-[0_0_0_4px_rgba(238,122,27,0.12)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-ink-muted">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search the catalogue"
              placeholder="Search “1200mm ceiling fan”, “Philips panel”…"
              className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-muted/60"
            />
            <button type="submit" className="switch-btn shrink-0 !py-2 text-sm">
              Search
            </button>
          </form>

          <div className="plate power-up mt-6 grid-cols-2">
            {PUBLISHED.map((category, i) => (
              <Link
                key={category}
                to={categoryPath(category)}
                data-interactive
                className="module group flex items-center gap-3 p-5"
              >
                <span className="led" style={{ "--i": i }} />
                <span className="flex-1">
                  <span className="nameplate block text-lg text-ink">
                    {category}
                  </span>
                  <span className="spec text-ink-muted">
                    {getProductsByCategory(category).length} models
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-ink-muted transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        <HeroLamp />
      </div>
    </section>
  );
}

// The largest picture on the page, and until now the only thing on it that
// did nothing. It is the product's own photo, so it links to the product, and
// reaching for it — pointer or keyboard — warms the lamp.
function HeroLamp() {
  const lamplight = kelvinToCss(LAMP_KELVIN);
  const photo = (
    <>
      <span className="lamp-glow" style={{ "--lamp": lamplight }} aria-hidden="true" />
      <img
        src={cdnImage(hero.image, 1000)}
        alt={hero.product ? displayTitle(hero.product) : ""}
        className="lamp-photo relative mx-auto max-h-[440px] w-full object-contain mix-blend-multiply"
        style={{ "--lamp": lamplight }}
      />
    </>
  );

  if (!hero.product) {
    return <div className="lamp order-first lg:order-none">{photo}</div>;
  }

  return (
    <Link to={`/product/${hero.product.uid}`} className="lamp order-first lg:order-none">
      {photo}
    </Link>
  );
}

function Section({ title, href, hrefLabel, children }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
      <div className="mb-7 flex items-baseline justify-between gap-4 border-b border-seam pb-3">
        <h2 className="nameplate text-2xl text-ink">{title}</h2>
        {href && (
          <Link
            to={href}
            className="spec shrink-0 text-ink-muted transition-colors hover:text-amber"
          >
            {hrefLabel} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function CategoryCard({ category }) {
  const items = getProductsByCategory(category);
  const types = getSubcategories(category).length;
  const brandCount = getBrandsForCategory(category).filter(
    (b) => b.status === "stocked",
  ).length;
  const image = getCategoryFeature(category).image;

  return (
    <Link
      to={categoryPath(category)}
      className="group block overflow-hidden rounded-[14px] border border-seam bg-surface transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_56px_-28px_rgba(19,26,36,0.32)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        <img
          src={cdnImage(image, 900)}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain mix-blend-multiply p-12 transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex items-end justify-between gap-4 border-t border-seam px-6 py-5">
        <div>
          <h3 className="nameplate text-2xl text-ink sm:text-3xl">{category}</h3>
          <p className="spec mt-2 text-ink-muted">
            {items.length} models · {types} types · {brandCount}{" "}
            {brandCount === 1 ? "brand" : "brands"}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-seam text-ink transition-colors group-hover:border-amber group-hover:bg-amber group-hover:text-surface">
          →
        </span>
      </div>
    </Link>
  );
}

function LightingBand() {
  const [kelvin, setKelvin] = useState(2700);
  const tone = nearestTone(kelvin);

  return (
    <section className="border-y border-seam bg-surface">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2">
        <div>
          <p className="spec mb-4 text-amber">Lighting</p>
          <h2 className="nameplate text-[1.9rem] text-ink sm:text-[2.4rem]">
            The catalogue sells light by colour temperature
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
            Slide from warm to cool and jump straight to the{" "}
            {tone.name.toLowerCase()} range.
          </p>
        </div>
        <div className="lg:justify-self-end">
          <KelvinBar kelvin={kelvin} onChange={setKelvin} />
        </div>
      </div>
    </section>
  );
}

function WhyVoltex() {
  const points = [
    {
      title: "Many brands, one catalogue",
      body: `${stocked.length} brands side by side — compare a Havells ceiling fan and an Atomberg one on the same page.`,
    },
    {
      title: "No guesswork",
      body: "Filters are built from real product data. If a spec isn’t in the catalogue, there’s no filter pretending it is.",
    },
    {
      title: "Prices on enquiry",
      body: "Build an enquiry list as you browse and send it in one go. No cart, no signup.",
    },
  ];

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
      <h2 className="nameplate mb-7 border-b border-seam pb-3 text-2xl text-ink">
        Why Voltex
      </h2>
      <div className="plate grid-cols-1 md:grid-cols-3">
        {points.map((p) => (
          <div key={p.title} className="module p-6">
            <span className="led" data-on />
            <h3 className="mt-3 text-[15px] font-semibold text-ink">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EnquiryCta() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-20 sm:px-8">
      <div className="flex flex-col items-start gap-5 rounded-[16px] border border-seam bg-surface p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div>
          <h2 className="nameplate text-2xl text-ink sm:text-3xl">
            Found what you need?
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Send us the models and quantities — we’ll quote it.
          </p>
        </div>
        <Link to="/contact" className="switch-btn shrink-0">
          Ask for a price
        </Link>
      </div>
    </section>
  );
}
