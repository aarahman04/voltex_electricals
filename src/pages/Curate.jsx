import { useEffect, useMemo, useState } from "react";
import {
  getBrands,
  getCategories,
  getSubcategories,
  matchesQuery,
} from "../data/products.js";
import { catalogFull as products } from "../data/catalogFull.js";
import { cdnImage } from "../lib/image.js";
import Portal from "../components/Portal.jsx";
import { useScrollLock } from "../lib/useScrollLock.js";

const endpoint = import.meta.env.DEV ? "/__curate" : "/api/curation";
const PAGE_SIZE = 48;

async function fetchCuration() {
  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) throw new Error((await res.json()).error || "Could not load curation");
  return res.json();
}

async function saveCuration(action) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Could not save curation");
  return res.json();
}

function ProductPhoto({ url, width = 200 }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) return <span className="flex h-full items-center justify-center px-3 text-center text-xs text-ink-muted">Image unavailable</span>;
  return <img src={cdnImage(url, width)} alt="" className="h-full w-full object-contain" loading="lazy" onError={() => setFailed(true)} />;
}

export default function Curate() {
  const [query, setQuery] = useState("");
  const [removedQuery, setRemovedQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [shown, setShown] = useState(PAGE_SIZE);
  const [removedShown, setRemovedShown] = useState(PAGE_SIZE);
  const [lastAnchor, setLastAnchor] = useState(null);
  const [status, setStatus] = useState(() => {
    const message = sessionStorage.getItem("curateStatus") || "";
    sessionStorage.removeItem("curateStatus");
    return message;
  });
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("browse");
  const [panelUid, setPanelUid] = useState(null);
  const [panelUnchecked, setPanelUnchecked] = useState(() => new Set());
  const [curation, setCuration] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useScrollLock(Boolean(panelUid));

  useEffect(() => {
    if (!panelUid) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") setPanelUid(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [panelUid]);

  useEffect(() => {
    fetchCuration().then(setCuration).catch((error) => setStatus(error.message));
  }, []);

  const removedIds = useMemo(() => new Set((curation?.removed ?? []).map((item) => item.uid)), [curation]);

  const categories = useMemo(() => getCategories(), []);
  const brands = useMemo(() => getBrands(), []);
  const subcategories = useMemo(
    () => (category ? getSubcategories(category, brand) : []),
    [category, brand],
  );

  const visible = useMemo(() => {
    let list = products.filter((p) => !removedIds.has(p.uid) && (!query.trim() || matchesQuery(p, query)));
    if (brand) list = list.filter((p) => p.brandSlug === brand);
    if (category) list = list.filter((p) => p.category === category);
    if (subcategory) list = list.filter((p) => p.subcategory === subcategory);
    return list;
  }, [query, brand, category, subcategory, removedIds]);
  const shownProducts = visible.slice(0, shown);
  const allShownSelected = shownProducts.length > 0 && shownProducts.every((product) => selected.has(product.uid));
  const filteredRemoved = (curation?.removed ?? []).filter((item) =>
    `${item.title} ${item.uid}`.toLowerCase().includes(removedQuery.trim().toLowerCase()),
  );
  const shownRemoved = filteredRemoved.slice(0, removedShown);
  const panelProduct = panelUid ? products.find((p) => p.uid === panelUid) : null;
  const panelGallery = panelProduct
    ? [...new Set([...(panelProduct.images?.gallery ?? []), ...(curation?.removedImages?.[panelUid] ?? [])])]
    : [];
  const keptImages = panelGallery.length - panelUnchecked.size;

  function toggle(uid, index, shiftKey) {
    if (busy) return;
    setSelected((prev) => {
      const next = new Set(prev);
      const anchorIndex = visible.findIndex((p) => p.uid === lastAnchor);
      if (shiftKey && anchorIndex !== -1) {
        const [start, end] = [anchorIndex, index].sort((a, b) => a - b);
        for (let i = start; i <= end; i += 1) next.add(visible[i].uid);
      } else if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }
      return next;
    });
    setLastAnchor(uid);
  }

  function selectShown() {
    setSelected((prev) => new Set([...prev, ...shownProducts.map((product) => product.uid)]));
  }

  function clearSelected() {
    setSelected(new Set());
    setLastAnchor(null);
  }

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await saveCuration({ type: "login", username, password });
      setPassword("");
      setCuration(await fetchCuration());
      setStatus("");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function runAction(action) {
    setBusy(true);
    setStatus("");
    try {
      const result = await saveCuration(action);
      setCuration(result);
      return result;
    } catch (error) {
      setStatus(error.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function removeSelected() {
    if (selected.size === 0) return;
    const items = products
      .filter((p) => selected.has(p.uid) && !removedIds.has(p.uid))
      .map((p) => ({ uid: p.uid, title: `${p.brand} ${p.title}` }));
    if (items.length !== selected.size) {
      setStatus("The catalog changed while selecting. Refresh and try again.");
      return;
    }
    if (await runAction({ type: "remove", items })) {
      sessionStorage.setItem("curateStatus", `Removed ${items.length} products from the live catalog.`);
      window.location.reload();
    }
  }

  async function restore(uid) {
    if (await runAction({ type: "restore", uid })) {
      setStatus("Restored. It will appear after the next site deployment.");
    }
  }

  function openImagePanel(uid) {
    setStatus("");
    setPanelUid(uid);
    setPanelUnchecked(new Set(curation.removedImages?.[uid] ?? []));
  }

  async function saveImages() {
    if (!panelProduct || keptImages === 0) return;
    if (await runAction({ type: "images", uid: panelUid, urls: [...panelUnchecked] })) {
      setStatus(`Saved images for ${panelProduct.title}. The site updates after deployment.`);
      setPanelUid(null);
    }
  }

  if (!curation) return (
    <div className="mx-auto max-w-md px-5 py-12 text-sm">
      <h1 className="nameplate mb-4 text-2xl">Curate products</h1>
      <p role="status">{status || "Loading catalog…"}</p>
      {status && <button className="mt-4 min-h-11 rounded-lg bg-ink px-5 text-white" onClick={() => window.location.reload()}>Retry</button>}
    </div>
  );

  if (!curation.authenticated) return (
    <div className="mx-auto max-w-md px-5 py-10 sm:py-16">
      <p className="spec mb-3 text-amber">Catalogue control</p>
      <h1 className="nameplate text-3xl">Curate products</h1>
      <p className="mt-2 text-sm text-ink-muted">Sign in to review products and update the live catalogue.</p>
      <form className="mt-7 space-y-4 rounded-xl border border-seam bg-surface p-5 shadow-sm sm:p-7" onSubmit={login}>
        {status && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{status}</p>}
        <label className="block text-sm font-medium">Username
          <input className="mt-2 min-h-11 w-full rounded-lg border border-seam-strong bg-white px-3 text-base" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
        </label>
        <label className="block text-sm font-medium">Password
          <input className="mt-2 min-h-11 w-full rounded-lg border border-seam-strong bg-white px-3 text-base" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="min-h-11 w-full rounded-lg bg-ink px-4 font-medium text-white disabled:opacity-40" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-28 pt-6 text-sm sm:px-6 sm:pb-10 sm:pt-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="spec mb-2 text-amber">Catalogue control</p>
          <h1 className="nameplate text-2xl sm:text-3xl">Curate products</h1>
          <p className="mt-2 text-sm text-ink-muted">Select products to remove from the live catalogue.</p>
        </div>
        {!import.meta.env.DEV && <button className="min-h-10 shrink-0 rounded-lg border border-seam bg-surface px-3 text-xs font-medium text-ink-muted" disabled={busy} onClick={async () => {
          if (await runAction({ type: "logout" })) setCuration({ ...curation, authenticated: false });
        }}>Sign out</button>}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-seam bg-surface p-1 sm:max-w-sm">
        <button
          className={`min-h-11 rounded-lg px-3 font-medium ${tab === "browse" ? "bg-ink text-white" : "text-ink-muted"}`}
          onClick={() => setTab("browse")}
        >
          Browse{selected.size > 0 ? ` · ${selected.size} selected` : ""}
        </button>
        <button
          className={`min-h-11 rounded-lg px-3 font-medium ${tab === "removed" ? "bg-ink text-white" : "text-ink-muted"}`}
          onClick={() => setTab("removed")}
        >
          Removed · {curation.removed?.length ?? 0}
        </button>
      </div>

      {status && (
        <div role="status" className="mb-4 rounded-lg border border-amber/30 bg-amber-tint px-4 py-3 text-sm text-ink">{status}</div>
      )}

      {tab === "removed" ? (
        <section aria-label="Removed products">
          <div className="mb-4 grid gap-2 sm:flex sm:items-end sm:justify-between">
            <label className="block text-xs font-medium text-ink-muted sm:w-96">Find a removed product
              <input
                type="search"
                className="mt-1 min-h-11 w-full rounded-lg border border-seam-strong bg-surface px-3 text-base text-ink"
                placeholder="Search by name or model"
                value={removedQuery}
                onChange={(event) => { setRemovedQuery(event.target.value); setRemovedShown(PAGE_SIZE); }}
              />
            </label>
            <p className="spec text-ink-muted">{filteredRemoved.length} removed</p>
          </div>
          {filteredRemoved.length === 0 && <p className="rounded-xl border border-seam bg-surface p-5 text-ink-muted">{removedQuery ? "No removed products match your search." : "No products have been removed."}</p>}
          <div className="grid gap-2 lg:grid-cols-2">
            {shownRemoved.map((r) => (
            <div key={r.uid} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-seam bg-surface px-4 py-3">
              <span className="min-w-0 break-words font-medium">{r.title}</span>
              <button
                className="min-h-11 shrink-0 rounded-lg border border-seam-strong px-3 text-xs font-medium text-ink hover:bg-paper disabled:opacity-50"
                disabled={busy}
                onClick={() => restore(r.uid)}
              >
                Restore
              </button>
            </div>
            ))}
          </div>
          {shownRemoved.length < filteredRemoved.length && (
            <button className="mt-5 min-h-11 w-full rounded-lg border border-seam-strong bg-surface px-4 font-medium sm:w-auto" onClick={() => setRemovedShown((count) => count + PAGE_SIZE)}>
              Show more removed products
            </button>
          )}
        </section>
      ) : (
        <>
          <div className="mb-4 rounded-xl border border-seam bg-surface p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <label className="col-span-2 text-xs font-medium text-ink-muted md:col-span-1">Search products
                <input
                  type="search"
                  className="mt-1 min-h-11 w-full rounded-lg border border-seam-strong bg-white px-3 text-base text-ink"
                  placeholder="Name or model"
                  value={query}
                  onChange={(event) => { setQuery(event.target.value); setShown(PAGE_SIZE); }}
                />
              </label>
              <label className="min-w-0 text-xs font-medium text-ink-muted">Brand
                <select className="mt-1 min-h-11 w-full rounded-lg border border-seam-strong bg-white px-2 text-sm text-ink" value={brand} onChange={(event) => { setBrand(event.target.value); setSubcategory(""); setShown(PAGE_SIZE); }}>
                  <option value="">All brands</option>
                  {brands.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                </select>
              </label>
              <label className="min-w-0 text-xs font-medium text-ink-muted">Category
                <select className="mt-1 min-h-11 w-full rounded-lg border border-seam-strong bg-white px-2 text-sm text-ink" value={category} onChange={(event) => { setCategory(event.target.value); setSubcategory(""); setShown(PAGE_SIZE); }}>
                  <option value="">All categories</option>
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="col-span-2 min-w-0 text-xs font-medium text-ink-muted md:col-span-1">Subcategory
                <select className="mt-1 min-h-11 w-full rounded-lg border border-seam-strong bg-white px-2 text-sm text-ink disabled:bg-paper disabled:text-ink-muted" value={subcategory} onChange={(event) => { setSubcategory(event.target.value); setShown(PAGE_SIZE); }} disabled={!category}>
                  <option value="">All subcategories</option>
                  {subcategories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-seam pt-3">
              <span className="spec mr-auto text-ink-muted">Showing {shownProducts.length} of {visible.length}</span>
              {(query || brand || category || subcategory) && <button className="min-h-10 rounded-lg px-3 text-xs font-medium text-ink-muted underline" onClick={() => { setQuery(""); setBrand(""); setCategory(""); setSubcategory(""); setShown(PAGE_SIZE); }}>Clear filters</button>}
              <button className="min-h-10 rounded-lg border border-seam-strong px-3 text-xs font-medium text-ink disabled:opacity-40" disabled={allShownSelected || shownProducts.length === 0 || busy} onClick={selectShown}>
                {allShownSelected ? "Shown selected" : `Select shown (${shownProducts.length})`}
              </button>
              {selected.size > 0 && <button className="hidden min-h-10 rounded-lg border border-seam-strong px-3 text-xs font-medium sm:block" disabled={busy} onClick={clearSelected}>Clear selection</button>}
              <button className="hidden min-h-10 rounded-lg bg-red-700 px-4 text-xs font-semibold text-white disabled:opacity-40 sm:block" disabled={selected.size === 0 || busy} onClick={removeSelected}>
                {busy ? "Removing…" : `Remove selected (${selected.size})`}
              </button>
            </div>
          </div>
          {visible.length === 0 && <p className="mb-4 rounded-xl border border-seam bg-surface p-5 text-ink-muted">No products match these filters.</p>}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
            {shownProducts.map((p, index) => {
              const isSelected = selected.has(p.uid);
              const galleryCount = new Set([...(p.images?.gallery ?? []), ...(curation.removedImages?.[p.uid] ?? [])]).size;
              return (
                <article
                  key={p.uid}
                  className={`flex min-w-0 flex-col rounded-xl border bg-surface p-1.5 ${isSelected ? "border-amber bg-amber-tint" : "border-seam"}`}
                >
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? "Deselect" : "Select"} ${p.brand} ${p.title}`}
                    className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                    disabled={busy}
                    onClick={(event) => toggle(p.uid, index, event.shiftKey)}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-paper">
                      <ProductPhoto url={p.images?.primary} />
                      <span aria-hidden="true" className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border text-xs shadow-sm ${isSelected ? "border-amber bg-amber text-white" : "border-seam-strong bg-white"}`}>
                        {isSelected ? "✓" : ""}
                      </span>
                    </div>
                    <span className="mt-2 block min-h-9 line-clamp-2 text-xs font-semibold leading-4">{p.title}</span>
                    <span className="mt-1 block truncate text-xs text-ink-muted">{p.brand}</span>
                  </button>
                  {galleryCount > 0 && (
                    <button
                      type="button"
                      className="mt-2 min-h-9 rounded-lg border border-seam px-2 text-left text-xs font-medium text-ink-muted hover:bg-paper"
                      disabled={busy}
                      onClick={() => openImagePanel(p.uid)}
                    >
                      Edit images · {galleryCount}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
          {shownProducts.length < visible.length && (
            <button className="mt-5 min-h-11 w-full rounded-lg border border-seam-strong bg-surface px-4 font-medium sm:w-auto" onClick={() => setShown((count) => count + PAGE_SIZE)}>
              Show more products
            </button>
          )}
          {selected.size > 0 && (
            <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-2 border-t border-seam bg-surface px-4 pt-3 shadow-[0_-8px_30px_rgba(19,26,36,0.12)] sm:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
              <button className="min-h-11 rounded-lg border border-seam-strong px-4 font-medium" disabled={busy} onClick={clearSelected}>Clear</button>
              <button className="min-h-11 min-w-0 flex-1 rounded-lg bg-red-700 px-3 font-semibold text-white disabled:opacity-40" disabled={busy} onClick={removeSelected}>
                {busy ? "Removing…" : `Remove selected (${selected.size})`}
              </button>
            </div>
          )}
        </>
      )}

      {panelProduct && (
        <Portal>
          <div className="fixed inset-0 z-[90] flex justify-end bg-ink/50" onClick={() => { if (!busy) setPanelUid(null); }}>
            <div role="dialog" aria-modal="true" aria-labelledby="curate-images-title" className="flex h-[100dvh] w-full max-w-lg flex-col overflow-hidden bg-surface shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-3 border-b border-seam px-4 py-4 sm:px-6">
                <div className="min-w-0">
                  <p className="spec mb-1 text-amber">Image selection</p>
                  <h2 id="curate-images-title" className="nameplate text-xl">{panelProduct.title}</h2>
                </div>
                <button type="button" aria-label="Close image editor" className="min-h-10 shrink-0 rounded-lg border border-seam px-3 text-xl" disabled={busy} onClick={() => setPanelUid(null)}>×</button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                <p className="mb-4 text-sm text-ink-muted">Untick images to hide them. The first kept image becomes the main photo after deployment.</p>
                {status && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{status}</p>}
                <div className="grid grid-cols-2 gap-3">
                  {panelGallery.map((url) => {
                    const checked = !panelUnchecked.has(url);
                    return (
                      <label key={url} className={`flex cursor-pointer flex-col overflow-hidden rounded-xl border ${checked ? "border-seam" : "border-amber bg-amber-tint"}`}>
                        <span className="aspect-square bg-paper"><ProductPhoto url={url} /></span>
                        <span className="flex min-h-11 items-center gap-2 px-3 text-xs font-medium">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={busy}
                            onChange={() => setPanelUnchecked((prev) => {
                              const next = new Set(prev);
                              if (next.has(url)) next.delete(url);
                              else next.add(url);
                              return next;
                            })}
                          />
                          Keep image
                        </span>
                      </label>
                    );
                  })}
                </div>
                {keptImages === 0 && <p className="mt-4 text-sm text-red-700">Keep at least one image, or remove the product instead.</p>}
              </div>
              <div className="flex gap-2 border-t border-seam bg-surface px-4 pt-3 sm:px-6 sm:pb-4" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
                <button className="min-h-11 flex-1 rounded-lg border border-seam-strong px-3 font-medium" disabled={busy} onClick={() => setPanelUid(null)}>Cancel</button>
                <button className="min-h-11 flex-1 rounded-lg bg-ink px-3 font-medium text-white disabled:opacity-40" disabled={busy || keptImages === 0} onClick={saveImages}>
                  {busy ? "Saving…" : `Save ${keptImages} images`}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
