// The three light tones the lighting catalogue actually ships, with the
// colour temperature each one is sold as. Ordered warm to cool, because
// that order is the scale itself.
export const TONES = [
  { name: "Warm White", kelvin: 2700, hex: "#ffb45e" },
  { name: "Natural White", kelvin: 4000, hex: "#ffe3bd" },
  { name: "Cool White", kelvin: 6500, hex: "#d4e8ff" },
];

export const MIN_KELVIN = TONES[0].kelvin;
export const MAX_KELVIN = TONES[TONES.length - 1].kelvin;

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Colour of light at a given temperature, interpolated between the tones
// the catalogue sells.
export function kelvinToRgb(kelvin) {
  const k = Math.min(Math.max(kelvin, MIN_KELVIN), MAX_KELVIN);
  const upperIndex = TONES.findIndex((t) => t.kelvin >= k);
  if (upperIndex <= 0) return hexToRgb(TONES[0].hex);

  const lower = TONES[upperIndex - 1];
  const upper = TONES[upperIndex];
  const t = (k - lower.kelvin) / (upper.kelvin - lower.kelvin);
  const a = hexToRgb(lower.hex);
  const b = hexToRgb(upper.hex);
  return a.map((channel, i) => Math.round(channel + (b[i] - channel) * t));
}

export function kelvinToCss(kelvin, alpha = 1) {
  const [r, g, b] = kelvinToRgb(kelvin);
  return alpha === 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${alpha})`;
}

export function nearestTone(kelvin) {
  return TONES.reduce((best, tone) =>
    Math.abs(tone.kelvin - kelvin) < Math.abs(best.kelvin - kelvin) ? tone : best,
  );
}
