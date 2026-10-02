import { useConfirm } from "./useConfirm.jsx";
import { useEffect, useMemo, useState } from "react";
import { getBrands, matchesQuery } from "../../data/products.js";
import { adminCatalogue } from "../../lib/admin/catalogue.js";
import Photo from "./Photo.jsx";
import Sheet from "./Sheet.jsx";

const PAGE_SIZE = 48;
const RECENT_KEY = "adminRecentRemoved";
function readRecent() {
  try { return new Set(JSON.parse(sessionStorage.getItem(RECENT_KEY) || "[]")); }
  catch { return new Set(); }
}

export default function RemoveProducts({ state, save, setShellBusy }) {
  const { confirm: askConfirm, confirmation } = useConfirm();
  const curation = state.curation;
  const products = useMemo(() => adminCatalogue(state), [state]);
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [lastAnchor, setLastAnchor] = useState(null);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [tab, setTab] = useState("browse");
  const [removedQuery, setRemovedQuery] = useState("");
  const [recent, setRecent] = useState(readRecent);
  const [panel, setPanel] = useState(null);
  const [unchecked, setUnchecked] = useState(() => new Set());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(() => window.matchMedia("(min-width: 1000px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1000px)");
    const update = () => setFiltersOpen(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const removedIds = new Set((curation.removed ?? []).map((p) => p.uid));
  const visible = products.filter((p) => !removedIds.has(p.uid) && matchesQuery(p, query) && (!brand || p.brandSlug === brand) && (!category || p.category === category) && (!subcategory || p.subcategory === subcategory));
  const shownProducts = visible.slice(0, shown);
  const categories = [...new Set(products.map((p) => p.category))].sort();
  const types = [...new Set(products.filter((p) => p.category === category && (!brand || p.brandSlug === brand)).map((p) => p.subcategory))].sort();
  const removed = (curation.removed ?? []).filter((p) => (tab !== "recent" || recent.has(p.uid)) && `${p.title} ${p.uid}`.toLowerCase().includes(removedQuery.trim().toLowerCase()));
  const gallery = panel ? [...new Set([panel.images.primary, ...(panel.images.gallery ?? []), ...(curation.removedImages?.[panel.uid] ?? [])].filter(Boolean))] : [];
  const kept = gallery.filter((url) => !unchecked.has(url)).length;
  async function run(action, message) {
    setBusy(true); setShellBusy(true); setError(""); setStatus("Saving…");
    try { await save(action); setStatus(message); return true; }
    catch (err) { setError(err.message); setStatus(""); return false; }
    finally { setBusy(false); setShellBusy(false); }
  }
  function remember(next) {
    setRecent(next);
    try { sessionStorage.setItem(RECENT_KEY, JSON.stringify([...next])); } catch { /* Recent is optional; Removed always comes from the server. */ }
  }
  function toggle(uid, index, shift) {
    const next = new Set(selected);
    const anchor = visible.findIndex((p) => p.uid === lastAnchor);
    if (shift && anchor !== -1) {
      const [start, end] = [anchor, index].sort((a, b) => a - b);
      for (let i = start; i <= end; i += 1) next.add(visible[i].uid);
    } else if (next.has(uid)) next.delete(uid);
    else next.add(uid);
    setSelected(next); setLastAnchor(uid);
  }
  async function removeSelected() {
    const items = products.filter((p) => selected.has(p.uid) && !removedIds.has(p.uid)).map((p) => ({ uid: p.uid, title: `${p.brand === "No brand" ? "" : p.brand + " "}${p.title}` }));
    if (!items.length) return;
    if (!await askConfirm(`Remove ${items.length} ${items.length === 1 ? "product" : "products"} from the site? You can bring them back from Removed.`)) return;
    if (await run({ type: "remove", items }, `Removed ${items.length} ${items.length === 1 ? "product" : "products"}. You can restore them from Removed.`)) { remember(new Set([...recent, ...items.map((p) => p.uid)])); setSelected(new Set()); setLastAnchor(null); }
  }
  async function saveImages() {
    if (unchecked.size && !await askConfirm(`Hide ${unchecked.size} ${unchecked.size === 1 ? "photo" : "photos"} from this product? You can keep them again here later.`)) return;
    if (await run({ type: "images", uid: panel.uid, urls: [...unchecked] }, "Photos saved — live on the site in about 2 minutes")) setPanel(null);
  }
  return <>
    {confirmation}
    <div className="admin-page-heading"><p className="spec">Choose what stays on the site</p><h1 className="nameplate">Remove products</h1><p>Tap to select. On a computer, Shift-click selects a range.</p></div>
    <div className="admin-chips admin-remove-tabs">{[["browse", "Browse"], ["recent", "Recent"], ["removed", `Removed (${curation.removed?.length || 0})`]].map(([id, label]) => <button className="admin-chip" key={id} disabled={busy} aria-pressed={tab === id} onClick={() => { setTab(id); setShown(PAGE_SIZE); }}>{label}</button>)}</div>
    {error && <p role="alert" className="admin-banner admin-error">{error}</p>}{status && <p role="status" className="admin-banner">{status}</p>}
    {tab !== "browse" ? <section aria-label="Removed products"><label>Find a removed product<input type="search" placeholder="Search removed products" value={removedQuery} onChange={(e) => { setRemovedQuery(e.target.value); setShown(PAGE_SIZE); }} /></label><p className="admin-count spec">{removed.length} products</p>{!removed.length && <div className="admin-empty plate"><div><h2>No removed products here</h2><p>{tab === "recent" ? "Products removed in this browser session appear here." : "Try another name, or return to Browse."}</p></div></div>}<div className="admin-restore-list">{removed.slice(0, shown).map((p) => <article key={p.uid}><strong>{p.title}</strong><button className="admin-button" disabled={busy} onClick={async () => { if (await run({ type: "restore", uid: p.uid }, "Restored — live on the site in about 2 minutes")) remember(new Set([...recent].filter((id) => id !== p.uid))); }}>Restore</button></article>)}</div>{removed.length > shown && <button className="admin-button admin-show-more" onClick={() => setShown(shown + PAGE_SIZE)}>Show more removed products</button>}</section> : <>
      <div className="admin-toolbar plate"><div><div className="admin-remove-filters"><label>Search products<input type="search" placeholder="Name, brand or model" value={query} disabled={busy} onChange={(e) => { setQuery(e.target.value); setShown(PAGE_SIZE); }} /></label><details className="admin-remove-choices" open={filtersOpen} onToggle={(e) => setFiltersOpen(e.currentTarget.open)}><summary>Filter by brand, category or type</summary><div><label>Brand<select value={brand} disabled={busy} onChange={(e) => { setBrand(e.target.value); setSubcategory(""); setShown(PAGE_SIZE); }}><option value="">All brands</option>{getBrands().map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}<option value="other">No brand</option></select></label><label>Category<select value={category} disabled={busy} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); setShown(PAGE_SIZE); }}><option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></label><label>Type<select value={subcategory} disabled={!category || busy} onChange={(e) => { setSubcategory(e.target.value); setShown(PAGE_SIZE); }}><option value="">All types</option>{types.map((t) => <option key={t}>{t}</option>)}</select></label></div></details></div><div className="admin-row-actions"><span className="spec">{shownProducts.length} of {visible.length}</span><button className="admin-button" disabled={busy || !shownProducts.length} onClick={() => setSelected(new Set([...selected, ...shownProducts.map((p) => p.uid)]))}>Select shown</button>{(query || brand || category || subcategory) && <button className="admin-button" onClick={() => { setQuery(""); setBrand(""); setCategory(""); setSubcategory(""); setShown(PAGE_SIZE); }}>Clear filters</button>}</div></div></div>
      {!visible.length && <div className="admin-empty"><h2>No products found</h2><p>Try a different search or clear the filters.</p></div>}
      <div className="admin-remove-grid">{shownProducts.map((p, index) => <article key={p.uid} data-selected={selected.has(p.uid)}><button className="admin-select-product" aria-pressed={selected.has(p.uid)} aria-label={`${selected.has(p.uid) ? "Deselect" : "Select"} ${p.title}`} disabled={busy} onClick={(e) => toggle(p.uid, index, e.shiftKey)}><div className="admin-photo"><Photo photo={p.images.primary} /><span className="admin-check" aria-hidden="true">{selected.has(p.uid) ? "✓" : ""}</span></div><strong>{p.title}</strong><span className="admin-muted">{p.brand}</span></button><button className="admin-button" disabled={busy} onClick={() => { setPanel(p); setUnchecked(new Set(curation.removedImages?.[p.uid] ?? [])); setError(""); }}>Clean up photos</button></article>)}</div>
      {visible.length > shown && <button className="admin-button admin-show-more" onClick={() => setShown(shown + PAGE_SIZE)}>Show more products</button>}
      <div className="admin-bottom-action"><div><strong>{selected.size} selected</strong><button className="admin-button" disabled={busy || !selected.size} onClick={() => { setSelected(new Set()); setLastAnchor(null); }}>Clear selection</button></div><button className="switch-btn" disabled={busy || !selected.size} onClick={removeSelected}>{busy ? "Removing…" : `Remove selected (${selected.size})`}</button></div>
    </>}
    {panel && <Sheet title={panel.title} busy={busy} onClose={() => setPanel(null)} footer={<button className="switch-btn" disabled={busy || !kept} onClick={saveImages}>{busy ? "Saving…" : `Save ${kept} ${kept === 1 ? "photo" : "photos"}`}</button>}><p className="admin-muted">Untick photos to hide them. The first kept photo becomes the main photo. Keep at least one.</p>{error && <p role="alert" className="admin-banner admin-error">{error}</p>}<div className="admin-cleanup-grid">{gallery.map((url) => <label key={url}><div className="admin-photo"><Photo photo={url} /></div><span><input type="checkbox" disabled={busy} checked={!unchecked.has(url)} onChange={() => { const next = new Set(unchecked); if (next.has(url)) next.delete(url); else next.add(url); setUnchecked(next); }} />Keep photo</span></label>)}</div>{!kept && <p role="alert" className="admin-banner admin-error">Keep at least one photo, or remove the product instead.</p>}</Sheet>}
  </>;
}
