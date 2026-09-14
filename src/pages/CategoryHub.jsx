import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getBrandsForCategory, getProductsByCategory } from "../data/products.js";
import { PUBLISHED, categoryList, categoryPath, isPublished, brandListingPath } from "../data/taxonomy.js";
import BrandMark from "../components/BrandMark.jsx";

export default function CategoryHub() {
  const { category } = useParams();

  const data = useMemo(() => {
    if (!isPublished(category)) return null;
    return {
      items: getProductsByCategory(category),
      brands: getBrandsForCategory(category),
    };
  }, [category]);

  if (!data) {
    return (
      <div className="mx-auto max-w-[640px] px-5 py-28 sm:px-8">
        <h1 className="nameplate text-3xl text-ink">Category not found</h1>
        <p className="mt-3 text-ink-muted">
          The catalogue covers {categoryList()} for now.
        </p>
        <div className="mt-6 flex gap-3">
          {PUBLISHED.map((name) => (
            <Link
              key={name}
              to={categoryPath(name)}
              className="switch-btn switch-btn--ghost text-sm"
            >
              {name}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-10">
        <p className="spec mb-3 text-amber">{category}</p>
        <h1 className="nameplate text-[2.25rem] text-ink sm:text-5xl">
          Choose your brand
        </h1>
        <p className="spec mt-4 text-ink-muted">
          {data.items.length} models · {data.brands.length}{" "}
          {data.brands.length === 1 ? "brand" : "brands"}
        </p>
      </header>

      <div className="plate grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {data.brands.map((brand) => (
          <Link
            key={brand.slug}
            to={brandListingPath(category, brand.slug)}
            data-interactive
            className="module group flex flex-col gap-5 p-6"
          >
            <span className="led" />

            <span className="flex h-28 items-center justify-center sm:h-36">
              <BrandMark slug={brand.slug} name={brand.name} size="xl" />
            </span>

            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[15px] font-medium text-ink">{brand.name}</span>
              <span className="spec shrink-0 text-ink-muted">
                {brand.count} {brand.count === 1 ? "model" : "models"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        <Link to="/products" className="spec text-ink-muted transition-colors hover:text-amber">
          All products →
        </Link>
        <Link to="/brands" className="spec text-ink-muted transition-colors hover:text-amber">
          See all brands →
        </Link>
      </div>
    </div>
  );
}
