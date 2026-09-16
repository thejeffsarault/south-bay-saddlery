import type { Metadata } from "next";
import { SellForm } from "@/components/SellForm";
import { SELL_COPY } from "@/lib/catalog";
import { isSellDemo } from "@/lib/sell-demo";

export const metadata: Metadata = {
  title: SELL_COPY.headline,
};

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const { demo } = await searchParams;
  return (
    <div className="sbs-page sbs-sell !py-8">
      <SellForm demo={isSellDemo(demo)} />
    </div>
  );
}
