import { Link } from "react-router-dom";
import { getProductImage } from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import { displayTitle } from "../lib/specSummary.js";
import { useEnquiry } from "../context/enquiry.js";
import { PUBLISHED, categoryPath } from "../data/taxonomy.js";
import BrandMark from "../components/BrandMark.jsx";

export default function Enquiry() {
  const { items, remove, clear, count } = useEnquiry();

  if (count === 0) {
    return (
      <div className="mx-auto max-w-[640px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-col items-start">
          <span className="led" data-on />
          <h1 className="nameplate mt-5 text-3xl text-ink sm:text-4xl">
            Your enquiry list is empty
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-muted">
            There are no prices on the site. Add the models you want quoted to
            this list as you browse, then send it to us in one go.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {PUBLISHED.map((name) => (
              <Link
                key={name}
                to={categoryPath(name)}
                className="switch-btn switch-btn--ghost text-sm"
              >
                Browse {name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-5 py-14 sm:px-8 sm:py-20">
      <header className="mb-10 flex flex-wrap items-baseline justify-between gap-4 border-b border-seam pb-6">
        <div>
          <p className="spec mb-2 text-amber">Enquiry list</p>
          <h1 className="nameplate text-4xl text-ink sm:text-5xl">
            {count} {count === 1 ? "model" : "models"}
          </h1>
        </div>
        <button
          type="button"
          onClick={clear}
          className="spec border-b border-seam pb-0.5 text-ink-muted transition-colors hover:border-amber hover:text-amber"
        >
          Clear list
        </button>
      </header>

      <ul className="plate">
        {items.map((p) => (
          <li key={p.uid} className="module flex items-center gap-4 p-4">
            <Link to={`/product/${p.uid}`} className="shrink-0">
              <img
                src={cdnImage(getProductImage(p), 120)}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-16 w-16 rounded-[7px] bg-surface object-contain mix-blend-multiply ring-1 ring-seam"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <BrandMark slug={p.brandSlug} name={p.brand} size="sm" />
              <Link
                to={`/product/${p.uid}`}
                className="mt-1 block truncate text-sm font-medium text-ink hover:text-amber"
              >
                {displayTitle(p)}
              </Link>
              <span className="spec text-ink-muted">{p.subcategory}</span>
            </div>
            <button
              type="button"
              onClick={() => remove(p.uid)}
              aria-label={`Remove ${displayTitle(p)}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] border border-seam text-ink-muted transition-colors hover:border-amber hover:text-amber"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link to="/contact" className="switch-btn">
          Send this list for a quote
        </Link>
        <Link
          to="/products"
          className="spec text-ink-muted transition-colors hover:text-amber"
        >
          Keep browsing →
        </Link>
      </div>
    </div>
  );
}
