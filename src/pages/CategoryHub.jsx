import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getBrandsForCategory,
  getDerivedSubcategories,
  getProductsByCategory,
  getSubcategories,
} from "../data/products.js";
import {
  PUBLISHED,
  categoryList,
  categoryPath,
  isPublished,
  orderedSubcategories,
  subcategoryPath,
} from "../data/taxonomy.js";
import { cdnImage } from "../lib/image.js";

const NOUN = { Fans: "fan", Lighting: "light", "Water Geysers": "geyser" };

export default function CategoryHub() {
  const { category } = useParams();

  const data = useMemo(() => {
    if (!isPublished(category)) return null;
    const items = getProductsByCategory(category);
    return {
      items,
      subs: orderedSubcategories(
        category,
        getSubcategories(category),
        getDerivedSubcategories(category),
      ),
      brands: getBrandsForCategory(category).filter((b) => b.status === "stocked"),
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

  const noun = NOUN[category] ?? category.toLowerCase().replace(/s$/, "");
  const liveTypes = data.subs.filter((s) => !s.comingSoon).length;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-10">
        <p className="spec mb-3 text-amber">{category}</p>
        <h1 className="nameplate text-[2.25rem] text-ink sm:text-5xl">
          Choose your {noun}
        </h1>
        <p className="spec mt-4 text-ink-muted">
          {data.items.length} models · {liveTypes} types · {data.brands.length}{" "}
          {data.brands.length === 1 ? "brand" : "brands"}
        </p>
      </header>

      <div className="plate power-up grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {data.subs.map((sub, i) =>
          sub.comingSoon ? (
            <div
              key={sub.name}
              data-coming-soon
              className="module flex flex-col p-4"
            >
              <div className="flex aspect-square items-center justify-center">
                <span className="spec text-ink-muted/40">Coming soon</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="led" />
                <span className="text-sm font-medium text-ink-muted/50">
                  {sub.name}
                </span>
              </div>
            </div>
          ) : (
            <Link
              key={sub.name}
              to={subcategoryPath(category, sub.name)}
              data-interactive
              className="module group flex flex-col p-4"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={cdnImage(sub.image, 400)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="led" style={{ "--i": i }} />
                <span className="flex-1 text-sm font-medium leading-snug text-ink">
                  {sub.name}
                </span>
              </div>
              <span className="spec mt-1 pl-4 text-ink-muted">
                {sub.count} {sub.count === 1 ? "model" : "models"}
              </span>
            </Link>
          ),
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        <Link to="/products" className="spec text-ink-muted transition-colors hover:text-amber">
          All products →
        </Link>
        {data.brands.slice(0, 6).map((b) => (
          <Link
            key={b.slug}
            to={`/brand/${b.slug}`}
            className="spec text-ink-muted transition-colors hover:text-amber"
          >
            {b.name} ({b.count})
          </Link>
        ))}
      </div>
    </div>
  );
}
