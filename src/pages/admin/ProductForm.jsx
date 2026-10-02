import { useConfirm } from "./useConfirm.jsx";
import { useState } from "react";
import { getBrands, getCategories, getSubcategories } from "../../data/products.js";
import { resizeImage } from "../../lib/admin/resizeImage.js";
import { productFields } from "../../lib/admin/product.js";
import Photo from "./Photo.jsx";

export default function ProductForm({ value, onChange, taxonomy, onSubmit, submitLabel = "Add to list", onBulk, busy = false, formId, hideAction = false }) {
  const { confirm: askConfirm, confirmation } = useConfirm();
  const [tag, setTag] = useState("");
  const [error, setError] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [newCategory, setNewCategory] = useState(false);
  const [newType, setNewType] = useState(false);
  // Locks the form while a submit is still saving, so a quick second action
  // (bulk photos, another Add) can't save over the list from stale state.
  const [saving, setSaving] = useState(false);
  const disabled = busy || preparing || saving;
  const categories = [...new Set([...getCategories(), ...Object.keys(taxonomy?.categories ?? {}), value.category].filter(Boolean))].sort();
  const types = [...new Set([...getSubcategories(value.category).map((s) => s.name), ...(taxonomy?.categories?.[value.category] ?? []), value.subcategory].filter(Boolean))].sort();
  const change = (key, next) => onChange({ ...value, [key]: next });

  function addTag() {
    const additions = tag.split(",").map((s) => s.trim()).filter(Boolean);
    const tags = [...value.tags];
    for (const item of additions) if (!tags.some((t) => t.toLowerCase() === item.toLowerCase())) tags.push(item);
    if (tags.length > 20 || tags.some((t) => t.length > 40)) { setError("Use up to 20 tags, each up to 40 characters."); return null; }
    setTag("");
    change("tags", tags);
    return tags;
  }

  async function choosePhotos(event, bulk = false) {
    const files = [...event.target.files];
    event.target.value = "";
    if (!files.length) return;
    setError("");
    if (bulk && (!value.category.trim() || !value.subcategory.trim())) { setError("Choose a category and type before adding bulk photos."); return; }
    if (bulk ? files.length > 50 : files.length + value.images.length > 12) { setError(bulk ? "Choose up to 50 photos at a time." : "Keep up to 12 photos per product."); return; }
    setPreparing(true);
    try {
      const photos = [];
      for (const file of files) photos.push(await resizeImage(file));
      if (bulk) await onBulk(photos);
      else change("images", [...value.images, ...photos]);
    } catch (err) { setError(err.message || "Could not prepare the photos. Please choose them again."); }
    finally { setPreparing(false); }
  }

  function reorder(index, direction) {
    const images = [...value.images];
    [images[index], images[index + direction]] = [images[index + direction], images[index]];
    change("images", images);
  }

  return <form id={formId} className="admin-product-form" onSubmit={async (event) => {
    event.preventDefault(); setError("");
    if (disabled) return;
    const tags = tag.trim() ? addTag() : value.tags;
    if (!tags) return;
    const product = { ...value, tags };
    setSaving(true);
    try { productFields(product); await onSubmit(product); setTag(""); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }}>
    {confirmation}
    <fieldset disabled={disabled}>
      <legend className="sr-only">Product details</legend>
      <section className="admin-photos">
        <label className="admin-photo-picker"><span className="admin-camera" aria-hidden="true">＋</span><strong>Take photo / choose photos</strong><span>Main photo first · up to 12 photos</span><input type="file" accept="image/*" capture="environment" multiple aria-label="Take photo / choose photos" onChange={choosePhotos} /></label>
        {preparing && <p role="status" className="admin-banner">Preparing photos…</p>}
        {value.images.length > 0 && <div className="admin-photo-list">{value.images.map((photo, index) => <div className="admin-photo-card" key={index}>
          <div className="admin-photo"><Photo photo={photo} /></div><span className="spec">{index === 0 ? "Main photo" : `Photo ${index + 1}`}</span>
          <div className="admin-photo-controls"><button type="button" aria-label={`Move photo ${index + 1} earlier`} disabled={index === 0} onClick={() => reorder(index, -1)}>←</button><button type="button" aria-label={`Move photo ${index + 1} later`} disabled={index === value.images.length - 1} onClick={() => reorder(index, 1)}>→</button><button type="button" aria-label={`Remove photo ${index + 1}`} onClick={async () => { if (await askConfirm("Remove this photo from the product?")) change("images", value.images.filter((_, i) => i !== index)); }}>Remove</button></div>
        </div>)}</div>}
      </section>
      <div className="admin-fields">
        <label>Name <span className="admin-required">*</span><input value={value.title} maxLength={200} required onChange={(e) => change("title", e.target.value)} placeholder="e.g. Crystal chandelier, 8 arms" /></label>
        <label>Brand<select value={value.brand || ""} onChange={(e) => change("brand", e.target.value)}><option value="">No brand</option>{getBrands().map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}</select></label>
        <div className="admin-field-pair">
          <label>Category <span className="admin-required">*</span><select value={newCategory ? "+" : value.category} required onChange={(e) => { const fresh = e.target.value === "+"; setNewCategory(fresh); setNewType(false); onChange({ ...value, category: fresh ? "" : e.target.value, subcategory: "" }); }}><option value="">Choose category</option>{categories.map((c) => <option key={c}>{c}</option>)}<option value="+">+ New category</option></select></label>
          <label>Type <span className="admin-required">*</span><select value={newType ? "+" : value.subcategory} required disabled={!value.category} onChange={(e) => { const fresh = e.target.value === "+"; setNewType(fresh); change("subcategory", fresh ? "" : e.target.value); }}><option value="">Choose type</option>{types.map((t) => <option key={t}>{t}</option>)}<option value="+">+ New type</option></select></label>
        </div>
        {newCategory && <label>New category name<input required maxLength={60} pattern="[A-Za-z0-9][A-Za-z0-9 &'\(\),.+\-]*" value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value, subcategory: "" })} /></label>}
        {newType && <label>New type name<input required maxLength={60} pattern="[A-Za-z0-9][A-Za-z0-9 &'\(\),.+\-]*" value={value.subcategory} onChange={(e) => change("subcategory", e.target.value)} /></label>}
        {onBulk && <div className="admin-bulk"><label className="admin-button">Bulk photos<input type="file" accept="image/*" capture="environment" multiple aria-label="Bulk photos" onChange={(e) => choosePhotos(e, true)} /></label><p>One product per photo. Uses the brand, category and type above; add names in your list.</p></div>}
        <details className="admin-optional"><summary>Optional details <span>Price, colour & more</span></summary><div className="admin-fields">
          <label>Price in ₹ <span className="admin-muted">optional</span><input type="number" inputMode="numeric" min={1} max={10000000} step={1} value={value.price ?? ""} placeholder="Whole rupees" onChange={(e) => change("price", e.target.value)} /></label>
          <div className="admin-field-pair"><label>Colour<input value={value.color || ""} maxLength={80} onChange={(e) => change("color", e.target.value)} /></label><label>Model code<input value={value.model || ""} maxLength={80} onChange={(e) => change("model", e.target.value)} /></label></div>
          <label>Tags<input value={tag} placeholder="e.g. crystal, living room" maxLength={200} onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }} /></label>
          <div className="admin-chips">{value.tags.map((t) => <button type="button" className="admin-chip" key={t} aria-label={`Remove tag ${t}`} onClick={async () => { if (await askConfirm(`Remove the tag “${t}”?`)) change("tags", value.tags.filter((s) => s !== t)); }}>{t} ×</button>)}</div>
          <label>Description<textarea value={value.description || ""} maxLength={2000} rows={3} onChange={(e) => change("description", e.target.value)} /></label>
        </div></details>
      </div>
    </fieldset>
    {error && <p role="alert" className="admin-banner admin-error">{error}</p>}
    {!hideAction && <div className="admin-form-action"><button className="switch-btn" disabled={disabled}>{preparing ? "Preparing photos…" : busy || saving ? "Saving…" : submitLabel}</button></div>}
  </form>;
}
