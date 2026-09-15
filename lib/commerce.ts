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
 * Jeff-locked inbound (via Andy). VERIFY_SHIP_TO_* env overrides.
 * Not Inlet Beach / WHOIS.
 */
export const VERIFY_SHIP_TO_DEFAULTS = {
  name: "South Bay Saddlery",
  attn: "Jeff Sarault",
  street: "32 Glory Road",
  city: "Santa Rosa Beach",
  state: "FL",
  zip: "32459",
  hours: "9am–5pm (local)",
} as const;

/** Stables / warehouse: ship and receive only. Never invite a visit. */
export const WAREHOUSE_POLICY = {
  short: "Ship/receive only — no in-person visits.",
  hours: "Receiving 9am–5pm (local).",
  details:
    "Shipping and escrow only. The warehouse is ship/receive only — no walk-ins, appointments, or barn visits.",
  buyer:
    "This saddle ships through Stripe escrow. Shipping only — no in-person visits, walk-ins, or appointments.",
  seller:
    "Ship by FedEx. Receiving is 9am–5pm (local). Ship/receive only — no drop-offs, walk-ins, or barn visits.",
} as const;

function envOrDefault(key: string, fallback: string) {
  const value = process.env[key];
  return value && value.trim() ? value.trim() : fallback;
}

export function warehouseShipTo(): WarehouseAddress {
  const name = envOrDefault("VERIFY_SHIP_TO_NAME", VERIFY_SHIP_TO_DEFAULTS.name);
  const attn = envOrDefault("VERIFY_SHIP_TO_ATTN", VERIFY_SHIP_TO_DEFAULTS.attn);
  const street = envOrDefault("VERIFY_SHIP_TO_STREET", VERIFY_SHIP_TO_DEFAULTS.street);
  const city = envOrDefault("VERIFY_SHIP_TO_CITY", VERIFY_SHIP_TO_DEFAULTS.city);
  const state = envOrDefault("VERIFY_SHIP_TO_STATE", VERIFY_SHIP_TO_DEFAULTS.state);
  const zip = envOrDefault("VERIFY_SHIP_TO_ZIP", VERIFY_SHIP_TO_DEFAULTS.zip);
  const hours = envOrDefault("VERIFY_SHIP_TO_HOURS", VERIFY_SHIP_TO_DEFAULTS.hours);
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

export function formatWarehouseShipTo(address: WarehouseAddress = warehouseShipTo()) {
  const attn = address.attn ? ` Attn ${address.attn}` : "";
  return `${address.name}${attn}, ${address.street}, ${address.city} ${address.state} ${address.zip}`;
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
  } else if (kind === "seller_to_warehouse" && shipTo) {
    message = inboundMissing
      ? "label queued — warehouse address from VERIFY_SHIP_TO_* not set yet"
      : `label queued — inbound seller → ${shipTo.name}, ${shipTo.city} ${shipTo.state}`;
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
