import { Link } from "react-router-dom";
import { getProductById, getProductImage, getProductsByBrand } from "../data/products.js";
import { PUBLISHED, brandListingPath } from "../data/taxonomy.js";
import { cdnImage } from "../lib/image.js";
import BrandMark from "./BrandMark.jsx";

// Voltex Exclusive's first photographs aren't all clean; these were checked by eye.
const LEAD = {
  "voltex-exclusive": { all: "voltex-exclusive--vx-ch-0051", Chandeliers: "voltex-exclusive--vx-ch-0051", Lighting: "voltex-exclusive--vx-wl-0002" },
};
const categoryRank = (product) => PUBLISHED.indexOf(product.category);

export default function BrandCard({ brand, category }) {
  const products = getProductsByBrand(brand.slug);
  const items = category ? products.filter((product) => product.category === category) : products;
  // Lead with the brand's first product in PUBLISHED category order, so a
  // brand's card doesn't change when its data files are split differently.
  const lead = getProductById(LEAD[brand.slug]?.[category ?? "all"]) ??
    [...items].sort((a, b) => categoryRank(a) - categoryRank(b)).find((product) => getProductImage(product)) ?? products[0];
  const categories = [...new Set(items.map((product) => product.category === "Water Geysers" ? "Water heating" : product.category))];
  const href = category ? brandListingPath(category, brand.slug) : `/brand/${brand.slug}`;

  return <Link className="brand-gallery-card" to={href} data-own={brand.own || undefined}>
    <div className="brand-gallery-top"><span className="spec">{items.length} models to explore</span><span className="brand-gallery-arrow" aria-hidden="true">↗</span></div>
    <div className="brand-gallery-body">
      <div className="brand-gallery-copy"><BrandMark slug={brand.slug} name={brand.name} size="lg" /><h2 className="nameplate">{brand.name}</h2><p>{categories.join(" · ")}</p></div>
      <div className="brand-gallery-product"><span aria-hidden="true" />{lead && <img src={cdnImage(getProductImage(lead), 420)} alt="" loading="lazy" decoding="async" />}</div>
    </div>
    <div className="brand-gallery-foot"><span>Discover the collection</span><span aria-hidden="true">→</span></div>
  </Link>;
}
