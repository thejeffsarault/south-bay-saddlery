"use client";

import { notFound } from "next/navigation";
import { ListingBadges } from "@/components/Badges";
import { BuyCta } from "@/components/BuyCta";
import { AngleGrid } from "@/components/SaddleVisual";
import { formatUsd, pathLabel } from "@/lib/catalog";
import { getSeedListing } from "@/lib/inventory";
import { useListing, useStore } from "@/lib/store";

export function DetailsView({ id }: { id: string }) {
  const { ready } = useStore();
  const listing = useListing(id);
  const seeded = getSeedListing(id);

  if (!listing) {
    if (!ready && !seeded) {
      return <p className="text-sm text-sbs-muted">Opening Details…</p>;
    }
    notFound();
  }

  return (
    <article className="space-y-8">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-sbs-muted">
        Details
      </p>
      <header className="space-y-3">
        <h1 className="font-serif text-4xl leading-tight text-sbs-text">
          {listing.name}
        </h1>
        <p className="font-mono text-sm text-sbs-ink">
          {listing.sku}
          {listing.includesCover ? " · with cover" : ""}
        </p>
        <p className="font-mono text-2xl text-sbs-text">
          {formatUsd(listing.price)}
        </p>
        <p className="text-sm text-sbs-ink">
          {listing.condition}
          {listing.includesCover ? " · with cover" : ""}
        </p>
        <ListingBadges
          verified={listing.verified}
          southBaySelect={listing.southBaySelect}
          selfServe={listing.route === "self-serve"}
        />
      </header>

      <p className="text-sbs-ink">{listing.summary}</p>

      <AngleGrid
        labels={listing.photoLabels}
        photoSrcs={listing.photoSrcs}
        altPrefix={listing.name}
      />

      <dl className="grid gap-4 border-y border-sbs-border py-6 text-sm">
        <Fact label="Brand" value={listing.brand} />
        <Fact label="Model" value={listing.model} />
        <Fact label="Year" value={listing.year} />
        <Fact label="Seat" value={listing.seat} />
        <Fact label="Flap" value={listing.flap} />
        <Fact label="Tree" value={listing.tree} />
        {listing.blocks ? <Fact label="Blocks" value={listing.blocks} /> : null}
        {listing.proNotes ? <Fact label="PRO" value={listing.proNotes} /> : null}
        <Fact label="Stamps" value={listing.stamps} />
        <Fact label="Serial" value={listing.serial} />
        <Fact label="Condition" value={listing.condition} />
        <Fact label="Wear" value={listing.wear} />
        <Fact label="Service" value={listing.serviceHistory} />
        <Fact label="Location" value={listing.location} />
        <Fact label="Path" value={pathLabel(listing.route)} />
        <Fact label="Discipline" value={listing.discipline} />
      </dl>

      <BuyCta
        listingId={listing.id}
        listingName={listing.name}
        price={listing.price}
      />
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-sbs-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sbs-text">{value}</dd>
    </div>
  );
}
