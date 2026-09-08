import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  getCategoryCounts,
  getDerivedSubcategories,
  getSubcategories,
} from "../data/products.js";
import {
  PUBLISHED,
  categoryPath,
  orderedSubcategories,
  subcategoryPath,
} from "../data/taxonomy.js";
import { useEnquiry } from "../context/enquiry.js";
import Lockup from "./Lockup.jsx";
import Portal from "./Portal.jsx";
import SearchOverlay from "./SearchOverlay.jsx";

const categoryCounts = getCategoryCounts();

// Built once: every published category with its subcategory list in canonical
// order, coming-soon entries included. Drives the mega-menu and the mobile
// drilldown both.
const categoryTree = PUBLISHED.map((category) => ({
  name: category,
  count: categoryCounts[category] ?? 0,
  subs: orderedSubcategories(
    category,
    getSubcategories(category),
    getDerivedSubcategories(category),
  ),
}));

const COMPANY = [
  { label: "Brands", to: "/brands" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenu(false);
      }
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if (!typing && (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey)))) {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  return (
    <header className="sticky top-0 z-40 border-b border-seam bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-5 sm:px-8">
        <Link to="/" aria-label="Voltex Electricals, home">
          <Lockup />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <div
            onMouseEnter={() => setMenu(true)}
            onMouseLeave={() => setMenu(false)}
          >
            <Link
              to="/products"
              className="flex items-center gap-1.5 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
              aria-expanded={menu}
              onFocus={() => setMenu(true)}
            >
              Products
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`transition-transform ${menu ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" d="m6 9 6 6 6-6" />
              </svg>
            </Link>
          </div>

          {COMPANY.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-amber" : "text-ink-muted hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSearch(true)}
            className="flex h-10 items-center gap-2 rounded-[8px] border border-seam px-3 text-sm text-ink-muted transition-colors hover:border-seam-strong hover:text-ink"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
            <span className="hidden lg:inline">Search</span>
            <kbd className="spec hidden rounded-[4px] bg-surface px-1.5 py-0.5 text-[10px] text-ink-muted ring-1 ring-seam lg:inline">
              /
            </kbd>
          </button>

          <EnquiryLink />

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobile}
            onClick={() => setMobile(true)}
            className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-seam text-ink transition-colors hover:border-seam-strong md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onMouseEnter={() => setMenu(true)}
            onMouseLeave={() => setMenu(false)}
            onClick={() => setMenu(false)}
            className="absolute inset-x-0 top-16 hidden border-b border-seam bg-paper md:block"
          >
            <MegaMenu />
          </motion.div>
        )}
      </AnimatePresence>

      <MobileNav open={mobile} onClose={() => setMobile(false)} />

      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </header>
  );
}

function EnquiryLink() {
  const { count } = useEnquiry();
  return (
    <Link
      to="/enquiry"
      aria-label={`Enquiry list, ${count} ${count === 1 ? "item" : "items"}`}
      className="relative flex h-10 items-center gap-2 rounded-[8px] px-3 text-sm text-ink-muted transition-colors hover:text-ink"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
      </svg>
      <span className="hidden lg:inline">Enquiry</span>
      {count > 0 && (
        <span className="spec flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[10px] leading-none text-surface">
          {count}
        </span>
      )}
    </Link>
  );
}

function MegaMenu() {
  // The module for the category you are currently inside reads as the live
  // circuit — that is exactly what .module[data-active] was written for.
  // Header sits outside <Routes>, so read the path rather than useParams().
  const { pathname } = useLocation();
  const segments = pathname.split("/");
  const current =
    segments[1] === "c" && segments[2]
      ? decodeURIComponent(segments[2]).toLowerCase()
      : null;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">
      <div className="plate grid-cols-1 md:grid-cols-2">
        {categoryTree.map((category) => (
          <div
            key={category.name}
            className="module p-6"
            data-active={current === category.name.toLowerCase() || undefined}
          >
            <div className="mb-4 flex items-center gap-2.5">
              <span className="led" data-on />
              <Link
                to={categoryPath(category.name)}
                className="nameplate text-xl text-ink transition-colors hover:text-amber"
              >
                {category.name}
              </Link>
              <span className="spec text-ink-muted">{category.count}</span>
            </div>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {category.subs.map((sub) => (
                <li key={sub.name}>
                  {sub.comingSoon ? (
                    <span className="flex items-baseline justify-between gap-2 py-1 text-sm text-ink-muted/50">
                      {sub.name}
                      <span className="spec text-[9px]">Soon</span>
                    </span>
                  ) : (
                    <Link
                      to={subcategoryPath(category.name, sub.name)}
                      className="flex items-baseline justify-between gap-2 py-1 text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {sub.name}
                      <span className="spec text-[9px] text-ink-muted/60">
                        {sub.count}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <Link to="/products" className="spec text-ink-muted transition-colors hover:text-amber">
          Browse all products →
        </Link>
        <Link to="/brands" className="spec text-ink-muted transition-colors hover:text-amber">
          Shop by brand →
        </Link>
      </div>
    </div>
  );
}

// Portalled to <body>: rendered in place it would inherit the header's
// backdrop-filter as its containing block and open as a clipped, transparent
// sliver. One keyed motion child so AnimatePresence can actually track the
// exit — exit propagates down to the panel's own slide.
function MobileNav({ open, onClose }) {
  const [category, setCategory] = useState(null);
  const active = categoryTree.find((c) => c.name === category);

  // The drawer stays mounted, so closing it has to drop the drilldown too —
  // otherwise it reopens two levels deep.
  const close = () => {
    setCategory(null);
    onClose();
  };

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav"
            className="fixed inset-0 z-[85] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div
              className="absolute inset-0 bg-ink/40"
              onClick={close}
              aria-hidden="true"
            />
            <motion.aside
              aria-label="Menu"
              className="thin-scroll absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-paper shadow-[0_0_60px_-12px_rgba(19,26,36,0.45)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-seam px-5">
                {active ? (
                  <button
                    type="button"
                    onClick={() => setCategory(null)}
                    className="flex items-center gap-2 text-sm text-ink-muted"
                  >
                    <span aria-hidden="true">←</span> All products
                  </button>
                ) : (
                  <Lockup className="text-[15px]" />
                )}
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={close}
                  className="flex h-9 w-9 items-center justify-center text-ink-muted hover:text-ink"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col p-5">
                {active ? (
                  <>
                    <Link
                      to={categoryPath(active.name)}
                      onClick={close}
                      className="nameplate flex items-baseline justify-between border-b border-seam py-4 text-2xl text-ink"
                    >
                      All {active.name}
                      <span className="spec text-ink-muted">{active.count}</span>
                    </Link>
                    {active.subs.map((sub) =>
                      sub.comingSoon ? (
                        <span
                          key={sub.name}
                          className="flex items-baseline justify-between border-b border-seam py-3.5 text-[15px] text-ink-muted/50"
                        >
                          {sub.name}
                          <span className="spec text-[9px]">Soon</span>
                        </span>
                      ) : (
                        <Link
                          key={sub.name}
                          to={subcategoryPath(active.name, sub.name)}
                          onClick={close}
                          className="flex items-baseline justify-between border-b border-seam py-3.5 text-[15px] text-ink"
                        >
                          {sub.name}
                          <span className="spec text-ink-muted">{sub.count}</span>
                        </Link>
                      ),
                    )}
                  </>
                ) : (
                  <>
                    {categoryTree.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setCategory(c.name)}
                        className="nameplate flex items-center justify-between border-b border-seam py-4 text-2xl text-ink"
                      >
                        {c.name}
                        <span aria-hidden="true" className="text-ink-muted">→</span>
                      </button>
                    ))}
                    <Link
                      to="/products"
                      onClick={close}
                      className="nameplate border-b border-seam py-4 text-2xl text-ink"
                    >
                      All products
                    </Link>
                    {COMPANY.map((item) => (
                      <NavLink
                        key={item.label}
                        to={item.to}
                        onClick={close}
                        className="nameplate border-b border-seam py-4 text-2xl text-ink"
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </>
                )}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
