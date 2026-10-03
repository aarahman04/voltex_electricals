import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { getCategoryFeature, getChandelierPicks, getFeaturedProducts, getIndustrialPicks, getProductsByCategory, getProductImage, getProductById } from "../data/products.js";
import { PUBLISHED, brandListingPath, categoryPath } from "../data/taxonomy.js";
import { cdnImage } from "../lib/image.js";
import { kelvinToCss, nearestTone } from "../lib/kelvin.js";
import KelvinBar from "../components/KelvinBar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ShoppableHero from "../components/ShoppableHero.jsx";
import RoomHotspots from "../components/RoomHotspots.jsx";
import { displayTitle, specSummary } from "../lib/specSummary.js";

const featured = getFeaturedProducts(4);
const industrial = getIndustrialPicks(4);
const chandeliers = getChandelierPicks();
// Positions match the complete 3:2 collection photograph, including both COB fixtures.
const collectionPieces = [
  { uid: "atomberg--atomberg-renesa-prime-crest-ceiling-fan", name: "Renesa Prime Crest", type: "Ceiling fan", x: 45, y: 17, width: 40, height: 25, side: "below" },
  { uid: "philips--philips-ornate-table-lamps", name: "Ornate", type: "Table lamp", x: 89, y: 54, width: 12, height: 21, side: "left" },
  { uid: "orient--prism-surface-cob-led-downlighter-warm-white", name: "Prism Surface", type: "COB light", x: 16, y: 10, width: 8, height: 13, side: "right" },
  { uid: "orient--prism-surface-cob-led-downlighter-warm-white", name: "Prism Surface", type: "COB light", x: 80, y: 12, width: 8, height: 13, side: "left" },
].map((item) => ({ ...item, product: getProductById(item.uid) })).filter((item) => item.product);
const collectionProducts = [...new Map(collectionPieces.map((item) => [item.uid, item])).values()];
const categoryCopy = {
  Fans: { title: "A breath of fresh air.", description: "Ceiling, pedestal, wall & exhaust fans", label: "Explore fans" },
  Lighting: { title: "Set the right mood.", description: "Everyday essentials to statement lighting", label: "Explore lighting" },
  Chandeliers: { title: "Make the ceiling count.", description: "Chandeliers, pendants & ceiling lights", label: "Explore chandeliers" },
  "Water Geysers": { title: "Comfort, on demand.", description: "Instant & storage water heaters", label: "Explore water heaters" },
};
const needs = [
  { title: "A cooler home", hint: "Ceiling & room fans", to: categoryPath("Fans"), icon: "fan" },
  { title: "A little less energy", hint: "Explore BLDC fans", to: "/search?q=bldc", icon: "bolt" },
  { title: "A brighter everyday", hint: "LED bulbs & panels", to: "/search?q=led+bulb", icon: "bulb" },
  { title: "Light beyond the walls", hint: "Outdoor & commercial", to: "/search?q=outdoor", icon: "sun" },
];

function Arrow({ diagonal = false }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h16m-6-6 6 6-6 6"} /></svg>;
}

function ElectricalIcon({ kind }) {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "bulb" ? <><path d="M8 16c0-3-3-3-3-7a7 7 0 0 1 14 0c0 4-3 4-3 7M8 17h8M9 20h6M11 23h2" /><path d="m10 9 2 3 2-3m-2 3v5" /></> : kind === "fan" ? <><circle cx="12" cy="12" r="2" /><path d="M11 10C5-1 21 1 15 9m-1 4c13-1 5 13 0 3m-4-3C3 24-3 8 8 11" /></> : kind === "sun" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></> : <path d="m14 2-9 12h7l-2 8 9-12h-7l2-8Z" />}
  </svg>;
}

