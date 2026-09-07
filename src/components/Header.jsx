import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import { getCategories, getProductsByCategory } from "../data/products.js";
import { useShopNotice } from "../context/shopNotice.js";

const categories = getCategories().map((name) => ({
  name,
  count: getProductsByCategory(name).length,
}));

const catalogueNav = [
  ...categories.map((c) => ({ label: c.name, to: `/category/${c.name}`, count: c.count })),
  { label: "Brands", to: "/brands" },
];

const companyNav = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

function Lockup({ size = "text-[17px]" }) {
  return (
    <span className="flex items-baseline gap-[0.4em] whitespace-nowrap">
      <span className={`nameplate ${size} text-ivory`}>Voltex</span>
      <span className={`nameplate-sub ${size} text-muted`}>Electricals</span>
    </span>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const notify = useShopNotice();

  const search = () =>
    notify("Catalogue search is coming soon. For now, browse by category and filter.");

  return (
    <header className="sticky top-0 z-40 border-b border-conduit bg-ground/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-5 sm:px-8">
        <Link to="/" aria-label="Voltex Electricals, home">
          <Lockup />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {catalogueNav.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-baseline gap-1.5 text-sm transition-colors ${
                  isActive ? "text-filament" : "text-muted hover:text-ivory"
                }`
              }
            >
              {item.label}
              {item.count != null && (
                <span className="spec text-[9px] opacity-50">{item.count}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <nav className="hidden items-center gap-6 pr-3 lg:flex">
            {companyNav.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm transition-colors ${
                    isActive ? "text-filament" : "text-muted hover:text-ivory"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={search}
            aria-label="Search the catalogue"
            className="hidden h-10 w-10 items-center justify-center rounded-[3px] text-muted transition-colors hover:text-ivory md:flex"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
          </button>

          <Link
            to="/cart"
            aria-label="Cart"
            className="hidden h-10 w-10 items-center justify-center rounded-[3px] text-muted transition-colors hover:text-ivory md:flex"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h2l2.4 11.2a1 1 0 0 0 1 .8h7.8a1 1 0 0 0 1-.8L20 8H7" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
            </svg>
          </Link>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-conduit text-ivory transition-colors hover:border-muted md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-ground-deep/70 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 z-50 flex h-full w-[80%] max-w-xs flex-col bg-ground-deep p-6 md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-10 flex items-center justify-between">
                <Lockup size="text-[15px]" />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center text-muted hover:text-ivory"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col">
                <DrawerLink to="/" end onClick={() => setOpen(false)}>
                  Home
                </DrawerLink>
                {catalogueNav.map((item) => (
                  <DrawerLink
                    key={item.label}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    meta={item.count != null ? `${item.count} models` : null}
                  >
                    {item.label}
                  </DrawerLink>
                ))}
                {companyNav.map((item) => (
                  <DrawerLink
                    key={item.label}
                    to={item.to}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </DrawerLink>
                ))}
                <DrawerLink to="/cart" onClick={() => setOpen(false)}>
                  Cart
                </DrawerLink>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function DrawerLink({ to, end, onClick, meta, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `nameplate flex items-baseline justify-between border-b border-conduit py-4 text-2xl transition-colors ${
          isActive ? "text-filament" : "text-ivory"
        }`
      }
    >
      {children}
      {meta && <span className="spec text-[10px] text-muted">{meta}</span>}
    </NavLink>
  );
}
