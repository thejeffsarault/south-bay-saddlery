import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Presentation received",
};

export default function PresentReceivedPage() {
  return (
    <div className="space-y-5">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-cognac">
        Intake
      </p>
      <h1 className="font-serif text-4xl text-espresso">Received</h1>
      <p className="text-charcoal">
        Your saddle is in the founder queue. Jeff will set price and route
        before anything is published to Explore the Collection.
      </p>
      <Link href="/collection" className="inline-block text-sm underline underline-offset-4">
        Explore the Collection
      </Link>
    </div>
  );
}
