export const SELL_GUIDE_SRC = {
  side: "/sell/guides/side.jpg",
  other: "/sell/guides/other-side.jpg",
  seat: "/sell/guides/seat.jpg",
  panels: "/sell/guides/panels.jpg",
  billets: "/sell/guides/billets.jpg",
  serial: "/sell/guides/serial.jpg",
} as const;

export type SellGuideId = keyof typeof SELL_GUIDE_SRC;

export const SELL_GUIDE_LINE = {
  side: "Photo of one long side of the saddle.",
  other: "Photo of the other long side.",
  seat: "Photo looking down at the seat — where you sit.",
  panels:
    "Take a picture of the bottom of the saddle — the soft panels underneath.",
  billets: "Photo of the straps that hold the girth.",
  serial: "Close-up of the stamped numbers under the flap.",
} as const;
