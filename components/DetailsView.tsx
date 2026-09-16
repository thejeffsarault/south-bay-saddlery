"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingBadges } from "@/components/Badges";
import { BuyCta } from "@/components/BuyCta";
import { ProductGallery } from "@/components/ProductGallery";
import { SaddleCard } from "@/components/SaddleCard";
import {
  FULFILLMENT_LINE,
  WEAR_MAX_CHARS,
  clipText,
  conditionLine,
  formatUsd,
  pathLabel,
} from "@/lib/catalog";
import { getSeedListing } from "@/lib/inventory";
import { useListing, useStore } from "@/lib/store";

export function DetailsView({ id }: { id: string }) {
  const { listings, ready } = useStore();
  const listing = useListing(id);
  const seeded = getSeedListing(id);

  if (!listing) {
    if (!ready && !seeded) {
      return (
        <div className="sbs-page">
          <p className="text-sm text-sbs-muted">Opening Details…</p>
        </div>
      );
    }
    notFound();
  }

  const related = listings
    .filter((item) => item.published && item.id !== listing.id)
    .slice(0, 3);
  const wear = clipText(listing.wear, WEAR_MAX_CHARS);

  return (
    <article>
      <div className="lg:mx-auto lg:grid lg:max-w-[var(--sbs-max)] lg:grid-cols-2 lg:items-start lg:gap-12 lg:px-[var(--sbs-page-pad-x-md)] lg:pt-8">
        <ProductGallery
          labels={listing.photoLabels}
          photoSrcs={listing.photoSrcs}
        />

        <div className="sbs-page space-y-5 !pt-5 lg:sticky lg:top-20 lg:max-w-none lg:px-0 lg:py-0">
          <header className="space-y-3">
            <h1 className="text-[var(--sbs-text-title)] leading-snug text-sbs-text sm:text-xl">
              {listing.name}
            </h1>
            <p className="text-2xl tracking-tight text-sbs-text">
              {formatUsd(listing.price)}
            </p>
            <ListingBadges
              verified={listing.verified}
              southBaySelect={listing.southBaySelect}
              selfServe={listing.route === "self-serve"}
            />
            <p className="text-[var(--sbs-text-meta)] text-sbs-muted">
              {conditionLine(listing)}
            </p>
            <BuyCta
              listingId={listing.id}
              listingName={listing.name}
              price={listing.price}
            />
          </header>

          <p className="text-[var(--sbs-text-meta)] text-sbs-muted">
            {FULFILLMENT_LINE}
          </p>

          <details className="border-y border-sbs-border py-3">
            <summary className="cursor-pointer text-sm text-sbs-text">
              Specs
            </summary>
            <dl className="mt-4 grid gap-4 text-sm">
              <Fact label="Brand" value={listing.brand} />
              <Fact label="Model" value={listing.model} />
              <Fact label="Year" value={listing.year} />
              <Fact label="Seat" value={listing.seat} />
              <Fact label="Flap" value={listing.flap} />
              <Fact label="Tree" value={listing.tree} />
              {listing.blocks ? <Fact label="Blocks" value={listing.blocks} /> : null}
              {listing.proNotes ? (
                <Fact label="PRO" value={listing.proNotes} />
              ) : null}
              <Fact label="Stamps" value={listing.stamps} mono />
              <Fact label="Serial" value={listing.serial} mono />
              <Fact label="Path" value={pathLabel(listing.route)} />
              <Fact label="Discipline" value={listing.discipline} />
            </dl>
          </details>

          {wear ? (
            <section className="space-y-2">
              <h2 className="text-sm text-sbs-text">Wear</h2>
              <p className="text-sm leading-relaxed text-sbs-ink">{wear}</p>
            </section>
          ) : null}

          <Link
            href="/collection"
            className="inline-block text-sm text-sbs-ink underline-offset-4 hover:underline"
          >
            Back to Collection
          </Link>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="sbs-page-wide space-y-4">
          <h2 className="text-sm text-sbs-text">Also in the Collection</h2>
          <div className="sbs-collection-grid grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <SaddleCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function Fact({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[var(--sbs-text-meta)] uppercase tracking-[0.14em] text-sbs-muted">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sbs-text ${mono ? "font-mono text-[0.8125rem]" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
