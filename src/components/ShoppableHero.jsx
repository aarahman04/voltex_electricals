import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBrands, getProductById, getProductImage, products } from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import RoomHotspots from "./RoomHotspots.jsx";

// These exact catalogue photographs are the references for the generated room.
// Coordinates are percentages of the uncropped 3:2 image, on every screen size.
const roomProducts = [
  { uid: "atomberg--atomberg-renesa-prime-crest-ceiling-fan", name: "Renesa Prime Crest", type: "Ceiling fan", x: 50, y: 17, width: 38, height: 28, side: "below" },
  { uid: "orient--raya-curve-wall-light", name: "Raya Curve", type: "Wall light", x: 83, y: 40, width: 14, height: 22, side: "left" },
  { uid: "philips--philips-ornate-table-lamps", name: "Ornate", type: "Table lamp", x: 18, y: 59, width: 17, height: 25, side: "right" },
].map((item) => ({ ...item, product: getProductById(item.uid) })).filter((item) => item.product);

function Arrow() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>;
}

export default function ShoppableHero() {
  const [lightsOn, setLightsOn] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  return <section className="switchboard-hero" data-lit={lightsOn}>
    <div className="switchboard-layout site-width">
      <svg className="switchboard-wire" viewBox="0 0 1200 600" fill="none" preserveAspectRatio="none" aria-hidden="true"><path className="wire-track" d="M-70 410H115q35 0 35 35v80q0 35 35 35h195q35 0 35-35v-15q0-35 35-35h270" /><path className="wire-current" pathLength="1" d="M-70 410H115q35 0 35 35v80q0 35 35 35h195q35 0 35-35v-15q0-35 35-35h270" /></svg>
      <div className="switchboard-copy">
        <p className="eyebrow"><span className="status-light" /> Good energy lives here</p>
        <h1 className="nameplate">Life,<br />switched <span>on.</span></h1>
        <p className="switchboard-description">The right light. A little fresh air.<br />A whole new feeling.</p>
        <Link to="/products" className="action-button">Find your essentials <Arrow /></Link>
      </div>

      <div className="switchboard-room">
        <div className="room-topbar"><span className="spec"><span className="room-live-dot" /> The Voltex room</span><span>See it. Like it. Make it yours.</span></div>
        <div className="shoppable-scene">
          <img className="shoppable-room-image" src="/images/shoppable-room-1440.webp" srcSet="/images/shoppable-room-720.webp 720w, /images/shoppable-room-1440.webp 1440w" sizes="(max-width: 767px) calc(100vw - 40px), 60vw" width="1440" height="960" fetchPriority="high" alt="A styled living room with an Atomberg Renesa Prime Crest ceiling fan, an Orient Raya Curve wall light, and a Philips Ornate table lamp" />
          <span className="shop-room-glow glow-table" aria-hidden="true" /><span className="shop-room-glow glow-wall" aria-hidden="true" />
          <RoomHotspots items={roomProducts} />
        </div>
        <div className="room-console">
          <button className="power-plate" type="button" role="switch" aria-checked={lightsOn} aria-label="Room lighting" onClick={() => setLightsOn((on) => !on)}>
            <span className="plate-screw screw-top" aria-hidden="true" />
            <span className="power-rocker" aria-hidden="true"><span className="power-indicator" /><span className="power-symbol">{lightsOn ? "I" : "O"}</span></span>
            <span className="plate-screw screw-bottom" aria-hidden="true" />
          </button>
          <div className="room-console-copy"><p className="spec">A little switch. A big difference.</p><strong>{lightsOn ? "Hello, warm evenings." : "A quieter kind of evening."}</strong><span>Go on, flip the switch.</span></div>
          <span className="room-power-state" aria-hidden="true">{lightsOn ? "ON" : "OFF"}<span /></span>
        </div>
      </div>
    </div>

    <div className="room-shopping site-width">
      <div className="room-shopping-intro"><span className="eyebrow">Shop this room</span><p>Three details.<br />All the difference.</p><small>Illustrative room · Catalogue products</small></div>
      <div className="room-product-rail">{roomProducts.map((item) => <Link key={item.uid} to={`/product/${item.uid}`} className="room-product-link"><img src={cdnImage(getProductImage(item.product), 120)} alt="" width="64" height="64" /><span><small>{item.product.brand} / {item.type}</small><strong>{item.name}</strong></span><span className="room-product-arrow" aria-hidden="true">↗</span></Link>)}</div>
    </div>
    <div className="space-toolbar site-width">
      <div className="space-toolbar-intro"><span className="eyebrow">Find your everyday</span><p><strong>{products.length.toLocaleString("en-IN")}</strong> models. <strong>{getBrands().length}</strong> brands. One place.</p></div>
      <form className="hero-finder" role="search" onSubmit={(event) => { event.preventDefault(); if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`); }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6" /></svg><input type="search" aria-label="Search the catalogue" placeholder="Find a fan, light or favourite brand…" value={query} onChange={(event) => setQuery(event.target.value)} /><button type="submit" aria-label="Search catalogue"><Arrow /></button></form>
    </div>
  </section>;
}
