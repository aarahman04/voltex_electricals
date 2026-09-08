import { getBrandBySlug } from "../data/brands.js";

// How a brand shows its name on a card or a detail page. A real logo is used
// the moment one lands at public/brands/<slug>.svg; until then it's a
// typographic chip on the brand's tint. The tint is a near-white wash, not
// the brand's real colour — the site stays brand-neutral (brief).
const SIZES = {
  sm: "h-6 px-2 text-[11px]",
  md: "h-8 px-3 text-[13px]",
  lg: "h-10 px-4 text-[15px]",
};

const LOGO_HEIGHT = { sm: 14, md: 18, lg: 24 };

export default function BrandMark({ slug, name, size = "md", className = "" }) {
  const brand = getBrandBySlug(slug);
  const label = name ?? brand?.name ?? slug;
  const tint = brand?.tint ?? "#EEECE7";

  if (brand?.logo) {
    return (
      <img
        src={brand.logo}
        alt={label}
        height={LOGO_HEIGHT[size]}
        style={{ height: LOGO_HEIGHT[size] }}
        className={`w-auto object-contain ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-[5px] font-display font-semibold tracking-tight text-ink ring-1 ring-seam ${SIZES[size]} ${className}`}
      style={{ backgroundColor: tint, fontVariationSettings: '"wdth" 100' }}
    >
      {label}
    </span>
  );
}
