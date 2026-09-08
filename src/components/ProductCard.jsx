import { useState } from "react";
import { Link } from "react-router-dom";
import { getProductImage } from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import { displayTitle, specSummary } from "../lib/specSummary.js";
import { productTone } from "../lib/kelvin.js";
import { useEnquiry } from "../context/enquiry.js";
import BrandMark from "./BrandMark.jsx";
import SwatchRow from "./SwatchRow.jsx";

export default function ProductCard({ product }) {
  const [loaded, setLoaded] = useState(false);
  const { has, toggle } = useEnquiry();
  const spec = specSummary(product);
  const title = displayTitle(product);
  const added = has(product.uid);
  const tone = productTone(product);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[12px] border border-seam bg-surface transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-20px_rgba(19,26,36,0.35)]">
      <Link
        to={`/product/${product.uid}`}
        className="block after:absolute after:inset-0 after:z-0 after:content-['']"
      >
        <div className="relative aspect-square overflow-hidden bg-surface p-5">
          {!loaded && <div className="absolute inset-0 animate-pulse bg-paper" />}
          {/* Lighting cards warm in the colour temperature that model is sold
              in, so the hover tells you what you'd be buying. Fans have no
              tone; neither does a model offered in several. Both keep the
              plain lift. */}
          {tone && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-[0.45]"
              style={{
                background: `radial-gradient(58% 58% at 50% 45%, ${tone.hex} 0%, transparent 70%)`,
              }}
            />
          )}
          <img
            src={cdnImage(getProductImage(product), 500)}
            alt={title}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`relative h-full w-full object-contain mix-blend-multiply transition-[opacity,transform] duration-300 group-hover:scale-[1.03] ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        <div className="flex flex-1 flex-col gap-2 border-t border-seam px-4 py-3.5">
          <BrandMark slug={product.brandSlug} name={product.brand} size="sm" />
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink">
            {title}
          </h3>
          <div className="mt-auto flex items-center justify-between gap-3 pt-1">
            {spec ? (
              <span className="spec text-ink-muted">{spec}</span>
            ) : (
              <span className="spec text-ink-muted/50">{product.subcategory}</span>
            )}
            <SwatchRow variants={product.variants} max={4} />
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={added ? `Remove ${title} from enquiry` : `Add ${title} to enquiry`}
        aria-pressed={added}
        onClick={() => toggle(product.uid)}
        className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-[7px] border transition-all duration-150 ${
          added
            ? "border-amber bg-amber text-surface"
            : "border-seam bg-surface text-ink-muted opacity-0 hover:border-seam-strong hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
        }`}
      >
        {added ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        )}
      </button>
    </article>
  );
}
