import { TONES } from "../lib/kelvin.js";

export default function VariantSelector({ variants, selected, onSelect }) {
  const optionKeys = Object.keys(variants[0]?.options ?? {}).filter(
    (k) => k.toLowerCase() !== "title",
  );
  if (optionKeys.length === 0) return null;

  return (
    <div className="flex flex-col gap-7">
      {optionKeys.map((key) => {
        const values = [
          ...new Set(variants.map((v) => v.options?.[key]).filter(Boolean)),
        ];
        if (values.length <= 1) return null;

        return (
          <div key={key}>
            <div className="mb-3 flex items-baseline justify-between border-b border-seam pb-2">
              <h4 className="spec text-ink-muted">{key}</h4>
              <span className="text-sm text-ink">{selected[key]}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const active = selected[key] === value;
                // Only a light tone has a real colour to show — it's measured
                // from Kelvin, not guessed from the name. A finish name like
                // "Metallic Bronze Copper" has no such source of truth, so it
                // stays a plain text button like every other spec.
                const tone = TONES.find((t) => t.name === value);

                if (tone) {
                  return (
                    <button
                      key={value}
                      type="button"
                      title={value}
                      aria-label={value}
                      aria-pressed={active}
                      onClick={() => onSelect(key, value)}
                      className={`h-10 w-10 rounded-full transition-all duration-150 ${
                        active ? "ring-2 ring-seam-strong" : "ring-1 ring-seam hover:ring-seam-strong"
                      }`}
                      style={{
                        backgroundColor: tone.hex,
                        boxShadow: active ? `0 0 14px 2px ${tone.hex}` : undefined,
                      }}
                    />
                  );
                }

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelect(key, value)}
                    className={`rounded-[7px] border px-4 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-amber bg-amber-tint text-ink"
                        : "border-seam text-ink-muted hover:border-seam-strong hover:text-ink"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
