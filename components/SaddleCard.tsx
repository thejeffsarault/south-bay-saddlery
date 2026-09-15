import Link from "next/link";
import { formatUsd, type PublicListing } from "@/lib/catalog";
import { ListingBadges } from "./Badges";
import { ListingPhoto } from "./ListingPhoto";

export function SaddleCard({ listing }: { listing: PublicListing }) {
  const selfServe = listing.route === "self-serve";
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
      <h2 className="font-serif text-[1.45rem] leading-tight text-sbs-text">
        {listing.name}
      </h2>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-sbs-ink">
          {listing.condition}
          {listing.includesCover ? " · with cover" : ""}
        </p>
        <p className="font-mono text-sm text-sbs-text">
          {formatUsd(listing.price)}
        </p>
      </div>
      <div className="mt-2">
        <ListingBadges
          verified={listing.verified}
          southBaySelect={listing.southBaySelect}
          selfServe={selfServe}
        />
      </div>
      {listing.verified || listing.southBaySelect ? (
        <p className="mt-2 text-xs text-sbs-muted">
          Shipping / escrow only — no in-person visits
        </p>
      ) : null}
    </Link>
  );
}
