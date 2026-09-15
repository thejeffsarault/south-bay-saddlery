import type { Metadata } from "next";
import Link from "next/link";
import { BUYER_CHECKOUT_COPY } from "@/lib/payout";
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
  const restock = kind === "restock" || order?.kind === "restock";

  return (
    <div className="space-y-5">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-sbs-muted">
        {verification ? "Verification" : restock ? "Restock" : "Escrow"}
      </p>
      <h1 className="font-serif text-4xl text-sbs-text">
        {verification
          ? "Verification received"
          : restock
            ? "Restocking fee"
            : "Funds held on the platform"}
      </h1>
      {verification ? (
        <p className="text-sbs-ink">
          The $150 verification fee is non-refundable. SBS absorbs Stripe on
          this charge. An inbound FedEx label seller → South Bay Saddlery
          (Santa Rosa Beach) is queued. Receiving 9am–5pm (local). Ship/receive
          only — no drop-offs or visits.
        </p>
      ) : restock ? (
        <p className="text-sbs-ink">
          Separate $100 restocking fee. The reversed listing sale does not take
          a 12% success fee. You pay return shipping.
        </p>
      ) : (
        <div className="space-y-3 text-sbs-ink">
          <p>
            {order
              ? `${order.listingName} · ${formatUsd(order.amount)} · status ${order.status}. Held on the platform — not transferred to the seller.`
              : "Checkout completed. The charge sits on the platform account until close. No seller transfer on charge."}
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {BUYER_CHECKOUT_COPY.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
      <Link href="/collection" className="inline-block text-sm underline underline-offset-4">
        Back to Collection
      </Link>
    </div>
  );
}
