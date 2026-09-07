import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import { getCategories, getProductsByCategory } from "../data/products.js";

const categories = getCategories().map((name) => ({
  name,
  count: getProductsByCategory(name).length,
}));

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-conduit bg-ground/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="nameplate text-lg text-ivory">Voltex</span>
          <span className="spec text-[9px] text-filament">Electricals</span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {categories.map((category) => (
            <NavLink
              key={category.name}
              to={`/category/${category.name}`}
              className={({ isActive }) =>
                `group flex items-baseline gap-2 text-sm transition-colors ${
                  isActive ? "text-filament" : "text-muted hover:text-ivory"
                }`
              }
            >
              {category.name}
              <span className="spec text-[9px] opacity-50">{category.count}</span>
            </NavLink>
          ))}
        </nav>

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
              className="fixed right-0 top-0 z-50 flex h-full w-[78%] max-w-xs flex-col bg-ground-deep p-6 md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="spec text-muted">Catalogue</span>
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
                <NavLink
                  to="/"
                  end
                  onClick={() => setOpen(false)}
                  className="nameplate border-b border-conduit py-5 text-2xl text-ivory"
                >
                  Home
                </NavLink>
                {categories.map((category) => (
                  <NavLink
                    key={category.name}
                    to={`/category/${category.name}`}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `nameplate flex items-baseline justify-between border-b border-conduit py-5 text-2xl transition-colors ${
                        isActive ? "text-filament" : "text-ivory"
                      }`
                    }
                  >
                    {category.name}
                    <span className="spec text-[10px] text-muted">
                      {category.count} models
                    </span>
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
