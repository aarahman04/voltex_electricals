import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getFacets, searchProducts } from "../data/products.js";
import Listing from "../components/Listing.jsx";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const [draft, setDraft] = useState(query);

  const results = useMemo(
    () => (query.trim().length >= 2 ? searchProducts(query, 999) : []),
    [query],
  );
  const facets = useMemo(() => getFacets(null), []);

  const submit = (e) => {
    e.preventDefault();
    setParams(
      (p) => {
        if (draft.trim()) p.set("q", draft.trim());
        else p.delete("q");
        // drop stale facet filters when the query changes
        for (const f of facets) p.delete(f.id);
        p.delete("sub");
        return p;
      },
      { replace: false },
    );
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-10 border-b border-seam pb-6">
        <p className="spec mb-3 text-amber">Search</p>
        <form onSubmit={submit} className="flex max-w-xl items-center gap-3 rounded-[10px] border border-seam bg-surface px-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-ink-muted">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Model, brand, type — “Atomberg 1200mm”"
            className="h-12 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-muted/60"
          />
        </form>
        {query.trim().length >= 2 && (
          <p className="spec mt-4 text-ink-muted">
            {results.length} {results.length === 1 ? "result" : "results"} for “
            {query.trim()}”
          </p>
        )}
      </header>

      {query.trim().length < 2 ? (
        <p className="text-sm text-ink-muted">
          Type at least two characters. You can search product names, model
          codes, brands and types.
        </p>
      ) : results.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Nothing matches “{query.trim()}”. Try a broader term, or browse by
          category.
        </p>
      ) : (
        <Listing baseProducts={results} facets={facets} />
      )}
    </div>
  );
}
