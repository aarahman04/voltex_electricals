import { getBrandBySlug } from "../data/brands.js";

// How a brand shows its name on a card or a detail page. A real logo is used
// the moment one lands at public/brands/<slug>.{svg,png}, drawn bare — no
// chip, no tint, no ring, just the mark at a size-capped box so every brand
// occupies the same footprint in a grid. Only a brand with no art yet falls
// back to a typographic chip on its tint (the tint is a near-white wash, not
// the brand's real colour — the site stays brand-neutral (brief)).
const SIZES = {
  sm: "h-6 px-2 text-[11px]",
  md: "h-8 px-3 text-[13px]",
  lg: "h-10 px-4 text-[15px]",
  xl: "h-16 px-6 text-[19px]",
};

// Fixed caps for the small inline sizes — never big enough on any screen to
// need their own scaling. `xl` is the one used as a card's whole visual
// (the brand-chooser, the Brands page): a flat pixel cap either crowds a
// phone-width card or reads small on a wide one, so it's a clamp instead —
// a phone-appropriate floor, a fluid middle, a desktop-card ceiling.
const LOGO_HEIGHT = { sm: 22, md: 28, lg: 36 };
const LOGO_MAX_WIDTH = { sm: 88, md: 116, lg: 148 };
const LOGO_XL_HEIGHT = [80, 14, 144]; // [min px, preferred vw, max px]
const LOGO_XL_WIDTH = [260, 40, 440];

function clampStyle([min, vw, max], scale) {
  return `clamp(${min * scale}px, ${vw * scale}vw, ${max * scale}px)`;
}

export default function BrandMark({ slug, name, size = "md", className = "" }) {
  const brand = getBrandBySlug(slug);
  const label = name ?? brand?.name ?? slug;

  if (brand?.logo) {
    const scale = brand.logoScale ?? 1;
    const style =
      size === "xl"
        ? {
            maxHeight: clampStyle(LOGO_XL_HEIGHT, scale),
            maxWidth: clampStyle(LOGO_XL_WIDTH, scale),
          }
        : {
            maxHeight: LOGO_HEIGHT[size] * scale,
            maxWidth: LOGO_MAX_WIDTH[size] * scale,
          };
    return (
      <img
        src={brand.logo}
        alt={label}
        loading="lazy"
        className={`w-auto object-contain ${className}`}
        style={style}
      />
    );
  }

  const tint = brand?.tint ?? "#EEECE7";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[5px] font-display font-semibold tracking-tight text-ink ring-1 ring-seam ${SIZES[size]} ${className}`}
      style={{ backgroundColor: tint, fontVariationSettings: '"wdth" 100' }}
    >
      {label}
    </span>
  );
}
