import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useSearchParams } from "react-router-dom";
import {
  getBrandsForCategory,
  getFacets,
  getProductsByCategory,
  getSubcategories,
  hasOptionValue,
} from "../data/products.js";
import BrandRail from "../components/BrandRail.jsx";
import FilterPanel from "../components/FilterPanel.jsx";
import ProductCard from "../components/ProductCard.jsx";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "az", label: "A–Z" },
  { value: "options", label: "Most options" },
];

export default function CategoryListing() {
  const { categoryName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const allProducts = useMemo(
    () => getProductsByCategory(categoryName),
    [categoryName],
  );
  const subcategories = useMemo(
    () => getSubcategories(categoryName),
    [categoryName],
  );
  const facets = useMemo(() => getFacets(categoryName), [categoryName]);
  const brands = useMemo(
    () => getBrandsForCategory(categoryName),
    [categoryName],
  );

  const [selectedSubs, setSelectedSubs] = useState(() => {
    const sub = searchParams.get("sub");
    return sub ? [sub] : [];
  });
  const [selectedFacets, setSelectedFacets] = useState(() => {
    const initial = {};
    const tone = searchParams.get("tone");
    if (tone) initial.tone = [tone];
    const brand = searchParams.get("brand");
    if (brand) initial.brand = [brand];
    return initial;
  });

  const activeBrand = selectedFacets.brand?.[0] ?? null;

  const selectBrand = (slug) => {
    setSelectedFacets((prev) => ({ ...prev, brand: slug ? [slug] : [] }));
    setSearchParams(
      (prev) => {
        if (slug) prev.set("brand", slug);
        else prev.delete("brand");
        return prev;
      },
      { replace: true },
    );
  };
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleSub = (name) =>
    setSelectedSubs((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name],
    );

  const toggleFacet = (facetId, value) =>
    setSelectedFacets((prev) => {
      const current = prev[facetId] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [facetId]: next };
    });

  const clearFilters = () => {
    setSelectedSubs([]);
    setSelectedFacets({});
    setSearch("");
    setSearchParams({}, { replace: true });
  };

  const activeCount =
    selectedSubs.length +
    Object.values(selectedFacets).reduce((n, values) => n + values.length, 0) +
    (search.trim() ? 1 : 0);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    let items = allProducts.filter((p) => {
      if (selectedSubs.length > 0 && !selectedSubs.includes(p.subcategory)) {
        return false;
      }

      if (activeBrand && p.brandSlug !== activeBrand) return false;

      for (const facet of facets) {
        const values = selectedFacets[facet.id] ?? [];
        if (values.length === 0) continue;
        if (!values.some((value) => hasOptionValue(p, facet.key, value))) {
          return false;
        }
      }

      if (query) {
        const haystack =
          `${p.title} ${p.subcategory} ${(p.tags ?? []).join(" ")}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });

    if (sort === "az") {
      items = [...items].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "options") {
      items = [...items].sort(
        (a, b) => (b.variants?.length ?? 0) - (a.variants?.length ?? 0),
      );
    }

    return items;
  }, [allProducts, activeBrand, facets, selectedFacets, selectedSubs, search, sort]);

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
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-10 border-b border-conduit pb-6">
        <p className="spec mb-3 text-filament">Catalogue</p>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="nameplate text-4xl text-ivory sm:text-5xl">
            {categoryName}
          </h1>
          <p className="spec text-muted">
            {filtered.length} of {allProducts.length} models
          </p>
        </div>
      </header>

      <BrandRail brands={brands} active={activeBrand} onSelect={selectBrand} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[230px_1fr] lg:gap-12">
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
              className="flex items-center gap-2.5 rounded-[3px] border border-conduit px-4 py-2.5 text-sm text-ivory transition-colors hover:border-muted lg:hidden"
            >
              Filters
              {activeCount > 0 && (
                <span className="spec rounded-[2px] bg-filament px-1.5 py-0.5 text-[9px] text-ground-deep">
                  {activeCount}
                </span>
              )}
            </button>

            <div className="ml-auto flex items-center gap-3">
              <label htmlFor="sort" className="spec hidden text-muted sm:block">
                Sort
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-[3px] border border-conduit bg-ground-deep px-3 py-2.5 text-sm text-ivory focus:border-filament focus:outline-none"
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
            <div className="flex flex-col items-start gap-4 border border-dashed border-conduit p-12">
              <p className="text-base text-ivory">
                No models match these filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="spec border-b border-filament/50 pb-0.5 text-filament transition-colors hover:border-filament"
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
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-ground-deep/70 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              className="thin-scroll fixed inset-x-0 bottom-0 z-50 max-h-[86vh] overflow-y-auto rounded-t-[6px] border-t border-conduit bg-ground p-6 lg:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-7 flex items-center justify-between border-b border-conduit pb-4">
                <h3 className="nameplate text-xl text-ivory">Filters</h3>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="spec rounded-[3px] bg-filament px-4 py-2 text-ground-deep"
                >
                  Show {filtered.length}
                </button>
              </div>
              <FilterPanel {...filterProps} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
