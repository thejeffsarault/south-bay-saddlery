import type { Metadata } from "next";
import { SellForm } from "@/components/SellForm";

export const metadata: Metadata = {
  title: "Sell Your Saddle",
};

export default function SellPage() {
  return (
    <div className="space-y-6">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-sbs-muted">
        Intake
      </p>
      <h1 className="font-serif text-4xl text-sbs-text">Sell Your Saddle</h1>
      <p className="text-sbs-ink">
        Phone-first intake for a pre-owned English saddle. About five minutes.
        Nothing is live until a founder approves and publishes from the queue.
      </p>
      <SellForm />
    </div>
  );
}
