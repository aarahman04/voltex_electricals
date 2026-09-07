import { Link } from "react-router-dom";
import { MAX_KELVIN, MIN_KELVIN, TONES, nearestTone } from "../lib/kelvin.js";

// The catalogue sells light by temperature, so the control that sets the
// showroom's light is the same control that filters it.
export default function KelvinBar({ kelvin, onChange }) {
  const tone = nearestTone(kelvin);

  return (
    <div className="w-full max-w-md">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="spec text-muted">Showroom light</span>
        <span className="spec text-ivory">
          {kelvin}K · {tone.name}
        </span>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 top-[9px] h-[2px] rounded-full"
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
          aria-label="Showroom light temperature in kelvin"
          className="relative w-full"
        />
      </div>

      <div className="mt-2 flex justify-between">
        {TONES.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => onChange(t.kelvin)}
            className={`spec text-[10px] transition-colors ${
              tone.name === t.name
                ? "text-ivory"
                : "text-muted/70 hover:text-ivory"
            }`}
          >
            {t.kelvin}K
          </button>
        ))}
      </div>

      <Link
        to={`/category/Lighting?tone=${encodeURIComponent(tone.name)}`}
        className="mt-6 inline-flex items-center gap-2 border-b border-filament/40 pb-1 text-sm font-medium text-ivory transition-colors hover:border-filament hover:text-filament"
      >
        Browse {tone.name.toLowerCase()} lighting
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
