import { type PublicListing } from "@/lib/catalog";
import { SaddleCard } from "./SaddleCard";

export function CollectionGrid({
  listings,
  ready = true,
}: {
  listings: PublicListing[];
  ready?: boolean;
}) {
  if (!ready) {
    return <p className="text-sm text-sbs-muted">Opening the Collection…</p>;
  }

  if (listings.length === 0) {
    return <p className="text-sm text-sbs-muted">Nothing in the Collection yet.</p>;
  }

  return (
    <div className="sbs-collection-grid grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {listings.map((listing, index) => (
        <SaddleCard
          key={listing.id}
          listing={listing}
          priority={index < 2}
        />
      ))}
    </div>
  );
}
