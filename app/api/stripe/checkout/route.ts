import { NextResponse } from "next/server";
import { isPlatformOwnedListing } from "@/lib/payout";
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
    sellerEmail?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  if (body.kind === "verification") {
    return NextResponse.json({
      ok: false,
      message: "Use /api/stripe/verification for the $150 Verification PaymentIntent.",
    });
  }

  if (!stripeConfigured() || !getStripe()) {
    return NextResponse.json({
      ok: false,
      setup: true,
      message:
        "Checkout is in test setup. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. No live charge was created. Funds would be held on the platform — no seller transfer on charge.",
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
  const seed = body.listingId ? getSeedListing(body.listingId) : undefined;
  const name = seed?.name || body.listingName || "Pre-owned English saddle";
  const amount = seed?.price || Number(body.price) || 0;
  const listingId = seed?.id || body.listingId || "";
  const platformOwned = isPlatformOwnedListing(listingId);
  const payoutMode = platformOwned ? "platform" : "connect";
  const transferGroup = `sbs-${listingId || "listing"}-${Date.now().toString(36)}`;

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
            unit_amount: Math.round(amount * 100),
            product_data: {
              name,
              description:
                "Charged in full to South Bay Saddlery. 3 days from delivery to keep or return. Return: you pay shipping + $100 restock.",
            },
          },
        },
      ],
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}&kind=listing`,
      cancel_url: `${origin}/collection/${encodeURIComponent(listingId)}`,
      payment_intent_data: {
        transfer_group: transferGroup,
        metadata: {
          kind: "listing",
          listingId,
          listingName: name,
          payoutMode,
          platformOwned: String(platformOwned),
          holdOnPlatform: "true",
          autoTransfer: "false",
        },
      },
      metadata: {
        kind: "listing",
        listingId,
        listingName: name,
        payoutMode,
        platformOwned: String(platformOwned),
        transferGroup,
        sellerEmail: body.sellerEmail || seed?.sellerEmail || "",
      },
    });

    return NextResponse.json({
      ok: true,
      url: session.url,
      id: session.id,
      transferGroup,
      payoutMode,
      holdOnPlatform: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({
      ok: false,
      setup: true,
      message: `Checkout is in test setup. ${message}`,
    });
  }
}
