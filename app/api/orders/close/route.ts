import { NextResponse } from "next/server";
import { payoutWindow } from "@/lib/payout";
import { logFinance } from "@/lib/finance";
import { findOrderById, updateOrder } from "@/lib/server-store";

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
  if (order.status === "refunded" || order.status === "returned") {
    return NextResponse.json({ ok: false, message: "Cannot close a reversed sale." });
  }
  const closedAt = new Date().toISOString();
  const window = payoutWindow(closedAt);
  const updated = await updateOrder(order.id, {
    status: "closed",
    closedAt,
    ...window,
  });
  await logFinance({
    type: "order.closed",
    orderId: order.id,
    listingId: order.listingId,
    status: "closed",
    detail: `Close recorded. Payout eligible ${window.payoutEligibleOn} (7–10 biz days). No transfer yet.`,
  });
  return NextResponse.json({ ok: true, order: updated });
}
