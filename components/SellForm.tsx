"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SELL_COPY,
  hasRequiredPhotos,
  type IntakeDraft,
  type PhotoAngleId,
} from "@/lib/catalog";
import { DRAFT_CONDITIONS } from "@/lib/bluebook/types";
import type { BluebookProposePublic } from "@/lib/bluebook/types";
import { PhotoActionPair } from "@/components/PhotoSlot";
import { draftDescription } from "@/lib/draft-copy";
import { fileToThumb } from "@/lib/photos";
import { parseVoltaireStamp, type StampToken } from "@/lib/serial/voltaire";
import { emptyDraft, useStore } from "@/lib/store";

const fieldClass =
  "w-full border border-sbs-border bg-sbs-surface px-3 py-2.5 text-sm text-sbs-text outline-none focus:border-sbs-black";

const PHOTO_STEPS = [
  { id: "photo.panels", angle: "panels", title: "Panels", helper: "Underside panels", n: 1 },
  { id: "photo.flaps", angle: "flaps", title: "Flaps", helper: "Both flaps", n: 2 },
  { id: "photo.underflaps", angle: "underflaps", title: "Underflaps", helper: "Under both flaps", n: 3 },
  { id: "photo.billets", angle: "billets", title: "Billets", helper: "Billet condition", n: 4 },
  { id: "photo.front", angle: "front", title: "Front", helper: "Pommel / front", n: 5 },
  { id: "photo.back", angle: "back", title: "Back", helper: "Cantle / rear", n: 6 },
  { id: "photo.serial", angle: "serial", title: "Serial / stamp", helper: "Must be readable", n: 7 },
] as const;

type PhotoStepId = (typeof PHOTO_STEPS)[number]["id"];
type StepId = "intro" | PhotoStepId | "photo.damage" | "draft" | "done";

const ORDER: StepId[] = [
  "intro",
  ...PHOTO_STEPS.map((step) => step.id),
  "photo.damage",
  "draft",
  "done",
];

function photoStep(id: StepId) {
  return PHOTO_STEPS.find((step) => step.id === id);
}

