import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <article className="sbs-page-wide space-y-10">
      <figure className="mx-auto max-w-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/about/jeff-sarault.jpg"
          alt="Jeff Sarault"
          className="aspect-[4/5] w-full bg-sbs-white object-cover object-center"
        />
        <figcaption className="mt-2 text-[var(--sbs-text-meta)] text-sbs-muted">
          South Bay Stables
        </figcaption>
      </figure>

      <header className="mx-auto max-w-xl space-y-3">
        <p className="text-[var(--sbs-text-meta)] uppercase tracking-[0.16em] text-sbs-muted">
          Founder
        </p>
        <h1
          className="font-serif font-medium leading-[1.1] text-sbs-text"
          style={{ fontSize: "var(--sbs-text-hero)" }}
        >
          Jeff Sarault
        </h1>
        <p className="text-sm text-sbs-ink">
          Certified saddle expert. The hands behind every Verified listing.
        </p>
      </header>

      <div className="mx-auto max-w-xl space-y-4 text-sm leading-relaxed text-sbs-ink">
        <p>
          Jeff has worked with high-end saddles since 2003, when he earned
          certification as a saddle expert through Voltaire Design. He spent
          years as a Voltaire sales representative across Ohio, Pennsylvania,
          and Western New York, and later helped launch Stella Saddlery —
          Voltaire’s Western sister brand.
        </p>
        <p>
          He left that organization to build South Bay Saddlery: a quieter way
          to buy and sell exceptional used English saddles, with a human still
          willing to put hands on the leather.
        </p>
      </div>

      <section className="mx-auto max-w-xl space-y-4">
        <h2 className="font-serif text-2xl font-medium text-sbs-text">
          What Verified means here
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-sbs-ink">
          <p>
            When a saddle is Verified, it has been shipped to South Bay Stables
            and inspected in person by Jeff — tree, leather, billets, and wear.
            It stays warehoused with us until it sells, and a short promo film
            is made for the listing.
          </p>
          <p>
            The mark on the photo is not a sticker from a warehouse robot. It is
            his name on the work.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-xl flex-wrap items-center gap-x-5 gap-y-2">
        <Link
          href="/collection"
          className="inline-flex bg-sbs-accent px-5 py-3 text-sm tracking-wide text-sbs-on-accent"
        >
          Browse Verified saddles
        </Link>
        <Link
          href="/sell"
          className="text-sm text-sbs-ink underline-offset-4 hover:underline"
        >
          Sell your saddle
        </Link>
      </div>
    </article>
  );
}
