"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SELL_COPY,
  hasRequiredPhotos,
  type IntakeDraft,
  type PhotoAngleId,
  type PhotoThumb,
} from "@/lib/catalog";
import type { BluebookProposePublic } from "@/lib/bluebook/types";
import { AngleGuide } from "@/components/AngleGuide";
import { PhotoActionPair } from "@/components/PhotoSlot";
import { SELL_GUIDE_LINE, type SellGuideId } from "@/lib/sell-guides";
import { draftDescription } from "@/lib/draft-copy";
import { fileToThumb } from "@/lib/photos";
import {
  SELL_DEMO_STAMP,
  demoPlaceholderPhotos,
} from "@/lib/sell-demo";
import { parseVoltaireStamp, type StampToken } from "@/lib/serial/voltaire";
import { emptyDraft, useStore } from "@/lib/store";

const fieldClass =
  "w-full border-0 border-b border-sbs-border bg-transparent px-0 py-2 text-sm text-sbs-text outline-none focus:border-sbs-black";

const sellCtaClass =
  "inline-flex w-full max-w-[220px] items-center justify-center rounded-full bg-sbs-accent px-8 py-4 text-sm font-medium tracking-wide text-sbs-on-accent disabled:opacity-60";

const SINGLE_STEPS = [
  { id: "photo.side", angle: "side", title: "Side", n: 1 },
  { id: "photo.other", angle: "other", title: "Other side", n: 2 },
  { id: "photo.seat", angle: "seat", title: "Seat", n: 3 },
] as const;

type SingleStepId = (typeof SINGLE_STEPS)[number]["id"];
type StepId =
  | "intro"
  | SingleStepId
  | "photo.under"
  | "photo.serial"
  | "photo.more"
  | "draft"
  | "done";

const ORDER: StepId[] = [
  "intro",
  "photo.side",
  "photo.other",
  "photo.seat",
  "photo.under",
  "photo.serial",
  "photo.more",
  "draft",
  "done",
];

function singleStep(id: StepId) {
  return SINGLE_STEPS.find((step) => step.id === id);
}

function progressFor(step: StepId) {
  if (step === "photo.under") return 4;
  if (step === "photo.serial") return 5;
  return singleStep(step)?.n ?? null;
}

