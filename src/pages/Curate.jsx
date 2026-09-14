import { useMemo, useState } from "react";
import {
  products,
  getBrands,
  getCategories,
  getSubcategories,
  searchProducts,
} from "../data/products.js";
import { cdnImage } from "../lib/image.js";

// Dev-only bulk removal tool. Reads/writes Products/curation.json through
// the /__curate endpoint vite.config.js registers for `vite dev` only —
// this page is not reachable in production (see App.jsx).

async function fetchCuration() {
  const res = await fetch("/__curate");
  return res.json();
}

async function saveCuration(data) {
  const res = await fetch("/__curate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export default function Curate() {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [lastAnchor, setLastAnchor] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("browse");
  const [panelUid, setPanelUid] = useState(null);
  const [panelUnchecked, setPanelUnchecked] = useState(() => new Set());
  const [removedList, setRemovedList] = useState(null);

  const categories = useMemo(() => getCategories(), []);
  const brands = useMemo(() => getBrands(), []);
  const subcategories = useMemo(
    () => (category ? getSubcategories(category) : []),
    [category],
  );

  const visible = useMemo(() => {
    let list = query.trim() ? searchProducts(query, 2000) : products;
    if (brand) list = list.filter((p) => p.brandSlug === brand);
    if (category) list = list.filter((p) => p.category === category);
    if (subcategory) list = list.filter((p) => p.subcategory === subcategory);
    return list;
  }, [query, brand, category, subcategory]);

  function toggle(uid, index, shiftKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (shiftKey && lastAnchor !== null) {
        const [start, end] = [lastAnchor, index].sort((a, b) => a - b);
        for (let i = start; i <= end; i += 1) next.add(visible[i].uid);
      } else if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }
      return next;
    });
    setLastAnchor(index);
  }

  async function removeSelected() {
    if (selected.size === 0) return;
    setBusy(true);
    const current = await fetchCuration();
    const already = new Set((current.removed ?? []).map((r) => r.uid));
    const additions = visible
      .filter((p) => selected.has(p.uid) && !already.has(p.uid))
      .map((p) => ({ uid: p.uid, title: `${p.brand} ${p.title}` }));
    const removed = [...(current.removed ?? []), ...additions];
    const result = await saveCuration({ removed, removedImages: current.removedImages ?? {} });
    setBusy(false);
    setSelected(new Set());
    setStatus(result.ok ? `Removed ${additions.length}. ${result.report}` : `Failed: ${result.error}`);
    setRemovedList(null);
  }

  async function restore(uid) {
    setBusy(true);
    const current = await fetchCuration();
    const removed = (current.removed ?? []).filter((r) => r.uid !== uid);
    const result = await saveCuration({ removed, removedImages: current.removedImages ?? {} });
    setBusy(false);
    setStatus(result.ok ? `Restored. ${result.report}` : `Failed: ${result.error}`);
    setRemovedList(null);
  }

  async function loadRemoved() {
    const current = await fetchCuration();
    setRemovedList(current.removed ?? []);
  }

  function openImagePanel(uid) {
    setPanelUid(uid);
    setPanelUnchecked(new Set());
  }

  async function saveImages() {
    const product = products.find((p) => p.uid === panelUid);
    if (!product) return;
    setBusy(true);
    const current = await fetchCuration();
    const removedImages = { ...(current.removedImages ?? {}) };
    if (panelUnchecked.size > 0) {
      removedImages[panelUid] = [...panelUnchecked];
    } else {
      delete removedImages[panelUid];
    }
    const result = await saveCuration({ removed: current.removed ?? [], removedImages });
    setBusy(false);
    setStatus(result.ok ? `Saved images for ${product.title}. ${result.report}` : `Failed: ${result.error}`);
    setPanelUid(null);
  }

  const panelProduct = panelUid ? products.find((p) => p.uid === panelUid) : null;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 text-sm">
      <h1 className="mb-4 text-lg font-semibold">Curate products (dev only)</h1>

      <div className="mb-3 flex gap-2 border-b border-black/10 pb-2">
        <button
          className={`rounded px-3 py-1 ${tab === "browse" ? "bg-black text-white" : "bg-black/5"}`}
          onClick={() => setTab("browse")}
        >
          Browse
        </button>
        <button
          className={`rounded px-3 py-1 ${tab === "removed" ? "bg-black text-white" : "bg-black/5"}`}
          onClick={() => {
            setTab("removed");
            loadRemoved();
          }}
        >
          Removed
        </button>
      </div>

      {status && (
        <div className="mb-3 rounded bg-amber-50 px-3 py-2 text-xs text-amber-900">{status}</div>
      )}

      {tab === "removed" ? (
        <div className="space-y-1">
          {removedList === null && <p>Loading…</p>}
          {removedList?.length === 0 && <p className="text-black/50">Nothing removed yet.</p>}
          {removedList?.map((r) => (
            <div key={r.uid} className="flex items-center justify-between rounded border border-black/10 px-3 py-2">
              <span>{r.title}</span>
              <button
                className="rounded bg-black/5 px-2 py-1 text-xs hover:bg-black/10"
                disabled={busy}
                onClick={() => restore(r.uid)}
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-10 mb-3 flex flex-wrap items-center gap-2 bg-paper py-2">
            <input
              className="w-56 rounded border border-black/15 px-2 py-1"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select className="rounded border border-black/15 px-2 py-1" value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">All brands</option>
              {brands.filter((b) => b.count > 0).map((b) => (
                <option key={b.slug} value={b.slug}>{b.name}</option>
              ))}
            </select>
            <select
              className="rounded border border-black/15 px-2 py-1"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory("");
              }}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              className="rounded border border-black/15 px-2 py-1"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={!category}
            >
              <option value="">All subcategories</option>
              {subcategories.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
            <span className="text-black/50">showing {visible.length}</span>
            <div className="ml-auto flex gap-2">
              {selected.size > 0 && (
                <button className="rounded bg-black/5 px-3 py-1" onClick={() => setSelected(new Set())}>
                  Clear ({selected.size})
                </button>
              )}
              <button
                className="rounded bg-red-600 px-3 py-1 font-medium text-white disabled:opacity-40"
                disabled={selected.size === 0 || busy}
                onClick={removeSelected}
              >
                Remove selected ({selected.size})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {visible.map((p, index) => {
              const isSelected = selected.has(p.uid);
              return (
                <div
                  key={p.uid}
                  className={`cursor-pointer rounded border-2 p-1 ${isSelected ? "border-red-600 bg-red-50" : "border-transparent hover:border-black/15"}`}
                  onClick={(e) => toggle(p.uid, index, e.shiftKey)}
                >
                  <div className="relative aspect-square overflow-hidden rounded bg-black/5">
                    <img
                      src={cdnImage(p.images?.primary, 200)}
                      alt=""
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">✓</div>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs font-medium">{p.title}</p>
                  <p className="truncate text-xs text-black/50">{p.brand}</p>
                  {p.images?.gallery?.length > 0 && (
                    <button
                      className="mt-0.5 text-xs text-blue-600 underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openImagePanel(p.uid);
                      }}
                    >
                      images ({p.images.gallery.length})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {panelProduct && (
        <div className="fixed inset-0 z-20 flex justify-end bg-black/40" onClick={() => setPanelUid(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 font-semibold">{panelProduct.title}</h2>
            <p className="mb-3 text-xs text-black/50">Untick images to drop them. First kept image becomes primary.</p>
            <div className="grid grid-cols-2 gap-2">
              {panelProduct.images.gallery.map((url) => {
                const checked = !panelUnchecked.has(url);
                return (
                  <label key={url} className={`flex flex-col gap-1 rounded border p-1 ${checked ? "border-black/15" : "border-red-400 opacity-50"}`}>
                    <img src={cdnImage(url, 200)} alt="" className="aspect-square w-full rounded object-contain" />
                    <span className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setPanelUnchecked((prev) => {
                            const next = new Set(prev);
                            if (next.has(url)) next.delete(url);
                            else next.add(url);
                            return next;
                          })
                        }
                      />
                      keep
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded bg-black px-3 py-1 text-white disabled:opacity-40" disabled={busy} onClick={saveImages}>
                Save images
              </button>
              <button className="rounded bg-black/5 px-3 py-1" onClick={() => setPanelUid(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
