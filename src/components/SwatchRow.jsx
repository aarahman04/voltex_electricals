import { swatchColor } from "./swatchColors.js";

// A preview of the finishes a model comes in, drawn from its variants.
export default function SwatchRow({ variants, max = 5 }) {
  if (!variants || variants.length <= 1) return null;

  const values = [
    ...new Set(
      variants
        .map((v) => v.options?.Color)
        .filter((value) => value && value !== "Default Title"),
    ),
  ];
  if (values.length <= 1) return null;

  const shown = values.slice(0, max);
  const overflow = values.length - shown.length;

  return (
    <div className="flex shrink-0 items-center gap-1">
      {shown.map((value) => (
        <span
          key={value}
          title={value}
          className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-ink/15"
          style={{ backgroundColor: swatchColor(value) ?? "#c9c4bb" }}
        />
      ))}
      {overflow > 0 && (
        <span className="spec text-[9px] text-ink/40">+{overflow}</span>
      )}
    </div>
  );
}
