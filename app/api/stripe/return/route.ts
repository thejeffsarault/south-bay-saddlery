import { NextResponse } from "next/server";
import { RESTOCK_FEE_USD } from "@/lib/payout";
import { createEscrowOrder } from "@/lib/commerce";
import { logFinance } from "@/lib/finance";
import { findOrderById, saveOrder, updateOrder } from "@/lib/server-store";
import { getStripe, siteOrigin, stripeConfigured } from "@/lib/stripe";
import { createTaxedCheckoutSession, taxedPrice } from "@/lib/stripe-tax";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { orderId?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  if (!body.orderId) {
    return NextResponse.json({ ok: false, message: "orderId required." }, { status: 400 });
  }

  const order = await findOrderById(body.orderId);
  if (!order || order.kind !== "listing") {
    return NextResponse.json({ ok: false, message: "Listing order not found." }, { status: 404 });
  }

  const stripe = getStripe();
  let refundId: string | undefined;
  let restockUrl: string | undefined;
  let restockId: string | undefined;

  if (stripe && stripeConfigured() && order.stripePaymentIntentId) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        metadata: { orderId: order.id, kind: "return", noSuccessFee: "true" },
      });
      refundId = refund.id;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Refund failed.";
      return NextResponse.json({ ok: false, message });
    }

    try {
      const origin = siteOrigin(request);
      const { session } = await createTaxedCheckoutSession(stripe, {
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: taxedPrice({
              currency: "usd",
              unit_amount: RESTOCK_FEE_USD * 100,
              product_data: {
                name: "SBS restocking fee",
                description: "Separate $100 restock on return. Buyer also pays return shipping.",
              },
            }),
          },
        ],
        success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}&kind=restock`,
        cancel_url: `${origin}/collection/${encodeURIComponent(order.listingId)}`,
        payment_intent_data: {
          metadata: { kind: "restock", orderId: order.id },
        },
        metadata: { kind: "restock", orderId: order.id, listingId: order.listingId },
      });
      restockUrl = session.url || undefined;
      restockId = session.id;
    } catch {
      restockUrl = undefined;
    }
  }

  const restock = await saveOrder(
    createEscrowOrder({
      listingId: order.listingId,
      listingName: `Restock · ${order.listingName}`,
      amount: RESTOCK_FEE_USD,
      stripeSessionId: restockId,
      kind: "restock",
    }),
  );

  const updated = await updateOrder(order.id, {
    status: "returned",
    restockChargeId: restock.id,
  });

  await logFinance({
    type: "return.started",
    stripeId: refundId,
    orderId: order.id,
    listingId: order.listingId,
    amount: order.amount,
    status: "returned",
    detail:
      "Return path: listing charge reversed with no 12% success fee. $100 restock is a separate charge. Buyer pays return shipping.",
    stub: !refundId,
  });

  await logFinance({
    type: "restock.charged",
    stripeId: restockId,
    orderId: restock.id,
    listingId: order.listingId,
    amount: RESTOCK_FEE_USD,
    status: "queued",
    detail: "Separate $100 restock charge on the return path.",
    stub: !restockUrl,
  });

  return NextResponse.json({
    ok: true,
    order: updated,
    refundId,
    restock,
    restockUrl,
    setup: !stripeConfigured(),
  });
}
