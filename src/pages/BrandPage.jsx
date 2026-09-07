import { Link, useParams } from "react-router-dom";
import { getBrandBySlug } from "../data/brands.js";
import { getCategories, getProductsByBrand } from "../data/products.js";
import ProductCard from "../components/ProductCard.jsx";

const categories = getCategories();

export default function BrandPage() {
  const { brandSlug } = useParams();
  const brand = getBrandBySlug(brandSlug);
  const items = getProductsByBrand(brandSlug);

  if (!brand || items.length === 0) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 py-28 sm:px-8">
        <h1 className="nameplate text-3xl text-ivory">
          {brand ? `${brand.name} is coming soon` : "Brand not found"}
        </h1>
        <p className="mt-3 text-muted">
          {brand
            ? "We carry this brand, but its models aren't in the catalogue yet."
            : "No such brand in the catalogue."}
        </p>
        <Link
          to="/brands"
          className="spec mt-6 inline-block border-b border-filament/50 pb-0.5 text-filament"
        >
          All brands →
        </Link>
      </div>
    );
  }

  const byCategory = categories
    .map((name) => ({ name, items: items.filter((p) => p.category === name) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
      <nav className="spec mb-8 flex items-center gap-2 text-muted">
        <Link to="/brands" className="transition-colors hover:text-filament">
          Brands
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ivory">{brand.name}</span>
      </nav>

      <header className="mb-12 border-b border-conduit pb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="nameplate text-4xl text-ivory sm:text-5xl">
            {brand.name}
          </h1>
          <p className="spec text-muted">{items.length} models</p>
        </div>
      </header>

      {byCategory.map((group) => (
        <section key={group.name} className="mb-16">
          <div className="mb-6 flex items-baseline justify-between border-b border-conduit pb-3">
            <h2 className="nameplate text-xl text-ivory">{group.name}</h2>
            <Link
              to={`/category/${group.name}?brand=${brand.slug}`}
              className="spec text-muted transition-colors hover:text-filament"
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
