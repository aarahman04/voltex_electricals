import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import { getBrands, getBrandsForCategory, getCategoryCounts, getCategoryFeature, getProductsByBrand } from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import { PUBLISHED, brandListingPath, categoryPath } from "../data/taxonomy.js";
import { useEnquiry } from "../context/enquiry.js";
import { useScrollLock } from "../lib/useScrollLock.js";
import Lockup from "./Lockup.jsx";
import Portal from "./Portal.jsx";
import SearchOverlay from "./SearchOverlay.jsx";

const categoryCounts = getCategoryCounts();

// Built once: every published category with the brands that stock it. Drives
// the mega-menu and the mobile drilldown both.
const categoryTree = PUBLISHED.map((category) => ({
  name: category,
  count: categoryCounts[category] ?? 0,
  brands: getBrandsForCategory(category),
}));

const COMPANY = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

// The Brands menu: Voltex's own range first, then the directory.
const OWN_BRAND = { label: "Voltex Exclusive", to: "/brand/voltex-exclusive", count: getProductsByBrand("voltex-exclusive").length };
const brandCount = getBrands().length;

export default function Header({ motionEnabled, toggleMotion, reducedMotion }) {
  const [menu, setMenu] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
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

  useScrollLock(mobile);

  return (
    <header className="site-header sticky top-0 z-40 backdrop-blur-md" onMouseLeave={() => { setMenu(false); setBrandsOpen(false); }}>
      <div className="header-row site-width flex items-center gap-3 sm:gap-6">
        <Link to="/" aria-label="Voltex Electricals, home">
          <Lockup className="text-[15px] sm:text-[18px]" />
        </Link>

        <nav aria-label="Main navigation" className="header-nav hidden items-center gap-7 lg:flex">
          <div
            onMouseEnter={() => { setMenu(true); setBrandsOpen(false); }}
          >
            <button
              type="button"
              aria-controls="product-megamenu"
              onClick={() => { setMenu(true); setBrandsOpen(false); }}
              className="flex items-center gap-1.5 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
              aria-expanded={menu}
              onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setMenu(true); } }}
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
            </button>
            <AnimatePresence>
              {menu && <motion.div id="product-megamenu" className="mega-panel absolute inset-x-0 top-full hidden border-b border-seam lg:block" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .2 }} onClick={() => setMenu(false)}><MegaMenu /></motion.div>}
            </AnimatePresence>
          </div>

          <BrandsMenu open={brandsOpen} setOpen={(open) => { setBrandsOpen(open); if (open) setMenu(false); }} />

          {COMPANY.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onMouseEnter={() => { setMenu(false); setBrandsOpen(false); }}
              onFocus={() => { setMenu(false); setBrandsOpen(false); }}
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

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <button className="motion-toggle" type="button" onClick={toggleMotion} disabled={Boolean(reducedMotion)} aria-pressed={!motionEnabled} aria-label={reducedMotion ? "Reduced motion enabled" : motionEnabled ? "Pause website motion" : "Play website motion"} title={reducedMotion ? "Your reduced motion preference is enabled" : motionEnabled ? "Pause motion" : "Play motion"}>
            <span className="motion-bars" aria-hidden="true"><i /><i /><i /><i /></span>
          </button>
          {/* An icon button on mobile (no room for a pill), a fake input on
              md+ so search reads as present on every page, not just home —
              it opens the same SearchOverlay rather than duplicating a field. */}
          <button
            type="button"
            onClick={() => setSearch(true)}
            aria-label="Search"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-seam text-ink-muted transition-colors hover:border-seam-strong hover:text-ink xl:w-[210px] xl:justify-start xl:gap-2 xl:px-3 xl:text-sm"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
            <span className="hidden truncate text-ink-muted/70 xl:inline">
              Search the catalogue
            </span>
            <kbd className="spec ml-auto hidden shrink-0 rounded-[4px] bg-surface px-1.5 py-0.5 text-[10px] text-ink-muted ring-1 ring-seam xl:inline">
              /
            </kbd>
          </button>

          <EnquiryLink />

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobile}
            onClick={() => setMobile(true)}
            className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-seam text-ink transition-colors hover:border-seam-strong lg:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      <MobileNav open={mobile} onClose={() => setMobile(false)} />

      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </header>
  );
}

