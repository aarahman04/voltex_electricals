import { Link } from "react-router-dom";
import { getBrands, products } from "../data/products.js";
import { PUBLISHED, categoryPath } from "../data/taxonomy.js";
import Lockup from "./Lockup.jsx";

const brands = getBrands();

export default function Footer() {
  return <footer className="site-footer">
    <div className="site-width">
      <div className="footer-grid">
        <div className="footer-about">
          <Link to="/" aria-label="Voltex Electricals, home"><Lockup className="text-xl" /></Link>
          <p>Good light. Fresh air. Everyday comfort. Electrical essentials for the spaces you live and work in.</p>
          <Link to="/contact" className="text-link mt-5 !text-[#ed985e]">Let’s talk about your project <span aria-hidden="true">↗</span></Link>
        </div>
        <div><h2 className="footer-heading">Explore</h2><div className="footer-links">
          {PUBLISHED.map((name) => <Link key={name} to={categoryPath(name)}>{name}</Link>)}
          <Link to="/products">All products</Link>
        </div></div>
        <div><h2 className="footer-heading">Our brands</h2><div className="footer-links">
          {brands.filter((b) => ["havells", "orient", "philips", "crompton", "atomberg"].includes(b.slug)).map((b) => <Link key={b.slug} to={"/brand/" + b.slug}>{b.name}</Link>)}
          <Link to="/brands">All {brands.length} brands ↗</Link>
        </div></div>
        <div><h2 className="footer-heading">Here to help</h2><div className="footer-links">
          <Link to="/about">About Voltex</Link><Link to="/contact">Contact us</Link><Link to="/enquiry">Your enquiry list</Link>
          <span className="mt-3 max-w-40 text-xs leading-relaxed text-[#a4ada5]">Browse. Shortlist. Enquire.<br />We’ll take it from there.</span>
        </div></div>
      </div>
      <div className="footer-wordmark" aria-hidden="true">VOLTEX.</div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Voltex Electricals</span><span>{products.length.toLocaleString("en-IN")} models · Prices on enquiry</span></div>
    </div>
  </footer>;
}
