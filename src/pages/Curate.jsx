import { useEffect, useMemo, useState } from "react";
import {
  getBrands,
  getCategories,
  getSubcategories,
  matchesQuery,
} from "../data/products.js";
import { catalogFull as products } from "../data/catalogFull.js";
import { cdnImage } from "../lib/image.js";

const endpoint = import.meta.env.DEV ? "/__curate" : "/api/curation";

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

export default function Curate() {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selected, setSelected] = useState(() => new Set());
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

  useEffect(() => {
    fetchCuration().then(setCuration).catch((error) => setStatus(error.message));
  }, []);

  const removedIds = useMemo(() => new Set((curation?.removed ?? []).map((item) => item.uid)), [curation]);

  const categories = useMemo(() => getCategories(), []);
  const brands = useMemo(() => getBrands(), []);
  const subcategories = useMemo(
    () => (category ? getSubcategories(category) : []),
    [category],
  );

  const visible = useMemo(() => {
    let list = products.filter((p) => !removedIds.has(p.uid) && (!query.trim() || matchesQuery(p, query)));
    if (brand) list = list.filter((p) => p.brandSlug === brand);
    if (category) list = list.filter((p) => p.category === category);
    if (subcategory) list = list.filter((p) => p.subcategory === subcategory);
    return list;
  }, [query, brand, category, subcategory, removedIds]);

  function toggle(uid, index, shiftKey) {
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
    setPanelUid(uid);
    setPanelUnchecked(new Set(curation.removedImages?.[uid] ?? []));
  }

  async function saveImages() {
    const product = products.find((p) => p.uid === panelUid);
    if (!product) return;
    if (await runAction({ type: "images", uid: panelUid, urls: [...panelUnchecked] })) {
      setStatus(`Saved images for ${product.title}. The site updates after deployment.`);
      setPanelUid(null);
    }
  }

  const panelProduct = panelUid ? products.find((p) => p.uid === panelUid) : null;

  if (!curation) return (
    <div className="mx-auto max-w-md px-4 py-10 text-sm">
      <h1 className="mb-4 text-xl font-semibold">Curate products</h1>
      <p role="status">{status || "Loading catalog…"}</p>
      {status && <button className="mt-4 rounded bg-black px-4 py-2 text-white" onClick={() => window.location.reload()}>Retry</button>}
    </div>
  );

  if (!curation.authenticated) return (
    <form className="mx-auto max-w-md space-y-4 px-4 py-10" onSubmit={login}>
      <h1 className="text-xl font-semibold">Curate products</h1>
      {status && <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{status}</p>}
      <label className="block text-sm">Username
        <input className="mt-1 w-full rounded border border-black/20 px-3 py-2" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
      </label>
      <label className="block text-sm">Password
        <input className="mt-1 w-full rounded border border-black/20 px-3 py-2" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </label>
      <button className="w-full rounded bg-black px-4 py-3 text-white disabled:opacity-40" disabled={busy}>Sign in</button>
    </form>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-24 pt-6 text-sm sm:pb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Curate products</h1>
        {!import.meta.env.DEV && <button className="text-xs underline" onClick={async () => {
          if (await runAction({ type: "logout" })) setCuration({ ...curation, authenticated: false });
        }}>Sign out</button>}
      </div>

      <div className="mb-3 flex gap-2 border-b border-black/10 pb-2">
        <button
          className={`rounded px-3 py-1 ${tab === "browse" ? "bg-black text-white" : "bg-black/5"}`}
          onClick={() => setTab("browse")}
        >
          Browse
        </button>
        <button
          className={`rounded px-3 py-1 ${tab === "removed" ? "bg-black text-white" : "bg-black/5"}`}
          onClick={() => setTab("removed")}
        >
          Removed
        </button>
      </div>

      {status && (
        <div role="status" className="mb-3 rounded bg-amber-50 px-3 py-2 text-xs text-amber-900">{status}</div>
      )}

      {tab === "removed" ? (
        <div className="space-y-1">
          {curation.removed?.length === 0 && <p className="text-black/50">Nothing removed yet.</p>}
          {curation.removed?.map((r) => (
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
          <div className="mb-3 flex flex-wrap items-center gap-2 bg-paper py-2 sm:sticky sm:top-16 sm:z-10">
            <input
              className="w-full rounded border border-black/15 px-2 py-2 sm:w-56 sm:py-1"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select className="min-w-0 flex-1 rounded border border-black/15 px-2 py-2 sm:flex-none sm:py-1" value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">All brands</option>
              {brands.filter((b) => b.count > 0).map((b) => (
                <option key={b.slug} value={b.slug}>{b.name}</option>
              ))}
            </select>
            <select
              className="min-w-0 flex-1 rounded border border-black/15 px-2 py-2 sm:flex-none sm:py-1"
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
              className="min-w-0 flex-1 rounded border border-black/15 px-2 py-2 sm:flex-none sm:py-1"
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
            <div className="ml-auto hidden gap-2 sm:flex">
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
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-label={`Select ${p.brand} ${p.title}`}
                  tabIndex={0}
                  onClick={(e) => toggle(p.uid, index, e.shiftKey)}
                  onKeyDown={(e) => {
                    if (e.target === e.currentTarget && (e.key === " " || e.key === "Enter")) {
                      e.preventDefault();
                      toggle(p.uid, index, e.shiftKey);
                    }
                  }}
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
          {selected.size > 0 && (
            <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-black/10 bg-white p-3 shadow-lg sm:hidden">
              <button className="rounded bg-black/5 px-3 py-3" onClick={() => setSelected(new Set())}>Clear</button>
              <button className="min-w-0 flex-1 rounded bg-red-600 px-3 py-3 font-medium text-white disabled:opacity-40" disabled={busy} onClick={removeSelected}>
                {busy ? "Removing…" : `Remove selected (${selected.size})`}
              </button>
            </div>
          )}
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
