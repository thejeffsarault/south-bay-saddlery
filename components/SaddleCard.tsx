import Link from "next/link";
import { cardTitle, formatUsd, type PublicListing } from "@/lib/catalog";
import { ListingBadges } from "./Badges";
import { ListingPhoto } from "./ListingPhoto";

export function SaddleCard({
  listing,
  priority = false,
}: {
  listing: PublicListing;
  priority?: boolean;
}) {
  return (
    <Link href={`/collection/${listing.id}`} className="group block">
      <ListingPhoto
        src={listing.heroSrc}
        alt={cardTitle(listing)}
        className="mb-3 aspect-[4/5] bg-sbs-white"
        contain={false}
        priority={priority}
      />
      <h2 className="truncate text-[var(--sbs-text-title)] leading-snug text-sbs-text">
        {cardTitle(listing)}
      </h2>
      <p className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sbs-muted">
        {listing.sku}
      </p>
      <p className="mt-1 text-[var(--sbs-text-title)] text-sbs-text">
        {formatUsd(listing.price)}
      </p>
      <div className="mt-2">
        <ListingBadges
          verified={listing.verified}
          southBaySelect={listing.southBaySelect}
          selfServe={listing.route === "self-serve"}
        />
      </div>
    </Link>
  );
}
