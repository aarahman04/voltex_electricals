import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { hasOptionValue } from "../data/products.js";
import { displayTitle } from "../lib/specSummary.js";
import FilterPanel from "./FilterPanel.jsx";
import ProductCard from "./ProductCard.jsx";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "az", label: "A–Z" },
  { value: "options", label: "Most options" },
];

// One filtered, sorted, URL-synced product grid. Category listings and the
// all-products page are the same view with a different starting set and a
// different facet list.
export default function Listing({
  baseProducts,
  facets,
  subcategories = [],
  children,
}) {
  const [params, setParams] = useSearchParams();

  const selectedFacets = useMemo(() => {
    const out = {};
    for (const facet of facets) {
      const raw = params.get(facet.id);
      if (raw) out[facet.id] = raw.split(",").filter(Boolean);
    }
    return out;
  }, [params, facets]);

  const selectedSubs = useMemo(
    () => (params.get("sub") ? params.get("sub").split(",").filter(Boolean) : []),
    [params],
  );
  const search = params.get("q") ?? "";
  const sort = params.get("sort") ?? "featured";
  const [filtersOpen, setFiltersOpen] = useState(false);

  const patch = (mutate) =>
    setParams(
      (prev) => {
        mutate(prev);
        return prev;
      },
      { replace: true },
    );

  const toggleSub = (name) =>
    patch((p) => {
      const next = selectedSubs.includes(name)
        ? selectedSubs.filter((s) => s !== name)
        : [...selectedSubs, name];
      if (next.length) p.set("sub", next.join(","));
      else p.delete("sub");
    });

  const toggleFacet = (facetId, value) =>
    patch((p) => {
      const current = selectedFacets[facetId] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length) p.set(facetId, next.join(","));
      else p.delete(facetId);
    });

  const setSearch = (value) =>
    patch((p) => (value ? p.set("q", value) : p.delete("q")));
  const setSort = (value) =>
    patch((p) => (value === "featured" ? p.delete("sort") : p.set("sort", value)));
  const clearFilters = () => setParams({}, { replace: true });

  const activeCount =
    selectedSubs.length +
    Object.values(selectedFacets).reduce((n, v) => n + v.length, 0) +
    (search.trim() ? 1 : 0);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let items = baseProducts.filter((p) => {
      if (selectedSubs.length && !selectedSubs.includes(p.subcategory)) return false;
      for (const facet of facets) {
        const values = selectedFacets[facet.id] ?? [];
        if (!values.length) continue;
        if (!values.some((value) => hasOptionValue(p, facet.key, value))) {
          return false;
        }
      }
      if (query) {
        const haystack =
          `${p.title} ${p.brand} ${p.subcategory} ${(p.tags ?? []).join(" ")}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    if (sort === "az") {
      items = [...items].sort((a, b) =>
        displayTitle(a).localeCompare(displayTitle(b)),
      );
    } else if (sort === "options") {
      items = [...items].sort(
        (a, b) => (b.variants?.length ?? 0) - (a.variants?.length ?? 0),
      );
    }
    return items;
  }, [baseProducts, facets, selectedFacets, selectedSubs, search, sort]);

  const filterProps = {
    subcategories,
    selectedSubs,
    onToggleSub: toggleSub,
    facets,
    selectedFacets,
    onToggleFacet: toggleFacet,
    search,
    onSearchChange: setSearch,
    onClear: clearFilters,
    activeCount,
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="thin-scroll sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
            <FilterPanel {...filterProps} />
          </div>
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2.5 rounded-[8px] border border-seam px-4 py-2.5 text-sm text-ink transition-colors hover:border-seam-strong lg:hidden"
            >
              Filters
              {activeCount > 0 && (
                <span className="spec rounded-[4px] bg-amber px-1.5 py-0.5 text-surface">
                  {activeCount}
                </span>
              )}
            </button>

            <p className="spec hidden text-ink-muted sm:block">
              {filtered.length} of {baseProducts.length}
            </p>

            <div className="ml-auto flex items-center gap-3">
              <label htmlFor="sort" className="spec hidden text-ink-muted sm:block">
                Sort
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-[8px] border border-seam bg-surface px-3 py-2.5 text-sm text-ink focus:border-amber focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-start gap-4 rounded-[12px] border border-dashed border-seam p-12">
              <p className="text-base text-ink">No models match these filters.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="spec border-b border-amber/50 pb-0.5 text-amber transition-colors hover:border-amber"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((product) => (
                  <motion.div
                    key={product.uid}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {children}
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-ink/30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              className="thin-scroll fixed inset-x-0 bottom-0 z-50 max-h-[86vh] overflow-y-auto rounded-t-[16px] border-t border-seam bg-paper p-6 lg:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-7 flex items-center justify-between border-b border-seam pb-4">
                <h3 className="nameplate text-xl text-ink">Filters</h3>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="spec rounded-[7px] bg-ink px-4 py-2 text-surface"
                >
                  Show {filtered.length}
                </button>
              </div>
              <FilterPanel {...filterProps} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
