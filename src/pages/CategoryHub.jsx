import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getBrandsForCategory, getCategoryFeature, getProductsByCategory } from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import { PUBLISHED, categoryList, categoryPath, isPublished } from "../data/taxonomy.js";
import BrandCard from "../components/BrandCard.jsx";

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
    <div className="site-width py-8 sm:py-12">
      <header className="category-hub-heading page-heading mb-10">
      <div>
        <p className="eyebrow mb-3">Explore the collection</p>
        <h1 className="nameplate text-[2.25rem] text-ink sm:text-5xl">
          {category === "Water Geysers" ? "Water heating" : category}
        </h1>
        <p className="spec mt-4 text-ink-muted">
          {data.items.length} models · {data.brands.length}{" "}
          {data.brands.length === 1 ? "brand" : "brands"}
        </p>
        <p className="mt-4 text-sm text-ink-muted">Choose a brand. Find the right fit for your space.</p>
      </div>
      <img src={cdnImage(getCategoryFeature(category).image, 500)} alt="" className="category-hub-image" />
      </header>

      <div className="brand-gallery">
        {data.brands.map((brand, index) => <BrandCard key={brand.slug} brand={brand} category={category} index={index} />)}
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
