import { useConfirm } from "./useConfirm.jsx";
import { useMemo, useState } from "react";
import { matchesQuery } from "../../data/products.js";
import { adminCatalogue } from "../../lib/admin/catalogue.js";
import { uploadPhoto } from "../../lib/admin/api.js";
import { productFields } from "../../lib/admin/product.js";
import { formatPrice } from "../../lib/price.js";
import Photo from "./Photo.jsx";
import ProductForm from "./ProductForm.jsx";
import Sheet from "./Sheet.jsx";

function PriceEditor({ product, price, busy, onSave, askConfirm }) {
  const [value, setValue] = useState(price ?? "");
  return <form className="admin-price-editor" onSubmit={(e) => { e.preventDefault(); onSave(product.uid, value === "" ? null : Number(value)); }}><label>Price in ₹<input aria-label={`Price for ${product.title}`} type="number" inputMode="numeric" min={1} max={10000000} step={1} value={value} disabled={busy} placeholder="No price" onChange={(e) => setValue(e.target.value)} /></label><button className="switch-btn" disabled={busy || value === ""}>Set price</button><button type="button" className="admin-button" disabled={busy || price == null} onClick={async () => { if (await askConfirm(`Clear the price for “${product.title}”? The site will show no price.`)) onSave(product.uid, null); }}>Clear</button></form>;
}

export default function ManageProducts({ state, save, setShellBusy }) {
  const { confirm: askConfirm, confirmation } = useConfirm();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [shown, setShown] = useState(36);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [progress, setProgress] = useState("");
  const products = useMemo(() => adminCatalogue(state), [state]);
  const visible = products.filter((p) => matchesQuery(p, query) && (filter !== "admin" || p.uid.startsWith("admin--")) && (filter !== "unbranded" || (p.uid.startsWith("admin--") && p.brandSlug === "other")));
  async function run(action, message) {
    setBusy(true); setShellBusy(true); setError(""); setStatus("Saving…");
    try { await save(action); setStatus(message); return true; }
    catch (err) { setError(err.message); setStatus(""); return false; }
    finally { setBusy(false); setShellBusy(false); }
  }
  async function update(product) {
    setBusy(true); setShellBusy(true); setError("");
    try {
      const fields = productFields(product);
      const images = [];
      let count = 0;
      const total = product.images.filter((p) => typeof p !== "string").length;
      for (const photo of product.images) {
        if (typeof photo !== "string") { count += 1; setProgress(`Uploading photo ${count}/${total}`); }
        images.push(await uploadPhoto(photo));
      }
      setProgress("Saving changes…");
      await save({ type: "update", id: product.id, fields, images });
      setEditing(null); setStatus("Saved — live on the site in about 2 minutes");
    } catch (err) { setError(err.message); throw err; }
    finally { setBusy(false); setShellBusy(false); setProgress(""); }
  }
  return <>
    {confirmation}
    <div className="admin-page-heading"><p className="spec">Keep the catalogue current</p><h1 className="nameplate">Manage products</h1><p>Set a price on any product. Edit the products added here.</p></div>
    <div className="admin-toolbar plate"><div><label>Search the catalogue<input type="search" placeholder="Name, brand, model or colour" value={query} disabled={busy} onChange={(e) => { setQuery(e.target.value); setShown(36); }} /></label><div className="admin-chips">{[["all", "All"], ["admin", "Added by admin"], ["unbranded", "Needs a brand"]].map(([id, label]) => <button className="admin-chip" key={id} disabled={busy} aria-pressed={filter === id} onClick={() => { setFilter(id); setShown(36); }}>{label}</button>)}</div></div></div>
    {error && <p role="alert" className="admin-banner admin-error">{error}</p>}{status && <p role="status" className="admin-banner admin-success">{status}</p>}
    <p className="admin-count spec">{visible.length} products</p>
    {!visible.length && <div className="admin-empty plate"><div><h2>No products found</h2><p>{filter === "unbranded" ? "Every admin product has a brand, or none have been added yet." : "Try another name or choose All."}</p></div></div>}
    <div className="admin-manage-list">{visible.slice(0, shown).map((p) => {
      const admin = p.uid.startsWith("admin--");
      const price = admin ? p.price : state.curation?.prices?.[p.uid];
      return <article className="admin-manage-row" key={p.uid}><div className="admin-product-summary"><div className="admin-photo"><Photo photo={p.images.primary} /></div><div><h2>{p.title}</h2><p className="admin-muted">{p.brand} · {p.category}</p><p className="admin-current-price">{formatPrice(price) || "No price set"}</p>{admin && <span className="spec">Added by admin</span>}</div></div><div className="admin-manage-controls"><PriceEditor key={`${p.uid}-${price ?? "none"}`} product={p} price={price} busy={busy} askConfirm={askConfirm} onSave={(uid, amount) => run({ type: "price", uid, price: amount }, amount == null ? "Price cleared — live in about 2 minutes" : "Price saved — live in about 2 minutes")} />{admin && <div className="admin-row-actions"><button className="admin-button" disabled={busy} onClick={() => { const product = state.products.find((item) => item.id === p.id); setError(""); setEditing({ ...product, brand: product.brand || "", price: product.price ?? "" }); }}>Edit</button><button className="admin-button admin-danger-text" disabled={busy} onClick={async () => { if (await askConfirm(`Delete “${p.title}” and all its photos? This cannot be restored from Removed.`)) run({ type: "delete", ids: [p.id] }, "Deleted — the site updates in about 2 minutes"); }}>Delete</button></div>}</div></article>;
    })}</div>
    {shown < visible.length && <button className="admin-button admin-show-more" onClick={() => setShown(shown + 36)}>Show more products</button>}
    {editing && <Sheet title="Edit product" busy={busy} onClose={() => setEditing(null)} footer={<button className="switch-btn" form="admin-edit-product" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>}>{progress && <p role="status" className="admin-banner">{progress}</p>}<ProductForm formId="admin-edit-product" hideAction value={editing} onChange={setEditing} taxonomy={state.taxonomy} onSubmit={update} submitLabel="Save changes" busy={busy} /></Sheet>}
  </>;
}
