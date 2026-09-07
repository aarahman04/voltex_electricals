import { Link } from "react-router-dom";
import { getBrands, getCategories, getProductImage, products } from "../data/products.js";
import { cdnImage } from "../lib/image.js";

const categories = getCategories();

function brandCard(brand) {
  const own = products.filter((p) => p.brandSlug === brand.slug);
  const breakdown = categories
    .map((name) => ({ name, count: own.filter((p) => p.category === name).length }))
    .filter((c) => c.count > 0);
  const cover = own.find((p) => getProductImage(p));
  return { ...brand, breakdown, cover: cover ? getProductImage(cover) : null };
}

export default function Brands() {
  const brands = getBrands().map(brandCard);
  const stocked = brands.filter((b) => b.status === "stocked");
  const soon = brands.filter((b) => b.status === "coming-soon");

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
      <header className="mb-12 border-b border-conduit pb-6">
        <p className="spec mb-3 text-filament">Brands</p>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="nameplate text-4xl text-ivory sm:text-5xl">
            Who we carry
          </h1>
          <p className="spec text-muted">
            {stocked.length} live · {soon.length} coming soon
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stocked.map((brand) => (
          <Link
            key={brand.slug}
            to={`/brand/${brand.slug}`}
            className="group flex flex-col overflow-hidden rounded-[4px] bg-plate transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-22px_rgba(242,166,59,0.5)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-plate-dim">
              {brand.cover && (
                <img
                  src={cdnImage(brand.cover, 640)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-contain mix-blend-multiply p-8 transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 border-t border-ink/10 px-5 py-5">
              <h2 className="nameplate text-2xl text-ink">{brand.name}</h2>
              <p className="spec text-ink/50">
                {brand.count} models · {brand.breakdown.map((c) => `${c.count} ${c.name}`).join(" · ")}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="spec mt-16 mb-5 border-b border-conduit pb-3 text-muted">
        Coming soon
      </h2>
      <div className="flex flex-wrap gap-2.5">
        {soon.map((brand) => (
          <span
            key={brand.slug}
            className="rounded-[3px] border border-dashed border-conduit px-4 py-2 text-sm text-muted/70"
          >
            {brand.name}
          </span>
        ))}
      </div>
    </div>
  );
}
