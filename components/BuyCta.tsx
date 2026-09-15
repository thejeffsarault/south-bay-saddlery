"use client";

import { useState } from "react";
import { ESCROW_TERMS } from "@/lib/commerce";
import { formatUsd } from "@/lib/catalog";

export function BuyCta({
  listingId,
  listingName,
  price,
}: {
  listingId: string;
  listingName: string;
  price: number;
}) {
  const publishable = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function startCheckout() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "listing",
          listingId,
          listingName,
          price,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        url?: string;
        setup?: boolean;
        message?: string;
      };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage(
        data.message ||
          "Checkout is in test setup. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
      );
    } catch {
      setMessage("Checkout is in test setup and could not start.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={startCheckout}
        disabled={busy}
        className="inline-flex w-full items-center justify-center bg-sbs-accent px-5 py-3.5 text-sm tracking-wide text-sbs-on-accent disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Opening checkout…" : `Buy · ${formatUsd(price)}`}
      </button>
      <p className="text-sm text-sbs-ink">
        Funds held in escrow. {ESCROW_TERMS.returnWindowDays}-day return from
        receipt. {formatUsd(ESCROW_TERMS.restockFeeUsd)} restocking fee. Seller
        payout {ESCROW_TERMS.sellerPayout} after close.
      </p>
      {!publishable || message ? (
        <p className="border border-sbs-border bg-sbs-surface px-4 py-3 text-sm text-sbs-ink">
          {message ||
            "Checkout is in test setup. Stripe keys are not on this environment — the buy path will not take live money."}
        </p>
      ) : null}
    </div>
  );
}
