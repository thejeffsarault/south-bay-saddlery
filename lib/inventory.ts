import { listingPhotos, type PublicListing } from "./catalog";

const ji001Photos = listingPhotos("ji-001");
const ji002Photos = listingPhotos("ji-002");

export const PUBLISHED_LISTINGS: PublicListing[] = [
  {
    id: "ji-001",
    sku: "JI-001",
    name: 'CWD SE01 17.5" 2024',
    brand: "CWD",
    model: "SE01",
    year: "2024",
    seat: '17.5"',
    flap: "3L",
    tree: "On file",
    serial: "114716",
    stamps: "SE01 1755 TC 3L · PA 705305 RT · 2244 114716",
    condition: "Excellent",
    wear: "Even, light wear consistent with careful schooling. Billets and panels present cleanly.",
    price: 4690,
    verified: true,
    southBaySelect: true,
    includesCover: true,
    published: true,
    discipline: "English",
    location: "South Bay",
    serviceHistory: "Pre-owned; cover included. Founder-reviewed before publish.",
    route: "verified",
    platformOwned: true,
    payoutMode: "platform",
    summary:
      "Pre-owned CWD SE01 in Excellent condition. Verified, South Bay Select, offered with cover.",
    ...ji001Photos,
    // Cantle nameplate is founder-private. Never render MARISSA LEDFORD.
  },
  {
    id: "ji-002",
    sku: "JI-002",
    name: 'Voltaire Design Stuttgart 18.5" 2019',
    brand: "Voltaire Design",
    model: "Stuttgart",
    year: "2019",
    seat: '18.5"',
    flap: "3AAAR",
    tree: "On file",
    serial: "1386",
    stamps: "1386 · 3AAAR · L/L 30 · PRO B10 D10",
    blocks: "L/L 30",
    proNotes: "PRO B10 D10",
    condition: "Excellent",
    wear: "Clean flaps and panels; cover included. Founder-reviewed before publish.",
    price: 3850,
    verified: true,
    southBaySelect: true,
    includesCover: true,
    published: true,
    discipline: "English",
    location: "South Bay",
    serviceHistory: "Pre-owned; cover included.",
    route: "verified",
    platformOwned: true,
    payoutMode: "platform",
    summary:
      "Pre-owned Voltaire Design Stuttgart in Excellent condition. Verified, South Bay Select, offered with cover.",
    ...ji002Photos,
  },
];

export function getSeedListing(id: string) {
  return PUBLISHED_LISTINGS.find((listing) => listing.id === id);
}

