import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { getBrands, getProductById, getProductImage, products } from "../data/products.js";
import { cdnImage } from "../lib/image.js";
import RoomHotspots from "./RoomHotspots.jsx";
import { advanceHero, heroScenes, heroTiming } from "../data/heroScenes.js";

const scenes = heroScenes.map((scene) => ({ ...scene, items: scene.items
  .map((item) => ({ ...item, product: getProductById(item.uid) })).filter((item) => item.product) }));

function Arrow() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>;
}

export default function ShoppableHero({ motionEnabled = true }) {
  const [lightsOn, setLightsOn] = useState(true);
  const [query, setQuery] = useState("");
  const [frame, setFrame] = useState({ scene: 0, phase: "settle", product: 0 });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [previousMotion, setPreviousMotion] = useState(motionEnabled);
  const [hidden, setHidden] = useState(document.hidden);
  const [loaded, setLoaded] = useState([]);
  const heroRef = useRef(null);
  const inView = useInView(heroRef, { amount: .15 });
  const navigate = useNavigate();
  const still = !motionEnabled || paused;
  const playing = !still && !hovered && !focused && !hidden && inView;
  const phase = still ? "settle" : frame.phase;
  const next = (frame.scene + 1) % scenes.length;
  const scene = scenes[frame.scene];
  const roomProducts = scene.items;
  const activeProduct = still ? frame.product : phase === "reveal" ? frame.product : -1;

  if (previousMotion !== motionEnabled) {
    setPreviousMotion(motionEnabled);
    setFrame((current) => ({ ...current, phase: "settle" }));
  }

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    // Keep the current photograph visible until the incoming image is decoded.
    if (!playing || !loaded.includes(frame.scene) || (phase === "close" && !loaded.includes(next))) return;
    const timer = window.setTimeout(() => setFrame((current) => advanceHero(current, scenes)), heroTiming[phase]);
    return () => window.clearTimeout(timer);
  }, [frame, loaded, next, phase, playing]);

  const browsingEvents = {
    onPointerEnter: (event) => { if (event.pointerType === "mouse") setHovered(true); },
    onPointerLeave: () => setHovered(false),
    onFocusCapture: () => setFocused(true),
    onBlurCapture: (event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); },
  };

  return <section ref={heroRef} className="switchboard-hero" data-lit={lightsOn}>
    <div className="switchboard-layout site-width">
      <svg className="switchboard-wire" viewBox="0 0 1200 600" fill="none" preserveAspectRatio="none" aria-hidden="true"><path className="wire-track" d="M-70 410H115q35 0 35 35v80q0 35 35 35h195q35 0 35-35v-15q0-35 35-35h270" /><path className="wire-current" pathLength="1" d="M-70 410H115q35 0 35 35v80q0 35 35 35h195q35 0 35-35v-15q0-35 35-35h270" /></svg>
      <div className="switchboard-copy">
        <p className="eyebrow"><span className="status-light" /> Good energy lives here</p>
        <h1 className="nameplate">Life,<br />switched <span>on.</span></h1>
        <p className="switchboard-description">The right light. A little fresh air.<br />A whole new feeling.</p>
        <Link to="/products" className="action-button">Find your essentials <Arrow /></Link>
      </div>

      <div className="switchboard-room" role="region" aria-roledescription="carousel" aria-label="Products in five spaces">
        <div className="room-topbar"><span className="spec"><span className="room-live-dot" /> The Voltex spaces</span><span>Every space. A little better.</span></div>
        <div className="hero-carousel" data-phase={phase} data-still={still} style={{ "--scene-duration": `${heroTiming[phase]}ms` }} {...browsingEvents}>
          {scenes.map((room, index) => {
            const current = index === frame.scene;
            const interactive = current && ["settle", "reveal", "close"].includes(phase);
            return <div key={room.id} className="shoppable-scene hero-scene" data-current={current} data-next={index === next} inert={!interactive} aria-hidden={!current} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${scenes.length}: ${room.name}`}>
              <img className="shoppable-room-image" src={`/images/${room.image}-1440.webp`} srcSet={`/images/${room.image}-720.webp 720w, /images/${room.image}-1440.webp 1440w`} sizes="(max-width: 767px) calc(100vw - 54px), 60vw" width="1440" height="960" fetchPriority={index === 0 ? "high" : "low"} decoding="async" alt={room.alt} onLoad={async (event) => { try { await event.currentTarget.decode(); } catch { /* A loaded image can still be displayed if decode is unavailable. */ } setLoaded((ready) => ready.includes(index) ? ready : [...ready, index]); }} />
              {room.id === "living" && <><span className="shop-room-glow glow-table" aria-hidden="true" /><span className="shop-room-glow glow-wall" aria-hidden="true" /></>}
              <RoomHotspots items={room.items} activeIndex={current ? activeProduct : -1} showHint={false} />
            </div>;
          })}
        </div>
        <div className="hero-scene-controls">
          <span className="hero-scene-name" aria-live={playing ? "off" : "polite"}><span>{String(frame.scene + 1).padStart(2, "0")}</span> {scene.name}</span>
          <div className="hero-scene-dots" role="group" aria-label="Choose a space">{scenes.map((room, index) => <button key={room.id} type="button" aria-label={`Show ${room.name.toLowerCase()}`} aria-pressed={frame.scene === index} disabled={!loaded.includes(index)} onClick={() => { setFrame({ scene: index, phase: "settle", product: 0 }); setPaused(true); }}><span /></button>)}</div>
          <button className="hero-play" type="button" aria-label={still ? "Play scene slideshow" : "Pause scene slideshow"} disabled={!motionEnabled} onClick={() => { setPaused((value) => !value); setFrame((current) => ({ ...current, phase: "settle" })); }}><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">{still ? <path d="m5 3 8 5-8 5Z" /> : <path d="M4 3h3v10H4zm5 0h3v10H9z" />}</svg></button>
        </div>
        <div className="room-console">
          <button className="power-plate" type="button" role="switch" aria-checked={lightsOn} aria-label="Room lighting" onClick={() => setLightsOn((on) => !on)}>
            <span className="plate-screw screw-top" aria-hidden="true" />
            <span className="power-rocker" aria-hidden="true"><span className="power-indicator" /><span className="power-symbol">{lightsOn ? "I" : "O"}</span></span>
            <span className="plate-screw screw-bottom" aria-hidden="true" />
          </button>
          <div className="room-console-copy"><p className="spec">A little switch. A big difference.</p><strong>{lightsOn ? scene.mood : "A quieter kind of space."}</strong><span>Go on, flip the switch.</span></div>
          <span className="room-power-state" aria-hidden="true">{lightsOn ? "ON" : "OFF"}<span /></span>
        </div>
      </div>
    </div>

    <div className="room-shopping site-width" {...browsingEvents}>
      <div className="room-shopping-intro"><span className="eyebrow">Shop this space</span><p>{scene.name}.<br />Made better.</p><small>Illustrative spaces · Catalogue products</small></div>
      <div className="room-product-rail">{roomProducts.map((item) => <Link key={item.uid} to={`/product/${item.uid}`} className="room-product-link"><img src={cdnImage(getProductImage(item.product), 120)} alt="" width="64" height="64" /><span><small>{item.product.brand} / {item.type}</small><strong>{item.name}</strong></span><span className="room-product-arrow" aria-hidden="true">↗</span></Link>)}</div>
    </div>
    <div className="space-toolbar site-width">
      <div className="space-toolbar-intro"><span className="eyebrow">Find your everyday</span><p><strong>{products.length.toLocaleString("en-IN")}</strong> models. <strong>{getBrands().length}</strong> brands. One place.</p></div>
      <form className="hero-finder" role="search" onSubmit={(event) => { event.preventDefault(); if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`); }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6" /></svg><input type="search" aria-label="Search the catalogue" placeholder="Find a fan, light or favourite brand…" value={query} onChange={(event) => setQuery(event.target.value)} /><button type="submit" aria-label="Search catalogue"><Arrow /></button></form>
    </div>
  </section>;
}
