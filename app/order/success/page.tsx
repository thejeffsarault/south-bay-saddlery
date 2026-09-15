import type { Metadata } from "next";
import Link from "next/link";
import { ESCROW_TERMS } from "@/lib/commerce";
import { formatUsd } from "@/lib/catalog";
import { findOrderBySession } from "@/lib/server-store";

export const metadata: Metadata = {
  title: "Order",
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; kind?: string }>;
}) {
  const { session_id, kind } = await searchParams;
  const order = session_id ? await findOrderBySession(session_id) : undefined;
  const verification = kind === "verification" || order?.kind === "verification";

  return (
    <div className="space-y-5">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-sbs-muted">
        {verification ? "Verification" : "Escrow"}
      </p>
      <h1 className="font-serif text-4xl text-sbs-text">
        {verification ? "Verification received" : "Funds held"}
      </h1>
      {verification ? (
        <p className="text-sbs-ink">
          The $150 verification fee is non-refundable. A FedEx label to Jeff is
          queued. This is not a support ticket.
        </p>
      ) : (
        <div className="space-y-3 text-sbs-ink">
          <p>
            {order
              ? `${order.listingName} · ${formatUsd(order.amount)} · status ${order.status}.`
              : "Checkout completed. The order is held in escrow once the Stripe webhook lands."}
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>
              {ESCROW_TERMS.returnWindowDays}-day return window from receipt
            </li>
            <li>{formatUsd(ESCROW_TERMS.restockFeeUsd)} restocking fee</li>
            <li>Seller payout {ESCROW_TERMS.sellerPayout}</li>
            <li>{ESCROW_TERMS.successFeePercent}% success fee on close</li>
          </ul>
        </div>
      )}
      <Link href="/collection" className="inline-block text-sm underline underline-offset-4">
        Back to Collection
      </Link>
    </div>
  );
}
