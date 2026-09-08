import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { searchProducts } from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import { displayTitle } from "../lib/specSummary.js";

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const close = () => {
    setQuery("");
    onClose();
  };

  const results = useMemo(
    () => (query.trim().length >= 2 ? searchProducts(query, 8) : []),
    [query],
  );
  const total = useMemo(
    () => (query.trim().length >= 2 ? searchProducts(query, 999).length : 0),
    [query],
  );

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    close();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="fixed inset-x-0 top-0 z-[70] mx-auto max-w-2xl px-4 pt-[8vh]"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="overflow-hidden rounded-[14px] border border-seam bg-paper shadow-[0_40px_80px_-32px_rgba(19,26,36,0.4)]">
              <form onSubmit={submit} className="flex items-center gap-3 border-b border-seam px-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-ink-muted">
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="m20 20-3.5-3.5" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search models, brands, types…"
                  className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-muted/60"
                />
                <button type="button" onClick={close} className="spec shrink-0 text-ink-muted hover:text-ink">
                  Esc
                </button>
              </form>

              {query.trim().length >= 2 && (
                <div className="thin-scroll max-h-[52vh] overflow-y-auto">
                  {results.length === 0 ? (
                    <p className="px-5 py-8 text-sm text-ink-muted">
                      Nothing matches “{query.trim()}”. Try a brand, a model or a
                      type — “Atomberg”, “1200mm”, “panel light”.
                    </p>
                  ) : (
                    <ul>
                      {results.map((p) => (
                        <li key={p.uid}>
                          <button
                            type="button"
                            onClick={() => {
                              navigate(`/product/${p.uid}`);
                              close();
                            }}
                            className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-amber-tint"
                          >
                            <img
                              src={cdnImage(p.images?.primary, 96)}
                              alt=""
                              loading="lazy"
                              className="h-12 w-12 shrink-0 rounded-[6px] bg-surface object-contain mix-blend-multiply ring-1 ring-seam"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm text-ink">
                                {displayTitle(p)}
                              </span>
                              <span className="spec text-ink-muted">
                                {p.brand} · {p.subcategory}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {total > results.length && (
                    <button
                      type="button"
                      onClick={submit}
                      className="spec block w-full border-t border-seam px-5 py-3 text-left text-amber hover:bg-amber-tint"
                    >
                      See all {total} results →
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
