import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getProductImage } from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import { displayTitle, specSummary } from "../lib/specSummary.js";
import { useShopNotice } from "../context/shopNotice.js";
import SwatchRow from "./SwatchRow.jsx";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function ProductCard({ product }) {
  const [loaded, setLoaded] = useState(false);
  const notify = useShopNotice();
  const spec = specSummary(product);
  const title = displayTitle(product);

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
    >
      <article className="group relative overflow-hidden rounded-[4px] bg-plate transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(242,166,59,0.45)]">
        <Link
          to={`/product/${product.uid}`}
          className="block after:absolute after:inset-0 after:z-0 after:content-['']"
        >
          {/* Most models are photographed white-on-white, so the tray sits
              a shade under the label strip to keep their edges. */}
          <div className="relative aspect-square overflow-hidden bg-plate-dim p-5">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(58% 52% at 50% 42%, #fffdf9 0%, rgba(255,253,249,0) 78%)",
              }}
            />
            {product.subcategory && (
              <span className="spec absolute left-3 top-3 z-10 text-[9px] text-ink/40">
                {product.subcategory}
              </span>
            )}
            {!loaded && (
              <div className="absolute inset-0 animate-pulse bg-plate-dim" />
            )}
            <img
              src={cdnImage(getProductImage(product), 500)}
              alt={title}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              className={`relative h-full w-full object-contain mix-blend-multiply transition-[opacity,transform] duration-500 group-hover:scale-[1.04] ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          <div className="flex flex-col gap-1.5 border-t border-ink/10 px-4 py-4">
            <span className="spec text-[9px] text-ink/45">{product.brand}</span>
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">
              {title}
            </h3>
            <div className="mt-0.5 flex items-center justify-between gap-3">
              {spec && (
                <span className="spec text-[10px] text-ink/45">{spec}</span>
              )}
              <SwatchRow variants={product.variants} max={4} />
            </div>
          </div>
        </Link>

        <button
          type="button"
          aria-label={`Add ${title} to cart`}
          onClick={() =>
            notify(`"${title}" — the cart isn't live yet. Enquire from the product page for a quote.`)
          }
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-[3px] bg-ground-deep/0 text-ink/35 opacity-0 transition-all duration-200 hover:bg-ground-deep hover:text-ivory focus-visible:opacity-100 group-hover:opacity-100"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </article>
    </motion.div>
  );
}
