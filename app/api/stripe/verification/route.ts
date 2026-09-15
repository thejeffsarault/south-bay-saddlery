import { NextResponse } from "next/server";
import { VERIFICATION_FEE_USD } from "@/lib/payout";
import { getStripe, siteOrigin, stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { submissionId?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  if (!stripeConfigured() || !getStripe()) {
    return NextResponse.json({
      ok: false,
      setup: true,
      message:
        "Verification checkout is in test setup. The $150 PaymentIntent is stubbed until Stripe keys are set. SBS absorbs Stripe on this charge.",
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({
      ok: false,
      setup: true,
      message: "Verification checkout is in test setup.",
    });
  }

  const origin = siteOrigin(request);
  const submissionId = body.submissionId || "";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: VERIFICATION_FEE_USD * 100,
            product_data: {
              name: "SBS Verification",
              description:
                "Non-refundable inspection. SBS absorbs card processing. Success queues an inbound FedEx label seller → warehouse.",
            },
          },
        },
      ],
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}&kind=verification&submissionId=${encodeURIComponent(submissionId)}`,
      cancel_url: `${origin}/verify?submissionId=${encodeURIComponent(submissionId)}`,
      payment_intent_data: {
        metadata: {
          kind: "verification",
          submissionId,
          sbsAbsorbsStripe: "true",
        },
      },
      metadata: {
        kind: "verification",
        submissionId,
        sbsAbsorbsStripe: "true",
      },
    });

    return NextResponse.json({
      ok: true,
      url: session.url,
      id: session.id,
      product: "SBS Verification",
      amount: VERIFICATION_FEE_USD,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({
      ok: false,
      setup: true,
      message: `Verification is in test setup. ${message}`,
    });
  }
}
