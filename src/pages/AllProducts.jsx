import { useMemo } from "react";
import { getFacets, products } from "../data/products.js";
import { categoryList } from "../data/taxonomy.js";
import Listing from "../components/Listing.jsx";

export default function AllProducts() {
  const facets = useMemo(() => getFacets(null), []);

  return (
    <div className="site-width py-8 sm:py-12">
      <header className="catalogue-heading mb-8">
        <div><p className="eyebrow">The complete collection</p><h1 className="nameplate">Find your<br />everyday essentials<span>.</span></h1><p className="catalogue-description">Explore {categoryList()} across all our brands.</p></div>
        <div className="catalogue-brand"><strong className="catalogue-count nameplate">{products.length.toLocaleString("en-IN")}</strong><span className="spec">Possibilities for your space</span></div>
      </header>

      <Listing baseProducts={products} facets={facets} />
    </div>
  );
}
