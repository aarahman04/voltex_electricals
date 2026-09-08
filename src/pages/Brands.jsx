import { Link } from "react-router-dom";
import { getBrands, getProductImage, products } from "../data/products.js";
import { PUBLISHED } from "../data/taxonomy.js";
import { cdnImage } from "../lib/image.js";
import BrandMark from "../components/BrandMark.jsx";

function brandCard(brand) {
  const own = products.filter((p) => p.brandSlug === brand.slug);
  const breakdown = PUBLISHED.map((name) => ({
    name,
    count: own.filter((p) => p.category === name).length,
  })).filter((c) => c.count > 0);
  const cover = own.find((p) => getProductImage(p));
  return { ...brand, breakdown, cover: cover ? getProductImage(cover) : null };
}

export default function Brands() {
  const brands = getBrands().map(brandCard);
  const stocked = brands.filter((b) => b.status === "stocked");
  const soon = brands.filter((b) => b.status === "coming-soon");

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
      <header className="mb-12 border-b border-seam pb-6">
        <p className="spec mb-3 text-amber">Brands</p>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="nameplate text-4xl text-ink sm:text-5xl">
            Brands we carry
          </h1>
          <p className="spec text-ink-muted">
            {stocked.length} live · {soon.length} coming soon
          </p>
        </div>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stocked.map((brand) => (
          <Link
            key={brand.slug}
            to={`/brand/${brand.slug}`}
            className="group flex flex-col overflow-hidden rounded-[12px] border border-seam bg-surface transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-22px_rgba(19,26,36,0.3)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-surface">
              {brand.cover && (
                <img
                  src={cdnImage(brand.cover, 640)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-contain mix-blend-multiply p-8 transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <span className="absolute left-4 top-4">
                <BrandMark slug={brand.slug} name={brand.name} size="sm" />
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1 border-t border-seam px-5 py-4">
              <h2 className="nameplate flex items-center gap-2.5 text-xl text-ink">
                {/* Green means in catalogue — the meaning .led[data-live] was
                    written for. */}
                <span className="led shrink-0" data-live />
                {brand.name}
              </h2>
              <p className="spec pl-[18px] text-ink-muted">
                {brand.count} models ·{" "}
                {brand.breakdown.map((c) => `${c.count} ${c.name}`).join(" · ")}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {soon.length > 0 && (
        <>
          <h2 className="spec mb-5 mt-16 border-b border-seam pb-3 text-ink-muted">
            Coming soon
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {soon.map((brand) => (
              <span
                key={brand.slug}
                className="flex items-center gap-2.5 rounded-[7px] border border-seam px-4 py-2 text-sm text-ink-muted/70"
              >
                {/* Unlit: same indicator, not yet in the catalogue. */}
                <span className="led shrink-0" />
                {brand.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
