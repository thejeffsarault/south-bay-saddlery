"use client";

import { SaddleCard } from "@/components/SaddleCard";
import { useStore } from "@/lib/store";

export default function CollectionPage() {
  const { listings, ready } = useStore();
  const english = listings.filter((listing) => listing.published);

  return (
    <div className="space-y-6">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-sbs-muted">
        Pre-owned English
      </p>
      <h1 className="font-serif text-4xl text-sbs-text">Collection</h1>
      <p className="text-sbs-ink">
        Published English listings only. Verified and South Bay Select badges
        appear on founder-approved stock. Shipping and escrow only — not a
        showroom. No walk-ins, appointments, or barn visits.
      </p>
      {!ready ? (
        <p className="text-sm text-sbs-muted">Opening the Collection…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {english.map((listing) => (
            <SaddleCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
