import Link from "next/link";
import { CollectionGrid } from "@/components/CollectionGrid";
import { PUBLISHED_LISTINGS } from "@/lib/inventory";

const HERO =
  PUBLISHED_LISTINGS.find((listing) => listing.id === "ji-001") ??
  PUBLISHED_LISTINGS[0];

export default function HomePage() {
  return (
    <div>
      <section className="relative bg-sbs-white">
        <div className="sbs-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO.heroSrc}
            alt={HERO.name}
            className="h-full w-full object-cover object-center"
            fetchPriority="high"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-sbs-white via-sbs-white/85 to-transparent">
          <div className="sbs-page-wide pointer-events-auto !pb-6 !pt-16">
            <h1
              className="font-serif font-medium leading-[1.1] text-sbs-text"
              style={{ fontSize: "var(--sbs-text-hero)" }}
            >
              Exceptional pre-owned saddles
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href="/collection"
                className="inline-flex bg-sbs-accent px-5 py-3 text-sm tracking-wide text-sbs-on-accent"
              >
                Explore the Collection
              </Link>
              <Link
                href="/sell"
                className="text-sm text-sbs-ink underline-offset-4 hover:underline"
              >
                Sell Your Saddle
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sbs-page-wide space-y-5">
        <h2 className="font-serif text-2xl font-medium text-sbs-text">
          The Collection
        </h2>
        <CollectionGrid listings={PUBLISHED_LISTINGS} />
      </section>

      <p className="px-[var(--sbs-page-pad-x)] text-center text-[var(--sbs-text-meta)] text-sbs-muted md:px-[var(--sbs-page-pad-x-md)]">
        Founder-reviewed · Verified available
      </p>

      <section className="mt-[var(--sbs-space-7)] bg-sbs-black text-sbs-white">
        <div className="mx-auto max-w-[var(--sbs-max)] px-[var(--sbs-page-pad-x)] py-[var(--sbs-space-7)] text-center md:px-[var(--sbs-page-pad-x-md)]">
          <h2 className="font-serif text-3xl font-medium">Sell Your Saddle</h2>
          <p className="mt-2 text-sm text-sbs-white/70">
            List in minutes · founder review before live
          </p>
          <Link
            href="/sell"
            className="mt-6 inline-block bg-sbs-white px-5 py-3 text-sm tracking-wide text-sbs-black"
          >
            Sell Your Saddle
          </Link>
        </div>
      </section>
    </div>
  );
}
