import { useState } from "react";
import { getBrands, getBrandsForCategory } from "../data/products.js";
import { PUBLISHED } from "../data/taxonomy.js";
import BrandCard from "../components/BrandCard.jsx";

export default function Brands() {
  const brands = getBrands();
  const [category, setCategory] = useState(null);
  const visibleBrands = category ? getBrandsForCategory(category) : brands;
  return <div className="site-width brand-directory">
    <header className="editorial-heading">
      <div><p className="eyebrow"><span className="status-light" /> The brand directory</p><h1 className="nameplate">Great brands.<br /><span>More possibilities.</span></h1></div>
      <div className="editorial-aside"><span className="directory-count">{String(brands.length).padStart(2, "0")}<span>brands.<br />one destination.</span></span><p>Explore the names behind your everyday. Find your favourite, then make it part of your space.</p></div>
    </header>
    <div className="directory-filter" role="group" aria-label="Filter brands by category">{[null, ...PUBLISHED].map((name) => <button type="button" key={name ?? "all"} aria-pressed={category === name} onClick={() => setCategory(name)}>{name === null ? "All brands" : name === "Water Geysers" ? "Water heating" : name}</button>)}</div>
    <p className="sr-only" aria-live="polite">{visibleBrands.length} brands{category ? ` for ${category}` : ""}</p>
    <div className="brand-gallery">{visibleBrands.map((brand) => <BrandCard key={brand.slug} brand={brand} category={category} />)}</div>
  </div>;
}
