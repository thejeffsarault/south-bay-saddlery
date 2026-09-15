"use client";

import { useState } from "react";
import { VERIFICATION_FEE_USD, formatUsd } from "@/lib/catalog";

export function VerifyUpsell({
  submissionId,
  initialLabelId,
}: {
  submissionId: string;
  initialLabelId?: string | null;
}) {
  const [busy, setBusy] = useState<"pay" | "label" | "">("");
  const [message, setMessage] = useState("");
  const [labelId, setLabelId] = useState(initialLabelId || "");

  async function startPay() {
    setBusy("pay");
    setMessage("");
    try {
      const res = await fetch("/api/stripe/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      const data = (await res.json()) as {
        url?: string;
        message?: string;
        setup?: boolean;
      };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage(
        data.message ||
          "Verification checkout is in test setup. The $150 PaymentIntent is stubbed until Stripe keys are set. SBS absorbs Stripe on this charge.",
      );
    } catch {
      setMessage("Verification checkout is in test setup.");
    } finally {
      setBusy("");
    }
  }

  async function queueLabel() {
    setBusy("label");
    setMessage("");
    try {
      const res = await fetch("/api/labels/fedex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "seller_to_warehouse",
          submissionId,
        }),
      });
      const data = (await res.json()) as {
        job?: { id: string; message?: string };
        message?: string;
      };
      if (data.job?.id) setLabelId(data.job.id);
      setMessage(data.message || data.job?.message || "label queued");
    } catch {
      setMessage("Label could not be queued.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-4 border border-sbs-border bg-sbs-surface p-4">
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-sbs-muted">
        Verification
      </p>
      <h2 className="font-serif text-2xl text-sbs-text">
        Verified path · {formatUsd(VERIFICATION_FEE_USD)}
      </h2>
      <p className="text-sm text-sbs-ink">
        Non-refundable. Separate $150 PaymentIntent — not the listing Checkout.
        SBS absorbs Stripe on this charge. Success queues an inbound FedEx
        label seller → warehouse. If VERIFY_SHIP_TO_* is empty, the job stays
        queued.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={startPay}
          disabled={Boolean(busy)}
          className="bg-sbs-accent px-4 py-3 text-sm text-sbs-on-accent disabled:opacity-60"
        >
          {busy === "pay"
            ? "Opening…"
            : `Pay ${formatUsd(VERIFICATION_FEE_USD)} verification`}
        </button>
        <button
          type="button"
          onClick={queueLabel}
          disabled={Boolean(busy)}
          className="border border-sbs-border px-4 py-3 text-sm text-sbs-text disabled:opacity-60"
        >
          {busy === "label" ? "Queuing…" : "FedEx label to warehouse"}
        </button>
      </div>
      {labelId ? (
        <p className="font-mono text-xs text-sbs-muted">Label job {labelId}</p>
      ) : null}
      {message ? <p className="text-sm text-sbs-ink">{message}</p> : null}
    </div>
  );
}
