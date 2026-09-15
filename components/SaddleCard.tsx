import Link from "next/link";
import { formatUsd, type PublicListing } from "@/lib/catalog";
import { LeatherPlate } from "./SaddleVisual";

export function SaddleCard({ listing }: { listing: PublicListing }) {
  return (
    <Link
      href={`/collection/${listing.id}`}
      className="block border border-border bg-ivory-soft p-3 transition-colors hover:border-cognac"
    >
      {listing.heroSrc ? (
        <div className="mb-3 aspect-[5/4] overflow-hidden bg-ivory-soft">
          <img
            src={listing.heroSrc}
            alt={listing.name}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <LeatherPlate caption={listing.sku} className="aspect-[5/4] mb-3" />
      )}
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-cognac">
        {listing.program}
      </p>
      <h2 className="mt-1 font-serif text-[1.45rem] leading-tight text-espresso">
        {listing.name}
      </h2>
      <p className="mt-2 text-sm text-charcoal">
        {listing.condition}
        {listing.includesCover ? " · with cover" : ""}
      </p>
      <p className="mt-3 font-mono text-sm text-espresso">
        {formatUsd(listing.price)}
      </p>
    </Link>
  );
}
