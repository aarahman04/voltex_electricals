import { useConfirm } from "./useConfirm.jsx";
import { useEffect, useState } from "react";
import { readDrafts, saveDrafts } from "../../lib/admin/drafts.js";
import { blankProduct, productFields } from "../../lib/admin/product.js";
import { uploadPhoto } from "../../lib/admin/api.js";
import ProductForm from "./ProductForm.jsx";
import DraftList from "./DraftList.jsx";
import Sheet from "./Sheet.jsx";

export default function AddProducts({ state, save, setShellBusy }) {
  const { confirm: askConfirm, confirmation } = useConfirm();
  const [drafts, setDrafts] = useState([]);
  const [form, setForm] = useState(blankProduct);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [status, setStatus] = useState(() => {
    try { return sessionStorage.getItem("adminPublishStatus") || ""; } catch { return ""; }
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    readDrafts().then((value) => { setDrafts(value.drafts); setForm(value.form || blankProduct()); setLoaded(true); }).catch(() => setStorageError("Could not load saved drafts. Keep this page open and try again."));
  }, []);
  useEffect(() => {
    if (!loaded) return;
    saveDrafts({ drafts, form }).then(() => setStorageError("")).catch(() => setStorageError("Drafts could not be saved on this device. Keep this page open and free some storage."));
  }, [drafts, form, loaded]);
  const shared = () => ({ brand: form.brand, category: form.category, subcategory: form.subcategory });
  async function keep(next, nextForm = form) {
    if (next.length > 50) throw new Error("Publish this list first. A list holds up to 50 products.");
    await saveDrafts({ drafts: next, form: nextForm });
    setDrafts(next); setForm(nextForm); setStorageError("");
    try { sessionStorage.removeItem("adminPublishStatus"); } catch { /* Draft storage is independent. */ }
  }
  async function publish() {
    setConfirm(false); setBusy(true); setShellBusy(true); setError(""); setStatus("");
    window.scrollTo({ top: 0 });
    try {
      const fields = drafts.map(productFields);
      await saveDrafts({ drafts, form });
      const total = drafts.reduce((sum, p) => sum + p.images.length, 0);
      let count = 0;
      const products = [];
      for (let index = 0; index < drafts.length; index += 1) {
        const images = [];
        for (const photo of drafts[index].images) {
          count += 1; setProgress({ text: `Uploading photo ${count}/${total}`, count, total });
          images.push(await uploadPhoto(photo));
        }
        products.push({ ...fields[index], images });
      }
      setProgress({ text: "Saving products…", count: total, total });
      await save({ type: "publish", products });
      // The server succeeded. Do not offer Publish again even if local storage fails.
      setDrafts([]);
      try { await saveDrafts({ drafts: [], form }); }
      catch { setStorageError("Published, but the saved list could not be cleared. Do not publish it again; clear this device’s saved list first."); }
      setStatus("Published — live on the site in about 2 minutes");
      try { sessionStorage.setItem("adminPublishStatus", "Published — live on the site in about 2 minutes"); } catch { /* The inline message still shows. */ }
    } catch (err) { setError(err.message); }
    finally { setProgress(null); setBusy(false); setShellBusy(false); }
  }
  if (!loaded) return <div><p role={storageError ? "alert" : "status"}>{storageError || "Loading saved drafts…"}</p>{storageError && <button className="admin-button" onClick={() => window.location.reload()}>Try again</button>}</div>;
  return <>
    {confirmation}
    <div className="admin-page-heading"><p className="spec">From the godown to the catalogue</p><h1 className="nameplate">Add products</h1><p>Take a photo, add the details, then review your list.</p></div>
    {storageError && <p role="alert" className="admin-banner admin-error">{storageError}</p>}
    {error && <p role="alert" className="admin-banner admin-error">{error} Your drafts are still in the list.</p>}
    {status && <p role="status" className="admin-banner admin-success">{status}</p>}
    {progress && <Sheet title="Publishing products" busy onClose={() => {}}><div className="admin-banner admin-progress" role="status"><strong>{progress.text}</strong><progress max={progress.total} value={progress.count} /><span>Keep this page open. Your list is saved on this device.</span></div></Sheet>}
    <div className="admin-add-layout"><section className="plate admin-form-plate" aria-label="Add a product"><div><ProductForm formId="admin-add-form" value={form} onChange={setForm} taxonomy={state.taxonomy} busy={busy} onSubmit={async (product) => { await keep([...drafts, { ...product, key: crypto.randomUUID() }], blankProduct(shared())); setStatus("Added to your list. Ready for the next product."); setError(""); }} onBulk={async (photos) => { await keep([...drafts, ...photos.map((photo) => ({ ...blankProduct(shared()), images: [photo], key: crypto.randomUUID() }))]); setStatus(photos.length === 1 ? "Added 1 product. Give it a name in your list." : `Added ${photos.length} products. Give each one a name in your list.`); }} /></div></section>
      <DraftList drafts={drafts} busy={busy} onChange={(key, fields) => setDrafts(drafts.map((d) => d.key === key ? { ...d, ...fields } : d))} onEdit={setEditing} onDuplicate={async (draft) => { try { await keep([...drafts, { ...draft, key: crypto.randomUUID() }]); setStatus("Duplicated. Check the name and photos before publishing."); } catch (err) { setError(err.message); } }} onRemove={async (draft) => { if (!await askConfirm(`Remove “${draft.title || "this unnamed product"}” from your list? Its saved photos will be removed too.`)) return; try { await keep(drafts.filter((d) => d.key !== draft.key)); setStatus("Removed from your list."); } catch (err) { setError(err.message); } }} />
    </div>
    <div className="admin-bottom-action"><div><strong>{drafts.length} {drafts.length === 1 ? "product" : "products"} in your list</strong><span className="admin-muted">{busy ? progress?.text : "Review names and photos before publishing"}</span></div>{!drafts.length ? <button className="switch-btn" form="admin-add-form" disabled={busy || Boolean(storageError)}>Add to list</button> : <button className="switch-btn" disabled={busy || Boolean(storageError)} onClick={() => { try { drafts.forEach(productFields); setError(""); setConfirm(true); } catch (err) { setError(err.message); window.scrollTo({ top: 0, behavior: "smooth" }); } }}>{busy ? "Publishing…" : `Publish ${drafts.length} ${drafts.length === 1 ? "product" : "products"}`}</button>}</div>
    {editing && <Sheet title="Edit draft" onClose={() => setEditing(null)} footer={<button className="switch-btn" form="admin-edit-draft">Save draft</button>}><ProductForm formId="admin-edit-draft" hideAction value={editing} onChange={setEditing} taxonomy={state.taxonomy} submitLabel="Save draft" onSubmit={async (product) => { await keep(drafts.map((d) => d.key === editing.key ? product : d)); setEditing(null); setStatus("Draft saved."); }} /></Sheet>}
    {confirm && <Sheet title={`Publish ${drafts.length} ${drafts.length === 1 ? "product" : "products"}?`} onClose={() => setConfirm(false)} footer={<><button className="admin-button" onClick={() => setConfirm(false)}>Review list</button><button className="switch-btn" onClick={publish}>Publish products</button></>}><p>These products and their photos will be added to the live catalogue. They should appear in about 2 minutes.</p></Sheet>}
  </>;
}
