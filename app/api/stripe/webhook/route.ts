import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createEscrowOrder, createLabelJob } from "@/lib/commerce";
import { saveLabel, saveOrder } from "@/lib/server-store";
import { getStripe, stripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const kind =
      session.metadata?.kind === "verification" ? "verification" : "listing";
    const amount = (session.amount_total ?? 0) / 100;
    const order = await saveOrder(
      createEscrowOrder({
        listingId: session.metadata?.listingId || "",
        listingName: session.metadata?.listingName || "South Bay Saddlery",
        amount,
        stripeSessionId: session.id,
        kind,
      }),
    );

    await saveLabel(
      createLabelJob({
        kind: kind === "verification" ? "seller_to_jeff" : "seller_to_buyer",
        listingId: session.metadata?.listingId,
        submissionId: session.metadata?.submissionId,
        orderId: order.id,
      }),
    );
  }

  return NextResponse.json({ received: true });
}
