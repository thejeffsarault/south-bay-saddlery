import { NextResponse } from "next/server";
import { warehouseShipTo } from "@/lib/commerce";
import {
  WORKED_EXAMPLE,
  payoutExampleHolds,
} from "@/lib/payout";
import { listConnect, listFinance, listLabels, listOrders } from "@/lib/server-store";

export const runtime = "nodejs";

export async function GET() {
  const [events, orders, connect, labels] = await Promise.all([
    listFinance(),
    listOrders(),
    listConnect(),
    listLabels(),
  ]);
  return NextResponse.json({
    ok: true,
    exampleHolds: payoutExampleHolds(),
    workedExample: WORKED_EXAMPLE,
    warehouse: warehouseShipTo(),
    tax: {
      phase: 1,
      automaticTaxOnCheckout: true,
      successFeeOnListOnly: true,
      stripeFeeOnPaymentIntent: true,
    },
    events,
    orders,
    connect,
    labels,
  });
}
