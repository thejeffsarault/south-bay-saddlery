import type { Metadata } from "next";
import { QueueBoard } from "@/components/QueueBoard";

export const metadata: Metadata = {
  title: "Founder queue",
};

export default function QueuePage() {
  return (
    <div className="space-y-6">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-sbs-muted">
        Founder
      </p>
      <h1 className="font-serif text-4xl text-sbs-text">Queue</h1>
      <p className="text-sbs-ink">
        Jeff price, route, then publish. Nothing enters Explore the Collection
        until those three gates are set.
      </p>
      <QueueBoard />
    </div>
  );
}
