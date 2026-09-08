// The maker's-plate lockup: "Voltex" stamped, "ELECTRICALS" tracked out beneath
// it in the quiet register. Hovering or focusing the mark warms the sub-word to
// amber while "Voltex" stays ink — the contrast is the whole effect, and it is
// the same rule wherever the lockup appears. Behaviour lives in .lockup-sub
// (index.css) so the header, the mobile drawer and the footer can't drift.
export default function Lockup({ className = "text-[17px]" }) {
  return (
    <span className="lockup flex items-baseline gap-[0.45em] whitespace-nowrap">
      <span className={`nameplate ${className} text-ink`}>Voltex</span>
      <span className={`nameplate-sub lockup-sub ${className}`}>Electricals</span>
    </span>
  );
}
