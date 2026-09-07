import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  getCategories,
  getCategoryFeature,
  getHeroFeature,
  getProductsByCategory,
  getSubcategories,
  products,
} from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import { kelvinToCss } from "../lib/kelvin.js";
import KelvinBar from "../components/KelvinBar.jsx";

export default function Home() {
  const categories = getCategories();
  const typeCount = useMemo(
    () => new Set(products.map((p) => p.subcategory)).size,
    [],
  );

  return (
    <div>
      <Hero modelCount={products.length} typeCount={typeCount} />

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-5 md:grid-cols-2">
          {categories.map((category, i) => (
            <CategoryTile key={category} category={category} index={i} />
          ))}
        </div>
      </section>

      {categories.map((category) => (
        <SubcategoryRow key={category} category={category} />
      ))}

      <footer className="mt-12 border-t border-conduit">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="nameplate text-base text-ivory">Voltex Electricals</span>
          <span className="spec text-muted">
            Orient Electric range · {products.length} models · Prices on enquiry
          </span>
        </div>
      </footer>
    </div>
  );
}

function Hero({ modelCount, typeCount }) {
  const [kelvin, setKelvin] = useState(2700);
  const { product: feature, image: featureImage } = getHeroFeature();
  const light = kelvinToCss(kelvin);

  return (
    <section className="relative overflow-hidden border-b border-conduit bg-ground-deep">
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-500"
        style={{
          background: `radial-gradient(120% 90% at 78% 18%, ${kelvinToCss(kelvin, 0.22)} 0%, transparent 62%)`,
        }}
      />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="spec mb-7 text-filament"
          >
            Orient Electric range · {modelCount} models · {typeCount} types
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="nameplate text-[2.15rem] text-ivory min-[420px]:text-[2.5rem] sm:text-[3.6rem] lg:text-[4.4rem]"
          >
            Everything that
            <br />
            moves air or
            <br />
            <span style={{ color: light }} className="transition-colors duration-500">
              makes light
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-7 max-w-md text-[15px] leading-relaxed text-ivory/75"
          >
            Browse the full range by sweep, wattage, finish and light tone.
            Every model, every variant, straight from the catalogue.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-12"
          >
            <KelvinBar kelvin={kelvin} onChange={setKelvin} />
          </motion.div>
        </div>

        {feature && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-[520px]"
          >
            <div
              className="pointer-events-none absolute -inset-10 rounded-full blur-3xl transition-[background] duration-500"
              style={{ background: kelvinToCss(kelvin, 0.18) }}
            />
            <Link
              to={`/product/${feature.id}`}
              className="group relative block overflow-hidden rounded-[4px] bg-plate-dim"
            >
              <img
                src={cdnImage(featureImage, 800)}
                alt={feature.title}
                className="aspect-square w-full object-contain mix-blend-multiply p-12 transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {/* The showroom light falling on an enamel surface. */}
              <div
                className="pointer-events-none absolute inset-0 mix-blend-multiply transition-[background] duration-500"
                style={{ background: kelvinToCss(kelvin, 0.32) }}
              />
              <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-4 bg-ground-deep/90 px-5 py-4 backdrop-blur-sm">
                <span className="text-sm font-medium text-ivory">
                  {feature.title}
                </span>
                <span className="spec text-[9px] text-filament opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  View →
                </span>
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// A lit display case: the goods on enamel, the plate below naming them.
// The catalogue photographs everything as a cut-out on white, so nothing
// here crops — the product is shown whole, the way a showroom shows it.
function CategoryTile({ category, index }) {
  const items = getProductsByCategory(category);
  const types = getSubcategories(category).length;
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
              {items.length} models · {types} types
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
