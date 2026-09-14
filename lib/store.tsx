"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  PHOTO_ANGLES,
  listingName,
  type IntakeDraft,
  type PublicListing,
  type QueueSubmission,
  type RouteId,
} from "./catalog";
import { PUBLISHED_LISTINGS } from "./inventory";

const STORAGE_KEY = "sbs-congress-mvp-v1";

type Persisted = {
  submissions: QueueSubmission[];
  extraListings: PublicListing[];
};

const emptyDraft = (): IntakeDraft => ({
  contactName: "",
  email: "",
  phone: "",
  location: "",
  brand: "",
  model: "",
  year: "",
  seat: "",
  flap: "",
  tree: "",
  stamps: "",
  condition: "",
  wear: "",
  serviceHistory: "",
  priceExpectation: "",
  pathInterest: "",
  photos: {},
});

const seedQueue: QueueSubmission[] = [
  {
    id: "q-seed-pessoa",
    submittedAt: "2026-09-10T16:00:00.000Z",
    contactName: "Elena Marsh",
    email: "elena@example.com",
    phone: "310-555-0144",
    location: "Palos Verdes, CA",
    brand: "Pessoa",
    model: "Rodrigo",
    year: "2018",
    seat: '17.5"',
    flap: "Regular",
    tree: "Medium",
    stamps: "Pessoa · Rodrigo · 17.5 · 18",
    condition: "Good",
    wear: "Knee-roll softening; one cosmetic flap scuff.",
    serviceHistory: "Reflocked 2023.",
    priceExpectation: "2200",
    pathInterest: "unsure",
    photos: {},
    founderPrice: "",
    founderRoute: "",
    publishedListingId: null,
  },
];

function readPersisted(): Persisted {
  if (typeof window === "undefined") {
    return { submissions: seedQueue, extraListings: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { submissions: seedQueue, extraListings: [] };
    const parsed = JSON.parse(raw) as Persisted;
    return {
      submissions: parsed.submissions?.length ? parsed.submissions : seedQueue,
      extraListings: parsed.extraListings ?? [],
    };
  } catch {
    return { submissions: seedQueue, extraListings: [] };
  }
}

type StoreValue = {
  ready: boolean;
  submissions: QueueSubmission[];
  listings: PublicListing[];
  submitIntake: (draft: IntakeDraft) => string;
  updateGate: (
    id: string,
    patch: { founderPrice?: string; founderRoute?: RouteId | "" },
  ) => void;
  publish: (id: string) => { ok: true; listingId: string } | { ok: false; reason: string };
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [submissions, setSubmissions] = useState<QueueSubmission[]>(seedQueue);
  const [extraListings, setExtraListings] = useState<PublicListing[]>([]);

  useEffect(() => {
    const persisted = readPersisted();
    setSubmissions(persisted.submissions);
    setExtraListings(persisted.extraListings);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ submissions, extraListings } satisfies Persisted),
    );
  }, [ready, submissions, extraListings]);

  const submitIntake = useCallback((draft: IntakeDraft) => {
    const id = `q-${Date.now().toString(36)}`;
    const next: QueueSubmission = {
      ...draft,
      id,
      submittedAt: new Date().toISOString(),
      founderPrice: "",
      founderRoute: "",
      publishedListingId: null,
    };
    setSubmissions((current) => [next, ...current]);
    return id;
  }, []);

  const updateGate = useCallback(
    (id: string, patch: { founderPrice?: string; founderRoute?: RouteId | "" }) => {
      setSubmissions((current) =>
        current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const publish = useCallback((id: string) => {
    const item = submissions.find((submission) => submission.id === id);
    if (!item) return { ok: false as const, reason: "Submission not found." };
    if (item.publishedListingId) {
      return { ok: false as const, reason: "Already published." };
    }
    const price = Number(item.founderPrice);
    if (!item.founderPrice || Number.isNaN(price) || price <= 0) {
      return { ok: false as const, reason: "Set a founder price before publish." };
    }
    if (!item.founderRoute) {
      return { ok: false as const, reason: "Set a route before publish." };
    }

    const listingId = `sbs-${id.replace(/^q-/, "")}`;
    const listing: PublicListing = {
      id: listingId,
      sku: listingId.toUpperCase(),
      name: listingName(item),
      brand: item.brand,
      model: item.model,
      year: item.year,
      seat: item.seat,
      flap: item.flap,
      tree: item.tree,
      serial: item.stamps,
      stamps: item.stamps,
      condition: item.condition || "Good",
      wear: item.wear,
      price,
      program: "Collection",
      includesCover: false,
      published: true,
      discipline: "English",
      location: item.location,
      serviceHistory: item.serviceHistory,
      route: item.founderRoute,
      summary: `Pre-owned ${listingName(item)}.`,
      photoLabels: PHOTO_ANGLES.map((angle) => angle.id).filter(
        (angle) => item.photos[angle],
      ),
    };

    setExtraListings((current) => [listing, ...current]);
    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === id
          ? { ...submission, publishedListingId: listingId }
          : submission,
      ),
    );
    return { ok: true as const, listingId };
  }, [submissions]);

  const listings = useMemo(
    () => [...extraListings, ...PUBLISHED_LISTINGS],
    [extraListings],
  );

  const value = useMemo(
    () => ({
      ready,
      submissions,
      listings,
      submitIntake,
      updateGate,
      publish,
    }),
    [ready, submissions, listings, submitIntake, updateGate, publish],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}

export function useListing(id: string) {
  const { listings } = useStore();
  return listings.find((listing) => listing.id === id);
}

export { emptyDraft };
