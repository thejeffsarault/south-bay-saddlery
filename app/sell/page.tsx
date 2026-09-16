import type { Metadata } from "next";
import { SellForm } from "@/components/SellForm";
import { SELL_COPY } from "@/lib/catalog";

export const metadata: Metadata = {
  title: SELL_COPY.headline,
};

export default function SellPage() {
  return (
    <div className="sbs-page !py-4">
      <SellForm />
    </div>
  );
}
