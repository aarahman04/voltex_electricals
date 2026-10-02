import { Link } from "react-router-dom";

export default function RoomHotspots({ items, activeIndex = -1, showHint = true }) {
  return <>
    {items.map((item, index) => <Link key={`${item.uid}-${index}`} to={`/product/${item.uid}`} className={`shop-hotspot hotspot-label-${item.side}`} data-open={activeIndex === index} style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.width}%`, height: `${item.height}%` }} aria-label={`View ${item.product.brand} ${item.name} ${item.type.toLowerCase()}`}>
      <span className="shop-hotspot-target" aria-hidden="true">+</span>
      <span className="shop-hotspot-label"><strong>{item.name} <span aria-hidden="true">↗</span></strong></span>
    </Link>)}
    {showHint && <span className="scene-shop-hint"><span aria-hidden="true">+</span> Tap a piece. Explore the product.</span>}
  </>;
}
