import Photo from "./Photo.jsx";

export default function DraftList({ drafts, busy, onChange, onEdit, onDuplicate, onRemove }) {
  return <section className="admin-drafts plate" aria-label="Draft list"><div>
    <div className="admin-section-heading"><div><p className="spec">Review before publishing</p><h2 className="nameplate">Your list <span>{drafts.length}</span></h2></div></div>
    <p className="admin-muted">Saved on this device. Finish the names, then publish together.</p>
    {!drafts.length && <div className="admin-empty"><span aria-hidden="true">＋</span><h3>Your next product starts with a photo</h3><p>Add a product and it will appear here for a final check.</p></div>}
    <div className="admin-draft-list">{drafts.map((draft, index) => <article className="admin-draft" key={draft.key}>
      <div className="admin-draft-top"><div className="admin-photo"><Photo photo={draft.images[0]} /></div><div className="admin-draft-fields"><label className="sr-only" htmlFor={`name-${draft.key}`}>Name for draft {index + 1}</label><input id={`name-${draft.key}`} required maxLength={200} placeholder="Give this product a name" value={draft.title} disabled={busy} onChange={(e) => onChange(draft.key, { title: e.target.value })} /><p className="admin-muted">{draft.category} / {draft.subcategory}</p><label>Price in ₹ <span className="admin-muted">optional</span><input type="number" inputMode="numeric" min={1} max={10000000} step={1} placeholder="No price" value={draft.price ?? ""} disabled={busy} onChange={(e) => onChange(draft.key, { price: e.target.value })} /></label></div></div>
      <div className="admin-row-actions"><button className="admin-button" disabled={busy} onClick={() => onEdit(draft)}>Edit</button><button className="admin-button" disabled={busy || drafts.length >= 50} onClick={() => onDuplicate(draft)}>Duplicate</button><button className="admin-button admin-danger-text" disabled={busy} onClick={() => onRemove(draft)}>Remove</button></div>
    </article>)}</div>
  </div></section>;
}
