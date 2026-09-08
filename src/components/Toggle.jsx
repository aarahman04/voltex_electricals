// A rocker switch, borrowed from the switchboards these products hang off.
export default function Toggle({ checked, onChange, label, meta }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="group flex w-full items-center gap-3 py-1.5 text-left"
    >
      <span
        aria-hidden="true"
        className={`relative h-5 w-9 shrink-0 rounded-[4px] border transition-colors duration-150 ${
          checked
            ? "border-amber bg-amber-tint"
            : "border-seam bg-surface group-hover:border-seam-strong"
        }`}
      >
        <span
          className={`absolute top-[2px] h-[14px] w-[14px] rounded-[3px] transition-all duration-150 ${
            checked
              ? "left-[19px] bg-amber shadow-[0_0_8px_rgba(238,122,27,0.5)]"
              : "left-[2px] bg-seam-strong group-hover:bg-ink-muted"
          }`}
        />
      </span>
      <span
        className={`flex-1 text-sm transition-colors ${
          checked ? "text-ink" : "text-ink-muted group-hover:text-ink"
        }`}
      >
        {label}
      </span>
      {meta != null && <span className="spec text-ink-muted/70">{meta}</span>}
    </button>
  );
}
