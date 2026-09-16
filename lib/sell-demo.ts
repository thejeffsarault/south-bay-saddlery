import type { IntakeDraft, PhotoAngleId } from "@/lib/catalog";

export const SELL_DEMO_STAMP = "PB 16.5 2A M/M C/C FIN #17 23.23";

const DEMO_STILLS: Partial<Record<PhotoAngleId, string>> = {
  side: "/listings/ji-001/01-near-side.jpeg",
  other: "/listings/ji-001/02-off-side.jpeg",
  seat: "/listings/ji-001/03-seat-top.jpeg",
  panels: "/listings/ji-001/08-panels-underside.jpeg",
  billets: "/listings/ji-001/07-right-under-flap.jpeg",
  serial: "/listings/ji-001/09-stamps.jpeg",
};

export function isSellDemo(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1";
}

export function demoPlaceholderPhotos(): IntakeDraft["photos"] {
  const photos: IntakeDraft["photos"] = {};
  for (const [angle, src] of Object.entries(DEMO_STILLS)) {
    if (!src) continue;
    photos[angle as PhotoAngleId] = { name: `${angle}.jpeg`, thumb: src };
  }
  return photos;
}
