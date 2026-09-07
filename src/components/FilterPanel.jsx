import { useState } from "react";
import { TONES } from "../lib/kelvin.js";
import Toggle from "./Toggle.jsx";

function Section({ title, children }) {
  return (
    <section>
      <h4 className="spec mb-3 border-b border-conduit pb-2 text-muted">
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
      className={`rounded-[3px] border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-filament bg-filament/15 text-filament"
          : "border-conduit text-muted hover:border-muted hover:text-ivory"
      }`}
    >
      {children}
    </button>
  );
}

// Lighting carries two dozen wattages. Show the common ones and let the
// rest open on request, so the panel stays readable.
function ChipList({ facet, selected, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 12;
  const shown = expanded ? facet.values : facet.values.slice(0, limit);
  const hidden = facet.values.length - shown.length;

  return (
    <div className="flex flex-wrap gap-2">
      {shown.map(({ value }) => (
        <Chip
          key={value}
          active={selected.includes(value)}
          onClick={() => onToggle(facet.id, value)}
        >
          {value}
        </Chip>
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="spec px-1 text-[10px] text-muted transition-colors hover:text-filament"
        >
          +{hidden} more
        </button>
      )}
    </div>
  );
}

export default function FilterPanel({
  subcategories,
  selectedSubs,
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
        <label htmlFor="catalogue-search" className="spec mb-2 block text-muted">
          Search
        </label>
        <input
          id="catalogue-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Model or type"
          className="w-full rounded-[3px] border border-conduit bg-ground-deep px-3 py-2.5 text-sm text-ivory placeholder:text-muted/60 focus:border-filament focus:outline-none"
        />
      </div>

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
                    className={`flex items-center gap-3 rounded-[3px] border px-3 py-2 text-sm transition-colors ${
                      active
                        ? "border-filament/60 bg-filament/10 text-ivory"
                        : "border-transparent text-muted hover:text-ivory"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{
                        backgroundColor: tone?.hex,
                        boxShadow: active ? `0 0 12px ${tone?.hex}` : "none",
                      }}
                    />
                    <span className="flex-1 text-left">{value}</span>
                    <span className="spec text-[10px] text-muted/70">
                      {tone?.kelvin}K
                    </span>
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
          className="w-fit border-b border-conduit pb-0.5 text-sm text-muted transition-colors hover:border-filament hover:text-filament"
        >
          Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
        </button>
      )}
    </div>
  );
}
