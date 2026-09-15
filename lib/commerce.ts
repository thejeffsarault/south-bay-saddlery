import {
  BUYER_CHECKOUT_COPY,
  RESTOCK_FEE_USD,
  RETURN_WINDOW_DAYS,
  SBS_SUCCESS_FEE_PERCENT,
  SELLER_PAYOUT_COPY,
  computePayout,
  isPlatformOwnedListing,
  payoutWindow,
  type PayoutBreakdown,
} from "./payout";

export {
  BUYER_CHECKOUT_COPY,
  SELLER_PAYOUT_COPY,
  computePayout,
  isPlatformOwnedListing,
  payoutWindow,
};

export const ESCROW_TERMS = {
  returnWindowDays: RETURN_WINDOW_DAYS,
  restockFeeUsd: RESTOCK_FEE_USD,
  sellerPayout: "7–10 business days after close",
  successFeePercent: SBS_SUCCESS_FEE_PERCENT,
} as const;

export type OrderStatus =
  | "escrow"
  | "delivered"
  | "closed"
  | "payout_queued"
  | "paid"
  | "platform_retained"
  | "refunded"
  | "returned";

export type PayoutMode = "platform" | "connect";

export type OrderKind = "listing" | "verification" | "restock";

export type Order = {
  id: string;
  listingId: string;
  listingName: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  deliveredAt?: string;
  closedAt?: string;
  payoutEligibleOn?: string;
  payoutDueBy?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  transferGroup?: string;
  kind: OrderKind;
  payoutMode: PayoutMode;
  platformOwned: boolean;
  connectAccountId?: string;
  breakdown?: PayoutBreakdown;
  restockChargeId?: string;
  sellerEmail?: string;
  terms: {
    returnWindowDays: number;
    restockFeeUsd: number;
    sellerPayout: string;
    successFeePercent: number;
    holdOnPlatform: true;
    autoTransferOnCharge: false;
  };
};

export type FinanceEvent = {
  id: string;
  at: string;
  type: string;
  stripeId?: string;
  orderId?: string;
  listingId?: string;
  amount?: number;
  status?: string;
  detail: string;
  stub?: boolean;
};

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function createEscrowOrder(input: {
  listingId: string;
  listingName: string;
  amount: number;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  transferGroup?: string;
  kind?: OrderKind;
  payoutMode?: PayoutMode;
  platformOwned?: boolean;
  connectAccountId?: string;
  sellerEmail?: string;
}): Order {
  const kind = input.kind ?? "listing";
  const platformOwned =
    input.platformOwned ?? isPlatformOwnedListing(input.listingId);
  const payoutMode =
    input.payoutMode ?? (platformOwned || kind !== "listing" ? "platform" : "connect");
  return {
    id: newId("ord"),
    listingId: input.listingId,
    listingName: input.listingName,
    amount: input.amount,
    status: kind === "verification" || kind === "restock" ? "paid" : "escrow",
    createdAt: new Date().toISOString(),
    stripeSessionId: input.stripeSessionId,
    stripePaymentIntentId: input.stripePaymentIntentId,
    transferGroup: input.transferGroup,
    kind,
    payoutMode,
    platformOwned: kind === "listing" ? platformOwned : true,
    connectAccountId: input.connectAccountId,
    sellerEmail: input.sellerEmail,
    breakdown: kind === "listing" ? computePayout(input.amount) : undefined,
    terms: {
      ...ESCROW_TERMS,
      holdOnPlatform: true,
      autoTransferOnCharge: false,
    },
  };
}

export type LabelKind =
  | "seller_to_buyer"
  | "seller_to_warehouse"
  | "seller_to_jeff";

export type WarehouseAddress = {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  complete: boolean;
};

export function warehouseShipTo(): WarehouseAddress {
  const name = process.env.VERIFY_SHIP_TO_NAME || "";
  const street = process.env.VERIFY_SHIP_TO_STREET || "";
  const city = process.env.VERIFY_SHIP_TO_CITY || "";
  const state = process.env.VERIFY_SHIP_TO_STATE || "";
  const zip = process.env.VERIFY_SHIP_TO_ZIP || "";
  return {
    name,
    street,
    city,
    state,
    zip,
    complete: Boolean(name && street && city && state && zip),
  };
}

export type LabelJob = {
  id: string;
  kind: LabelKind;
  status: "queued";
  message: string;
  stub: boolean;
  fedexConfigured: boolean;
  warehouseComplete: boolean;
  createdAt: string;
  listingId?: string;
  submissionId?: string;
  orderId?: string;
  shipTo?: WarehouseAddress;
};

export function fedexEnvPresent() {
  return Boolean(
    process.env.FEDEX_API_KEY ||
      process.env.FEDEX_CLIENT_ID ||
      process.env.FEDEX_ACCOUNT_NUMBER ||
      process.env.FEDEX_METER_NUMBER,
  );
}

export function normalizeLabelKind(kind?: string): LabelKind {
  if (kind === "seller_to_buyer") return "seller_to_buyer";
  return "seller_to_warehouse";
}

export function createLabelJob(input: {
  kind: LabelKind;
  listingId?: string;
  submissionId?: string;
  orderId?: string;
}): LabelJob {
  const kind = normalizeLabelKind(input.kind);
  const configured = fedexEnvPresent();
  const shipTo = kind === "seller_to_warehouse" ? warehouseShipTo() : undefined;
  const inboundMissing = kind === "seller_to_warehouse" && !shipTo?.complete;
  return {
    id: newId("lbl"),
    kind,
    status: "queued",
    message: inboundMissing
      ? "label queued — warehouse address missing (VERIFY_SHIP_TO_*)"
      : "label queued",
    stub: !configured || inboundMissing,
    fedexConfigured: configured,
    warehouseComplete: shipTo?.complete ?? true,
    createdAt: new Date().toISOString(),
    listingId: input.listingId,
    submissionId: input.submissionId,
    orderId: input.orderId,
    shipTo,
  };
}

export type ConnectAccount = {
  id: string;
  email: string;
  listingId?: string;
  submissionId?: string;
  stripeAccountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
};
