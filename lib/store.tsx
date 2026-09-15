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
  INTAKE_ANGLES,
  listingName,
  type IntakeDraft,
  type PathInterestId,
  type PublicListing,
  type QueueStatus,
  type QueueSubmission,
} from "./catalog";
import { PUBLISHED_LISTINGS } from "./inventory";

const STORAGE_KEY = "sbs-mvp-v1";

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
  serial: "",
  condition: "",
  wear: "",
  serviceHistory: "",
  priceExpectation: "",
  pathInterest: "",
  photos: {},
});

function readPersisted(): Persisted {
  if (typeof window === "undefined") {
    return { submissions: [], extraListings: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { submissions: [], extraListings: [] };
    const parsed = JSON.parse(raw) as Persisted;
    return {
      submissions: parsed.submissions ?? [],
      extraListings: parsed.extraListings ?? [],
    };
  } catch {
    return { submissions: [], extraListings: [] };
  }
}

type StoreValue = {
  ready: boolean;
  submissions: QueueSubmission[];
  listings: PublicListing[];
  submitIntake: (draft: IntakeDraft) => QueueSubmission;
  setStatus: (
    id: string,
    status: QueueStatus,
    patch?: Partial<
      Pick<
        QueueSubmission,
        "founderPrice" | "southBaySelect" | "rejectedReason"
      >
    >,
  ) => void;
  updateSubmission: (id: string, patch: Partial<QueueSubmission>) => void;
  publish: (id: string) => { ok: true; listingId: string } | { ok: false; reason: string };
  notifyJeff: (id: string) => Promise<{ ok: boolean; notifiedAt: string; channel: "webhook" | "email-stub" }>;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [submissions, setSubmissions] = useState<QueueSubmission[]>([]);
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

  const updateSubmission = useCallback((id: string, patch: Partial<QueueSubmission>) => {
    setSubmissions((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const submitIntake = useCallback((draft: IntakeDraft) => {
    const id = `q-${Date.now().toString(36)}`;
    const next: QueueSubmission = {
      ...draft,
      id,
      submittedAt: new Date().toISOString(),
      status: "pending",
      founderPrice: draft.priceExpectation,
      southBaySelect: false,
      publishedListingId: null,
      notifiedAt: null,
      notifyChannel: null,
      verificationPaidAt: null,
      labelJobId: null,
      rejectedReason: "",
    };
    setSubmissions((current) => [next, ...current]);
    return next;
  }, []);

  const setStatus = useCallback(
    (
      id: string,
      status: QueueStatus,
      patch?: Partial<
        Pick<QueueSubmission, "founderPrice" | "southBaySelect" | "rejectedReason">
      >,
    ) => {
      setSubmissions((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
                ...patch,
              }
            : item,
        ),
      );
    },
    [],
  );

  const publish = useCallback(
    (id: string) => {
      const item = submissions.find((submission) => submission.id === id);
      if (!item) return { ok: false as const, reason: "Submission not found." };
      if (item.status === "published" || item.publishedListingId) {
        return { ok: false as const, reason: "Already published." };
      }
      if (item.status !== "approved") {
        return { ok: false as const, reason: "Approve before publish." };
      }
      const price = Number(item.founderPrice || item.priceExpectation);
      if (!price || Number.isNaN(price) || price <= 0) {
        return { ok: false as const, reason: "Set a founder price before publish." };
      }

      const listingId = `sbs-${id.replace(/^q-/, "")}`;
      const photoSrcs: Record<string, string> = {};
      for (const angle of INTAKE_ANGLES) {
        const photo = item.photos[angle.id];
        if (photo?.thumb) photoSrcs[angle.id] = photo.thumb;
      }

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
        serial: item.serial,
        stamps: item.stamps,
        condition: item.condition || "Good",
        wear: item.wear,
        price,
        verified: item.pathInterest === "verified",
        southBaySelect: item.southBaySelect,
        includesCover: false,
        published: true,
        discipline: "English",
        location: item.location,
        serviceHistory: item.serviceHistory,
        route: (item.pathInterest || "self-serve") as PathInterestId,
        summary: `Pre-owned ${listingName(item)}.`,
        photoLabels: INTAKE_ANGLES.map((angle) => angle.id).filter(
          (angle) => item.photos[angle],
        ),
        photoSrcs,
        heroSrc: photoSrcs.front || photoSrcs.panels,
      };

      setExtraListings((current) => [listing, ...current]);
      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === id
            ? {
                ...submission,
                status: "published",
                publishedListingId: listingId,
                founderPrice: String(price),
              }
            : submission,
        ),
      );
      return { ok: true as const, listingId };
    },
    [submissions],
  );

  const notifyJeff = useCallback(
    async (id: string) => {
      const item = submissions.find((submission) => submission.id === id);
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: id,
          headline: item
            ? `${item.brand} ${item.model} ${item.seat} ${item.year}`.trim()
            : id,
          pathInterest: item?.pathInterest ?? "",
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        notifiedAt: string;
        channel: "webhook" | "email-stub";
      };
      updateSubmission(id, {
        notifiedAt: data.notifiedAt,
        notifyChannel: data.channel,
      });
      return data;
    },
    [submissions, updateSubmission],
  );

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
      setStatus,
      updateSubmission,
      publish,
      notifyJeff,
    }),
    [
      ready,
      submissions,
      listings,
      submitIntake,
      setStatus,
      updateSubmission,
      publish,
      notifyJeff,
    ],
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
