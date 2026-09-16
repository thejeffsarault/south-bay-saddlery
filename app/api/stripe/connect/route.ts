import { NextResponse } from "next/server";
import { newId } from "@/lib/commerce";
import { logFinance } from "@/lib/finance";
import { findConnectByEmail, listConnect, saveConnectAccount } from "@/lib/server-store";
import { getStripe, siteOrigin, stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  const accounts = await listConnect();
  return NextResponse.json({ ok: true, accounts });
}

export async function POST(request: Request) {
  let body: { email?: string; listingId?: string; submissionId?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const email = (body.email || "").trim();
  if (!email) {
    return NextResponse.json({ ok: false, message: "Seller email required." }, { status: 400 });
  }

  const existing = await findConnectByEmail(email);
  const stripe = getStripe();

  if (!stripe || !stripeConfigured()) {
    const account = await saveConnectAccount({
      id: existing?.id || newId("cn"),
      email,
      listingId: body.listingId || existing?.listingId,
      submissionId: body.submissionId || existing?.submissionId,
      stripeAccountId: existing?.stripeAccountId,
      chargesEnabled: false,
      payoutsEnabled: false,
      onboarded: false,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await logFinance({
      type: "connect.onboard_stub",
      orderId: undefined,
      listingId: body.listingId,
      detail: `Connect Express stub for ${email}. Add Stripe keys to create a live Express account. Platform-owned inventory skips Connect.`,
      stub: true,
    });
    return NextResponse.json({
      ok: true,
      setup: true,
      account,
      message:
        "Connect Express is in test setup. C2C sellers will onboard here when Stripe keys are present. JI-001 / JI-002 skip Connect.",
    });
  }

  try {
    const origin = siteOrigin(request);
    const stripeAccount =
      existing?.stripeAccountId
        ? await stripe.accounts.retrieve(existing.stripeAccountId)
        : await stripe.accounts.create({
            type: "express",
            country: "US",
            email,
            capabilities: { transfers: { requested: true } },
            metadata: {
              listingId: body.listingId || "",
              submissionId: body.submissionId || "",
            },
          });

    const link = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: `${origin}/queue`,
      return_url: `${origin}/queue`,
      type: "account_onboarding",
    });

    const account = await saveConnectAccount({
      id: existing?.id || newId("cn"),
      email,
      listingId: body.listingId || existing?.listingId,
      submissionId: body.submissionId || existing?.submissionId,
      stripeAccountId: stripeAccount.id,
      chargesEnabled: Boolean(stripeAccount.charges_enabled),
      payoutsEnabled: Boolean(stripeAccount.payouts_enabled),
      onboarded: Boolean(stripeAccount.details_submitted && stripeAccount.payouts_enabled),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await logFinance({
      type: "connect.onboard_link",
      stripeId: stripeAccount.id,
      listingId: body.listingId,
      detail: `Connect Express onboarding link created for ${email}.`,
    });

    return NextResponse.json({ ok: true, account, url: link.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connect onboarding failed.";
    return NextResponse.json({ ok: false, setup: true, message });
  }
}
