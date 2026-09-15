import { NextResponse } from "next/server";
import { warehouseShipTo } from "@/lib/commerce";
import { payoutExampleHolds, WORKED_EXAMPLE } from "@/lib/payout";
import { stripeConfigured, stripePublishableKey, stripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    checkoutReady: stripeConfigured(),
    publishableKeyPresent: Boolean(stripePublishableKey()),
    webhookReady: Boolean(stripeWebhookSecret()),
    warehouse: warehouseShipTo(),
    payoutExampleHolds: payoutExampleHolds(),
    workedExample: WORKED_EXAMPLE,
    holdOnPlatform: true,
    autoTransferOnCharge: false,
  });
}
