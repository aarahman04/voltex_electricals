import { memo } from "react";
import { Link } from "react-router-dom";
import { getProductImage } from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import { displayTitle, specSummary } from "../lib/specSummary.js";
import { productTone } from "../lib/kelvin.js";
import { useEnquiry } from "../context/enquiry.js";
import { formatPrice } from "../lib/price.js";

function ProductCard({ product }) {
  const { has, toggle } = useEnquiry();
  const title = displayTitle(product);
  const price = formatPrice(product.price);
  const added = has(product.uid);
  const tone = productTone(product);
  // Local photographs (Voltex Exclusive) know their size, so the card reserves
  // space for them; they're whole photographs, not cut-outs on white.
  const { width, height } = product.images ?? {};

  return <article className="catalog-card" data-saved={added} data-photo={width ? true : undefined} style={tone ? { "--product-glow": tone.hex } : undefined}>
    <Link to={`/product/${product.uid}`} className="product-card-link">
      <div className="product-image-bed">
        <span className="product-category spec">{product.category === "Water Geysers" ? "Water heating" : product.category}</span>
        <span className="product-orbit" aria-hidden="true" />
        <img src={cdnImage(getProductImage(product), 600)} alt={title} width={width} height={height} loading="lazy" decoding="async" />
        <span className="product-view">View details <span aria-hidden="true">↗</span></span>
      </div>
      <div className="product-copy">
        {product.brandSlug !== "other" && <span className="product-brand spec">{product.brand}</span>}
        <h3>{title}</h3>
        <p className="product-spec">{specSummary(product) || product.subcategory}</p>
        {product.styledRoom && <p className="product-room-note">Shown in a styled room</p>}
        {price && <p className="product-price">{price}</p>}
        {added && <span className="product-saved">✓ In your enquiry list</span>}
      </div>
    </Link>
    <button type="button" className="product-card-add" aria-label={added ? `Remove ${title} from enquiry` : `Add ${title} to enquiry`} aria-pressed={added} onClick={() => toggle(product.uid)}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d={added ? "m5 13 4 4L19 7" : "M12 5v14M5 12h14"} /></svg>
    </button>
  </article>;
}

export default memo(ProductCard);
