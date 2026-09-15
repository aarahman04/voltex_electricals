import { Link } from "react-router-dom";
import { getBrands, products } from "../data/products.js";
import { PUBLISHED, categoryList } from "../data/taxonomy.js";

const brands = getBrands();

export default function About() {
  return (
    <div className="mx-auto max-w-[760px] px-5 py-14 sm:px-8 sm:py-20">
      <p className="spec mb-4 text-amber">About</p>
      <h1 className="nameplate text-4xl text-ink sm:text-5xl">
        One counter for everything electrical
      </h1>

      <div className="mt-10 flex flex-col gap-6 text-[15px] leading-relaxed text-ink-muted">
        <p>
          Voltex Electricals is a multi-brand electrical goods dealer. This site
          is the browsing catalogue: every {categoryList()} product we carry,
          laid out by type, brand and specification, so you can see the whole
          range before you ask for a price.
        </p>
        <p>
          It’s a catalogue, not a shop. There’s no cart and no checkout — you
          browse here, add models to an enquiry list, and we quote. Product
          photos and details come straight from each manufacturer.
        </p>
      </div>

      <dl className="plate mt-12 grid-cols-3">
        <Stat value={products.length} label="Models listed" />
        <Stat value={PUBLISHED.length} label="Categories" />
        <Stat value={brands.length} label="Brands carried" />
      </dl>

      <p className="mt-8 text-sm text-ink-muted">
        Brands carried:{" "}
        {brands.map((b, i) => (
          <span key={b.slug}>
            <Link to={`/brand/${b.slug}`} className="text-ink hover:text-amber">
              {b.name}
            </Link>
            {i < brands.length - 1 ? ", " : "."}
          </span>
        ))}
      </p>

      <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link to="/products" className="switch-btn">
          Browse the catalogue
        </Link>
        <Link
          to="/contact"
          className="spec border-b border-seam pb-0.5 text-ink-muted transition-colors hover:border-amber hover:text-amber"
        >
          Get in touch →
        </Link>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="module px-4 py-6 text-center">
      <div className="nameplate text-3xl text-ink">{value}</div>
      <div className="spec mt-2 text-ink-muted">{label}</div>
    </div>
  );
}
