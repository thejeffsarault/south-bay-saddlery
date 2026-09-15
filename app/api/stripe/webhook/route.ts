import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  createEscrowOrder,
  createLabelJob,
  newId,
} from "@/lib/commerce";
import { logFinance } from "@/lib/finance";
import { computePayout, isPlatformOwnedListing } from "@/lib/payout";
import {
  findConnectByEmail,
  findOrderByPaymentIntent,
  findOrderBySession,
  findOrderByTransferGroup,
  saveConnectAccount,
  saveLabel,
  saveOrder,
  updateOrder,
} from "@/lib/server-store";
import { getStripe, stripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const kind =
    session.metadata?.kind === "verification"
      ? "verification"
      : session.metadata?.kind === "restock"
        ? "restock"
        : "listing";
  const chargedAmount = (session.amount_total ?? 0) / 100;
  const listAmount = Number(session.metadata?.listAmount) || chargedAmount;
  const listingId = session.metadata?.listingId || "";
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  const existing = session.id ? await findOrderBySession(session.id) : undefined;
  if (existing && kind === "listing") {
    const breakdown = computePayout(
      existing.listAmount || listAmount,
      chargedAmount,
    );
    await updateOrder(existing.id, {
      chargedAmount,
      listAmount: existing.listAmount || listAmount,
      breakdown,
    });
  }
  const order =
    existing ||
    (await saveOrder(
      createEscrowOrder({
        listingId,
        listingName: session.metadata?.listingName || "South Bay Saddlery",
        amount: chargedAmount,
        listAmount,
        chargedAmount,
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        transferGroup: session.metadata?.transferGroup,
        kind,
        payoutMode:
          session.metadata?.payoutMode === "connect" ? "connect" : "platform",
        platformOwned:
          session.metadata?.platformOwned === "true" ||
          isPlatformOwnedListing(listingId),
        sellerEmail: session.metadata?.sellerEmail,
      }),
    ));

  await logFinance({
    type: "checkout.session.completed",
    stripeId: session.id,
    orderId: order.id,
    listingId,
    amount: chargedAmount,
    status: order.status,
    detail:
      kind === "verification"
        ? "Verification $150 captured on platform. SBS absorbs Stripe. No seller transfer."
        : kind === "restock"
          ? "Separate $100 restock charge captured. No 12% on the reversed sale."
          : "Buyer Checkout captured on the platform account. Held — no auto-transfer to seller.",
  });

  if (kind === "verification") {
    await saveLabel(
      createLabelJob({
        kind: "seller_to_warehouse",
        listingId,
        submissionId: session.metadata?.submissionId,
        orderId: order.id,
      }),
    );
  }

  if (kind === "listing") {
    await saveLabel(
      createLabelJob({
        kind: "seller_to_buyer",
        listingId,
        orderId: order.id,
      }),
    );
  }

  return order;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = stripeWebhookSecret();

  if (!stripe || !secret) {
    return NextResponse.json({
      ok: false,
      setup: true,
      message:
        "Stripe webhook is in test setup. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
    });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ message: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const raw = await request.text();
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    }
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const kind = intent.metadata?.kind || "listing";
      const amount = (intent.amount_received || intent.amount) / 100;
      const listAmount = Number(intent.metadata?.listAmount) || amount;
      let order = intent.id ? await findOrderByPaymentIntent(intent.id) : undefined;
      if (order && kind === "listing") {
        await updateOrder(order.id, {
          chargedAmount: amount,
          listAmount: order.listAmount || listAmount,
          breakdown: computePayout(order.listAmount || listAmount, amount),
        });
      }
      if (!order && kind === "verification") {
        order = await saveOrder(
          createEscrowOrder({
            listingId: intent.metadata?.listingId || "",
            listingName: "SBS Verification",
            amount,
            stripePaymentIntentId: intent.id,
            kind: "verification",
          }),
        );
        await saveLabel(
          createLabelJob({
            kind: "seller_to_warehouse",
            listingId: intent.metadata?.listingId,
            submissionId: intent.metadata?.submissionId,
            orderId: order.id,
          }),
        );
      }
      await logFinance({
        type: "payment_intent.succeeded",
        stripeId: intent.id,
        orderId: order?.id,
        listingId: intent.metadata?.listingId,
        amount,
        status: order?.status || "paid",
        detail:
          kind === "verification"
            ? "Verification PaymentIntent succeeded. Inbound warehouse label queued. SBS absorbed processing."
            : kind === "restock"
              ? "Restock PaymentIntent succeeded. Separate $100 charge."
              : "Listing PaymentIntent succeeded. Funds held on platform until close + 7–10 biz day payout.",
      });
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const pi =
        typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      const order = pi ? await findOrderByPaymentIntent(pi) : undefined;
      if (order && order.kind === "listing") {
        await updateOrder(order.id, { status: "refunded" });
      }
      await logFinance({
        type: "charge.refunded",
        stripeId: charge.id,
        orderId: order?.id,
        listingId: order?.listingId,
        amount: (charge.amount_refunded || charge.amount) / 100,
        status: "refunded",
        detail:
          "Charge refunded. No 12% success fee on a reversed sale. Restock is a separate $100 charge if this is a return.",
      });
      break;
    }
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const email = account.email || "";
      const existing = email ? await findConnectByEmail(email) : undefined;
      await saveConnectAccount({
        id: existing?.id || newId("cn"),
        email: email || account.id,
        stripeAccountId: account.id,
        listingId: existing?.listingId,
        submissionId: existing?.submissionId,
        chargesEnabled: Boolean(account.charges_enabled),
        payoutsEnabled: Boolean(account.payouts_enabled),
        onboarded: Boolean(account.details_submitted && account.payouts_enabled),
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await logFinance({
        type: "account.updated",
        stripeId: account.id,
        detail: `Connect Express ${account.id} updated. payouts_enabled=${Boolean(account.payouts_enabled)}.`,
        status: account.payouts_enabled ? "onboarded" : "pending",
      });
      break;
    }
    default: {
      const paid = ["transfer.paid", "payout.paid", "transfer.created"];
      const failed = ["transfer.failed", "payout.failed", "transfer.reversed"];
      if (paid.includes(event.type) || failed.includes(event.type)) {
        const transfer = event.data.object as Stripe.Transfer | Stripe.Payout;
        const group =
          "transfer_group" in transfer && typeof transfer.transfer_group === "string"
            ? transfer.transfer_group
            : undefined;
        const order = group ? await findOrderByTransferGroup(group) : undefined;
        const ok = paid.includes(event.type);
        if (ok && order) {
          await updateOrder(order.id, {
            status: "paid",
            stripeTransferId: transfer.id,
          });
        }
        await logFinance({
          type: event.type,
          stripeId: transfer.id,
          orderId: order?.id,
          listingId: order?.listingId,
          amount: transfer.amount / 100,
          status: ok ? "paid" : "failed",
          detail: ok
            ? "Seller Transfer recorded after close. Not created at Checkout."
            : "Seller Transfer failed or reversed. Funds remain on the platform.",
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