export default function Home({ motionEnabled }) {
  return <div className="home-page">
    <ShoppableHero motionEnabled={motionEnabled} />
    <Section eyebrow="The collection" title="Every room. Every need." href="/products" hrefLabel="View the catalogue">
      <div className="category-grid">{PUBLISHED.map((category) => <CategoryCard key={category} category={category} />)}</div>
    </Section>
    <LightingStudio />
    <Section className="range-section" eyebrow="Discover the range" title="Good things, well chosen." blurb="A few favourites for the spaces you make your own." href="/products" hrefLabel="Explore the collection">
      <div className="range-editorial">
        <div className="range-room">
          <CollectionScene motionEnabled={motionEnabled} />
          <div><span className="spec">See it here. Find it here.</span><h3 className="nameplate">Feel more at home.</h3><p>Explore the fan, lamp and COB lights that bring this room to life.</p>
            <ul className="collection-product-links">{collectionProducts.map((item) => <li key={item.uid}><Link to={`/product/${item.uid}`}><span><small>{item.type}</small><strong>{item.product.brand} {item.name}</strong></span><Arrow diagonal /></Link></li>)}</ul>
            <small className="collection-image-note">Illustrative room · Explore product details for finishes.</small>
          </div>
        </div>
        <div className="range-grid">{featured.map((p) => <ProductCard key={p.uid} product={p} />)}</div>
      </div>
      <div className="range-note"><span><span className="status-light" /> Find your favourites. Save products to your enquiry list.</span><span className="spec">Browse. Shortlist. Make it yours.</span></div>
    </Section>
    {chandeliers.products.length > 0 && <ChandelierRange />}
    <section className="needs-band">
      <div className="site-width">
        <p className="eyebrow">What’s on your list?</p>
        <div className="needs-grid">{needs.map((need) => <Link className="need-link" key={need.title} to={need.to}>
          <span className="need-icon"><ElectricalIcon kind={need.icon} /></span><span><strong>{need.title}</strong><small>{need.hint}</small></span><Arrow />
        </Link>)}</div>
      </div>
    </section>
    {industrial.length > 0 && <IndustrialRange />}
    <HowItWorks />
    <section className="site-width enquiry-banner">
      <div><p className="eyebrow">Let’s get your project going</p><h2 className="nameplate">A better space<br />starts with a conversation.</h2></div>
      <div className="enquiry-banner-action"><p>A single room or a whole building. Tell us what you need and we’ll help with a quote.</p><Link to="/contact" className="action-button">Talk to Voltex <Arrow diagonal /></Link></div>
    </section>
  </div>;
}

