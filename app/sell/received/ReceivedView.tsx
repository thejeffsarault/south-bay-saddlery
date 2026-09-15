"use client";

import { VerifyUpsell } from "@/components/VerifyUpsell";
import { useStore } from "@/lib/store";

export function ReceivedView({
  id,
  path,
}: {
  id?: string;
  path?: string;
}) {
  const { submissions, ready } = useStore();
  const submission = id
    ? submissions.find((item) => item.id === id)
    : undefined;
  const verified = path === "verified" || submission?.pathInterest === "verified";

  if (!ready) {
    return <p className="text-sm text-sbs-muted">Saving your submission…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-sbs-ink">
        Status: <span className="font-medium">pending</span>
        {submission?.notifiedAt
          ? ` · Notify Jeff (via Andy/Kai) sent ${new Date(submission.notifiedAt).toLocaleString()}`
          : " · notify queued"}
      </p>
      {verified && id ? (
        <VerifyUpsell
          submissionId={id}
          initialLabelId={submission?.labelJobId}
        />
      ) : null}
    </div>
  );
}
