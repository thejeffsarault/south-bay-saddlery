import { NextResponse } from "next/server";
import { stripeConfigured, stripePublishableKey, stripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    checkoutReady: stripeConfigured(),
    publishableKeyPresent: Boolean(stripePublishableKey()),
    webhookReady: Boolean(stripeWebhookSecret()),
  });
}
