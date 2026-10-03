// The VOLTEX wordmark as outlined paths (no font needed). The V's apex is left
// open like a switch contact, with a copper contact line in the gap. Letters
// take `currentColor`; public/brands/voltex-exclusive.svg and
// public/favicon.svg carry copies of the same paths.
const WORDMARK_PATHS = [
  "M0 2h7.2l6.2 20.4V30z M28 2h-7.2l-6.2 20.4V30z",
  "M47.5 2C38.4 2 31.5 8.2 31.5 16s6.9 14 16 14 16-6.2 16-14-6.9-14-16-14zm0 5.8c5.6 0 9.8 3.5 9.8 8.2s-4.2 8.2-9.8 8.2-9.8-3.5-9.8-8.2 4.2-8.2 9.8-8.2z",
  "M67 2h5.8v22.2H87V30H67z",
  "M89.5 2h24v5.8h-9.1V30h-5.8V7.8h-9.1z",
  "M116.5 2h20v5.6h-14.2v5.6h12.8v5.6h-12.8v5.6h14.2V30h-20z",
  "M139.5 2h7.1l5.9 9.2 5.9-9.2h7.1l-9.5 14 9.5 14h-7.1l-5.9-9.2-5.9 9.2h-7.1l9.5-14z",
];

export default function VoltexWordmark({ className = "", title = "Voltex" }) {
  return (
    <svg className={className} viewBox="0 0 166 32" role="img" aria-label={title} fill="currentColor">
      {WORDMARK_PATHS.map((d) => <path key={d} d={d} />)}
      <rect className="voltex-contact" x="13.2" y="21" width="1.6" height="9" />
    </svg>
  );
}
