// The brands that stock this category, as a row of chips. Stocked brands
// filter the grid and carry a live indicator; the rest show the same
// indicator unlit, so "in catalogue" reads the same here as on /brands.
export default function BrandRail({ brands, active, onSelect }) {
  if (brands.length <= 1) return null;

  return (
    <div className="thin-scroll -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-2">
      <Chip active={!active} onClick={() => onSelect(null)}>
        All brands
      </Chip>

      {brands.map((brand) =>
        brand.status === "stocked" ? (
          <Chip
            key={brand.slug}
            active={active === brand.slug}
            onClick={() => onSelect(brand.slug)}
          >
            <span className="led mr-2 shrink-0" data-live />
            {brand.name}
            <span className="spec ml-1.5 opacity-60">{brand.count}</span>
          </Chip>
        ) : (
          <span
            key={brand.slug}
            title={`${brand.name} — coming soon`}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[7px] border border-seam px-3 py-1.5 text-xs text-ink-muted/50"
          >
            <span className="led shrink-0" />
            {brand.name}
          </span>
        ),
      )}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex shrink-0 items-center whitespace-nowrap rounded-[7px] border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-amber bg-amber-tint text-ink"
          : "border-seam text-ink-muted hover:border-seam-strong hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
