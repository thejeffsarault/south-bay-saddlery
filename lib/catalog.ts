export const BODY_ANGLES = [
  { id: "panels", label: "Panels", required: true },
  { id: "flaps", label: "Flaps", required: true },
  { id: "underflaps", label: "Underflaps", required: true },
  { id: "billets", label: "Billets", required: true },
  { id: "front", label: "Front", required: true },
  { id: "back", label: "Back", required: true },
] as const;

export const INTAKE_ANGLES = [
  ...BODY_ANGLES,
  { id: "serial", label: "Serial / stamp", required: true },
  { id: "damage", label: "Damage (if any)", required: false },
] as const;

export type PhotoAngleId = (typeof INTAKE_ANGLES)[number]["id"];

export const SHOWROOM_SHOTS = [
  { id: "near-side", file: "01-near-side.jpeg", label: "Near-side" },
  { id: "off-side", file: "02-off-side.jpeg", label: "Off-side" },
  { id: "seat", file: "03-seat-top.jpeg", label: "Seat" },
  { id: "front", file: "04-front.jpeg", label: "Front" },
  { id: "rear", file: "05-rear.jpeg", label: "Rear" },
  { id: "left-under-flap", file: "06-left-under-flap.jpeg", label: "Left under-flap" },
  { id: "right-under-flap", file: "07-right-under-flap.jpeg", label: "Right under-flap" },
  { id: "panels", file: "08-panels-underside.jpeg", label: "Panels" },
  { id: "serial", file: "09-stamps.jpeg", label: "Serial / stamps" },
  { id: "cover", file: "10-saddle-cover.jpeg", label: "Cover" },
] as const;

export type ShowroomShotId = (typeof SHOWROOM_SHOTS)[number]["id"];

export const PATH_INTERESTS = [
  {
    id: "self-serve",
    label: "Self-serve",
    hint: "You photograph, list, and ship to the buyer after sale. Labels are generated automatically. Shipping only — no warehouse visits.",
  },
  {
    id: "verified",
    label: "Verified · $150",
    hint: "Non-refundable $150. SBS absorbs Stripe. Inbound FedEx seller → South Bay Saddlery (Santa Rosa Beach), receiving 9am–5pm (local). Ship/receive only — no drop-offs or visits.",
  },
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

export type QueueStatus = "pending" | "approved" | "rejected" | "published";

export const QUEUE_STATUSES: { id: QueueStatus; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "published", label: "Published" },
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
  blocks?: string;
  proNotes?: string;
  condition: Condition;
  wear: string;
  price: number;
  verified: boolean;
  southBaySelect: boolean;
  includesCover: boolean;
  published: true;
  discipline: "English";
  location: string;
  serviceHistory: string;
  route: PathInterestId;
  summary: string;
  photoLabels: string[];
  photoSrcs?: Record<string, string>;
  heroSrc?: string;
  platformOwned: boolean;
  payoutMode: "platform" | "connect";
  sellerEmail?: string;
  connectAccountId?: string;
};

export type PhotoThumb = { name: string; thumb: string };

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
  serial: string;
  condition: Condition | "";
  wear: string;
  serviceHistory: string;
  priceExpectation: string;
  pathInterest: PathInterestId | "";
  photos: Partial<Record<PhotoAngleId, PhotoThumb>>;
};

export type QueueSubmission = IntakeDraft & {
  id: string;
  submittedAt: string;
  status: QueueStatus;
  founderPrice: string;
  southBaySelect: boolean;
  publishedListingId: string | null;
  notifiedAt: string | null;
  notifyChannel: "webhook" | "email-stub" | null;
  verificationPaidAt: string | null;
  labelJobId: string | null;
  rejectedReason: string;
  returnStreet?: string;
  returnCity?: string;
  returnState?: string;
  returnZip?: string;
};

export const MIN_BODY_PHOTOS = 6;
export const MIN_PHOTOS = 6;
export const VERIFICATION_FEE_USD = 150;

export function photoCount(photos: IntakeDraft["photos"]) {
  return INTAKE_ANGLES.filter((angle) => photos[angle.id]?.thumb).length;
}

export function bodyPhotoCount(photos: IntakeDraft["photos"]) {
  return BODY_ANGLES.filter((angle) => photos[angle.id]?.thumb).length;
}

export function hasRequiredPhotos(photos: IntakeDraft["photos"]) {
  return (
    Boolean(photos.serial?.thumb) && bodyPhotoCount(photos) >= MIN_BODY_PHOTOS
  );
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

export function formatUsdPrecise(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function pathLabel(id: string) {
  if (id === "verified") return "Verified";
  if (id === "self-serve") return "Self-serve";
  return PATH_INTERESTS.find((item) => item.id === id)?.label ?? id;
}

export function shotLabel(id: string) {
  return (
    SHOWROOM_SHOTS.find((shot) => shot.id === id)?.label ??
    INTAKE_ANGLES.find((angle) => angle.id === id)?.label ??
    id.replaceAll("-", " ")
  );
}

export function listingPhotos(folder: string) {
  const photoSrcs: Record<string, string> = {};
  const photoLabels: string[] = [];
  for (const shot of SHOWROOM_SHOTS) {
    photoSrcs[shot.id] = `/listings/${folder}/${shot.file}`;
    photoLabels.push(shot.id);
  }
  return {
    photoSrcs,
    photoLabels,
    heroSrc: photoSrcs["near-side"],
  };
}
