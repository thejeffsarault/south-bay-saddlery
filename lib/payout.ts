/** Stripe US card estimate: 2.9% + $0.30. Seller eats this on listing payouts. */
export const STRIPE_PERCENT = 0.029;
export const STRIPE_FIXED_USD = 0.3;
export const SBS_SUCCESS_FEE_PERCENT = 12;
export const RESTOCK_FEE_USD = 100;
export const VERIFICATION_FEE_USD = 150;
export const RETURN_WINDOW_DAYS = 3;
export const PAYOUT_MIN_BIZ_DAYS = 7;
export const PAYOUT_MAX_BIZ_DAYS = 10;

export function usdToCents(usd: number) {
  return Math.round(usd * 100);
}

export function centsToUsd(cents: number) {
  return cents / 100;
}

/** Stripe fee is always on the PaymentIntent / full charge (list + shipping + tax). */
export function estimateStripeFeeUsd(chargedAmountUsd: number) {
  const cents = usdToCents(chargedAmountUsd);
  return centsToUsd(Math.round(cents * STRIPE_PERCENT) + usdToCents(STRIPE_FIXED_USD));
}

/** 12% success fee stays on item list only — never on shipping or tax. */
export function sbsFeeUsd(listUsd: number) {
  return centsToUsd(Math.round(usdToCents(listUsd) * (SBS_SUCCESS_FEE_PERCENT / 100)));
}

export function sellerNetUsd(listUsd: number, chargedAmountUsd = listUsd) {
  return centsToUsd(
    usdToCents(listUsd) -
      usdToCents(estimateStripeFeeUsd(chargedAmountUsd)) -
      usdToCents(sbsFeeUsd(listUsd)),
  );
}

export type PayoutBreakdown = {
  list: number;
  charged: number;
  stripeProcessing: number;
  sbsFee: number;
  sellerNet: number;
};

export function computePayout(
  listUsd: number,
  chargedAmountUsd = listUsd,
): PayoutBreakdown {
  const charged = chargedAmountUsd;
  const stripeProcessing = estimateStripeFeeUsd(charged);
  const sbsFee = sbsFeeUsd(listUsd);
  return {
    list: listUsd,
    charged,
    stripeProcessing,
    sbsFee,
    sellerNet: centsToUsd(
      usdToCents(listUsd) - usdToCents(sbsFee) - usdToCents(stripeProcessing),
    ),
  };
}

/** CFO worked example: $4690 → Stripe ≈$136.31, SBS 12%=$562.80, seller net ≈$3990.89 */
export const WORKED_EXAMPLE_LIST_USD = 4690;
export const WORKED_EXAMPLE = computePayout(WORKED_EXAMPLE_LIST_USD);

export function payoutExampleHolds() {
  return (
    WORKED_EXAMPLE.stripeProcessing === 136.31 &&
    WORKED_EXAMPLE.sbsFee === 562.8 &&
    WORKED_EXAMPLE.sellerNet === 3990.89
  );
}

export function addBusinessDays(fromIso: string, days: number) {
  const d = new Date(fromIso);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const weekday = d.getDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return d.toISOString();
}

export function payoutWindow(closedAt: string) {
  return {
    payoutEligibleOn: addBusinessDays(closedAt, PAYOUT_MIN_BIZ_DAYS),
    payoutDueBy: addBusinessDays(closedAt, PAYOUT_MAX_BIZ_DAYS),
  };
}

export function isPlatformOwnedListing(id: string) {
  return id === "ji-001" || id === "ji-002";
}

export const BUYER_CHECKOUT_COPY = [
  "You are charged the listed total through Stripe.",
  "You have 3 days from delivery to keep or return the saddle.",
  "A return means you pay return shipping plus a separate $100 restocking fee.",
] as const;

export const SELLER_PAYOUT_COPY = [
  "South Bay Saddlery keeps 12% of the item list price (not shipping or tax).",
  "Card processing is calculated on the full Stripe charge and deducted from your payout — you eat the Stripe fee.",
  "Payout is 7–10 business days after close, by Transfer to your Connect Express account. Founder Select inventory (JI-001, JI-002) stays on the platform — no Connect transfer. A return skips 12% and skips Transfer; restock is a separate $100 buyer charge.",
] as const;
