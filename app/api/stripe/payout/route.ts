import { NextResponse } from "next/server";
import { usdToCents } from "@/lib/payout";
import { logFinance } from "@/lib/finance";
import { findConnectByEmail, findOrderById, listOrders, updateOrder } from "@/lib/server-store";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  const orders = await listOrders();
  return NextResponse.json({
    ok: true,
    orders: orders.filter((order) => order.kind === "listing"),
  });
}

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
  if (order.status === "refunded" || order.status === "returned") {
    return NextResponse.json({
      ok: false,
      message: "No payout on a reversed sale. No 12% is taken.",
    });
  }
  if (order.status === "escrow" || order.status === "delivered") {
    return NextResponse.json({
      ok: false,
      message:
        "Hold on platform until close. Mark delivered (3-day keep/return), then close, then wait 7–10 business days.",
    });
  }

  const now = new Date();
  if (order.payoutEligibleOn && new Date(order.payoutEligibleOn) > now) {
    return NextResponse.json({
      ok: false,
      message: `Payout window is 7–10 business days after close. Eligible ${order.payoutEligibleOn}.`,
      payoutEligibleOn: order.payoutEligibleOn,
    });
  }

  if (order.platformOwned || order.payoutMode === "platform") {
    const updated = await updateOrder(order.id, { status: "platform_retained" });
    await logFinance({
      type: "payout.platform_retained",
      orderId: order.id,
      listingId: order.listingId,
      amount: order.amount,
      status: "platform_retained",
      detail: `Select/founder inventory ${order.listingId} — funds stay on the platform. No Connect transfer. Breakdown kept for the ledger.`,
      stub: !stripeConfigured(),
    });
    return NextResponse.json({
      ok: true,
      transferred: false,
      status: "platform_retained",
      order: updated,
      breakdown: order.breakdown,
    });
  }

  const net = order.breakdown?.sellerNet ?? 0;
  const connect = order.connectAccountId
    ? { stripeAccountId: order.connectAccountId }
    : order.sellerEmail
      ? await findConnectByEmail(order.sellerEmail)
      : undefined;
  const destination = order.connectAccountId || connect?.stripeAccountId;
  if (!destination) {
    const updated = await updateOrder(order.id, { status: "payout_queued" });
    await logFinance({
      type: "payout.queued",
      orderId: order.id,
      listingId: order.listingId,
      amount: net,
      status: "payout_queued",
      detail:
        "C2C payout queued. Connect Express account is missing — onboard the seller before Transfer.",
      stub: true,
    });
    return NextResponse.json({
      ok: true,
      transferred: false,
      status: "payout_queued",
      message: "Connect Express required for C2C seller payout.",
      order: updated,
      breakdown: order.breakdown,
    });
  }

  const stripe = getStripe();
  if (!stripe || !stripeConfigured()) {
    const updated = await updateOrder(order.id, { status: "payout_queued" });
    await logFinance({
      type: "payout.queued",
      orderId: order.id,
      listingId: order.listingId,
      amount: net,
      status: "payout_queued",
      detail: `Payout job stub: would Transfer ${net} to ${order.connectAccountId} after close. Stripe keys missing.`,
      stub: true,
    });
    return NextResponse.json({
      ok: true,
      transferred: false,
      setup: true,
      status: "payout_queued",
      order: updated,
      breakdown: order.breakdown,
    });
  }

  try {
    const transfer = await stripe.transfers.create({
      amount: usdToCents(net),
      currency: "usd",
      destination,
      transfer_group: order.transferGroup,
      metadata: {
        orderId: order.id,
        listingId: order.listingId,
        sbsFee: String(order.breakdown?.sbsFee ?? ""),
        stripeProcessing: String(order.breakdown?.stripeProcessing ?? ""),
      },
    });
    const updated = await updateOrder(order.id, {
      status: "paid",
      stripeTransferId: transfer.id,
    });
    await logFinance({
      type: "payout.transferred",
      stripeId: transfer.id,
      orderId: order.id,
      listingId: order.listingId,
      amount: net,
      status: "paid",
      detail: `Transferred seller net after 12% and Stripe processing. Not created at Checkout.`,
    });
    return NextResponse.json({
      ok: true,
      transferred: true,
      status: "paid",
      transferId: transfer.id,
      order: updated,
      breakdown: order.breakdown,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transfer failed.";
    await logFinance({
      type: "transfer.failed",
      orderId: order.id,
      listingId: order.listingId,
      amount: net,
      status: "failed",
      detail: message,
    });
    return NextResponse.json({ ok: false, message });
  }
}
