import { Link } from "react-router-dom";
import { getCategories } from "../data/products.js";

const categories = getCategories();

export default function Cart() {
  return (
    <div className="mx-auto max-w-[560px] px-5 py-24 sm:px-8 sm:py-32">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-conduit text-muted">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h2l2.4 11.2a1 1 0 0 0 1 .8h7.8a1 1 0 0 0 1-.8L20 8H7" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="17" cy="20" r="1" />
          </svg>
        </span>

        <h1 className="nameplate mt-8 text-3xl text-ivory sm:text-4xl">
          Your cart is coming soon
        </h1>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ivory/75">
          This is a browsing catalogue for now — no cart, no checkout. When you
          find something, use the enquiry form and we'll quote it.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {categories.map((name) => (
            <Link
              key={name}
              to={`/category/${name}`}
              className="rounded-[3px] border border-conduit px-5 py-2.5 text-sm text-ivory transition-colors hover:border-filament hover:text-filament"
            >
              Browse {name}
            </Link>
          ))}
          <Link
            to="/contact"
            className="rounded-[3px] bg-filament px-5 py-2.5 text-sm font-semibold text-ground-deep transition-colors hover:bg-filament/85"
          >
            Enquire
          </Link>
        </div>
      </div>
    </div>
  );
}