export function SellForm({ demo = false }: { demo?: boolean }) {
  const { submitIntake, notifyJeff } = useStore();
  const [draft, setDraft] = useState<IntakeDraft>(emptyDraft);
  const [step, setStep] = useState<StepId>("intro");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copyDirty, setCopyDirty] = useState(false);
  const [tokens, setTokens] = useState<StampToken[]>([]);
  const [stampNote, setStampNote] = useState("");
  const advanceRef = useRef<number | null>(null);
  const demoSeeded = useRef(false);

  const photosReady = hasRequiredPhotos(draft.photos);
  const currentSingle = singleStep(step);
  const progress = progressFor(step);
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

  useEffect(() => {
    if (!demo) {
      if (demoSeeded.current) {
        demoSeeded.current = false;
        setDraft(emptyDraft());
        setTokens([]);
        setStampNote("");
        setCopyDirty(false);
        setStep("intro");
      }
      return;
    }
    if (demoSeeded.current) return;
    demoSeeded.current = true;
    const parsed = parseVoltaireStamp(SELL_DEMO_STAMP);
    setTokens(parsed.tokens);
    setStampNote(parsed.confident ? "Stamp read." : "");
    setDraft((current) => ({
      ...current,
      stamps: SELL_DEMO_STAMP,
      brand: parsed.brand || current.brand,
      model: parsed.model || current.model,
      year: parsed.year || current.year,
      seat: parsed.seat || current.seat,
      flap: parsed.flap || current.flap,
      panel: parsed.panel || current.panel,
      blocks: parsed.blocks || current.blocks,
      tree: parsed.tree || current.tree,
      serial: parsed.serial || current.serial,
      condition: current.condition || "Excellent",
      photos: { ...demoPlaceholderPhotos(), ...current.photos },
    }));
  }, [demo]);

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

  function scheduleAdvance(from: StepId) {
    if (advanceRef.current) window.clearTimeout(advanceRef.current);
    advanceRef.current = window.setTimeout(() => {
      const index = ORDER.indexOf(from);
      if (index >= 0 && index < ORDER.length - 1) setStep(ORDER[index + 1]);
    }, 400);
  }

  async function attachPhoto(angle: PhotoAngleId, files: FileList | File[] | null) {
    const file = files?.[0];
    if (!file) return;
    const thumb = await fileToThumb(file);
    const nextPhotos = { ...draft.photos, [angle]: thumb };
    setDraft((current) => ({
      ...current,
      photos: { ...current.photos, [angle]: thumb },
    }));
    if (angle === "panels" || angle === "billets") {
      if (nextPhotos.panels?.thumb && nextPhotos.billets?.thumb) {
        scheduleAdvance("photo.under");
      }
    } else if (angle === "serial") {
      scheduleAdvance("photo.serial");
    } else {
      const match = SINGLE_STEPS.find((item) => item.angle === angle);
      if (match) scheduleAdvance(match.id);
    }
  }

  async function attachMore(files: FileList | File[] | null) {
    if (!files?.length) return;
    const extras: PhotoThumb[] = [];
    for (const file of Array.from(files)) {
      extras.push(await fileToThumb(file));
    }
    setDraft((current) => ({
      ...current,
      morePhotos: [...current.morePhotos, ...extras],
    }));
  }

  function applyStamp(value: string) {
    const parsed = parseVoltaireStamp(value);
    setTokens(parsed.tokens);
    setDraft((current) => {
      const next = { ...current, stamps: value };
      if (!parsed.confident) {
        setStampNote("");
        return next;
      }
      setStampNote("");
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
    if (demo) {
      go("done");
      return;
    }
    if (!photosReady) {
      setError("Side, other side, seat, under, and serial are required.");
      go("photo.side");
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

  const underReady = Boolean(
    draft.photos.panels?.thumb && draft.photos.billets?.thumb,
  );

  return (
    <form
      onSubmit={onSubmit}
      className="flex min-h-[calc(100dvh-7rem)] flex-col"
    >
      {demo ? (
        <p role="status" className="text-[var(--sbs-text-meta)] text-sbs-muted">
          {SELL_COPY.demoBanner}
        </p>
      ) : null}

      <div className="relative flex min-h-8 items-center">
        {step !== "intro" && step !== "done" ? (
          <button
            type="button"
            onClick={goBack}
            className="text-[var(--sbs-text-meta)] text-sbs-muted"
          >
            {SELL_COPY.back}
          </button>
        ) : null}
        {progress ? (
          <p className="pointer-events-none absolute inset-x-0 text-center font-mono text-[var(--sbs-text-meta)] text-sbs-muted opacity-40">
            {progress} / 5
          </p>
        ) : null}
      </div>

      <div key={step} className="sbs-step flex flex-1 flex-col justify-center py-16">
        {step === "intro" ? <IntroStep onStart={goNext} /> : null}

        {currentSingle ? (
          <PhotoAsk
            title={currentSingle.title}
            angle={currentSingle.angle}
            thumb={draft.photos[currentSingle.angle]?.thumb}
            onFiles={(files) => void attachPhoto(currentSingle.angle, files)}
            onContinue={goNext}
            allowContinue={demo || Boolean(draft.photos[currentSingle.angle]?.thumb)}
          />
        ) : null}

        {step === "photo.under" ? (
          <UnderStep
            panels={draft.photos.panels?.thumb}
            billets={draft.photos.billets?.thumb}
            onPanels={(files) => void attachPhoto("panels", files)}
            onBillets={(files) => void attachPhoto("billets", files)}
            onContinue={goNext}
            allowContinue={demo || underReady}
          />
        ) : null}

        {step === "photo.serial" ? (
          <PhotoAsk
            title="Serial"
            angle="serial"
            thumb={draft.photos.serial?.thumb}
            onFiles={(files) => void attachPhoto("serial", files)}
            onContinue={goNext}
            allowContinue={demo || Boolean(draft.photos.serial?.thumb)}
            stamp={demo ? draft.stamps : undefined}
            tokens={demo ? tokens : undefined}
            stampNote={demo ? stampNote : undefined}
            onStamp={demo ? applyStamp : undefined}
          />
        ) : null}

        {step === "photo.more" ? (
          <MoreStep
            extras={draft.morePhotos}
            onFiles={(files) => void attachMore(files)}
            onSkip={goNext}
          />
        ) : null}

        {step === "draft" ? (
          <DraftStep
            draft={draft}
            error={error}
            busy={busy}
            onUpdate={update}
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
    <div className="flex flex-col items-center px-2 py-6 text-center">
      <p
        aria-hidden
        className="font-mono text-[var(--sbs-text-meta)] tracking-[0.36em] text-sbs-muted"
      >
        1 · 2 · 3
      </p>
      <h1
        className="mt-10 font-serif font-medium leading-[1.12] tracking-[0.02em] text-sbs-text"
        style={{ fontSize: "var(--sbs-text-hero)" }}
      >
        {SELL_COPY.headline}
      </h1>
      <div className="mt-8 space-y-2 text-lg leading-8 text-sbs-text">
        <p>{SELL_COPY.beat1}</p>
        <p>{SELL_COPY.beat2}</p>
        <p>{SELL_COPY.beat3}</p>
      </div>
      <p className="mt-6 text-[var(--sbs-text-meta)] text-sbs-muted">
        {SELL_COPY.time}
      </p>
      <button type="button" onClick={onStart} className={`${sellCtaClass} mt-14`}>
        {SELL_COPY.begin}
      </button>
    </div>
  );
}

function PhotoAsk({
  title,
  angle,
  thumb,
  onFiles,
  onContinue,
  allowContinue,
  stamp,
  tokens,
  stampNote,
  onStamp,
}: {
  title: string;
  angle: PhotoAngleId;
  thumb?: string;
  onFiles: (files: FileList | null) => void;
  onContinue: () => void;
  allowContinue?: boolean;
  stamp?: string;
  tokens?: StampToken[];
  stampNote?: string;
  onStamp?: (value: string) => void;
}) {
  const guideId = angle as SellGuideId;
  const line = SELL_GUIDE_LINE[guideId];

  return (
    <div className="space-y-10">
      <div className="space-y-5">
        <AngleGuide id={guideId} />
        <h2
          className="font-serif font-medium text-sbs-text"
          style={{ fontSize: "var(--sbs-text-hero)" }}
        >
          {title}
        </h2>
        {line ? <p className="text-base leading-7 text-sbs-text">{line}</p> : null}
      </div>

      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" className="max-h-56 w-full object-contain" />
      ) : null}

      <PhotoActionPair
        id={`step-${angle}`}
        variant="hero"
        onCamera={onFiles}
        onLibrary={onFiles}
      />

      {onStamp ? (
        <label className="block space-y-1">
          <textarea
            className={`${fieldClass} min-h-16 text-sbs-muted`}
            value={stamp ?? ""}
            onChange={(e) => onStamp(e.target.value)}
            aria-label="Stamp"
          />
          {tokens?.length ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tokens.map((token, index) => (
                <span
                  key={`${token.raw}-${index}`}
                  className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-sbs-muted"
                >
                  {token.kind} {token.raw}
                </span>
              ))}
            </div>
          ) : null}
          {stampNote ? (
            <p className="text-[var(--sbs-text-meta)] text-sbs-muted">{stampNote}</p>
          ) : null}
        </label>
      ) : null}

      {allowContinue ? (
        <button
          type="button"
          onClick={onContinue}
          className="text-sm text-sbs-text"
        >
          {SELL_COPY.continue}
        </button>
      ) : null}
    </div>
  );
}

function UnderStep({
  panels,
  billets,
  onPanels,
  onBillets,
  onContinue,
  allowContinue,
}: {
  panels?: string;
  billets?: string;
  onPanels: (files: FileList | null) => void;
  onBillets: (files: FileList | null) => void;
  onContinue: () => void;
  allowContinue?: boolean;
}) {
  return (
    <div className="space-y-12">
      <div className="space-y-5">
        <AngleGuide id="panels" />
        <h2
          className="font-serif font-medium text-sbs-text"
          style={{ fontSize: "var(--sbs-text-hero)" }}
        >
          Under
        </h2>
      </div>
      <div className="space-y-10">
        <UnderSlot
          id="panels"
          label="Panels"
          line={SELL_GUIDE_LINE.panels}
          thumb={panels}
          onFiles={onPanels}
        />
        <UnderSlot
          id="billets"
          label="Billets"
          line={SELL_GUIDE_LINE.billets}
          thumb={billets}
          onFiles={onBillets}
          companion
        />
      </div>
      {allowContinue ? (
        <button
          type="button"
          onClick={onContinue}
          className="text-sm text-sbs-text"
        >
          {SELL_COPY.continue}
        </button>
      ) : null}
    </div>
  );
}

function UnderSlot({
  id,
  label,
  line,
  thumb,
  onFiles,
  companion,
}: {
  id: SellGuideId;
  label: string;
  line: string;
  thumb?: string;
  onFiles: (files: FileList | null) => void;
  companion?: boolean;
}) {
  return (
    <div className="space-y-4 border-b border-sbs-border pb-8 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-3">
        {companion ? <AngleGuide id={id} size="slot" /> : null}
        <div className="space-y-2">
          <p className="text-sm text-sbs-text">{label}</p>
          <p className="text-base leading-7 text-sbs-text">{line}</p>
        </div>
      </div>
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" className="max-h-40 w-full object-contain" />
      ) : null}
      <PhotoActionPair
        id={`step-${id}`}
        variant="plain"
        onCamera={onFiles}
        onLibrary={onFiles}
      />
    </div>
  );
}

