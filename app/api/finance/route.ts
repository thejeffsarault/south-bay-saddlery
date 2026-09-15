import { NextResponse } from "next/server";
import { warehouseShipTo } from "@/lib/commerce";
import {
  WORKED_EXAMPLE,
  payoutExampleHolds,
} from "@/lib/payout";
import { listConnect, listFinance, listOrders } from "@/lib/server-store";

export const runtime = "nodejs";

export async function GET() {
  const [events, orders, connect] = await Promise.all([
    listFinance(),
    listOrders(),
    listConnect(),
  ]);
  return NextResponse.json({
    ok: true,
    exampleHolds: payoutExampleHolds(),
    workedExample: WORKED_EXAMPLE,
    warehouse: warehouseShipTo(),
    events,
    orders,
    connect,
  });
}
