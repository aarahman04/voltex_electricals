import { Link, useParams } from "react-router-dom";
import { getBrandBySlug } from "../data/brands.js";
import { getProductsByBrand } from "../data/products.js";
import { PUBLISHED } from "../data/taxonomy.js";
import BrandMark from "../components/BrandMark.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function BrandPage() {
  const { brandSlug } = useParams();
  const brand = getBrandBySlug(brandSlug);
  const items = getProductsByBrand(brandSlug);

  if (!brand || items.length === 0) {
    return (
      <div className="mx-auto max-w-[640px] px-5 py-28 sm:px-8">
        <h1 className="nameplate text-3xl text-ink">
          {brand ? `${brand.name} is coming soon` : "Brand not found"}
        </h1>
        <p className="mt-3 text-ink-muted">
          {brand
            ? "We carry this brand, but its models aren’t in the catalogue yet."
            : "No such brand in the catalogue."}
        </p>
        <Link
          to="/brands"
          className="spec mt-6 inline-block border-b border-amber/50 pb-0.5 text-amber"
        >
          All brands →
        </Link>
      </div>
    );
  }

  const byCategory = PUBLISHED.map((name) => ({
    name,
    items: items.filter((p) => p.category === name),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
      <nav className="spec mb-8 flex items-center gap-2 text-ink-muted">
        <Link to="/brands" className="transition-colors hover:text-amber">
          Brands
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{brand.name}</span>
      </nav>

      <header className="mb-12 border-b border-seam pb-6">
        <BrandMark slug={brand.slug} name={brand.name} size="lg" />
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="nameplate text-4xl text-ink sm:text-5xl">{brand.name}</h1>
          <p className="spec text-ink-muted">{items.length} models</p>
        </div>
      </header>

      {byCategory.map((group) => (
        <section key={group.name} className="mb-16">
          <div className="mb-6 flex items-baseline justify-between border-b border-seam pb-3">
            <h2 className="nameplate text-xl text-ink">{group.name}</h2>
            <Link
              to={`/products?category=${encodeURIComponent(group.name)}&brand=${brand.slug}`}
              className="spec text-ink-muted transition-colors hover:text-amber"
            >
              All {group.items.length} →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {group.items.slice(0, 8).map((product) => (
              <ProductCard key={product.uid} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
