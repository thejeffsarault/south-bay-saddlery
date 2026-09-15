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
  listAmount?: number;
  chargedAmount?: number;
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
  listAmount?: number;
  chargedAmount?: number;
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
  const listAmount = input.listAmount ?? input.amount;
  const chargedAmount = input.chargedAmount ?? input.amount;
  return {
    id: newId("ord"),
    listingId: input.listingId,
    listingName: input.listingName,
    amount: input.amount,
    listAmount,
    chargedAmount,
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
    breakdown:
      kind === "listing" ? computePayout(listAmount, chargedAmount) : undefined,
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
  | "seller_to_jeff"
  | "verify_fail_return";

export type LabelBillTo = "platform" | "seller" | "buyer";

export type WarehouseAddress = {
  name: string;
  attn: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  hours: string;
  complete: boolean;
};

/**
 * Warehouse inbound only. Values come from VERIFY_SHIP_TO_* env — never
 * hardcode a destination (no Inlet Beach / WHOIS fallback).
 */
export function warehouseShipTo(): WarehouseAddress {
  const name = process.env.VERIFY_SHIP_TO_NAME || "";
  const attn = process.env.VERIFY_SHIP_TO_ATTN || "";
  const street = process.env.VERIFY_SHIP_TO_STREET || "";
  const city = process.env.VERIFY_SHIP_TO_CITY || "";
  const state = process.env.VERIFY_SHIP_TO_STATE || "";
  const zip = process.env.VERIFY_SHIP_TO_ZIP || "";
  const hours = process.env.VERIFY_SHIP_TO_HOURS || "";
  return {
    name,
    attn,
    street,
    city,
    state,
    zip,
    hours,
    complete: Boolean(name && street && city && state && zip),
  };
}

export type LabelJob = {
  id: string;
  kind: LabelKind;
  status: "queued";
  message: string;
  stub: boolean;
  billedTo: LabelBillTo;
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
  if (kind === "verify_fail_return") return "verify_fail_return";
  return "seller_to_warehouse";
}

export function createLabelJob(input: {
  kind: LabelKind;
  listingId?: string;
  submissionId?: string;
  orderId?: string;
  shipTo?: Partial<WarehouseAddress>;
}): LabelJob {
  const kind = normalizeLabelKind(input.kind);
  const configured = fedexEnvPresent();
  const billedTo: LabelBillTo =
    kind === "verify_fail_return" ? "platform" : kind === "seller_to_buyer" ? "buyer" : "seller";

  let shipTo: WarehouseAddress | undefined;
  if (kind === "seller_to_warehouse") {
    shipTo = warehouseShipTo();
  } else if (kind === "verify_fail_return") {
    shipTo = {
      name: input.shipTo?.name || "",
      attn: input.shipTo?.attn || "",
      street: input.shipTo?.street || "",
      city: input.shipTo?.city || "",
      state: input.shipTo?.state || "",
      zip: input.shipTo?.zip || "",
      hours: input.shipTo?.hours || "",
      complete: Boolean(
        input.shipTo?.name &&
          input.shipTo?.street &&
          input.shipTo?.city &&
          input.shipTo?.state &&
          input.shipTo?.zip,
      ),
    };
  }

  const inboundMissing = kind === "seller_to_warehouse" && !shipTo?.complete;
  const returnAddrMissing = kind === "verify_fail_return" && !shipTo?.complete;

  let message = "label queued";
  if (kind === "verify_fail_return") {
    message = returnAddrMissing
      ? "label queued — SBS pays outbound FedEx to seller (seller address incomplete; not blocked)"
      : "label queued — SBS pays outbound FedEx to seller";
  } else if (inboundMissing) {
    message = "label queued — warehouse address from VERIFY_SHIP_TO_* not set yet";
  }

  return {
    id: newId("lbl"),
    kind,
    status: "queued",
    message,
    stub: !configured,
    billedTo,
    fedexConfigured: configured,
    warehouseComplete: kind === "seller_to_warehouse" ? Boolean(shipTo?.complete) : true,
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
