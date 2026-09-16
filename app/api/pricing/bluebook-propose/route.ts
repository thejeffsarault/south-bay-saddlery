import { NextResponse } from "next/server";
import { publicBluebookResponse } from "@/lib/bluebook/propose";
import type { BluebookProposeRequest } from "@/lib/bluebook/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: BluebookProposeRequest = {};
  try {
    body = (await request.json()) as BluebookProposeRequest;
  } catch {
    body = {};
  }

  const result = publicBluebookResponse({
    brand: body.brand,
    model: body.model,
    year: body.year,
    conditionTier: body.conditionTier ?? body.condition,
    condition: body.condition,
    serial: body.serial,
    path: body.path,
  });

  return NextResponse.json(result);
}
