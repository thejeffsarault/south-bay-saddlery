import { NextResponse } from "next/server";
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
  const deliveredAt = new Date().toISOString();
  const updated = await updateOrder(order.id, { status: "delivered", deliveredAt });
  await logFinance({
    type: "order.delivered",
    orderId: order.id,
    listingId: order.listingId,
    status: "delivered",
    detail: "Delivery recorded. Buyer has 3 days to keep or return.",
  });
  return NextResponse.json({ ok: true, order: updated });
}
