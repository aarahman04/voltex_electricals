// The catalogue names 117 distinct finishes ("Metallic Bronze Copper",
// "Tangerine Brown", "Honeymaple Wood"). Rather than enumerate them, scan
// the name for known finish words and take the last one, which is the head
// noun of the finish in this vocabulary: "Tangerine Brown" is a brown.
const FINISHES = {
  white: "#f6f4ef",
  ivory: "#f3ead6",
  pearl: "#f0ebe2",
  marble: "#eceae4",
  snow: "#fbfbfb",
  frost: "#eef2f3",
  cream: "#f0e6d2",
  creme: "#f0e6d2",
  latte: "#e2d3bb",
  beige: "#e4d7c1",
  black: "#1c1c1e",
  charcoal: "#33383a",
  graphite: "#3c4245",
  gunmetal: "#4a5257",
  slate: "#5a666c",
  grey: "#98a0a2",
  gray: "#98a0a2",
  silver: "#c3c9cb",
  chrome: "#d5dbdd",
  nickel: "#c2c6c4",
  pewter: "#a6a29a",
  steel: "#8b969c",
  brown: "#6d4a33",
  chocolate: "#4a2f22",
  truffle: "#5b483a",
  coco: "#5c4033",
  mahogany: "#5a2d21",
  caramel: "#a9713c",
  champagne: "#d9c3a0",
  bronze: "#8c6239",
  copper: "#b06a45",
  brass: "#b58a45",
  gold: "#c9a24a",
  wood: "#a3763f",
  maple: "#c08a4c",
  teak: "#8a5a2b",
  teakwood: "#8a5a2b",
  walnut: "#5f4231",
  oak: "#a67b4b",
  hickory: "#8b5e3c",
  ash: "#b9a68c",
  blue: "#41678f",
  azure: "#3f7fb5",
  aqua: "#4f9a9a",
  teal: "#3f8281",
  green: "#4b7a4a",
  matcha: "#7d9260",
  olive: "#6b6a3a",
  red: "#b23a2e",
  crimson: "#8f2b28",
  wine: "#6d2f34",
  pink: "#d08699",
  orange: "#d1743a",
  tangerine: "#d1743a",
  yellow: "#d9b23c",
  magma: "#6b5551",
  smoke: "#7d7671",
  dune: "#c2a875",
  topaz: "#c9a24a",
  cosmos: "#23262b",
};

const WORDS = Object.keys(FINISHES);

export function swatchColor(value) {
  if (!value) return null;
  const tokens = String(value).toLowerCase().split(/[^a-z]+/).filter(Boolean);
  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    const token = tokens[i];
    if (FINISHES[token]) return FINISHES[token];
    const partial = WORDS.find((w) => token.includes(w));
    if (partial) return FINISHES[partial];
  }
  return null;
}
