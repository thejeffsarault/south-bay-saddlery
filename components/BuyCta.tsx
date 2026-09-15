"use client";

import { useState } from "react";
import { BUYER_CHECKOUT_COPY } from "@/lib/payout";
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
      <ul className="list-disc space-y-1 pl-5 text-sm text-sbs-ink">
        {BUYER_CHECKOUT_COPY.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {!publishable || message ? (
        <p className="border border-sbs-border bg-sbs-surface px-4 py-3 text-sm text-sbs-ink">
          {message ||
            "Checkout is in test setup. Stripe keys are not on this environment — the buy path will not take live money. Charged totals would be held on the platform account."}
        </p>
      ) : null}
    </div>
  );
}
