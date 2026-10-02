import { Link } from "react-router-dom";
import { getProductImage } from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import { displayTitle, specSummary } from "../lib/specSummary.js";
import { useEnquiry } from "../context/enquiry.js";
import { PUBLISHED, categoryPath } from "../data/taxonomy.js";

export default function Enquiry() {
  const { items, remove, clear, count } = useEnquiry();
  return <div className="enquiry-page site-width">
    <header className="catalogue-heading"><div><p className="eyebrow">A space in the making</p><h1 className="nameplate">Your shortlist<span>.</span></h1><p className="catalogue-description">All your good finds, in one place.</p></div><span className="spec">{count} {count === 1 ? "model" : "models"} selected</span></header>
    {count === 0 ? <div className="shortlist-empty"><div className="shortlist-symbol" aria-hidden="true">+</div><h2 className="nameplate">Your next great find<br />belongs right here.</h2><p>Tap + on a product to add it to your shortlist.<br />When you’re ready, send it to us for a quote.</p><div>{PUBLISHED.map((name) => <Link key={name} to={categoryPath(name)} className="text-link">{name === "Water Geysers" ? "Water heating" : name} <span aria-hidden="true">↗</span></Link>)}</div></div> :
    <div className="shortlist-layout"><div><div className="shortlist-label"><span className="spec">The products</span><button type="button" onClick={clear}>Clear list</button></div><ul className="shortlist-products">{items.map((p) => <li key={p.uid}><Link to={`/product/${p.uid}`} className="shortlist-product"><img src={cdnImage(getProductImage(p), 240)} alt="" /><div><span className="spec">{p.brand}</span><h2>{displayTitle(p)}</h2><p>{specSummary(p) || p.subcategory}</p></div></Link><button type="button" aria-label={`Remove ${displayTitle(p)}`} onClick={() => remove(p.uid)}>×</button></li>)}</ul></div>
    <aside className="shortlist-next"><span className="eyebrow">The next connection</span><h2 className="nameplate">Bring your<br />project to life.</h2><p>Tell us your quantities and a little about your space. We’ll help with pricing and availability.</p><Link to="/contact" className="action-button">Enquire about your list ↗</Link><Link to="/products" className="text-link">Keep exploring →</Link><span className="spec">No checkout. A real conversation.</span></aside></div>}
  </div>;
}
