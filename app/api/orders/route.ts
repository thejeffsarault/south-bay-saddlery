import { NextResponse } from "next/server";
import { listOrders } from "@/lib/server-store";

export const runtime = "nodejs";

export async function GET() {
  const orders = await listOrders();
  return NextResponse.json({ ok: true, orders });
}
