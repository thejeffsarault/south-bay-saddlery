"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  INTAKE_ANGLES,
  QUEUE_STATUSES,
  formatUsd,
  pathLabel,
  photoCount,
  type QueueStatus,
} from "@/lib/catalog";
import { SellerTerms } from "@/components/SellerTerms";
import { FinanceTab } from "@/components/FinanceTab";
import { useStore } from "@/lib/store";

const fieldClass =
  "w-full border border-sbs-border bg-sbs-bg px-3 py-2 text-sm text-sbs-text outline-none focus:border-sbs-black";

export function QueueBoard() {
  const {
    ready,
    submissions,
    setStatus,
    updateSubmission,
    publish,
    notifyJeff,
  } = useStore();
  const [notice, setNotice] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<QueueStatus | "all">("all");
  const [view, setView] = useState<"listings" | "finance">("listings");

  const visible = useMemo(() => {
    if (filter === "all") return submissions;
    return submissions.filter((item) => item.status === filter);
  }, [filter, submissions]);

  if (!ready) {
    return <p className="text-sm text-sbs-muted">Opening the founder queue…</p>;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-sbs-ink">
        Approve, reject, or publish. Labels and checkout are automated — Jeff
        does not handle photo, support, or shipping work from this board.
        Buyer funds sit on the platform until close; C2C payouts use Connect
        Express. Warehouse is ship/receive only — no buyer or seller visits.
      </p>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={view === "listings"}
          onClick={() => setView("listings")}
          label="Listings"
        />
        <FilterChip
          active={view === "finance"}
          onClick={() => setView("finance")}
          label="Finance"
        />
      </div>

      {view === "finance" ? <FinanceTab /> : null}

      {view === "listings" ? (
      <div className="space-y-6">
      <SellerTerms compact />
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={`All · ${submissions.length}`}
        />
        {QUEUE_STATUSES.map((status) => (
          <FilterChip
            key={status.id}
            active={filter === status.id}
            onClick={() => setFilter(status.id)}
            label={`${status.label} · ${
              submissions.filter((item) => item.status === status.id).length
            }`}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-sbs-ink">No saddles in this view.</p>
      ) : null}

      {visible.map((item) => {
        const priceOk = Number(item.founderPrice || item.priceExpectation) > 0;
        const canPublish = item.status === "approved" && priceOk;
        return (
          <article key={item.id} className="border border-sbs-border bg-sbs-surface p-4">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-sbs-muted">
              {item.status} · {new Date(item.submittedAt).toLocaleDateString()}
            </p>
            <h2 className="mt-1 font-serif text-2xl text-sbs-text">
              {item.brand} {item.model} {item.seat} {item.year}
            </h2>
            <dl className="mt-3 grid gap-2 text-sm text-sbs-ink">
              <Fact label="Contact" value={`${item.contactName} · ${item.email} · ${item.phone}`} />
              <Fact label="Location" value={item.location} />
              <Fact
                label="Seat / flap / panel"
                value={`${item.seat} · ${item.flap} · ${item.panel || item.tree || "—"}`}
              />
              <Fact label="Serial" value={item.serial} />
              <Fact label="Stamps" value={item.stamps} />
              <Fact label="Description" value={item.description || "—"} />
              <Fact label="Condition + wear" value={`${item.condition}. ${item.wear}`} />
              <Fact label="Service" value={item.serviceHistory} />
              <Fact
                label="Proposed list"
                value={
                  item.needsJeffReview && !item.priceExpectation
                    ? "Needs founder price"
                    : item.priceExpectation
                }
              />
              {item.needsJeffReview ? (
                <Fact label="Review flag" value="needsJeffReview" />
              ) : null}
              <Fact label="Path" value={item.pathInterest ? pathLabel(item.pathInterest) : "—"} />
              <Fact
                label="Photos"
                value={`${photoCount(item.photos)} / ${INTAKE_ANGLES.length} · serial ${
                  item.photos.serial?.thumb ? "on file" : "missing"
                }`}
              />
              <Fact
                label="Notify Jeff (via Andy/Kai)"
                value={
                  item.notifiedAt
                    ? `${new Date(item.notifiedAt).toLocaleString()} · ${item.notifyChannel ?? "stub"}`
                    : "Not sent"
                }
              />
            </dl>

            {photoCount(item.photos) > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-1">
                {INTAKE_ANGLES.map((angle) => {
                  const photo = item.photos[angle.id];
                  if (!photo) return null;
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={angle.id}
                      src={photo.thumb}
                      alt={angle.label}
                      className="aspect-square w-full object-cover"
                    />
                  );
                })}
                {(item.morePhotos ?? []).map((photo, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`more-${photo.name}-${index}`}
                    src={photo.thumb}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-sbs-muted">
                No attached files on this intake.
              </p>
            )}

            <div className="mt-5">
              <label className="block space-y-1">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sbs-muted">
                  Founder price
                </span>
                <input
                  className={fieldClass}
                  inputMode="decimal"
                  value={item.founderPrice}
                  onChange={(e) =>
                    updateSubmission(item.id, { founderPrice: e.target.value })
                  }
                  placeholder="4690"
                />
              </label>
            </div>

            {item.status !== "published" ? (
              <label className="mt-3 block space-y-1">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sbs-muted">
                  Reject reason
                </span>
                <input
                  className={fieldClass}
                  value={item.rejectedReason}
                  onChange={(e) =>
                    updateSubmission(item.id, { rejectedReason: e.target.value })
                  }
                />
              </label>
            ) : null}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={item.status === "published"}
                onClick={() => setStatus(item.id, "approved")}
                className="border border-sbs-border px-4 py-3 text-sm disabled:opacity-40"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={item.status === "published"}
                onClick={() => setStatus(item.id, "rejected")}
                className="border border-sbs-border px-4 py-3 text-sm disabled:opacity-40"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={!canPublish}
                onClick={() => {
                  const result = publish(item.id);
                  setNotice((current) => ({
                    ...current,
                    [item.id]: result.ok
                      ? `Published to /collection/${result.listingId}`
                      : result.reason,
                  }));
                }}
                className="bg-sbs-accent px-4 py-3 text-sm text-sbs-on-accent disabled:opacity-40"
              >
                {canPublish ? "Publish" : "Approve + price to publish"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const result = await notifyJeff(item.id);
                  setNotice((current) => ({
                    ...current,
                    [item.id]: result.ok
                      ? `Notify Jeff (via Andy/Kai) · ${result.channel}`
                      : "Notify stub recorded",
                  }));
                }}
                className="border border-sbs-border px-4 py-3 text-sm"
              >
                Notify Jeff (via Andy/Kai)
              </button>
            </div>
            {item.publishedListingId ? (
              <p className="mt-3 text-sm text-sbs-ink">
                Live in Collection ·{" "}
                <Link
                  href={`/collection/${item.publishedListingId}`}
                  className="underline underline-offset-4"
                >
                  Details
                </Link>
                {item.founderPrice
                  ? ` · ${formatUsd(Number(item.founderPrice))}`
                  : ""}
              </p>
            ) : null}
            {notice[item.id] ? (
              <p className="mt-2 text-sm text-sbs-ink">{notice[item.id]}</p>
            ) : null}
            <div className="mt-4 space-y-2 border border-sbs-border p-3">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sbs-muted">
                Fail verify — return to seller
              </p>
              <p className="text-xs text-sbs-ink">
                SBS pays. Platform books outbound FedEx (verify_fail_return).
                Seller address can be incomplete — the job still queues.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className={fieldClass}
                  placeholder="Street"
                  value={item.returnStreet || ""}
                  onChange={(e) =>
                    updateSubmission(item.id, { returnStreet: e.target.value })
                  }
                />
                <input
                  className={fieldClass}
                  placeholder="City"
                  value={item.returnCity || ""}
                  onChange={(e) =>
                    updateSubmission(item.id, { returnCity: e.target.value })
                  }
                />
                <input
                  className={fieldClass}
                  placeholder="State"
                  value={item.returnState || ""}
                  onChange={(e) =>
                    updateSubmission(item.id, { returnState: e.target.value })
                  }
                />
                <input
                  className={fieldClass}
                  placeholder="ZIP"
                  value={item.returnZip || ""}
                  onChange={(e) =>
                    updateSubmission(item.id, { returnZip: e.target.value })
                  }
                />
              </div>
              <button
                type="button"
                className="w-full border border-sbs-border px-4 py-3 text-sm"
                onClick={async () => {
                  const res = await fetch("/api/verify/fail-return", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      submissionId: item.id,
                      listingId: item.publishedListingId || undefined,
                      shipTo: {
                        name: item.contactName,
                        street: item.returnStreet || "",
                        city: item.returnCity || "",
                        state: item.returnState || "",
                        zip: item.returnZip || "",
                      },
                    }),
                  });
                  const data = (await res.json()) as {
                    ok?: boolean;
                    billedTo?: string;
                    message?: string;
                    job?: { id: string };
                  };
                  if (data.job?.id) {
                    updateSubmission(item.id, {
                      labelJobId: data.job.id,
                      status: "rejected",
                      rejectedReason:
                        item.rejectedReason ||
                        "Verification failed — returning to seller (SBS pays outbound FedEx).",
                    });
                  }
                  setNotice((current) => ({
                    ...current,
                    [item.id]:
                      data.message ||
                      `Fail-return queued · billed to ${data.billedTo || "platform"}`,
                  }));
                }}
              >
                Fail verify — return (SBS pays)
              </button>
            </div>
            {item.publishedListingId ? (
              <button
                type="button"
                className="mt-2 w-full border border-sbs-border px-4 py-3 text-sm"
                onClick={async () => {
                  const res = await fetch("/api/stripe/connect", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: item.email,
                      listingId: item.publishedListingId,
                      submissionId: item.id,
                    }),
                  });
                  const data = (await res.json()) as {
                    url?: string;
                    message?: string;
                  };
                  if (data.url) window.location.href = data.url;
                  setNotice((current) => ({
                    ...current,
                    [item.id]: data.message || "Connect Express onboarding recorded.",
                  }));
                }}
              >
                Connect Express (C2C payouts)
              </button>
            ) : null}
          </article>
        );
      })}
      </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs uppercase tracking-[0.14em] ${
        active ? "bg-sbs-black text-sbs-white" : "border border-sbs-border"
      }`}
    >
      {label}
    </button>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sbs-muted">
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
