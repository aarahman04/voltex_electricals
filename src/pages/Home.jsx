import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  getBrands,
  getBrandsForCategory,
  getCategories,
  getCategoryFeature,
  getProductsByCategory,
  getShowcaseProducts,
  getSubcategories,
  products,
} from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import { kelvinToCss, nearestTone } from "../lib/kelvin.js";
import KelvinBar from "../components/KelvinBar.jsx";
import CylinderCarousel from "../components/CylinderCarousel.jsx";

const showcase = getShowcaseProducts().slice(0, 12);
const brands = getBrands();

export default function Home() {
  const categories = getCategories();
  const typeCount = useMemo(
    () => new Set(products.map((p) => p.subcategory)).size,
    [],
  );

  return (
    <div>
      <Hero
        modelCount={products.length}
        typeCount={typeCount}
        brandCount={brands.length}
      />

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-5 md:grid-cols-2">
          {categories.map((category, i) => (
            <CategoryTile key={category} category={category} index={i} />
          ))}
        </div>
      </section>

      <BrandStrip />

      <LightingBand />

      {categories.map((category) => (
        <SubcategoryRow key={category} category={category} />
      ))}
    </div>
  );
}

function Hero({ modelCount, typeCount, brandCount }) {
  return (
    <section className="relative overflow-hidden border-b border-conduit bg-ground-deep">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(242,166,59,0.14) 0%, transparent 60%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-[1400px] px-5 pt-20 sm:px-8 lg:pt-28"
      >
        <p className="spec mb-7 text-filament">
          {modelCount} models · {typeCount} types · {brandCount} brands
        </p>

        <h1 className="nameplate text-[2rem] text-ivory min-[420px]:text-[2.4rem] sm:text-[3.5rem] lg:text-[4.4rem]">
          Everything that
          <br />
          moves air or
          <br />
          makes light
        </h1>

        <p className="mt-7 max-w-md text-[15px] leading-relaxed text-ivory/75">
          Browse the full range by sweep, wattage, finish and light tone. Every
          model, every variant, straight from the catalogue.
        </p>
      </motion.div>

      <div className="relative mt-14 pb-16 lg:mt-8">
        <CylinderCarousel products={showcase} />
        <p className="spec mt-3 text-center text-muted/60">
          Spin or swipe through the range
        </p>
      </div>
    </section>
  );
}

// A lit display case: the goods on enamel, the plate below naming them.
function CategoryTile({ category, index }) {
  const items = getProductsByCategory(category);
  const types = getSubcategories(category).length;
  const brandCount = getBrandsForCategory(category).filter(
    (b) => b.status === "stocked",
  ).length;
  const { image: showcaseImage } = getCategoryFeature(category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/category/${category}`}
        className="group block overflow-hidden rounded-[4px] transition-shadow duration-500 hover:shadow-[0_30px_70px_-30px_rgba(242,166,59,0.55)]"
      >
        <div className="relative aspect-[16/11] overflow-hidden bg-plate-dim">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 60% at 50% 8%, rgba(242,166,59,0.20) 0%, transparent 70%)",
            }}
          />
          <img
            src={cdnImage(showcaseImage, 900)}
            alt=""
            loading="lazy"
            decoding="async"
            className="relative h-full w-full object-contain mix-blend-multiply p-10 transition-transform duration-700 group-hover:scale-[1.06] sm:p-14"
          />
        </div>

        <div className="flex items-end justify-between gap-4 bg-ground-lift px-6 py-5">
          <div>
            <h2 className="nameplate text-3xl text-ivory sm:text-4xl">{category}</h2>
            <p className="spec mt-2 text-muted">
              {items.length} models · {types} types ·{" "}
              {brandCount} {brandCount === 1 ? "brand" : "brands"}
            </p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-conduit text-ivory transition-all duration-300 group-hover:border-filament group-hover:bg-filament group-hover:text-ground-deep">
            →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function BrandStrip() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-8 sm:px-8">
      <div className="mb-6 flex items-baseline justify-between border-b border-conduit pb-3">
        <h3 className="nameplate text-xl text-ivory">Who we carry</h3>
        <Link
          to="/brands"
          className="spec text-muted transition-colors hover:text-filament"
        >
          All brands →
        </Link>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {brands.map((brand) =>
          brand.status === "stocked" ? (
            <Link
              key={brand.slug}
              to={`/brand/${brand.slug}`}
              className="rounded-[3px] border border-conduit px-4 py-2 text-sm text-ivory transition-colors hover:border-filament hover:text-filament"
            >
              {brand.name}
              <span className="spec ml-2 text-[9px] text-muted">{brand.count}</span>
            </Link>
          ) : (
            <span
              key={brand.slug}
              className="rounded-[3px] border border-dashed border-conduit px-4 py-2 text-sm text-muted/60"
            >
              {brand.name}
            </span>
          ),
        )}
      </div>
    </section>
  );
}

function LightingBand() {
  const [kelvin, setKelvin] = useState(2700);
  const tone = nearestTone(kelvin);

  return (
    <section className="relative my-16 overflow-hidden border-y border-conduit bg-ground-deep">
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-500"
        style={{
          background: `radial-gradient(90% 120% at 15% 30%, ${kelvinToCss(kelvin, 0.24)} 0%, transparent 62%)`,
        }}
      />
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="spec mb-5 text-filament">Lighting</p>
          <h2 className="nameplate text-[2rem] text-ivory sm:text-[2.6rem]">
            Pick a white,
            <br />
            <span
              style={{ color: kelvinToCss(kelvin) }}
              className="transition-colors duration-500"
            >
              see the room change
            </span>
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ivory/75">
            The catalogue sells light by colour temperature. Slide from warm to
            cool and jump straight to the {tone.name.toLowerCase()} range.
          </p>
        </div>
        <div className="w-full max-w-md lg:justify-self-end">
          <KelvinBar kelvin={kelvin} onChange={setKelvin} />
        </div>
      </div>
    </section>
  );
}

function SubcategoryRow({ category }) {
  const subcategories = getSubcategories(category);
  if (subcategories.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-16 sm:px-8">
      <div className="mb-6 flex items-baseline justify-between border-b border-conduit pb-3">
        <h3 className="nameplate text-xl text-ivory">{category} by type</h3>
        <Link
          to={`/category/${category}`}
          className="spec text-muted transition-colors hover:text-filament"
        >
          All {category} →
        </Link>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {subcategories.map((sub) => (
          <Link
            key={sub.name}
            to={`/category/${category}?sub=${encodeURIComponent(sub.name)}`}
            className="group w-[8.5rem] shrink-0 sm:w-40"
          >
            <div className="overflow-hidden rounded-[4px] bg-plate-dim transition-shadow duration-300 group-hover:shadow-[0_14px_30px_-16px_rgba(242,166,59,0.5)]">
              <img
                src={cdnImage(sub.image, 320)}
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-contain mix-blend-multiply p-4 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="mt-3 line-clamp-2 min-h-[2.4rem] text-[13px] font-medium leading-snug text-ivory transition-colors group-hover:text-filament">
              {sub.name}
            </p>
            <p className="spec text-[9px] text-muted">
              {sub.count} {sub.count === 1 ? "model" : "models"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