// A two-item disclosure menu. Opens on hover like Products, and on click or
// ArrowDown; Escape closes it and returns focus to the button.
function BrandsMenu({ open, setOpen }) {
  const button = useRef(null);
  const panel = useRef(null);
  const { pathname } = useLocation();
  const active = pathname === "/brands" || pathname.startsWith("/brand/");

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const focusItem = (step) => {
    const items = [...(panel.current?.querySelectorAll("a") ?? [])];
    const index = items.indexOf(document.activeElement);
    items[(index + step + items.length) % items.length]?.focus();
  };

  return (
    <div
      className="brands-menu"
      onMouseEnter={() => setOpen(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    >
      <button
        ref={button}
        type="button"
        className="brands-menu-button"
        data-active={active || undefined}
        aria-expanded={open}
        aria-controls="brands-menu"
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown") return;
          event.preventDefault();
          setOpen(true);
          requestAnimationFrame(() => focusItem(1));
        }}
      >
        Brands
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path strokeLinecap="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            id="brands-menu"
            className="brands-menu-panel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") { event.preventDefault(); focusItem(1); }
              if (event.key === "ArrowUp") { event.preventDefault(); focusItem(-1); }
            }}
          >
            <Link to={OWN_BRAND.to} className="brands-menu-own" onClick={() => setOpen(false)}>
              <img src="/brands/voltex-exclusive.svg" alt="" width="120" height="36" />
              <span><strong>{OWN_BRAND.label}</strong><small>Chandeliers and wall lights, {OWN_BRAND.count} models</small></span>
            </Link>
            <Link to="/brands" className="brands-menu-all" onClick={() => setOpen(false)}>
              <span><strong>All brands</strong><small>The {brandCount} brands we carry</small></span>
              <span aria-hidden="true">↗</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EnquiryLink() {
  const { count } = useEnquiry();
  return (
    <Link
      to="/enquiry"
      aria-label={`Enquiry list, ${count} ${count === 1 ? "item" : "items"}`}
      className="header-enquiry relative flex h-10 items-center gap-2 px-3 text-sm transition-colors"
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
  // Header sits outside Routes, so read the category from the current path.
  const { pathname } = useLocation();
  const segments = pathname.split("/");
  const current =
    segments[1] === "c" && segments[2]
      ? decodeURIComponent(segments[2]).toLowerCase()
      : null;

  return <div className="site-width">
    <div className="mega-intro"><div><p className="eyebrow">Find your everyday essentials</p><h2 className="nameplate">A little change. A better space.</h2></div><Link to="/products" className="text-link">The complete catalogue <span aria-hidden="true">↗</span></Link></div>
    <div className="mega-grid">{categoryTree.map((category) => <div key={category.name} className="mega-category" data-category={category.name} data-active={current === category.name.toLowerCase() || undefined}>
      <Link to={categoryPath(category.name)} className="mega-category-visual"><div><strong>{category.name === "Water Geysers" ? "Water heating" : category.name}</strong><span className="spec">{category.count} models <span aria-hidden="true">↗</span></span></div><img src={cdnImage(getCategoryFeature(category.name).image, 300)} alt="" /></Link>
      <ul className="mega-brand-links">{category.brands.map((brand) => <li key={brand.slug}><Link to={brandListingPath(category.name, brand.slug)}>{brand.name}<span>{brand.count}</span></Link></li>)}</ul>
    </div>)}</div>
    <div className="mega-footer"><span>Good light. Fresh air. Everyday comfort.</span><Link to="/contact">Planning something bigger? Talk to us ↗</Link></div>
  </div>;
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
            className="fixed inset-0 z-[85] lg:hidden"
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
                    {active.brands.map((brand) => (
                      <Link
                        key={brand.slug}
                        to={brandListingPath(active.name, brand.slug)}
                        onClick={close}
                        className="flex items-baseline justify-between border-b border-seam py-3.5 text-[15px] text-ink"
                      >
                        {brand.name}
                        <span className="spec text-ink-muted">{brand.count}</span>
                      </Link>
                    ))}
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
                    <p className="mobile-nav-group spec">Brands</p>
                    <Link
                      to={OWN_BRAND.to}
                      onClick={close}
                      className="flex items-baseline justify-between border-b border-seam py-3.5 text-[15px] text-ink"
                    >
                      {OWN_BRAND.label}
                      <span className="spec text-ink-muted">{OWN_BRAND.count}</span>
                    </Link>
                    <Link
                      to="/brands"
                      onClick={close}
                      className="flex items-baseline justify-between border-b border-seam py-3.5 text-[15px] text-ink"
                    >
                      All brands
                      <span className="spec text-ink-muted">{brandCount}</span>
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
