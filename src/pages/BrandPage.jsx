import { Link, useParams } from "react-router-dom";
import { getBrandBySlug } from "../data/brands.js";
import { getProductsByBrand } from "../data/products.js";
import { PUBLISHED, brandListingPath } from "../data/taxonomy.js";
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
    <div className="site-width py-10 sm:py-14">
      <nav className="spec mb-8 flex items-center gap-2 text-ink-muted">
        <Link to="/brands" className="transition-colors hover:text-amber">
          Brands
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{brand.name}</span>
      </nav>

      <header className="catalogue-heading mb-12">
        <div><p className="eyebrow">Meet the collection</p><h1 className="nameplate">{brand.name}<span>.</span></h1><p className="catalogue-description">Explore every possibility, one essential at a time.</p></div>
        <div className="catalogue-brand"><BrandMark slug={brand.slug} name={brand.name} size="lg" /><span className="spec">{items.length} models to discover</span></div>
      </header>

      {byCategory.map((group) => (
        <section key={group.name} className="mb-16">
          <div className="mb-6 flex items-baseline justify-between border-b border-seam pb-3">
            <h2 className="nameplate text-xl text-ink">{group.name}</h2>
            <span className="spec text-ink-muted">{group.items.length} models</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {group.items.slice(0, 8).map((product) => (
              <ProductCard key={product.uid} product={product} />
            ))}
          </div>
          {group.items.length > 8 && (
            <Link
              to={brandListingPath(group.name, brand.slug)}
              className="switch-btn switch-btn--ghost mt-6 w-full justify-center text-sm"
            >
              See all {group.items.length} {group.name} →
            </Link>
          )}
        </section>
      ))}
    </div>
  );
}