function MoreStep({
  extras,
  onFiles,
  onSkip,
}: {
  extras: PhotoThumb[];
  onFiles: (files: FileList | null) => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-14">
      <h2
        className="font-serif font-medium text-sbs-text"
        style={{ fontSize: "var(--sbs-text-hero)" }}
      >
        More
      </h2>
      {extras.length ? (
        <div className="flex flex-wrap gap-3">
          {extras.map((photo, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${photo.name}-${index}`}
              src={photo.thumb}
              alt=""
              className="h-20 w-20 object-cover"
            />
          ))}
        </div>
      ) : null}
      <PhotoActionPair
        id="step-more"
        variant="hero"
        libraryMultiple
        onCamera={onFiles}
        onLibrary={onFiles}
      />
      <button type="button" onClick={onSkip} className="text-sm text-sbs-muted">
        {SELL_COPY.skip}
      </button>
    </div>
  );
}

function DraftStep({
  draft,
  error,
  busy,
  onUpdate,
  onCopyDirty,
}: {
  draft: IntakeDraft;
  error: string;
  busy: boolean;
  onUpdate: <K extends keyof IntakeDraft>(key: K, value: IntakeDraft[K]) => void;
  onCopyDirty: () => void;
}) {
  return (
    <div className="space-y-12">
      <h2
        className="font-serif font-medium text-sbs-text"
        style={{ fontSize: "var(--sbs-text-hero)" }}
      >
        Draft
      </h2>

      <p className="text-sm text-sbs-text">{SELL_COPY.feeLine}</p>

      <button
        type="button"
        aria-pressed={draft.pathInterest === "verified"}
        onClick={() =>
          onUpdate(
            "pathInterest",
            draft.pathInterest === "verified" ? "self-serve" : "verified",
          )
        }
        className={`text-left text-sm ${
          draft.pathInterest === "verified" ? "text-sbs-text" : "text-sbs-muted"
        }`}
      >
        {SELL_COPY.verifiedLabel}
      </button>

      <p className="text-[var(--sbs-text-meta)] text-sbs-muted">
        {SELL_COPY.policy}
      </p>

      <textarea
        className={`${fieldClass} min-h-24`}
        value={draft.description}
        onChange={(e) => {
          onCopyDirty();
          onUpdate("description", e.target.value);
        }}
        aria-label="Description"
      />

      <div className="space-y-8">
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

      {error ? <p className="text-sm text-sbs-text">{error}</p> : null}

      <button type="submit" disabled={busy} className={sellCtaClass}>
        {busy ? "Sending…" : SELL_COPY.cta}
      </button>
    </div>
  );
}

function DoneStep() {
  return (
    <div className="space-y-16">
      <h2
        className="font-serif font-medium text-sbs-text"
        style={{ fontSize: "var(--sbs-text-hero)" }}
      >
        {SELL_COPY.done}
      </h2>
      <Link href="/collection" className={sellCtaClass}>
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
      <span className="text-[var(--sbs-text-meta)] text-sbs-muted">{label}</span>
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
