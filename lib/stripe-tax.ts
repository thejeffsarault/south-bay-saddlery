import type Stripe from "stripe";

/** Phase 1: Stripe Tax on. Never invent a destination; tax uses the buyer address. */
export const CHECKOUT_TAX = {
  automatic_tax: { enabled: true as const },
  billing_address_collection: "required" as const,
};

export function taxedPrice(
  price: Stripe.Checkout.SessionCreateParams.LineItem.PriceData,
): Stripe.Checkout.SessionCreateParams.LineItem.PriceData {
  return { ...price, tax_behavior: "exclusive" };
}

function stripAutomaticTax(
  params: Stripe.Checkout.SessionCreateParams,
): Stripe.Checkout.SessionCreateParams {
  const retry: Stripe.Checkout.SessionCreateParams = { ...params };
  delete retry.automatic_tax;
  if (!retry.line_items) return retry;
  retry.line_items = retry.line_items.map((item) => {
    if (typeof item === "string" || !item.price_data) return item;
    const price_data = { ...item.price_data };
    delete price_data.tax_behavior;
    return { ...item, price_data };
  });
  return retry;
}

export async function createTaxedCheckoutSession(
  stripe: Stripe,
  params: Stripe.Checkout.SessionCreateParams,
): Promise<{
  session: Stripe.Checkout.Session;
  automaticTax: boolean;
  fallback?: string;
}> {
  const withTax: Stripe.Checkout.SessionCreateParams = {
    ...params,
    automatic_tax: { enabled: true },
    billing_address_collection: params.billing_address_collection || "required",
  };
  try {
    return {
      session: await stripe.checkout.sessions.create(withTax),
      automaticTax: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const taxIssue = /automatic.?tax|tax settings|tax_behavior|Stripe Tax/i.test(
      message,
    );
    if (!taxIssue) throw error;
    return {
      session: await stripe.checkout.sessions.create(stripAutomaticTax(params)),
      automaticTax: false,
      fallback: message,
    };
  }
}
