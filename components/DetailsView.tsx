"use client";

import { notFound } from "next/navigation";
import { ConsultationCta } from "@/components/SiteChrome";
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
      return <p className="text-sm text-charcoal">Opening Details…</p>;
    }
    notFound();
  }

  return (
    <article className="space-y-8">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-cognac">
        Details
      </p>
      <header className="space-y-2">
        <h1 className="font-serif text-4xl leading-tight text-espresso">
          {listing.name}
        </h1>
        <p className="font-mono text-sm text-charcoal">
          {listing.sku} · {listing.program}
          {listing.includesCover ? " · with cover" : ""}
        </p>
      </header>

      <p className="font-mono text-2xl text-espresso">
        {formatUsd(listing.price)}
      </p>
      <p className="text-charcoal">{listing.summary}</p>

      <AngleGrid labels={listing.photoLabels} />

      <dl className="grid gap-4 border-y border-border py-6 text-sm">
        <Fact label="Brand" value={listing.brand} />
        <Fact label="Model" value={listing.model} />
        <Fact label="Year" value={listing.year} />
        <Fact label="Seat" value={listing.seat} />
        <Fact label="Flap" value={listing.flap} />
        <Fact label="Tree" value={listing.tree} />
        <Fact label="Stamps" value={listing.stamps} />
        <Fact label="Serial" value={listing.serial} />
        <Fact label="Condition" value={listing.condition} />
        <Fact label="Wear" value={listing.wear} />
        <Fact label="Service history" value={listing.serviceHistory} />
        <Fact label="Location" value={listing.location} />
        <Fact label="Path" value={pathLabel(listing.route)} />
        <Fact label="Discipline" value={listing.discipline} />
      </dl>

      <ConsultationCta />
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-cognac">
        {label}
      </dt>
      <dd className="mt-1 text-espresso">{value}</dd>
    </div>
  );
}
