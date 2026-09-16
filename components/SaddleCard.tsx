import Link from "next/link";
import { cardTitle, formatUsd, type PublicListing } from "@/lib/catalog";
import { ListingBadges } from "./Badges";
import { ListingPhoto } from "./ListingPhoto";
import { VerifiedMarkOverlay } from "./VerifiedMark";

export function SaddleCard({
  listing,
  priority = false,
}: {
  listing: PublicListing;
  priority?: boolean;
}) {
  return (
    <Link href={`/collection/${listing.id}`} className="group block">
      <div className="relative">
        <ListingPhoto
          src={listing.heroSrc}
          alt={cardTitle(listing)}
          className="sbs-card-frame"
          contain
          priority={priority}
        />
        {listing.verified ? <VerifiedMarkOverlay /> : null}
      </div>
      <h2 className="truncate text-[var(--sbs-text-title)] leading-snug text-sbs-text">
        {cardTitle(listing)}
      </h2>
      <p className="mt-1 text-[var(--sbs-text-title)] text-sbs-text">
        {formatUsd(listing.price)}
      </p>
      <div className="mt-2">
        <ListingBadges
          verified={listing.verified}
          selfServe={listing.route === "self-serve"}
        />
      </div>
    </Link>
  );
}
