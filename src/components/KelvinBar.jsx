import { Link } from "react-router-dom";
import { MAX_KELVIN, MIN_KELVIN, TONES, nearestTone } from "../lib/kelvin.js";

// The catalogue sells light by colour temperature, so the control that sets
// the preview is the same control that filters the range.
export default function KelvinBar({ kelvin, onChange }) {
  const tone = nearestTone(kelvin);

  return (
    <div className="w-full max-w-md">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="spec text-ink-muted">Light tone</span>
        <span className="spec text-ink">
          {kelvin}K · {tone.name}
        </span>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 top-[9px] h-[3px] rounded-full"
          style={{
            background: `linear-gradient(90deg, ${TONES.map((t) => t.hex).join(", ")})`,
          }}
        />
        <input
          type="range"
          min={MIN_KELVIN}
          max={MAX_KELVIN}
          step={100}
          value={kelvin}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Light temperature in kelvin"
          className="relative w-full"
        />
      </div>

      <div className="mt-2 flex justify-between">
        {TONES.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => onChange(t.kelvin)}
            className={`spec transition-colors ${
              tone.name === t.name
                ? "text-ink"
                : "text-ink-muted/70 hover:text-ink"
            }`}
          >
            {t.kelvin}K
          </button>
        ))}
      </div>

      <Link
        to={`/products?category=Lighting&tone=${encodeURIComponent(tone.name)}`}
        className="mt-6 inline-flex items-center gap-2 border-b border-amber/40 pb-1 text-sm font-medium text-ink transition-colors hover:border-amber hover:text-amber"
      >
        Browse {tone.name.toLowerCase()} lighting
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
