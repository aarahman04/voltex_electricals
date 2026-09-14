import { getBrandBySlug } from "../data/brands.js";

// How a brand shows its name on a card or a detail page. A real logo is used
// the moment one lands at public/brands/<slug>.{svg,png}; until then it's a
// typographic chip on the brand's tint. The tint is a near-white wash, not
// the brand's real colour — the site stays brand-neutral (brief).
//
// The plate stays behind real logos too. Three of the fourteen brands have
// art, and their aspect ratios disagree — Crompton is a 2.3:1 wordmark,
// Havells 1.8:1, Philips a 1:1 badge. Dropped bare into a grid beside eleven
// fixed-height chips they read as ragged. Same box, same height, capped
// width, object-contain: all fourteen marks are one shape.
const SIZES = {
  sm: "h-6 px-2 text-[11px]",
  md: "h-8 px-3 text-[13px]",
  lg: "h-10 px-4 text-[15px]",
};

const LOGO_HEIGHT = { sm: 14, md: 18, lg: 24 };
const LOGO_MAX_WIDTH = { sm: 62, md: 82, lg: 104 };

export default function BrandMark({ slug, name, size = "md", className = "" }) {
  const brand = getBrandBySlug(slug);
  const label = name ?? brand?.name ?? slug;
  const tint = brand?.tint ?? "#EEECE7";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-[5px] font-display font-semibold tracking-tight text-ink ring-1 ring-seam ${SIZES[size]} ${className}`}
      style={{ backgroundColor: tint, fontVariationSettings: '"wdth" 100' }}
    >
      {brand?.logo ? (
        <img
          src={brand.logo}
          alt={label}
          loading="lazy"
          className="w-auto object-contain"
          style={{
            maxHeight: LOGO_HEIGHT[size],
            maxWidth: LOGO_MAX_WIDTH[size],
          }}
        />
      ) : (
        label
      )}
    </span>
  );
}
