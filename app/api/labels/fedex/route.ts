import { NextResponse } from "next/server";
import { createLabelJob, normalizeLabelKind, type LabelKind } from "@/lib/commerce";
import { listLabels, saveLabel } from "@/lib/server-store";

export const runtime = "nodejs";

export async function GET() {
  const labels = await listLabels();
  return NextResponse.json({ ok: true, labels });
}

export async function POST(request: Request) {
  let body: {
    kind?: LabelKind;
    listingId?: string;
    submissionId?: string;
    orderId?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const job = await saveLabel(
    createLabelJob({
      kind: normalizeLabelKind(body.kind),
      listingId: body.listingId,
      submissionId: body.submissionId,
      orderId: body.orderId,
    }),
  );

  return NextResponse.json({
    ok: true,
    stub: job.stub,
    message: job.message,
    job,
  });
}
