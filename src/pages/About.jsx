import { Link } from "react-router-dom";
import { getBrands, getCategories, products } from "../data/products.js";

const brands = getBrands();
const stocked = brands.filter((b) => b.status === "stocked");
const categories = getCategories();

export default function About() {
  return (
    <div className="mx-auto max-w-[760px] px-5 py-14 sm:px-8 sm:py-20">
      <p className="spec mb-4 text-filament">About</p>
      <h1 className="nameplate text-4xl text-ivory sm:text-5xl">
        One counter for
        <br />
        fans and light
      </h1>

      <div className="mt-10 flex flex-col gap-6 text-[15px] leading-relaxed text-ivory/80">
        <p>
          Voltex Electricals is an electrical goods dealer. This site is the
          browsing catalogue: every fan and every light we carry, laid out by
          type, brand and specification, so you can see the whole range before
          you ask for a price.
        </p>
        <p>
          It is a catalogue, not a shop. There is no cart and no checkout yet —
          you browse here, then enquire, and we quote. Product photos and
          details come straight from each manufacturer.
        </p>
      </div>

      <dl className="mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-[4px] border border-conduit bg-conduit">
        <Stat value={products.length} label="Models listed" />
        <Stat value={categories.length} label="Categories" />
        <Stat value={brands.length} label="Brands carried" />
      </dl>

      <p className="mt-8 text-sm text-muted">
        Live now:{" "}
        {stocked.map((b, i) => (
          <span key={b.slug}>
            <Link to={`/brand/${b.slug}`} className="text-ivory hover:text-filament">
              {b.name}
            </Link>
            {i < stocked.length - 1 ? ", " : ". "}
          </span>
        ))}
        The rest are on the way.
      </p>

      <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3">
        <Link
          to="/category/Fans"
          className="rounded-[3px] bg-filament px-6 py-3 text-sm font-semibold text-ground-deep transition-colors hover:bg-filament/85"
        >
          Browse the catalogue
        </Link>
        <Link
          to="/contact"
          className="spec self-center border-b border-conduit pb-0.5 text-muted transition-colors hover:border-filament hover:text-filament"
        >
          Get in touch →
        </Link>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="bg-ground-deep px-4 py-6 text-center">
      <div className="nameplate text-3xl text-ivory">{value}</div>
      <div className="spec mt-2 text-muted">{label}</div>
    </div>
  );
}
