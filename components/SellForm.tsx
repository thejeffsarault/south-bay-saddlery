"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BODY_ANGLES,
  INTAKE_ANGLES,
  MIN_BODY_PHOTOS,
  PATH_INTERESTS,
  SELL_COPY,
  bodyPhotoCount,
  hasRequiredPhotos,
  type IntakeDraft,
  type PhotoAngleId,
} from "@/lib/catalog";
import { DRAFT_CONDITIONS } from "@/lib/bluebook/types";
import type { BluebookProposePublic } from "@/lib/bluebook/types";
import { PhotoActionPair, PhotoSlot } from "@/components/PhotoSlot";
import { draftDescription } from "@/lib/draft-copy";
import { fileToThumb } from "@/lib/photos";
import { parseVoltaireStamp, type StampToken } from "@/lib/serial/voltaire";
import { emptyDraft, useStore } from "@/lib/store";

const fieldClass =
  "w-full border border-sbs-border bg-sbs-surface px-3 py-2.5 text-sm text-sbs-text outline-none focus:border-sbs-black";

type Step = "photos" | "draft";

function nextEmptySlot(photos: IntakeDraft["photos"]): PhotoAngleId {
  const required = INTAKE_ANGLES.filter((angle) => angle.required);
  const open = required.find((angle) => !photos[angle.id]?.thumb);
  return open?.id ?? "damage";
}

