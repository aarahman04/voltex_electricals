import { useState } from "react";
import { TONES } from "../lib/kelvin.js";
import Toggle from "./Toggle.jsx";

function Section({ title, children }) {
  return (
    <section>
      <h4 className="spec mb-3 border-b border-seam pb-2 text-ink-muted">
        {title}
      </h4>
      {children}
    </section>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-[7px] border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-amber bg-amber-tint text-ink"
          : "border-seam text-ink-muted hover:border-seam-strong hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

// Lighting carries two dozen wattages. Show the common ones and let the rest
// open on request, so the panel stays readable.
function ChipList({ facet, selected, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 12;
  const shown = expanded ? facet.values : facet.values.slice(0, limit);
  const hidden = facet.values.length - shown.length;

  return (
    <div className="flex flex-wrap gap-2">
      {shown.map(({ value, label }) => (
        <Chip
          key={value}
          active={selected.includes(value)}
          onClick={() => onToggle(facet.id, value)}
        >
          {label ?? value}
        </Chip>
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="spec px-1 text-ink-muted transition-colors hover:text-amber"
        >
          +{hidden} more
        </button>
      )}
    </div>
  );
}

export default function FilterPanel({
  subcategories = [],
  selectedSubs = [],
  onToggleSub,
  facets,
  selectedFacets,
  onToggleFacet,
  search,
  onSearchChange,
  onClear,
  activeCount,
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <label htmlFor="catalogue-search" className="spec mb-2 block text-ink-muted">
          Search this list
        </label>
        <input
          id="catalogue-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Model or keyword"
          className="w-full rounded-[8px] border border-seam bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-amber focus:outline-none"
        />
      </div>

      {subcategories.length > 0 && (
        <Section title={`Type · ${subcategories.length}`}>
          <div className="flex flex-col">
            {subcategories.map((sub) => (
              <Toggle
                key={sub.name}
                checked={selectedSubs.includes(sub.name)}
                onChange={() => onToggleSub(sub.name)}
                label={sub.name}
                meta={sub.count}
              />
            ))}
          </div>
        </Section>
      )}

      {facets.map((facet) => (
        <Section key={facet.id} title={facet.label}>
          {facet.kind === "tone" ? (
            <div className="flex flex-col gap-1">
              {facet.values.map(({ value }) => {
                const tone = TONES.find((t) => t.name === value);
                const active = (selectedFacets[facet.id] ?? []).includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onToggleFacet(facet.id, value)}
                    className={`flex items-center gap-3 rounded-[7px] border px-3 py-2 text-sm transition-colors ${
                      active
                        ? "border-amber bg-amber-tint text-ink"
                        : "border-transparent text-ink-muted hover:text-ink"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full ring-1 ring-seam"
                      style={{
                        backgroundColor: tone?.hex,
                        boxShadow: active ? `0 0 10px ${tone?.hex}` : "none",
                      }}
                    />
                    <span className="flex-1 text-left">{value}</span>
                    <span className="spec text-ink-muted/70">{tone?.kelvin}K</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <ChipList
              facet={facet}
              selected={selectedFacets[facet.id] ?? []}
              onToggle={onToggleFacet}
            />
          )}
        </Section>
      ))}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="w-fit border-b border-seam pb-0.5 text-sm text-ink-muted transition-colors hover:border-amber hover:text-amber"
        >
          Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
        </button>
      )}
    </div>
  );
}
