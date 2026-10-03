import { useMemo } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { getBrandBySlug } from "../data/brands.js";
import { getFacets, getProductsByCategory, getSubcategories } from "../data/products.js";
import { categoryPath, isPublished, orderedSubcategories } from "../data/taxonomy.js";
import BrandMark from "../components/BrandMark.jsx";
import Listing from "../components/Listing.jsx";
import { usePageMeta } from "../lib/usePageMeta.js";

export default function BrandListing() {
  const { category, brandSlug } = useParams();
  const [params] = useSearchParams();

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

  const label = category === "Water Geysers" ? "Water heating" : category;
  usePageMeta(
    data?.brand ? `${data.brand.name} ${label}` : null,
    data?.items?.length ? `${data.items.length} ${data.brand.name} models in ${label}. Filter by type, save the ones you like and send an enquiry.` : null,
  );

  // Chandeliers used to be a type under Lighting; old filtered links follow it.
  if (category?.toLowerCase() === "lighting" && params.get("sub")?.split(",").includes("Chandeliers")) {
    return <Navigate replace to={`${categoryPath("Chandeliers")}/${encodeURIComponent(brandSlug)}`} />;
  }

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
    <div className="site-width py-8 sm:py-12">
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

      <header className="catalogue-heading mb-8">
        <div><p className="eyebrow">The {brand.name} collection</p><h1 className="nameplate">{category === "Water Geysers" ? "Water heating" : category}<span>.</span></h1><p className="catalogue-description">Find your favourite. Explore the details. Make it part of your space.</p></div>
        <div className="catalogue-brand"><BrandMark slug={brand.slug} name={brand.name} size="lg" /><span className="spec">{items.length} models to discover</span></div>
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
