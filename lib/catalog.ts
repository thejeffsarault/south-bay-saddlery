export const PHOTO_ANGLES = [
  { id: "near-side", label: "Near-side" },
  { id: "off-side", label: "Off-side" },
  { id: "seat", label: "Seat" },
  { id: "front", label: "Front" },
  { id: "rear", label: "Rear" },
  { id: "flaps", label: "Flaps" },
  { id: "billets", label: "Billets" },
  { id: "panels", label: "Panels" },
  { id: "stamps", label: "Stamps" },
  { id: "damage", label: "Damage" },
] as const;

export type PhotoAngleId = (typeof PHOTO_ANGLES)[number]["id"];

export const PATH_INTERESTS = [
  { id: "marketplace", label: "Marketplace" },
  { id: "verified", label: "Verified" },
  { id: "concierge", label: "Concierge" },
  { id: "trade-in", label: "Trade-in" },
  { id: "unsure", label: "Unsure" },
] as const;

export type PathInterestId = (typeof PATH_INTERESTS)[number]["id"];

export const CONDITIONS = [
  "Excellent",
  "Very good",
  "Good",
  "Fair",
  "Needs work",
] as const;

export type Condition = (typeof CONDITIONS)[number];

export type RouteId = Exclude<PathInterestId, "unsure">;

export const PUBLISH_ROUTES: { id: RouteId; label: string }[] = [
  { id: "marketplace", label: "Marketplace" },
  { id: "verified", label: "Verified" },
  { id: "concierge", label: "Concierge" },
  { id: "trade-in", label: "Trade-in" },
];

export type PublicListing = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  year: string;
  seat: string;
  flap: string;
  tree: string;
  serial: string;
  stamps: string;
  condition: Condition;
  wear: string;
  price: number;
  program: string;
  includesCover: boolean;
  published: true;
  discipline: "English";
  location: string;
  serviceHistory: string;
  route: RouteId;
  summary: string;
  photoLabels: PhotoAngleId[];
  photoSrcs?: Partial<Record<PhotoAngleId, string>>;
  heroSrc?: string;
};

export type IntakeDraft = {
  contactName: string;
  email: string;
  phone: string;
  location: string;
  brand: string;
  model: string;
  year: string;
  seat: string;
  flap: string;
  tree: string;
  stamps: string;
  condition: Condition | "";
  wear: string;
  serviceHistory: string;
  priceExpectation: string;
  pathInterest: PathInterestId | "";
  photos: Partial<Record<PhotoAngleId, { name: string; thumb: string }>>;
};

export type QueueSubmission = IntakeDraft & {
  id: string;
  submittedAt: string;
  founderPrice: string;
  founderRoute: RouteId | "";
  publishedListingId: string | null;
};

export const MIN_PHOTOS = 9;

export function photoCount(photos: IntakeDraft["photos"]) {
  return PHOTO_ANGLES.filter((angle) => photos[angle.id]?.thumb).length;
}

export function listingName(input: {
  brand: string;
  model: string;
  seat: string;
  year: string;
}) {
  return [input.brand, input.model, input.seat, input.year]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function pathLabel(id: string) {
  return (
    [...PATH_INTERESTS, ...PUBLISH_ROUTES].find((item) => item.id === id)
      ?.label ?? id
  );
}
