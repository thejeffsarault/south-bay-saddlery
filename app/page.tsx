import Link from "next/link";
import { SaddleCard } from "@/components/SaddleCard";
import { PUBLISHED_LISTINGS } from "@/lib/inventory";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-sbs-muted">
        Pre-owned English
      </p>
      <div className="space-y-4">
        <h1 className="font-serif text-[2.6rem] leading-[1.05] text-sbs-text sm:text-5xl">
          Sell your saddle. Browse the Collection.
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-sbs-ink">
          South Bay Saddlery is a mobile-first marketplace for pre-owned
          English saddles. Photograph the required angles, send the facts, and
          a founder reviews every listing before it goes live.
        </p>
      </div>
      <div className="brass-rule" />
      <div className="grid gap-3">
        <Link
          href="/sell"
          className="bg-sbs-accent px-5 py-4 text-center text-sm tracking-wide text-sbs-on-accent"
        >
          Sell Your Saddle
        </Link>
        <Link
          href="/collection"
          className="border border-sbs-border px-5 py-4 text-center text-sm tracking-wide text-sbs-text hover:border-sbs-black"
        >
          Explore the Collection
        </Link>
      </div>
      <section className="space-y-4">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-sbs-muted">
          In the Collection
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {PUBLISHED_LISTINGS.map((listing) => (
            <SaddleCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
