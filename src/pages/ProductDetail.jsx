import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  getMoreFromBrand,
  getProductById,
  getRelatedProducts,
} from "../data/products.js";
import { categoryPath, subcategoryPath } from "../data/taxonomy.js";
import { cdnImage } from "../lib/image.js";
import { displayTitle } from "../lib/specSummary.js";
import { useEnquiry } from "../context/enquiry.js";
import BrandMark from "../components/BrandMark.jsx";
import VariantSelector from "../components/VariantSelector.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductDetail() {
  const { uid } = useParams();
  const product = getProductById(uid);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [uid]);

  if (!product) {
    return (
      <div className="mx-auto max-w-[640px] px-5 py-32 sm:px-8">
        <h1 className="nameplate text-3xl text-ink">Model not found</h1>
        <p className="mt-3 text-ink-muted">This model isn’t in the catalogue.</p>
        <Link
          to="/products"
          className="spec mt-6 inline-block border-b border-amber/50 pb-0.5 text-amber"
        >
          Browse all products →
        </Link>
      </div>
    );
  }

  return <ProductDetailView key={product.uid} product={product} />;
}

function ProductDetailView({ product }) {
  const gallery = product.images?.gallery?.length
    ? product.images.gallery
    : [product.images?.primary].filter(Boolean);

  const hasVariants = product.variants?.length > 1;
  const [selected, setSelected] = useState(() => ({
    ...(product.variants?.[0]?.options ?? {}),
  }));
  const [activeImage, setActiveImage] = useState(0);

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return product.variants?.[0];
    return (
      product.variants.find((v) =>
        Object.entries(selected).every(([k, val]) => v.options?.[k] === val),
      ) ?? product.variants[0]
    );
  }, [hasVariants, product.variants, selected]);

  const handleSelect = (key, value) => {
    const next = { ...selected, [key]: value };
    setSelected(next);
    const variantIndex = product.variants.findIndex((v) =>
      Object.entries(next).every(([k, val]) => v.options?.[k] === val),
    );
    if (variantIndex > -1 && variantIndex < gallery.length) {
      setActiveImage(variantIndex);
    }
  };

  const { has, toggle } = useEnquiry();
  const added = has(product.uid);
  const related = getRelatedProducts(product);
  const more = getMoreFromBrand(product);
  const title = displayTitle(product);
  const tags = (product.tags ?? []).filter((tag) => !tag.includes("__")).slice(0, 6);

  const optionRows = hasVariants
    ? []
    : Object.entries(selected).filter(
        ([key, value]) => key.toLowerCase() !== "title" && value,
      );
  const specRows = [
    ...(product.specs ?? []).map((s) => [s.label, s.value]),
    ...optionRows,
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-12">
      <nav className="spec mb-8 flex flex-wrap items-center gap-2 text-ink-muted">
        <Link to="/products" className="transition-colors hover:text-amber">
          Products
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to={categoryPath(product.category)}
          className="transition-colors hover:text-amber"
        >
          {product.category}
        </Link>
        {product.subcategory && (
          <>
            <span aria-hidden="true">/</span>
            <Link
              to={subcategoryPath(product.category, product.subcategory)}
              className="transition-colors hover:text-amber"
            >
              {product.subcategory}
            </Link>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <Gallery
          images={gallery}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          title={title}
        />

        <div className="flex flex-col">
          <Link to={`/brand/${product.brandSlug}`} className="w-fit">
            <BrandMark slug={product.brandSlug} name={product.brand} size="md" />
          </Link>
          <h1 className="nameplate mt-4 text-[1.85rem] text-ink sm:text-[2.25rem]">
            {title}
          </h1>
          {product.subcategory && (
            <p className="spec mt-3 text-ink-muted">
              {product.category} · {product.subcategory}
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[6px] border border-seam px-2.5 py-1 text-xs text-ink-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {hasVariants && (
            <div className="mt-9">
              <VariantSelector
                variants={product.variants}
                selected={selected}
                onSelect={handleSelect}
              />
            </div>
          )}

          {(specRows.length > 0 || selectedVariant?.sku) && (
            <dl className="mt-9 border-t border-seam">
              {specRows.map(([label, value]) => (
                <SpecRow key={label} label={label} value={value} />
              ))}
              {selectedVariant?.sku && (
                <SpecRow label="Model code" value={selectedVariant.sku} mono />
              )}
            </dl>
          )}

          {product.description && (
            <p className="mt-8 text-sm leading-relaxed text-ink-muted">
              {product.description}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => toggle(product.uid)}
              aria-pressed={added}
              className={`switch-btn ${added ? "!bg-amber" : ""}`}
            >
              {added ? "Added to enquiry" : "Add to enquiry"}
            </button>
            <Link to="/enquiry" className="switch-btn switch-btn--ghost text-sm">
              View enquiry list
            </Link>
            <span className="spec w-full text-ink-muted sm:w-auto">
              No price — quoted on enquiry
            </span>
          </div>

          {product.sourceUrl && (
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="spec mt-4 w-fit text-ink-muted/70 underline-offset-2 hover:text-amber hover:underline"
            >
              Manufacturer page ↗
            </a>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <ProductRow title={`More ${product.subcategory ?? product.category}`} items={related} />
      )}
      {more.length > 0 && (
        <ProductRow title={`More from ${product.brand}`} items={more} />
      )}
    </div>
  );
}

function ProductRow({ title, items }) {
  return (
    <section className="mt-20">
      <h2 className="nameplate mb-6 border-b border-seam pb-3 text-xl text-ink">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.uid} product={p} />
        ))}
      </div>
    </section>
  );
}

