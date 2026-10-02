import { Link } from "react-router-dom";
import { getProductImage, getProductsByBrand } from "../data/products.js";
import { brandListingPath } from "../data/taxonomy.js";
import { cdnImage } from "../lib/image.js";
import BrandMark from "./BrandMark.jsx";

export default function BrandCard({ brand, category }) {
  const products = getProductsByBrand(brand.slug);
  const items = category ? products.filter((product) => product.category === category) : products;
  const lead = items.find((product) => getProductImage(product)) ?? products[0];
  const categories = [...new Set(items.map((product) => product.category === "Water Geysers" ? "Water heating" : product.category))];
  const href = category ? brandListingPath(category, brand.slug) : `/brand/${brand.slug}`;

  return <Link className="brand-gallery-card" to={href}>
    <div className="brand-gallery-top"><span className="spec">{items.length} models to explore</span><span className="brand-gallery-arrow" aria-hidden="true">↗</span></div>
    <div className="brand-gallery-body">
      <div className="brand-gallery-copy"><BrandMark slug={brand.slug} name={brand.name} size="lg" /><h2 className="nameplate">{brand.name}</h2><p>{categories.join(" · ")}</p></div>
      <div className="brand-gallery-product"><span aria-hidden="true" />{lead && <img src={cdnImage(getProductImage(lead), 420)} alt="" loading="lazy" decoding="async" />}</div>
    </div>
    <div className="brand-gallery-foot"><span>Discover the collection</span><span aria-hidden="true">→</span></div>
  </Link>;
}
