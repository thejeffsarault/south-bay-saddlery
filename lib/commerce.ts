export const ESCROW_TERMS = {
  returnWindowDays: 3,
  restockFeeUsd: 100,
  sellerPayout: "7–10 business days after close",
  successFeePercent: 12,
} as const;

export type OrderStatus = "escrow";

export type Order = {
  id: string;
  listingId: string;
  listingName: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  stripeSessionId?: string;
  kind: "listing" | "verification";
  terms: {
    returnWindowDays: number;
    restockFeeUsd: number;
    sellerPayout: string;
    successFeePercent: number;
  };
};

export function sellerPayoutUsd(amount: number) {
  return Math.round(amount * (1 - ESCROW_TERMS.successFeePercent / 100));
}

export function createEscrowOrder(input: {
  listingId: string;
  listingName: string;
  amount: number;
  stripeSessionId?: string;
  kind?: "listing" | "verification";
}): Order {
  return {
    id: `ord-${Date.now().toString(36)}`,
    listingId: input.listingId,
    listingName: input.listingName,
    amount: input.amount,
    status: "escrow",
    createdAt: new Date().toISOString(),
    stripeSessionId: input.stripeSessionId,
    kind: input.kind ?? "listing",
    terms: { ...ESCROW_TERMS },
  };
}

export type LabelKind = "seller_to_buyer" | "seller_to_jeff";

export type LabelJob = {
  id: string;
  kind: LabelKind;
  status: "queued";
  message: "label queued";
  stub: boolean;
  fedexConfigured: boolean;
  createdAt: string;
  listingId?: string;
  submissionId?: string;
  orderId?: string;
};

export function fedexEnvPresent() {
  return Boolean(
    process.env.FEDEX_API_KEY ||
      process.env.FEDEX_CLIENT_ID ||
      process.env.FEDEX_ACCOUNT_NUMBER ||
      process.env.FEDEX_METER_NUMBER,
  );
}

export function createLabelJob(input: {
  kind: LabelKind;
  listingId?: string;
  submissionId?: string;
  orderId?: string;
}): LabelJob {
  const configured = fedexEnvPresent();
  return {
    id: `lbl-${Date.now().toString(36)}`,
    kind: input.kind,
    status: "queued",
    message: "label queued",
    stub: !configured,
    fedexConfigured: configured,
    createdAt: new Date().toISOString(),
    listingId: input.listingId,
    submissionId: input.submissionId,
    orderId: input.orderId,
  };
}
