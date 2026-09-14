import Link from "next/link";
import { ConsultationCta } from "@/components/SiteChrome";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-cognac">
        Pre-owned English
      </p>
      <div className="space-y-4">
        <h1 className="font-serif text-[2.6rem] leading-[1.05] text-espresso sm:text-5xl">
          Present the saddle. Explore the Collection.
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-charcoal">
          South Bay Saddlery Congress is a mobile intake and collection for
          pre-owned English saddles. Photograph every angle, send the facts,
          and Jeff prices, routes, and publishes from the founder queue.
        </p>
      </div>
      <div className="brass-rule" />
      <div className="grid gap-3">
        <Link
          href="/present"
          className="bg-espresso px-5 py-4 text-center text-sm tracking-wide text-ivory"
        >
          Present Your Saddle
        </Link>
        <Link
          href="/collection"
          className="border border-border px-5 py-4 text-center text-sm tracking-wide text-espresso hover:border-cognac"
        >
          Explore the Collection
        </Link>
        <ConsultationCta />
      </div>
    </div>
  );
}