// The full-res image at cdnImage's 1000px target only starts downloading
// when it becomes the active slide, so every swipe used to pay for a fresh
// request. Warming the browser's own cache for the neighbours — the two
// frames a swipe or arrow-click can actually land on — means that request
// is already in flight (usually already finished) by the time it's needed.
function usePreloadNeighbors(images, activeImage) {
  useEffect(() => {
    if (images.length < 2) return;
    for (const offset of [1, -1]) {
      const i = (activeImage + offset + images.length) % images.length;
      const img = new Image();
      img.src = cdnImage(images[i], 1000);
    }
  }, [images, activeImage]);
}

function Gallery({ images, activeImage, setActiveImage, title }) {
  // Direction drives which side the incoming frame slides in from — a
  // swipe right should feel like it's pulling the next photo in from the
  // right, not just cross-fading in place.
  const [direction, setDirection] = useState(1);
  const step = (delta) => {
    setDirection(delta);
    setActiveImage((i) => (i + delta + images.length) % images.length);
  };

  usePreloadNeighbors(images, activeImage);

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-square max-h-[560px] overflow-hidden rounded-[12px] border border-seam bg-surface">
        {/* mode="popLayout" (not "wait") so the incoming frame slides in
            while the outgoing one is still leaving — since neighbours are
            already preloaded, this reads as an instant swipe rather than a
            fade-out-then-fade-in pause. */}
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.img
            key={images[activeImage]}
            src={cdnImage(images[activeImage], 1000)}
            alt={title}
            fetchpriority="high"
            decoding="async"
            drag={images.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) step(1);
              else if (info.offset.x > 60) step(-1);
            }}
            custom={direction}
            initial={(dir) => ({ opacity: 0, x: dir * 40 })}
            animate={{ opacity: 1, x: 0 }}
            exit={(dir) => ({ opacity: 0, x: dir * -40 })}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full object-contain mix-blend-multiply p-8"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <GalleryButton side="left" onClick={() => step(-1)} />
            <GalleryButton side="right" onClick={() => step(1)} />
            <span className="spec absolute bottom-4 right-4 text-ink-muted">
              {activeImage + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="thin-scroll flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`View image ${i + 1}`}
              aria-current={activeImage === i}
              onClick={() => setActiveImage(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-[8px] border bg-surface transition-all duration-150 ${
                activeImage === i
                  ? "border-amber"
                  : "border-seam opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={cdnImage(src, 160)}
                alt=""
                loading="lazy"
                className="h-full w-full object-contain mix-blend-multiply p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecRow({ label, value, mono = false }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-seam py-3">
      <dt className="spec shrink-0 text-ink-muted">{label}</dt>
      <dd
        className={`min-w-0 break-words text-right text-sm text-ink ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function GalleryButton({ side, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-seam bg-paper/90 text-ink opacity-0 transition-opacity duration-150 hover:bg-paper focus-visible:opacity-100 group-hover:opacity-100 ${
        side === "left" ? "left-3" : "right-3"
      }`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
