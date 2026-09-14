"use client";

import { SaddleCard } from "@/components/SaddleCard";
import { useStore } from "@/lib/store";

export default function CollectionPage() {
  const { listings, ready } = useStore();
  const english = listings.filter((listing) => listing.published);

  return (
    <div className="space-y-6">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-cognac">
        Pre-owned English
      </p>
      <h1 className="font-serif text-4xl text-espresso">
        Explore the Collection
      </h1>
      <p className="text-charcoal">
        Published English listings only. Details open on the saddle name.
      </p>
      {!ready ? (
        <p className="text-sm text-charcoal">Opening the Collection…</p>
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
