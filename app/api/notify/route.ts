import { NextResponse } from "next/server";
import { saveNotification } from "@/lib/server-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    submissionId?: string;
    headline?: string;
    pathInterest?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const submissionId = body.submissionId || "unknown";
  const webhook = process.env.NOTIFY_WEBHOOK_URL || "";
  const notifiedAt = new Date().toISOString();
  let channel: "webhook" | "email-stub" = "email-stub";
  let ok = true;
  let detail =
    "Email stub recorded. Notify Jeff (via Andy/Kai). No direct Jeff inbox is used.";

  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "sell_your_saddle.submitted",
          via: "Andy/Kai",
          submissionId,
          headline: body.headline || "",
          pathInterest: body.pathInterest || "",
          notifiedAt,
        }),
      });
      channel = "webhook";
      ok = res.ok;
      detail = ok
        ? "Webhook posted for Andy/Kai to notify Jeff."
        : `Webhook responded ${res.status}.`;
    } catch (error) {
      channel = "webhook";
      ok = false;
      detail = error instanceof Error ? error.message : "Webhook failed.";
    }
  }

  const record = await saveNotification({
    id: `n-${Date.now().toString(36)}`,
    submissionId,
    notifiedAt,
    channel,
    via: "Andy/Kai",
    ok,
    detail,
  });

  return NextResponse.json({
    ok,
    notifiedAt,
    channel,
    via: "Andy/Kai",
    detail,
    record,
  });
}
