import { NextResponse } from "next/server";
import { VERIFICATION_FEE_USD } from "@/lib/catalog";
import { getSeedListing } from "@/lib/inventory";
import { getStripe, siteOrigin, stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    kind?: "listing" | "verification";
    listingId?: string;
    listingName?: string;
    submissionId?: string;
    price?: number;
  } = {};
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
        "Checkout is in test setup. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. No live charge was created.",
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({
      ok: false,
      setup: true,
      message: "Checkout is in test setup.",
    });
  }

  const origin = siteOrigin(request);
  const kind = body.kind === "verification" ? "verification" : "listing";

  let name = "South Bay Saddlery";
  let amount = 0;
  let listingId = body.listingId || "";

  if (kind === "verification") {
    name = "Verified inspection";
    amount = VERIFICATION_FEE_USD;
    listingId = body.submissionId || "verification";
  } else {
    const seed = body.listingId ? getSeedListing(body.listingId) : undefined;
    name = seed?.name || body.listingName || "Pre-owned English saddle";
    amount = seed?.price || Number(body.price) || 0;
    listingId = seed?.id || body.listingId || "";
  }

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { ok: false, message: "Listing price is not available for checkout." },
      { status: 400 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount * 100,
            product_data: { name },
          },
        },
      ],
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}&kind=${kind}`,
      cancel_url:
        kind === "verification"
          ? `${origin}/verify?submissionId=${encodeURIComponent(body.submissionId || "")}`
          : `${origin}/collection/${encodeURIComponent(listingId)}`,
      metadata: {
        kind,
        listingId,
        listingName: name,
        submissionId: body.submissionId || "",
      },
    });

    return NextResponse.json({ ok: true, url: session.url, id: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json(
      {
        ok: false,
        setup: true,
        message: `Checkout is in test setup. ${message}`,
      },
      { status: 200 },
    );
  }
}
