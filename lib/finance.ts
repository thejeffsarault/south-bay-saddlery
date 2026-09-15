import { newId, type FinanceEvent } from "./commerce";
import { saveFinanceEvent } from "./server-store";

export async function logFinance(input: Omit<FinanceEvent, "id" | "at"> & { at?: string }) {
  return saveFinanceEvent({
    id: newId("fin"),
    at: input.at || new Date().toISOString(),
    type: input.type,
    stripeId: input.stripeId,
    orderId: input.orderId,
    listingId: input.listingId,
    amount: input.amount,
    status: input.status,
    detail: input.detail,
    stub: input.stub,
  });
}
