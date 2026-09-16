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
    <div className="sbs-collection-grid">
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
