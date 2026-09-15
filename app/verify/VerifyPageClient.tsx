"use client";

import Link from "next/link";
import { VerifyUpsell } from "@/components/VerifyUpsell";

export function VerifyPageClient({ submissionId }: { submissionId?: string }) {
  return (
    <div className="space-y-6">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-sbs-muted">
        Verification
      </p>
      <h1 className="font-serif text-4xl text-sbs-text">Verified path</h1>
      <p className="text-sbs-ink">
        $150 non-refundable. Separate PaymentIntent — SBS absorbs Stripe.
        Success queues an inbound FedEx label seller → South Bay Saddlery
        (Santa Rosa Beach). Receiving 9am–5pm (local). Ship/receive only — no
        drop-offs, walk-ins, or barn visits. Jeff does not see a support or
        shipping task.
      </p>
      {submissionId ? (
        <VerifyUpsell submissionId={submissionId} />
      ) : (
        <p className="text-sm text-sbs-ink">
          Start from{" "}
          <Link href="/sell" className="underline underline-offset-4">
            Sell Your Saddle
          </Link>{" "}
          and choose the Verified path.
        </p>
      )}
    </div>
  );
}