function Section({ eyebrow, title, blurb, href, hrefLabel, children, className = "" }) {
  return <motion.section className={`home-section site-width ${className}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
    <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2 className="nameplate">{title}</h2>{blurb && <p className="section-description">{blurb}</p>}</div>{href && <Link to={href} className="text-link">{hrefLabel}<Arrow diagonal /></Link>}</div>
    {children}
  </motion.section>;
}

function IndustrialRange() {
  const [lead, ...others] = industrial;
  return <motion.section className="industrial-section" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .7 }}><div className="site-width">
    <div className="industrial-heading"><div><p className="eyebrow"><span className="status-light" /> Built for the bigger picture</p><h2 className="nameplate">Serious spaces.<br /><span>Serious power.</span></h2></div><div><p>From the workshop floor to the warehouse ceiling. Air movement and lighting that mean business.</p><Link to={brandListingPath("Fans", "almonard")} className="text-link">Explore industrial fans <Arrow diagonal /></Link></div></div>
    <div className="industrial-grid">
      <Link className="industrial-feature" to={`/product/${lead.uid}`}><span className="spec"><span>{lead.brand} / Industrial</span><span>Air in motion</span></span><span className="airflow-rings" aria-hidden="true" /><svg className="airflow-lines" viewBox="0 0 500 360" fill="none" aria-hidden="true">{[0, 1, 2, 3].map((i) => <path key={i} pathLength="1" d={`M-50 ${80 + i * 60}C100 ${-20 + i * 60} 340 ${200 + i * 40} 550 ${60 + i * 60}`} style={{ animationDelay: `${i * -.8}s` }} />)}</svg><img src={cdnImage(getProductImage(lead), 750)} alt={displayTitle(lead)} loading="lazy" /><div className="industrial-feature-foot"><div><h3 className="nameplate">{displayTitle(lead)}</h3><small>{specSummary(lead)} · Explore the model</small></div><span aria-hidden="true">↗</span></div></Link>
      <div className="industrial-products">{others.map((p) => <Link key={p.uid} to={`/product/${p.uid}`} className="industrial-product"><img src={cdnImage(getProductImage(p), 300)} alt="" loading="lazy" /><div><span className="spec">{p.brand}</span><h3>{displayTitle(p)}</h3><small>{specSummary(p) || p.subcategory}</small></div><span aria-hidden="true">↗</span></Link>)}</div>
    </div>
    <div className="industrial-foot spec"><span>Factories & workshops</span><span>Warehouses & commercial spaces</span><span>Project enquiries welcome</span></div>
  </div></motion.section>;
}

// The collection room introduces its products one at a time, like the hero:
// each marker opens its label in turn while the room is on screen. It stops
// while the visitor points at or focuses a marker, and stays still when
// motion is paused or reduced (markers still open on hover and focus).
const REVEAL_MS = 2600;
function CollectionScene({ motionEnabled }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(-1);
  const [held, setHeld] = useState(false);
  const playing = motionEnabled && !reducedMotion && inView && !held;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % collectionPieces.length), active === -1 ? 600 : REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [playing, active]);
  return <figure
    ref={ref}
    className="shoppable-scene collection-scene"
    onPointerEnter={() => setHeld(true)}
    onPointerLeave={() => setHeld(false)}
    onFocus={() => setHeld(true)}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false); }}
  >
    <img className="shoppable-room-image" src="/images/collection-room-1440.webp" srcSet="/images/collection-room-720.webp 720w, /images/collection-room-1440.webp 1440w" sizes="(max-width: 767px) calc(100vw - 40px), 60vw" width="1440" height="960" alt="A warm living room with an Atomberg Renesa Prime Crest ceiling fan, Philips Ornate table lamp and two Orient Prism Surface COB lights. Select a marked product to explore it." loading="lazy" />
    <RoomHotspots items={collectionPieces} activeIndex={held || !playing ? -1 : active} />
  </figure>;
}

// Voltex Exclusive chandeliers. Each photograph hangs from a brass rail on a
// fine drop line; the lines draw down once when the section comes into view.
function ChandelierRange() {
  const reducedMotion = useReducedMotion();
  const [room] = chandeliers.rooms;
  const drop = (i) => ({
    initial: reducedMotion ? false : { scaleY: 0 },
    whileInView: { scaleY: 1 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: 0.9, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] },
  });
  return <section className="chandelier-section" aria-labelledby="chandelier-heading"><div className="site-width">
    <div className="chandelier-heading">
      <div>
        <p className="eyebrow">Voltex Exclusive</p>
        <h2 id="chandelier-heading" className="nameplate">Chandeliers,<br /><span>from our own range.</span></h2>
      </div>
      <div>
        <p>Crystal-style, modern LED, pendant and ceiling designs. Browse the collection, save the ones you like, and ask us about any model.</p>
        <Link to={categoryPath("Chandeliers")} className="text-link">Explore chandeliers <Arrow diagonal /></Link>
      </div>
    </div>
    <div className="chandelier-layout">
      {room && <Link to={`/product/${room.uid}`} className="chandelier-room">
        {/* The large tile uses the 1280 detail file; the 640 card file looks soft at this size. */}
        <img src={getProductImage(room).replace(/-640\.webp$/, "-1280.webp")} srcSet={`${getProductImage(room)} 640w, ${getProductImage(room).replace(/-640\.webp$/, "-1280.webp")} 1280w`} sizes="(max-width: 1100px) calc(100vw - 40px), 520px" width={room.images.width} height={room.images.height} alt={displayTitle(room)} loading="lazy" decoding="async" />
        <span className="chandelier-room-foot"><span><strong>{displayTitle(room)}</strong><small>Shown in a styled room</small></span><span aria-hidden="true">↗</span></span>
      </Link>}
      <ul className="chandelier-rail">
        {chandeliers.products.map((p, i) => <li key={p.uid}>
          <motion.span className="chandelier-drop" aria-hidden="true" {...drop(i)} />
          <Link to={`/product/${p.uid}`} className="chandelier-piece">
            <span className="chandelier-plate"><img src={getProductImage(p)} width={p.images.width} height={p.images.height} alt="" loading="lazy" decoding="async" /></span>
            <span className="chandelier-caption"><strong>{p.title.replace(/\s+VX-[A-Z]+-\d+$/, "")}</strong><small>{p.variants?.[0]?.sku}</small></span>
          </Link>
        </li>)}
      </ul>
    </div>
  </div></section>;
}

function CategoryCard({ category }) {
  const copy = categoryCopy[category];
  return <Link to={categoryPath(category)} className="category-card" data-category={category}>
    <div className="category-card-heading"><span className="eyebrow">{category}</span><span className="category-arrow"><Arrow diagonal /></span></div>
    <h3 className="nameplate">{copy.title}</h3><p>{copy.description}</p>
    <div className="category-image"><img src={cdnImage(getCategoryFeature(category).image, 700)} alt="" loading="lazy" decoding="async" /></div>
    <div className="category-card-foot"><span>{copy.label}</span><span className="spec">{getProductsByCategory(category).length} models</span></div>
  </Link>;
}

function LightingStudio() {
  const [kelvin, setKelvin] = useState(2700);
  const tone = nearestTone(kelvin);
  return <section className="light-studio" style={{ "--light": kelvinToCss(kelvin) }}>
    <div className="site-width light-studio-layout">
      <div className="light-studio-copy"><p className="eyebrow">The light lab</p><h2 className="nameplate">Same room.<br /><span>Different feeling.</span></h2><p>Warm and welcoming, or crisp and focused. Move the slider to find your kind of light.</p><span className="studio-tone"><span />{tone.name} · {kelvin}K</span></div>
      <KelvinBar kelvin={kelvin} onChange={setKelvin} />
    </div>
  </section>;
}

function HowItWorks() {
  const reducedMotion = useReducedMotion();
  return <section className="how-section site-width">
    <div className="section-heading"><div><p className="eyebrow">From browsing to building</p><h2 className="nameplate">Let’s make it simple.</h2></div><p className="section-description">Your next project, in three steps.</p></div>
    <svg className="process-circuit" viewBox="0 0 1200 48" fill="none" aria-hidden="true"><path d="M15 24H385q15 0 15-12t15-12h355q15 0 15 12t15 12h385" stroke="#d5dccb" /><motion.path d="M15 24H385q15 0 15-12t15-12h355q15 0 15 12t15 12h385" stroke="#bc6a3a" strokeWidth="1.5" initial={reducedMotion ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: "easeInOut" }} /><circle cx="15" cy="24" r="4" fill="#bc6a3a" /><circle cx="600" cy="0" r="4" fill="#bc6a3a" /><circle cx="1185" cy="24" r="4" fill="#bc6a3a" /></svg>
    <div className="how-grid">{[
      ["01", "Find your fit", "Browse brands and compare the sizes, finishes and specifications that suit your space."],
      ["02", "Build your shortlist", "Tap + on any product to save it to your enquiry list. Everything you need, together."],
      ["03", "Let’s talk details", "Send us your list and quantities. We’ll help with pricing and availability."],
    ].map(([number, title, description]) => <div key={number} className="how-step"><span className="how-number spec">{number}</span><h3>{title}</h3><p>{description}</p></div>)}</div>
  </section>;
}
