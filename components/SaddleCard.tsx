import Link from "next/link";
import { formatUsd, type PublicListing } from "@/lib/catalog";
import { ListingBadges } from "./Badges";
import { ListingPhoto } from "./ListingPhoto";

export function SaddleCard({ listing }: { listing: PublicListing }) {
  return (
    <Link
      href={`/collection/${listing.id}`}
      className="block border border-sbs-border bg-sbs-surface p-3 transition-colors hover:border-sbs-black"
    >
      <ListingPhoto
        src={listing.heroSrc}
        alt={listing.name}
        caption={listing.sku}
        className="mb-3 aspect-[5/4]"
      />
      <ListingBadges
        verified={listing.verified}
        southBaySelect={listing.southBaySelect}
      />
      <h2 className="mt-2 font-serif text-[1.45rem] leading-tight text-sbs-text">
        {listing.name}
      </h2>
      <p className="mt-2 text-sm text-sbs-ink">
        {listing.condition}
        {listing.includesCover ? " · with cover" : ""}
      </p>
      <p className="mt-3 font-mono text-sm text-sbs-text">
        {formatUsd(listing.price)}
      </p>
    </Link>
  );
}
