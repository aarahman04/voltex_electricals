import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getFacets, searchProducts } from "../data/products.js";
import Listing from "../components/Listing.jsx";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const [draft, setDraft] = useState(query);
  // A new search fired from elsewhere (header pill, hero) while already on
  // this page updates the URL but not this local draft — adjust it during
  // render (React's documented pattern) rather than in an effect, so there's
  // no extra render pass and no risk of clobbering an in-progress edit.
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setDraft(query);
  }

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
    <div className="site-width py-8 sm:py-12">
      <header className="page-heading mb-10">
        <p className="spec mb-3 text-amber">Search</p>
        <h1 className="nameplate mb-6 text-4xl sm:text-5xl">Find your next essential.</h1>
        <form onSubmit={submit} className="flex max-w-xl items-center gap-3 rounded-[10px] border border-seam bg-surface px-4 transition-shadow focus-within:border-amber focus-within:shadow-[0_0_0_4px_rgba(238,122,27,0.12)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-ink-muted">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            aria-label="Search products"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Model, brand, type — “Atomberg 1200mm”"
            className="h-14 min-w-0 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-muted/60"
          />
          <button type="submit" className="switch-btn shrink-0 !py-2 text-sm">
            Search
          </button>
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
