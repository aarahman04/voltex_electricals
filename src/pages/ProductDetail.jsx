import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { getProductById, getRelatedProducts } from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import { displayTitle } from "../lib/specSummary.js";
import VariantSelector from "../components/VariantSelector.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProductById(id);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 py-32 sm:px-8">
        <h1 className="nameplate text-3xl text-ivory">Model not found</h1>
        <p className="mt-3 text-muted">
          This model is not in the catalogue.
        </p>
        <Link
          to="/"
          className="spec mt-6 inline-block border-b border-filament/50 pb-0.5 text-filament"
        >
          Back to catalogue
        </Link>
      </div>
    );
  }

  return <ProductDetailView key={product.id} product={product} />;
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

    // Display-only: infer a variant's photo by mapping its position in the
    // variant list onto the gallery, when the gallery is long enough for
    // that to mean anything.
    const variantIndex = product.variants.findIndex((v) =>
      Object.entries(next).every(([k, val]) => v.options?.[k] === val),
    );
    if (variantIndex > -1 && variantIndex < gallery.length) {
      setActiveImage(variantIndex);
    }
  };

  const related = getRelatedProducts(product);
  const title = displayTitle(product);
  const specRows = Object.entries(selected).filter(
    ([key, value]) => key.toLowerCase() !== "title" && value,
  );

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-12">
      <nav className="spec mb-8 flex items-center gap-2 text-muted">
        <Link to="/" className="transition-colors hover:text-filament">
          Catalogue
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to={`/category/${product.category}`}
          className="transition-colors hover:text-filament"
        >
          {product.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-ivory">{product.subcategory}</span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <Gallery
          images={gallery}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          title={product.title}
        />

        <div className="flex flex-col">
          <p className="spec text-filament">{product.subcategory}</p>
          <h1 className="nameplate mt-4 text-[1.75rem] text-ivory sm:text-[2.15rem]">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted">{product.vendor}</p>

          {product.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[3px] border border-conduit px-2.5 py-1 text-xs text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {hasVariants && (
            <div className="mt-10">
              <VariantSelector
                variants={product.variants}
                selected={selected}
                onSelect={handleSelect}
              />
            </div>
          )}

          <dl className="mt-10 border-t border-conduit">
            <SpecRow label="Type" value={product.subcategory} />
            {!hasVariants &&
              specRows.map(([key, value]) => (
                <SpecRow key={key} label={key} value={value} />
              ))}
            {selectedVariant?.sku && (
              <SpecRow label="Model code" value={selectedVariant.sku} mono />
            )}
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="button"
              className="whitespace-nowrap rounded-[3px] bg-filament px-8 py-3.5 text-sm font-semibold text-ground-deep transition-colors hover:bg-filament/85"
            >
              Enquire
            </button>
            <span className="spec whitespace-nowrap text-muted">
              Pricing on request
            </span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="nameplate mb-6 border-b border-conduit pb-3 text-xl text-ivory">
            More {product.subcategory}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Gallery({ images, activeImage, setActiveImage, title }) {
  const step = (delta) =>
    setActiveImage((i) => (i + delta + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-square max-h-[560px] overflow-hidden rounded-[4px] bg-plate-dim">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[activeImage]}
            src={cdnImage(images[activeImage], 1000)}
            alt={title}
            drag={images.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) step(1);
              else if (info.offset.x > 60) step(-1);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="h-full w-full object-contain mix-blend-multiply p-8"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <GalleryButton side="left" onClick={() => step(-1)} />
            <GalleryButton side="right" onClick={() => step(1)} />
            <span className="spec absolute bottom-4 right-4 text-[9px] text-ink/40">
              {activeImage + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`View image ${i + 1}`}
              aria-current={activeImage === i}
              onClick={() => setActiveImage(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-[3px] bg-plate-dim transition-all duration-200 ${
                activeImage === i
                  ? "ring-2 ring-filament"
                  : "opacity-55 hover:opacity-100"
              }`}
            >
              <img src={cdnImage(src, 160)} alt="" loading="lazy" className="h-full w-full object-contain mix-blend-multiply p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecRow({ label, value, mono = false }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-conduit py-3">
      <dt className="spec shrink-0 text-muted">{label}</dt>
      <dd
        className={`min-w-0 break-all text-right text-sm text-ivory ${
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
      className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ground-deep/70 text-ivory opacity-0 transition-opacity duration-200 hover:bg-ground-deep focus-visible:opacity-100 group-hover:opacity-100 ${
        side === "left" ? "left-3" : "right-3"
      }`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
