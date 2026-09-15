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
        Pending, approve, reject, publish. After approve and publish, the
        saddle enters the Collection. Notify Jeff via Andy/Kai — never from a
        direct Jeff inbox in this app.
      </p>
      <QueueBoard />
    </div>
  );
}