export function SellForm() {
  const router = useRouter();
  const { submitIntake, notifyJeff } = useStore();
  const [draft, setDraft] = useState<IntakeDraft>(emptyDraft);
  const [step, setStep] = useState<Step>("photos");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copyDirty, setCopyDirty] = useState(false);
  const [tokens, setTokens] = useState<StampToken[]>([]);
  const [stampNote, setStampNote] = useState("");

  const bodyReady = bodyPhotoCount(draft.photos);
  const photosReady = hasRequiredPhotos(draft.photos);
  const proposedCopy = useMemo(
    () =>
      draftDescription({
        brand: draft.brand,
        model: draft.model,
        year: draft.year,
        seat: draft.seat,
        flap: draft.flap,
        panel: draft.panel,
        serial: draft.serial,
        condition: draft.condition,
      }),
    [
      draft.brand,
      draft.model,
      draft.year,
      draft.seat,
      draft.flap,
      draft.panel,
      draft.serial,
      draft.condition,
    ],
  );

  useEffect(() => {
    if (copyDirty) return;
    setDraft((current) =>
      current.description === proposedCopy
        ? current
        : { ...current, description: proposedCopy },
    );
  }, [copyDirty, proposedCopy]);

  useEffect(() => {
    if (step !== "draft") return;
    const brand = draft.brand.trim();
    const year = draft.year.trim();
    if (!brand || !year) {
      setDraft((current) =>
        current.needsJeffReview || current.priceExpectation
          ? {
              ...current,
              needsJeffReview: !current.priceExpectation,
            }
          : current,
      );
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/pricing/bluebook-propose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: draft.brand,
            model: draft.model,
            year: draft.year,
            conditionTier: draft.condition,
            serial: draft.serial,
            path: draft.pathInterest || "self-serve",
          }),
          signal: controller.signal,
        });
        const data = (await res.json()) as BluebookProposePublic;
        if (controller.signal.aborted) return;
        if (data.ok) {
          setDraft((current) => ({
            ...current,
            priceExpectation: String(data.proposedList),
            needsJeffReview: false,
            priceFlags: data.flags,
          }));
        } else {
          setDraft((current) => ({
            ...current,
            priceExpectation: "",
            needsJeffReview: true,
            priceFlags: data.flags ?? [data.reason],
          }));
        }
      } catch {
        if (controller.signal.aborted) return;
        setDraft((current) => ({
          ...current,
          priceExpectation: "",
          needsJeffReview: true,
          priceFlags: ["price_lookup_failed"],
        }));
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    step,
    draft.brand,
    draft.model,
    draft.year,
    draft.condition,
    draft.serial,
    draft.pathInterest,
  ]);

  function update<K extends keyof IntakeDraft>(key: K, value: IntakeDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function assignFiles(files: FileList | File[] | null, slot?: PhotoAngleId) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    let photos = { ...draft.photos };
    for (const file of list) {
      const angle = slot && list.length === 1 ? slot : nextEmptySlot(photos);
      const thumb = await fileToThumb(file);
      photos = { ...photos, [angle]: thumb };
    }
    setDraft((current) => ({ ...current, photos }));
  }

  function clearPhoto(id: PhotoAngleId) {
    setDraft((current) => {
      const photos = { ...current.photos };
      delete photos[id];
      return { ...current, photos };
    });
  }

  function applyStamp(value: string) {
    const parsed = parseVoltaireStamp(value);
    setTokens(parsed.tokens);
    setDraft((current) => {
      const next = { ...current, stamps: value };
      if (!parsed.confident) {
        setStampNote(
          value.trim()
            ? "Could not decode this stamp. Enter the fields below — we do not invent a read."
            : "",
        );
        return next;
      }
      setStampNote(
        parsed.flags.includes("yearFromDateToken")
          ? "Stamp read. Year taken from the date token."
          : "Stamp read.",
      );
      return {
        ...next,
        brand: parsed.brand,
        model: parsed.model,
        year: parsed.year || current.year,
        seat: parsed.seat,
        flap: parsed.flap,
        panel: parsed.panel,
        blocks: parsed.blocks,
        tree: parsed.tree,
        serial: parsed.serial,
      };
    });
  }

  function goDraft() {
    setError("");
    if (!photosReady) {
      setError(
        `${MIN_BODY_PHOTOS} angles plus a serial / stamp photo are required.`,
      );
      return;
    }
    setStep("draft");
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!photosReady) {
      setError(
        `${MIN_BODY_PHOTOS} angles plus a serial / stamp photo are required.`,
      );
      setStep("photos");
      return;
    }
    if (!draft.contactName.trim() || !draft.email.trim()) {
      setError("Name and email are needed so we can reach you.");
      return;
    }
    setBusy(true);
    const submission = submitIntake(draft);
    try {
      await notifyJeff(submission.id);
      if (draft.pathInterest === "verified") {
        await fetch("/api/labels/fedex", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "seller_to_warehouse",
            submissionId: submission.id,
          }),
        });
      }
    } catch {
      // Queue still holds the pending listing if notify/label stubs fail.
    }
    router.push(
      `/sell/received?id=${encodeURIComponent(submission.id)}&path=${encodeURIComponent(
        draft.pathInterest || "self-serve",
      )}`,
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {step === "photos" ? (
        <section className="space-y-5">
          <div
            className="flex min-h-[16rem] w-full flex-col items-center justify-center border border-sbs-border bg-sbs-white px-6 py-10 text-center"
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              void assignFiles(e.dataTransfer.files);
            }}
          >
            <PhotoActionPair
              id="bulk"
              align="center"
              libraryMultiple
              onCamera={(files) => void assignFiles(files)}
              onLibrary={(files) => void assignFiles(files)}
            />
            <p className="mt-4 text-sm text-sbs-muted">
              {MIN_BODY_PHOTOS} angles + serial
            </p>
          </div>

          <div className="flex items-end justify-between gap-3">
            <p className="font-mono text-[var(--sbs-text-meta)] text-sbs-muted">
              {bodyReady} / {BODY_ANGLES.length}
              {draft.photos.serial?.thumb ? " · serial on file" : " · serial needed"}
            </p>
            <Link
              href="/sell/photo-tips"
              className="text-[var(--sbs-text-meta)] text-sbs-muted underline-offset-4 hover:text-sbs-black hover:underline"
            >
              Photo tips
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {INTAKE_ANGLES.map((angle) => (
              <PhotoSlot
                key={angle.id}
                id={angle.id}
                label={angle.label}
                emphasized={angle.id === "serial"}
                thumb={draft.photos[angle.id]?.thumb}
                onCamera={(files) => void assignFiles(files, angle.id)}
                onLibrary={(files) => void assignFiles(files, angle.id)}
                onClear={() => clearPhoto(angle.id)}
              />
            ))}
          </div>

          {error ? <p className="text-sm text-sbs-text">{error}</p> : null}

          <button
            type="button"
            onClick={goDraft}
            disabled={!photosReady}
            className="w-full bg-sbs-accent px-5 py-3.5 text-sm tracking-wide text-sbs-on-accent disabled:opacity-40"
          >
            {SELL_COPY.continue}
          </button>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-medium text-sbs-text">
                Draft review
              </h2>
              <p className="mt-1 text-sm text-sbs-muted">
                Paste the stamp as printed.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep("photos")}
              className="text-[var(--sbs-text-meta)] text-sbs-muted underline-offset-4 hover:underline"
            >
              Photos
            </button>
          </div>

          <label className="block space-y-1">
            <span className="text-[var(--sbs-text-meta)] uppercase tracking-[0.14em] text-sbs-muted">
              Stamp
            </span>
            <textarea
              className={`${fieldClass} min-h-24`}
              value={draft.stamps}
              onChange={(e) => applyStamp(e.target.value)}
              placeholder="PB 16.5 2A M/M C/C FIN #17 23.23"
            />
          </label>
          {tokens.length ? (
            <div className="flex flex-wrap gap-1.5">
              {tokens.map((token, index) => (
                <span
                  key={`${token.raw}-${index}`}
                  className="border border-sbs-border px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-sbs-muted"
                >
                  {token.kind} {token.raw}
                </span>
              ))}
            </div>
          ) : null}
          {stampNote ? (
            <p className="text-sm text-sbs-muted">{stampNote}</p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Brand" value={draft.brand} onChange={(v) => update("brand", v)} />
            <Field label="Model" value={draft.model} onChange={(v) => update("model", v)} />
            <Field label="Year" value={draft.year} onChange={(v) => update("year", v)} />
            <Field label="Seat" value={draft.seat} onChange={(v) => update("seat", v)} />
            <Field label="Flap" value={draft.flap} onChange={(v) => update("flap", v)} />
            <Field label="Panel" value={draft.panel} onChange={(v) => update("panel", v)} />
            <Field label="Serial" value={draft.serial} onChange={(v) => update("serial", v)} />
            <label className="block space-y-1">
              <span className="text-[var(--sbs-text-meta)] uppercase tracking-[0.14em] text-sbs-muted">
                Condition
              </span>
              <select
                className={fieldClass}
                value={draft.condition}
                onChange={(e) =>
                  update("condition", e.target.value as IntakeDraft["condition"])
                }
              >
                <option value="">Select</option>
                {DRAFT_CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-[var(--sbs-text-meta)] uppercase tracking-[0.14em] text-sbs-muted">
                Proposed list
              </span>
              <input
                className={fieldClass}
                inputMode="decimal"
                value={draft.priceExpectation}
                onChange={(e) => {
                  update("priceExpectation", e.target.value);
                  update("needsJeffReview", !e.target.value.trim());
                }}
                placeholder={draft.needsJeffReview ? "Founder will price" : ""}
              />
            </label>
          </div>

          {draft.needsJeffReview ? (
            <p className="text-sm text-sbs-muted">
              No Blue Book match. Founder will price — no estimate invented.
            </p>
          ) : draft.priceExpectation ? (
            <p className="text-sm text-sbs-muted">Blue Book draft price.</p>
          ) : null}

          <label className="block space-y-1">
            <span className="text-[var(--sbs-text-meta)] uppercase tracking-[0.14em] text-sbs-muted">
              Description
            </span>
            <textarea
              className={`${fieldClass} min-h-24`}
              value={draft.description}
              onChange={(e) => {
                setCopyDirty(true);
                update("description", e.target.value);
              }}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Name"
              value={draft.contactName}
              onChange={(v) => update("contactName", v)}
              autoComplete="name"
            />
            <Field
              label="Email"
              value={draft.email}
              onChange={(v) => update("email", v)}
              type="email"
              autoComplete="email"
            />
          </div>

          <div className="grid gap-2">
            {PATH_INTERESTS.map((path) => (
              <label
                key={path.id}
                className={`border px-3 py-3 text-sm ${
                  draft.pathInterest === path.id
                    ? "border-sbs-black"
                    : "border-sbs-border"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  name="path"
                  value={path.id}
                  checked={draft.pathInterest === path.id}
                  onChange={() => update("pathInterest", path.id)}
                />
                <span className="block">{path.label}</span>
              </label>
            ))}
          </div>

          {error ? <p className="text-sm text-sbs-text">{error}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-sbs-accent px-5 py-3.5 text-sm tracking-wide text-sbs-on-accent disabled:opacity-60"
          >
            {busy ? "Sending…" : SELL_COPY.cta}
          </button>
        </section>
      )}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[var(--sbs-text-meta)] uppercase tracking-[0.14em] text-sbs-muted">
        {label}
      </span>
      <input
        type={type}
        className={fieldClass}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
