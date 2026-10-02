import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getBrands, products } from "../data/products.js";
import { PUBLISHED, categoryPath } from "../data/taxonomy.js";

export default function About() {
  const brands = getBrands();
  return <div className="about-page">
    <header className="editorial-heading site-width">
      <div><p className="eyebrow"><span className="status-light" /> This is Voltex Electricals</p><h1 className="nameplate">Good energy.<br /><span>Great spaces.</span></h1></div>
      <div className="editorial-aside"><p>It’s the light you come home to. The breeze on a quiet afternoon. The everyday details that make a space yours.</p></div>
    </header>
    <motion.figure className="about-image site-width" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}>
      <img src="/images/voltex-living-1440.webp" srcSet="/images/voltex-living-720.webp 720w, /images/voltex-living-1440.webp 1440w" sizes="(max-width: 767px) 100vw, 90vw" width="1440" height="960" alt="A considered living space with a ceiling fan, warm lighting and natural materials" />
      <figcaption><span className="spec">The everyday, considered.</span><span>Light. Air. Comfort.</span></figcaption>
    </motion.figure>
    <section className="about-story site-width">
      <div><p className="eyebrow">A connection worth making</p><h2 className="nameplate">The right choice<br />changes everything.</h2></div>
      <div className="about-story-copy"><p>We’re Voltex Electricals, a multi-brand electrical goods dealer bringing fans, lighting and water heating together in one place.</p><p>Our catalogue puts the details in your hands: real manufacturer photographs, product specifications, finishes and sizes. Explore at your own pace, build your shortlist, then talk to us about prices and availability.</p><Link to="/products" className="text-link">Find your next essential <span aria-hidden="true">↗</span></Link></div>
    </section>
    <section className="about-numbers site-width" aria-label="Our catalogue in numbers">
      {[[products.length.toLocaleString("en-IN"), "Models to discover"], [String(brands.length).padStart(2,"0"), "Brands, together"], [String(PUBLISHED.length).padStart(2,"0"), "Everyday essentials"]].map(([value, label]) => <div key={label}><strong className="nameplate">{value}</strong><span className="spec">{label}</span></div>)}
    </section>
    <section className="about-principles site-width">
      <div className="section-heading"><div><p className="eyebrow">A simpler way to choose</p><h2 className="nameplate">From possibility to your place.</h2></div></div>
      <div className="principle-grid">{[
        ["01", "Find your kind of comfort.", "Browse by room need, product type or the brands you already know. Compare the details that matter to you."],
        ["02", "Keep the good ones close.", "Add products to your enquiry list as you explore. Bring your whole project together in one shortlist."],
        ["03", "Make the next connection.", "Share your list and quantities with us. We’ll help you move forward with pricing and availability."],
      ].map(([n,title,copy], index) => <motion.article key={n} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .45, delay: index * .08 }}><span className="spec">{n} /</span><h3>{title}</h3><p>{copy}</p></motion.article>)}</div>
    </section>
    <section className="about-close site-width"><div><p className="eyebrow">For the spaces you live and work in</p><h2 className="nameplate">Make yourself at home.</h2></div><div>{PUBLISHED.map((name) => <Link key={name} to={categoryPath(name)}>{name === "Water Geysers" ? "Water heating" : name}<span aria-hidden="true">↗</span></Link>)}</div></section>
  </div>;
}
