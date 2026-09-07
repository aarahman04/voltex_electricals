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
        className={`relative h-5 w-9 shrink-0 rounded-[3px] border transition-colors duration-200 ${
          checked
            ? "border-filament/60 bg-filament/25"
            : "border-conduit bg-ground-deep group-hover:border-muted/60"
        }`}
      >
        <span
          className={`absolute top-[2px] h-[14px] w-[14px] rounded-[2px] transition-all duration-200 ${
            checked
              ? "left-[19px] bg-filament shadow-[0_0_10px_rgba(242,166,59,0.55)]"
              : "left-[2px] bg-muted/60 group-hover:bg-muted"
          }`}
        />
      </span>
      <span
        className={`flex-1 text-sm transition-colors ${
          checked ? "text-ivory" : "text-muted group-hover:text-ivory"
        }`}
      >
        {label}
      </span>
      {meta != null && (
        <span className="spec text-[10px] text-muted/70">{meta}</span>
      )}
    </button>
  );
}
