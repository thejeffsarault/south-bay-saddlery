"use client";

import { useState } from "react";
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
      setMessage("Unable to start checkout.");
    } catch {
      setMessage("Unable to start checkout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={startCheckout}
        disabled={busy}
        className="inline-flex w-full items-center justify-center bg-sbs-accent px-5 py-3.5 text-sm tracking-wide text-sbs-on-accent disabled:opacity-60"
      >
        {busy ? "Opening checkout…" : `Buy · ${formatUsd(price)}`}
      </button>
      {message ? (
        <p className="text-[var(--sbs-text-meta)] text-sbs-muted">{message}</p>
      ) : null}
    </div>
  );
}
