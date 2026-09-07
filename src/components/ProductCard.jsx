import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getProductImage } from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import { displayTitle, specSummary } from "../lib/specSummary.js";
import SwatchRow from "./SwatchRow.jsx";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function ProductCard({ product }) {
  const [loaded, setLoaded] = useState(false);
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
      <Link to={`/product/${product.id}`} className="group block">
        <article className="overflow-hidden rounded-[4px] bg-plate transition-[transform,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_-18px_rgba(242,166,59,0.45)]">
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

          <div className="flex flex-col gap-2 border-t border-ink/10 px-4 py-4">
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">
              {title}
            </h3>
            <div className="flex items-center justify-between gap-3">
              {spec && (
                <span className="spec text-[10px] text-ink/45">{spec}</span>
              )}
              <SwatchRow variants={product.variants} max={4} />
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
