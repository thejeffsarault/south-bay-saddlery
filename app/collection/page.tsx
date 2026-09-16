"use client";

import { CollectionGrid } from "@/components/CollectionGrid";
import { useStore } from "@/lib/store";

export default function CollectionPage() {
  const { listings, ready } = useStore();
  const english = listings.filter((listing) => listing.published);

  return (
    <div className="sbs-page-wide space-y-6">
      <h1 className="font-serif text-3xl font-medium text-sbs-text sm:text-4xl">
        The Collection
      </h1>
      <CollectionGrid listings={english} ready={ready} />
    </div>
  );
}
