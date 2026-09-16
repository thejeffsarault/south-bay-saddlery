import type { Metadata } from "next";
import { SellForm } from "@/components/SellForm";
import { SELL_COPY } from "@/lib/catalog";

export const metadata: Metadata = {
  title: SELL_COPY.headline,
};

export default function SellPage() {
  return (
    <div className="sbs-page space-y-5">
      <h1 className="font-serif text-3xl font-medium text-sbs-text sm:text-4xl">
        {SELL_COPY.headline}
      </h1>
      <p className="text-sbs-text">{SELL_COPY.microcopy}</p>
      <p className="text-[var(--sbs-text-meta)] text-sbs-muted">
        {SELL_COPY.secondary}
      </p>
      <SellForm />
    </div>
  );
}
