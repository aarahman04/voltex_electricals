// Hotspots use percentages of the complete 3:2 photograph, including on phones.
export const heroScenes = [
  {
    id: "living", name: "Living room", image: "shoppable-room", mood: "Hello, warm evenings.",
    alt: "A warm living room with an Atomberg ceiling fan, Orient wall light and Philips table lamp",
    items: [
      { uid: "atomberg--atomberg-renesa-prime-crest-ceiling-fan", name: "Renesa Prime Crest", type: "Ceiling fan", x: 50, y: 17, width: 38, height: 28, side: "below" },
      { uid: "orient--raya-curve-wall-light", name: "Raya Curve", type: "Wall light", x: 83, y: 40, width: 14, height: 22, side: "left" },
      { uid: "philips--philips-ornate-table-lamps", name: "Ornate", type: "Table lamp", x: 18, y: 59, width: 17, height: 25, side: "right" },
    ],
  },
  {
    id: "bathroom", name: "Bathroom", image: "hero-bathroom", mood: "A warmer start to the day.",
    alt: "A sunlit stone bathroom with an AO Smith water geyser, Orient exhaust fan and gold-lined ceiling light",
    items: [
      { uid: "ao-smith--elegance-prime-neo-vertical", name: "Elegance Prime Neo", type: "Water geyser", x: 18, y: 27, width: 15, height: 32, side: "right" },
      { uid: "orient--smart-air-white-exhaust-fan", name: "Smart Air", type: "Exhaust fan", x: 74, y: 27, width: 13, height: 18, side: "left" },
      { uid: "orient--prism-surface-cob-led-downlighter-warm-white", name: "Prism Surface", type: "COB downlight", x: 53, y: 7, width: 10, height: 13, side: "below" },
    ],
  },
  {
    id: "factory", name: "Factory", image: "hero-factory", mood: "Air that gets to work.",
    alt: "An industrial workshop with green Almonard wall and pedestal air circulators and an Orient metal exhaust fan",
    items: [
      { uid: "almonard--wall-air-circulators", name: "Wall Air Circulator", type: "Industrial wall fan", x: 18, y: 20, width: 22, height: 32, side: "right" },
      { uid: "almonard--pedestal-air-circulators", name: "Pedestal Air Circulator", type: "Industrial pedestal fan", x: 69, y: 43, width: 22, height: 32, side: "left" },
      { uid: "orient--hill-air-exhaust-fan", name: "Hill Air", type: "Metal exhaust fan", x: 87, y: 16, width: 15, height: 23, side: "left" },
    ],
  },
  {
    id: "workspace", name: "Creative studio", image: "hero-workspace", mood: "Space for a bright idea.",
    alt: "An architecture studio with an Orient Cabin Star roof fan, adjustable LED spotlight and WindPro wall fan",
    items: [
      { uid: "orient--cabin-star-300mm-high-speed-roof-wall-mountable-fan", name: "Cabin Star", type: "Roof & wall fan", x: 47, y: 17, width: 21, height: 27, side: "below" },
      { uid: "orient--led-cob-spot-light", name: "LED COB Spot Light", type: "Adjustable spotlight", x: 77, y: 9, width: 10, height: 10, side: "below" },
      { uid: "orient--windpro-wall-80-high-speed-wall-fan", name: "WindPro Wall 80", type: "High-speed wall fan", x: 19, y: 38, width: 22, height: 34, side: "right" },
    ],
  },
  {
    id: "kitchen", name: "Kitchen", image: "hero-kitchen", mood: "Fresh air. Fresh beginnings.",
    alt: "A blue and oak kitchen with an Orient four-blade ceiling fan, Smart Air exhaust fan and Prism Surface downlight",
    items: [
      { uid: "orient--new-air-plus-4-blade-small-ceiling-fan-for-kitchen-2-years-warranty", name: "New Air Plus", type: "Kitchen ceiling fan", x: 49, y: 19, width: 33, height: 28, side: "below" },
      { uid: "orient--smart-air-white-exhaust-fan", name: "Smart Air", type: "Exhaust fan", x: 80, y: 29, width: 12, height: 17, side: "left" },
      { uid: "orient--prism-surface-cob-led-downlighter-warm-white", name: "Prism Surface", type: "COB downlight", x: 20, y: 11, width: 9, height: 12, side: "below" },
    ],
  },
];

export const heroTiming = { settle: 1800, reveal: 2400, close: 400, shrink: 650, slide: 900, expand: 650 };

export function advanceHero(frame, scenes) {
  if (frame.phase === "reveal" && frame.product + 1 < scenes[frame.scene].items.length) {
    return { ...frame, product: frame.product + 1 };
  }
  if (frame.phase === "expand") return { scene: (frame.scene + 1) % scenes.length, phase: "settle", product: 0 };
  const phases = Object.keys(heroTiming);
  return { ...frame, phase: phases[phases.indexOf(frame.phase) + 1] };
}
