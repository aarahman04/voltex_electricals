import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  getBrandsForCategory,
  getFacets,
  getProductsByDerived,
  getProductsBySubcategory,
  getSubcategories,
} from "../data/products.js";
import {
  categoryPath,
  derivedTile,
  isPublished,
  subcategoryPath,
} from "../data/taxonomy.js";
import BrandRail from "../components/BrandRail.jsx";
import Listing from "../components/Listing.jsx";

export default function CategoryListing() {
  const { category, subcategory } = useParams();
  const [params, setParams] = useSearchParams();

  const data = useMemo(() => {
    if (!isPublished(category)) return null;
    // Metal Fans and Industrial Fans are attributes, not subcategories, so
    // they select on a derived variant option instead. Same route, same
    // breadcrumb, same shared <Listing> — a metal wall fan appears here and
    // stays under Wall Fans.
    const derived = derivedTile(category, subcategory);
    const items = derived
      ? getProductsByDerived(category, derived)
      : getProductsBySubcategory(category, subcategory);
    if (items.length === 0) return { items };
    return {
      items,
      // The tile you're already standing in shouldn't also be a filter chip.
      facets: getFacets(category).filter(
        (f) => f.id !== "category" && (!derived || f.key !== derived.facet),
      ),
      siblings: getSubcategories(category),
      brands: getBrandsForCategory(category),
    };
  }, [category, subcategory]);

  const activeBrand = params.get("brand");
  const selectBrand = (slug) =>
    setParams(
      (p) => {
        if (slug) p.set("brand", slug);
        else p.delete("brand");
        return p;
      },
      { replace: true },
    );

  if (!data || data.items.length === 0) {
    return (
      <div className="mx-auto max-w-[640px] px-5 py-28 sm:px-8">
        <h1 className="nameplate text-3xl text-ink">{subcategory}</h1>
        <p className="mt-3 text-ink-muted">
          No models in this type yet. It may be a line we’re still adding.
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
        <span className="text-ink">{subcategory}</span>
      </nav>

      <header className="mb-8 border-b border-seam pb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="nameplate text-4xl text-ink sm:text-5xl">{subcategory}</h1>
          <p className="spec text-ink-muted">{data.items.length} models</p>
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          {subcategory} from {data.brands.filter((b) => b.status === "stocked").length}{" "}
          brands. Prices on enquiry.
        </p>
      </header>

      <BrandRail brands={data.brands} active={activeBrand} onSelect={selectBrand} />

      <Listing baseProducts={data.items} facets={data.facets} />

      <SiblingTypes category={category} current={subcategory} siblings={data.siblings} />
    </div>
  );
}

function SiblingTypes({ category, current, siblings }) {
  const others = siblings.filter((s) => s.name !== current);
  if (others.length === 0) return null;
  return (
    <section className="mt-16 border-t border-seam pt-8">
      <h2 className="spec mb-4 text-ink-muted">More {category.toLowerCase()} types</h2>
      <div className="flex flex-wrap gap-2">
        {others.map((s) => (
          <Link
            key={s.name}
            to={subcategoryPath(category, s.name)}
            className="rounded-[7px] border border-seam px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-seam-strong hover:text-ink"
          >
            {s.name}
            <span className="spec ml-1.5 opacity-60">{s.count}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