export function SellForm() {
  const { submitIntake, notifyJeff } = useStore();
  const [draft, setDraft] = useState<IntakeDraft>(emptyDraft);
  const [step, setStep] = useState<StepId>("intro");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copyDirty, setCopyDirty] = useState(false);
  const [tokens, setTokens] = useState<StampToken[]>([]);
  const [stampNote, setStampNote] = useState("");
  const advanceRef = useRef<number | null>(null);

  const photosReady = hasRequiredPhotos(draft.photos);
  const currentPhoto = photoStep(step);
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
          ? { ...current, needsJeffReview: !current.priceExpectation }
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

  useEffect(() => {
    return () => {
      if (advanceRef.current) window.clearTimeout(advanceRef.current);
    };
  }, []);

  function update<K extends keyof IntakeDraft>(key: K, value: IntakeDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function go(next: StepId) {
    setError("");
    if (advanceRef.current) {
      window.clearTimeout(advanceRef.current);
      advanceRef.current = null;
    }
    setStep(next);
  }

  function goNext() {
    const index = ORDER.indexOf(step);
    if (index >= 0 && index < ORDER.length - 1) go(ORDER[index + 1]);
  }

  function goBack() {
    const index = ORDER.indexOf(step);
    if (index > 0) go(ORDER[index - 1]);
  }

  async function attachPhoto(angle: PhotoAngleId, files: FileList | File[] | null) {
    const file = files?.[0];
    if (!file) return;
    const thumb = await fileToThumb(file);
    setDraft((current) => ({
      ...current,
      photos: { ...current.photos, [angle]: thumb },
    }));
    if (advanceRef.current) window.clearTimeout(advanceRef.current);
    advanceRef.current = window.setTimeout(() => {
      const index = ORDER.indexOf(step);
      if (index >= 0 && index < ORDER.length - 1) setStep(ORDER[index + 1]);
    }, 400);
  }

  function applyStamp(value: string) {
    const parsed = parseVoltaireStamp(value);
    setTokens(parsed.tokens);
    setDraft((current) => {
      const next = { ...current, stamps: value };
      if (!parsed.confident) {
        setStampNote(
          value.trim()
            ? "Could not decode this stamp. Enter details on the draft — we do not invent a read."
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

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!photosReady) {
      setError("Six angles and a serial / stamp photo are required.");
      go("photo.panels");
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
    setBusy(false);
    go("done");
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) {
        return;
      }
      if (currentPhoto && draft.photos[currentPhoto.angle]?.thumb) {
        event.preventDefault();
        const index = ORDER.indexOf(step);
        if (index >= 0 && index < ORDER.length - 1) setStep(ORDER[index + 1]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentPhoto, draft.photos, step]);

  return (
    <form
      onSubmit={onSubmit}
      className="flex min-h-[calc(100dvh-8rem)] flex-col"
    >
      <div className="flex items-center justify-between gap-3">
        {step !== "intro" && step !== "done" ? (
          <button
            type="button"
            onClick={goBack}
            className="text-[var(--sbs-text-meta)] text-sbs-muted"
          >
            {SELL_COPY.back}
          </button>
        ) : (
          <span />
        )}
        {currentPhoto ? (
          <p className="font-mono text-[var(--sbs-text-meta)] text-sbs-muted">
            {currentPhoto.n} / 7
          </p>
        ) : (
          <span />
        )}
      </div>

      <div key={step} className="sbs-step flex flex-1 flex-col justify-center py-8">
        {step === "intro" ? <IntroStep onStart={goNext} /> : null}

        {currentPhoto ? (
          <PhotoAsk
            title={currentPhoto.title}
            helper={currentPhoto.helper}
            angle={currentPhoto.angle}
            thumb={draft.photos[currentPhoto.angle]?.thumb}
            stamp={step === "photo.serial"}
            stamps={draft.stamps}
            tokens={tokens}
            stampNote={stampNote}
            onFiles={(files) => void attachPhoto(currentPhoto.angle, files)}
            onStamp={applyStamp}
            onContinue={goNext}
          />
        ) : null}

        {step === "photo.damage" ? (
          <PhotoAsk
            title="Damage?"
            helper="Any damage close-up"
            angle="damage"
            thumb={draft.photos.damage?.thumb}
            onFiles={(files) => void attachPhoto("damage", files)}
            onContinue={goNext}
            onSkip={goNext}
          />
        ) : null}

        {step === "draft" ? (
          <DraftStep
            draft={draft}
            tokens={tokens}
            stampNote={stampNote}
            error={error}
            busy={busy}
            onUpdate={update}
            onStamp={applyStamp}
            onEditPhotos={() => go("photo.panels")}
            onCopyDirty={() => setCopyDirty(true)}
          />
        ) : null}

        {step === "done" ? <DoneStep /> : null}
      </div>
    </form>
  );
}

function IntroStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-6">
      <h1
        className="font-serif font-medium leading-[1.1] text-sbs-text"
        style={{ fontSize: "var(--sbs-text-hero)" }}
      >
        {SELL_COPY.headline}
      </h1>
      <p className="text-lg text-sbs-text">{SELL_COPY.microcopy}</p>
      <p className="text-[var(--sbs-text-meta)] text-sbs-muted">
        {SELL_COPY.secondary}
      </p>
      <Link
        href="/sell/photo-tips"
        className="inline-block text-[var(--sbs-text-meta)] text-sbs-muted underline-offset-4 hover:underline"
      >
        Photo tips
      </Link>
      <button
        type="button"
        onClick={onStart}
        className="w-full bg-sbs-accent px-5 py-3.5 text-sm tracking-wide text-sbs-on-accent"
      >
        {SELL_COPY.start}
      </button>
    </div>
  );
}

function PhotoAsk({
  title,
  helper,
  angle,
  thumb,
  stamp,
  stamps,
  tokens,
  stampNote,
  onFiles,
  onStamp,
  onContinue,
  onSkip,
}: {
  title: string;
  helper: string;
  angle: PhotoAngleId;
  thumb?: string;
  stamp?: boolean;
  stamps?: string;
  tokens?: StampToken[];
  stampNote?: string;
  onFiles: (files: FileList | null) => void;
  onStamp?: (value: string) => void;
  onContinue: () => void;
  onSkip?: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="font-serif font-medium text-sbs-text"
          style={{ fontSize: "var(--sbs-text-hero)" }}
        >
          {title}
        </h2>
        <p className="mt-2 text-sbs-muted">{helper}</p>
      </div>

      {thumb ? (
        <div className="relative overflow-hidden border border-sbs-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="" className="max-h-64 w-full object-cover" />
        </div>
      ) : null}

      <PhotoActionPair
        id={`step-${angle}`}
        variant="hero"
        onCamera={onFiles}
        onLibrary={onFiles}
      />

      {stamp ? (
        <label className="block space-y-1">
          <span className="text-[var(--sbs-text-meta)] uppercase tracking-[0.14em] text-sbs-muted">
            Stamp
          </span>
          <textarea
            className={`${fieldClass} min-h-24`}
            value={stamps ?? ""}
            onChange={(e) => onStamp?.(e.target.value)}
            placeholder="PB 16.5 2A M/M C/C FIN #17 23.23"
          />
          {tokens?.length ? (
            <div className="flex flex-wrap gap-1.5 pt-2">
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
          {stampNote ? <p className="text-sm text-sbs-muted">{stampNote}</p> : null}
        </label>
      ) : null}

      {thumb ? (
        <button
          type="button"
          onClick={onContinue}
          className="w-full bg-sbs-accent px-5 py-3.5 text-sm tracking-wide text-sbs-on-accent"
        >
          {SELL_COPY.continue}
        </button>
      ) : null}

      {onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-sm text-sbs-muted"
        >
          {SELL_COPY.damageSkip}
        </button>
      ) : null}
    </div>
  );
}

function DraftStep({
  draft,
  tokens,
  stampNote,
  error,
  busy,
  onUpdate,
  onStamp,
  onEditPhotos,
  onCopyDirty,
}: {
  draft: IntakeDraft;
  tokens: StampToken[];
  stampNote: string;
  error: string;
  busy: boolean;
  onUpdate: <K extends keyof IntakeDraft>(key: K, value: IntakeDraft[K]) => void;
  onStamp: (value: string) => void;
  onEditPhotos: () => void;
  onCopyDirty: () => void;
}) {
  return (
    <div className="space-y-6">
      <h2
        className="font-serif font-medium text-sbs-text"
        style={{ fontSize: "var(--sbs-text-hero)" }}
      >
        Your draft
      </h2>

      <label className="block space-y-1">
        <span className="text-[var(--sbs-text-meta)] uppercase tracking-[0.14em] text-sbs-muted">
          Stamp
        </span>
        <textarea
          className={`${fieldClass} min-h-24`}
          value={draft.stamps}
          onChange={(e) => onStamp(e.target.value)}
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
      {stampNote ? <p className="text-sm text-sbs-muted">{stampNote}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Brand" value={draft.brand} onChange={(v) => onUpdate("brand", v)} />
        <Field label="Model" value={draft.model} onChange={(v) => onUpdate("model", v)} />
        <Field label="Year" value={draft.year} onChange={(v) => onUpdate("year", v)} />
        <Field label="Seat" value={draft.seat} onChange={(v) => onUpdate("seat", v)} />
        <Field label="Flap" value={draft.flap} onChange={(v) => onUpdate("flap", v)} />
        <Field label="Panel" value={draft.panel} onChange={(v) => onUpdate("panel", v)} />
        <Field label="Serial" value={draft.serial} onChange={(v) => onUpdate("serial", v)} />
        <label className="block space-y-1">
          <span className="text-[var(--sbs-text-meta)] uppercase tracking-[0.14em] text-sbs-muted">
            Condition
          </span>
          <select
            className={fieldClass}
            value={draft.condition}
            onChange={(e) =>
              onUpdate("condition", e.target.value as IntakeDraft["condition"])
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
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-[var(--sbs-text-meta)] uppercase tracking-[0.14em] text-sbs-muted">
            Proposed list
          </span>
          <input
            className={fieldClass}
            inputMode="decimal"
            value={draft.priceExpectation}
            onChange={(e) => {
              onUpdate("priceExpectation", e.target.value);
              onUpdate("needsJeffReview", !e.target.value.trim());
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

      <p className="text-sm text-sbs-text">{SELL_COPY.feeLine}</p>

      <label className="block space-y-1">
        <span className="text-[var(--sbs-text-meta)] uppercase tracking-[0.14em] text-sbs-muted">
          Description
        </span>
        <textarea
          className={`${fieldClass} min-h-24`}
          value={draft.description}
          onChange={(e) => {
            onCopyDirty();
            onUpdate("description", e.target.value);
          }}
        />
      </label>

      <div className="grid gap-3">
        <Field
          label="Name"
          value={draft.contactName}
          onChange={(v) => onUpdate("contactName", v)}
          autoComplete="name"
        />
        <Field
          label="Email"
          value={draft.email}
          onChange={(v) => onUpdate("email", v)}
          type="email"
          autoComplete="email"
        />
      </div>

      <button
        type="button"
        aria-pressed={draft.pathInterest === "verified"}
        onClick={() =>
          onUpdate(
            "pathInterest",
            draft.pathInterest === "verified" ? "self-serve" : "verified",
          )
        }
        className={`w-full border px-3 py-3 text-left ${
          draft.pathInterest === "verified"
            ? "border-sbs-black"
            : "border-sbs-border"
        }`}
      >
        <span className="block text-sm text-sbs-text">
          {SELL_COPY.verifiedLabel}
        </span>
        <span className="mt-1 block text-[var(--sbs-text-meta)] text-sbs-muted">
          {SELL_COPY.verifiedHint}
        </span>
      </button>
      <p className="text-[var(--sbs-text-meta)] text-sbs-muted">
        {SELL_COPY.certainty}
      </p>

      {error ? <p className="text-sm text-sbs-text">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-sbs-accent px-5 py-3.5 text-sm tracking-wide text-sbs-on-accent disabled:opacity-60"
      >
        {busy ? "Sending…" : SELL_COPY.cta}
      </button>
      <button
        type="button"
        onClick={onEditPhotos}
        className="w-full text-sm text-sbs-muted"
      >
        {SELL_COPY.editPhotos}
      </button>
    </div>
  );
}

function DoneStep() {
  return (
    <div className="space-y-6">
      <h2
        className="font-serif font-medium text-sbs-text"
        style={{ fontSize: "var(--sbs-text-hero)" }}
      >
        {SELL_COPY.done}
      </h2>
      <p className="text-sbs-muted">{SELL_COPY.doneBody}</p>
      <Link
        href="/collection"
        className="inline-block w-full bg-sbs-accent px-5 py-3.5 text-center text-sm tracking-wide text-sbs-on-accent"
      >
        {SELL_COPY.collection}
      </Link>
    </div>
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
