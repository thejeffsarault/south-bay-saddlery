import type { Metadata } from "next";
import { SellForm } from "@/components/SellForm";

export const metadata: Metadata = {
  title: "Sell Your Saddle",
};

export default function SellPage() {
  return (
    <div className="sbs-page space-y-6">
      <h1 className="font-serif text-3xl font-medium text-sbs-text sm:text-4xl">
        Sell Your Saddle
      </h1>
      <p className="text-sm text-sbs-muted">
        List in minutes · founder review before live
      </p>
      <SellForm />
    </div>
  );
}
