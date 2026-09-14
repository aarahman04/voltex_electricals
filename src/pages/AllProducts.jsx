import { useMemo } from "react";
import { getFacets, products } from "../data/products.js";
import { categoryList } from "../data/taxonomy.js";
import Listing from "../components/Listing.jsx";

export default function AllProducts() {
  const facets = useMemo(() => getFacets(null), []);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-10 border-b border-seam pb-6">
        <p className="spec mb-3 text-amber">Catalogue</p>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="nameplate text-4xl text-ink sm:text-5xl">All products</h1>
          <p className="spec text-ink-muted">{products.length} models</p>
        </div>
        <p className="mt-3 max-w-xl text-sm text-ink-muted">
          Every {categoryList()} product in the catalogue, across all brands.
          Filter by category, brand and specification.
        </p>
      </header>

      <Listing baseProducts={products} facets={facets} />
    </div>
  );
}
