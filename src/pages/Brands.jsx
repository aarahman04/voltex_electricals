import { Link } from "react-router-dom";
import { getBrands } from "../data/products.js";
import BrandMark from "../components/BrandMark.jsx";

export default function Brands() {
  const brands = getBrands();

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
      <header className="mb-12 border-b border-seam pb-6">
        <p className="spec mb-3 text-amber">Brands</p>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="nameplate text-4xl text-ink sm:text-5xl">
            Brands we carry
          </h1>
          <p className="spec text-ink-muted">{brands.length} brands</p>
        </div>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            to={`/brand/${brand.slug}`}
            className="led-row group flex flex-col overflow-hidden rounded-[12px] border border-seam bg-surface transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-22px_rgba(19,26,36,0.3)]"
          >
            <span className="flex aspect-[16/10] items-center justify-center border-b border-seam bg-surface">
              <BrandMark slug={brand.slug} name={brand.name} size="xl" />
            </span>

            <div className="flex flex-1 flex-col gap-1 px-5 py-4">
              <h2 className="nameplate flex items-center gap-2.5 text-xl text-ink">
                <span className="led shrink-0" />
                {brand.name}
              </h2>
              <p className="spec pl-[18px] text-ink-muted">
                {brand.count} {brand.count === 1 ? "model" : "models"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
