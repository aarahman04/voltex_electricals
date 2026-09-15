import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getBrandBySlug } from "../data/brands.js";
import { getFacets, getProductsByCategory, getSubcategories } from "../data/products.js";
import { categoryPath, isPublished, orderedSubcategories } from "../data/taxonomy.js";
import BrandMark from "../components/BrandMark.jsx";
import Listing from "../components/Listing.jsx";

export default function BrandListing() {
  const { category, brandSlug } = useParams();

  const data = useMemo(() => {
    if (!isPublished(category)) return null;
    const brand = getBrandBySlug(brandSlug);
    if (!brand) return null;
    const items = getProductsByCategory(category).filter(
      (p) => p.brandSlug === brandSlug,
    );
    if (items.length === 0) return { brand, items: [] };
    return {
      brand,
      items,
      facets: getFacets(category, brandSlug),
      subcategories: orderedSubcategories(category, getSubcategories(category, brandSlug)),
    };
  }, [category, brandSlug]);

  if (!data || data.items.length === 0) {
    return (
      <div className="mx-auto max-w-[640px] px-5 py-28 sm:px-8">
        <h1 className="nameplate text-3xl text-ink">
          {data?.brand ? `${data.brand.name} — ${category}` : "Not found"}
        </h1>
        <p className="mt-3 text-ink-muted">
          {data?.brand
            ? "No models from this brand in this category yet."
            : "That brand isn’t in the catalogue."}
        </p>
        <Link
          to={categoryPath(category)}
          className="spec mt-6 inline-block border-b border-amber/50 pb-0.5 text-amber"
        >
          ← Back to {category}
        </Link>
      </div>
    );
  }

  const { brand, items, facets, subcategories } = data;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14">
      <nav className="spec mb-6 flex items-center gap-2 text-ink-muted">
        <Link to="/products" className="transition-colors hover:text-amber">
          Products
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={categoryPath(category)} className="transition-colors hover:text-amber">
          {category}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{brand.name}</span>
      </nav>

      <header className="mb-8 border-b border-seam pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandMark slug={brand.slug} name={brand.name} size="lg" />
            <h1 className="nameplate text-3xl text-ink sm:text-4xl">{category}</h1>
          </div>
          <p className="spec text-ink-muted">{items.length} models</p>
        </div>
      </header>

      <Listing baseProducts={items} facets={facets} subcategories={subcategories}>
        <div className="mt-16 border-t border-seam pt-8">
          <Link
            to={categoryPath(category)}
            className="spec text-ink-muted transition-colors hover:text-amber"
          >
            See all {category} brands →
          </Link>
        </div>
      </Listing>
    </div>
  );
}
