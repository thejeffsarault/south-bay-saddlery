import { NextResponse } from "next/server";
import { createLabelJob, warehouseShipTo, type WarehouseAddress } from "@/lib/commerce";
import { logFinance } from "@/lib/finance";
import { saveLabel } from "@/lib/server-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    listingId?: string;
    submissionId?: string;
    orderId?: string;
    shipTo?: Partial<WarehouseAddress>;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const job = await saveLabel(
    createLabelJob({
      kind: "verify_fail_return",
      listingId: body.listingId,
      submissionId: body.submissionId,
      orderId: body.orderId,
      shipTo: body.shipTo,
    }),
  );

  await logFinance({
    type: "verify.fail_return",
    orderId: body.orderId,
    listingId: body.listingId,
    status: "queued",
    detail: `${job.message}. billedTo=${job.billedTo}. Platform books outbound FedEx; seller is not charged for the return label.`,
    stub: job.stub,
  });

  return NextResponse.json({
    ok: true,
    stub: job.stub,
    billedTo: job.billedTo,
    message: job.message,
    job,
    warehouse: warehouseShipTo(),
  });
}
