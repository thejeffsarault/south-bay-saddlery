"use client";

import { useEffect, useState } from "react";
import { formatUsd, formatUsdPrecise } from "@/lib/catalog";
import type { ConnectAccount, FinanceEvent, LabelJob, Order } from "@/lib/commerce";
import type { PayoutBreakdown } from "@/lib/payout";

type FinancePayload = {
  ok: boolean;
  exampleHolds: boolean;
  workedExample: PayoutBreakdown;
  warehouse: {
    name: string;
    attn: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    hours: string;
    complete: boolean;
  };
  tax?: {
    phase: number;
    automaticTaxOnCheckout: boolean;
    successFeeOnListOnly: boolean;
    stripeFeeOnPaymentIntent: boolean;
  };
  events: FinanceEvent[];
  orders: Order[];
  connect: ConnectAccount[];
  labels?: LabelJob[];
};

export function FinanceTab() {
  const [data, setData] = useState<FinancePayload | null>(null);
  const [notice, setNotice] = useState("");

  async function reload() {
    const res = await fetch("/api/finance");
    setData((await res.json()) as FinancePayload);
  }

  useEffect(() => {
    void reload();
  }, []);

  async function post(url: string, body: Record<string, string>) {
    setNotice("");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { message?: string; ok?: boolean };
    setNotice(json.message || (json.ok ? "Recorded." : "Request finished."));
    await reload();
  }

  if (!data) {
    return <p className="text-sm text-sbs-muted">Opening the finance ledger…</p>;
  }

  const listings = data.orders.filter((order) => order.kind === "listing");

  return (
    <div className="space-y-8">
      <section className="space-y-2 border border-sbs-border bg-sbs-surface p-4">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-sbs-muted">
          Payout math
        </p>
        <p className="text-sm text-sbs-ink">
          Stripe fee is 2.9% + $0.30 on the PaymentIntent amount (full charge,
          including shipping/tax). 12% success fee stays on item list only.
          Returned/refunded orders skip 12% and skip Transfer — $100 restock is
          a separate buyer charge.
        </p>
        <p className="text-sm text-sbs-text">
          ${data.workedExample.list.toLocaleString()} list → Stripe ≈{" "}
          {formatUsdPrecise(data.workedExample.stripeProcessing)}, SBS 12% ={" "}
          {formatUsdPrecise(data.workedExample.sbsFee)}, seller net ≈{" "}
          {formatUsdPrecise(data.workedExample.sellerNet)}
          {data.exampleHolds ? " · example holds" : " · example drifted"}
        </p>
        <p className="text-xs text-sbs-muted">
          Stripe Tax Phase 1: automatic_tax on Checkout. 12% stays on item
          list. Stripe fee from the full PaymentIntent (tax/ship included).
        </p>
        <p className="text-xs text-sbs-muted">
          Warehouse inbound:{" "}
          {data.warehouse.complete
            ? `${data.warehouse.name}, ${data.warehouse.city} ${data.warehouse.state}`
            : "VERIFY_SHIP_TO_* empty — inbound labels stay queued (env only, not hardcoded)"}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-sbs-text">Orders</h2>
        {listings.length === 0 ? (
          <p className="text-sm text-sbs-ink">
            No listing orders yet. A Checkout webhook or a stubbed return/payout
            writes here.
          </p>
        ) : null}
        {listings.map((order) => (
          <article key={order.id} className="border border-sbs-border bg-sbs-surface p-4">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sbs-muted">
              {order.status} · {order.payoutMode}{" "}
              {order.platformOwned ? "· platform owned" : "· C2C"}
            </p>
            <h3 className="mt-1 font-serif text-2xl text-sbs-text">
              {order.listingName}
            </h3>
            <p className="text-sm text-sbs-ink">
              {formatUsd(order.amount)} held on platform
              {order.breakdown
                ? ` · Stripe ${formatUsdPrecise(order.breakdown.stripeProcessing)} · SBS ${formatUsdPrecise(order.breakdown.sbsFee)} · seller ${formatUsdPrecise(order.breakdown.sellerNet)}`
                : ""}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className="border border-sbs-border px-3 py-2 text-sm"
                onClick={() => post("/api/orders/deliver", { orderId: order.id })}
              >
                Mark delivered
              </button>
              <button
                type="button"
                className="border border-sbs-border px-3 py-2 text-sm"
                onClick={() => post("/api/orders/close", { orderId: order.id })}
              >
                Close (start 7–10 day window)
              </button>
              <button
                type="button"
                className="bg-sbs-accent px-3 py-2 text-sm text-sbs-on-accent"
                onClick={() => post("/api/stripe/payout", { orderId: order.id })}
              >
                Run payout job
              </button>
              <button
                type="button"
                className="border border-sbs-border px-3 py-2 text-sm"
                onClick={() => post("/api/stripe/return", { orderId: order.id })}
              >
                Return + $100 restock
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-sbs-text">Labels</h2>
        <p className="text-sm text-sbs-ink">
          Fail-verify returns are billed to the platform (SBS pays outbound
          FedEx). Inbound verify still uses VERIFY_SHIP_TO_*.
        </p>
        {!data.labels?.length ? (
          <p className="text-sm text-sbs-muted">No label jobs yet.</p>
        ) : (
          data.labels.map((job) => (
            <article key={job.id} className="border border-sbs-border bg-sbs-surface p-4">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sbs-muted">
                {job.kind} · billed {job.billedTo}
                {job.stub ? " · stub" : ""}
              </p>
              <p className="text-sm text-sbs-ink">{job.message}</p>
            </article>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-sbs-text">Connect Express</h2>
        <p className="text-sm text-sbs-ink">
          C2C sellers only. JI-001 and JI-002 skip Connect — funds stay on the
          platform.
        </p>
        {data.connect.length === 0 ? (
          <p className="text-sm text-sbs-muted">No Express accounts yet.</p>
        ) : (
          data.connect.map((account) => (
            <p key={account.id} className="text-sm text-sbs-ink">
              {account.email} · {account.stripeAccountId || "stub"} · payouts{" "}
              {account.payoutsEnabled ? "on" : "off"}
            </p>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-sbs-text">Ledger</h2>
        {data.events.length === 0 ? (
          <p className="text-sm text-sbs-ink">
            Webhooks write payment_intent.succeeded, charge.refunded,
            checkout.session.completed, account.updated, and transfer.paid /
            failed here.
          </p>
        ) : null}
        {data.events.map((event) => (
          <article key={event.id} className="border-t border-sbs-border pt-3 text-sm">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sbs-muted">
              {event.type}
              {event.stub ? " · stub" : ""} · {new Date(event.at).toLocaleString()}
            </p>
            <p className="text-sbs-ink">{event.detail}</p>
          </article>
        ))}
      </section>

      {notice ? <p className="text-sm text-sbs-text">{notice}</p> : null}
    </div>
  );
}
