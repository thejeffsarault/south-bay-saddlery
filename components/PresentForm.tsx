"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CONDITIONS,
  MIN_PHOTOS,
  PATH_INTERESTS,
  PHOTO_ANGLES,
  photoCount,
  type IntakeDraft,
} from "@/lib/catalog";
import { fileToThumb } from "@/lib/photos";
import { emptyDraft, useStore } from "@/lib/store";

const fieldClass =
  "w-full border border-sbs-border bg-sbs-surface px-3 py-2.5 text-sm text-sbs-text outline-none focus:border-sbs-black";

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-sbs-muted">
          {index}
        </p>
        <h2 className="font-serif text-2xl text-sbs-text">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function PresentForm() {
  const router = useRouter();
  const { submitIntake } = useStore();
  const [draft, setDraft] = useState<IntakeDraft>(emptyDraft);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const photosReady = photoCount(draft.photos);
  const canSubmit = useMemo(() => {
    return (
      draft.contactName &&
      draft.email &&
      draft.phone &&
      draft.location &&
      draft.brand &&
      draft.model &&
      draft.year &&
      draft.seat &&
      draft.flap &&
      draft.tree &&
      draft.stamps &&
      draft.condition &&
      draft.wear &&
      draft.serviceHistory &&
      draft.priceExpectation &&
      draft.pathInterest &&
      photosReady >= MIN_PHOTOS
    );
  }, [draft, photosReady]);

  function update<K extends keyof IntakeDraft>(key: K, value: IntakeDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function onPhoto(angleId: (typeof PHOTO_ANGLES)[number]["id"], file?: File) {
    if (!file) return;
    const thumb = await fileToThumb(file);
    setDraft((current) => ({
      ...current,
      photos: { ...current.photos, [angleId]: thumb },
    }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!canSubmit) {
      setError(
        `Complete contact, saddle facts, and at least ${MIN_PHOTOS} photo angles.`,
      );
      return;
    }
    setBusy(true);
    submitIntake(draft);
    router.push("/present/received");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <Section index="01" title="Contact">
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-[0.14em] text-sbs-muted">
            Name
          </span>
          <input
            className={fieldClass}
            value={draft.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            autoComplete="name"
            required
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-[0.14em] text-sbs-muted">
            Email
          </span>
          <input
            type="email"
            className={fieldClass}
            value={draft.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-[0.14em] text-sbs-muted">
            Phone
          </span>
          <input
            type="tel"
            className={fieldClass}
            value={draft.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
            required
          />
        </label>
      </Section>

      <Section index="02" title="Location">
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-[0.14em] text-sbs-muted">
            City, state
          </span>
          <input
            className={fieldClass}
            value={draft.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Palos Verdes, CA"
            required
          />
        </label>
      </Section>

      <Section index="03" title="Brand / model / year">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.14em] text-sbs-muted">
              Brand
            </span>
            <input
              className={fieldClass}
              value={draft.brand}
              onChange={(e) => update("brand", e.target.value)}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.14em] text-sbs-muted">
              Model
            </span>
            <input
              className={fieldClass}
              value={draft.model}
              onChange={(e) => update("model", e.target.value)}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.14em] text-sbs-muted">
              Year
            </span>
            <input
              className={fieldClass}
              value={draft.year}
              onChange={(e) => update("year", e.target.value)}
              required
            />
          </label>
        </div>
      </Section>

      <Section index="04" title="Seat / flap / tree">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.14em] text-sbs-muted">
              Seat
            </span>
            <input
              className={fieldClass}
              value={draft.seat}
              onChange={(e) => update("seat", e.target.value)}
              placeholder='17.5"'
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.14em] text-sbs-muted">
              Flap
            </span>
            <input
              className={fieldClass}
              value={draft.flap}
              onChange={(e) => update("flap", e.target.value)}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-[0.14em] text-sbs-muted">
              Tree
            </span>
            <input
              className={fieldClass}
              value={draft.tree}
              onChange={(e) => update("tree", e.target.value)}
              required
            />
          </label>
        </div>
      </Section>

      <Section index="05" title="Stamps">
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-[0.14em] text-sbs-muted">
            Serial and flap stamps
          </span>
          <textarea
            className={`${fieldClass} min-h-24`}
            value={draft.stamps}
            onChange={(e) => update("stamps", e.target.value)}
            required
          />
        </label>
      </Section>

      <Section index="06" title="Condition + wear">
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-[0.14em] text-sbs-muted">
            Condition
          </span>
          <select
            className={fieldClass}
            value={draft.condition}
            onChange={(e) =>
              update("condition", e.target.value as IntakeDraft["condition"])
            }
            required
          >
            <option value="">Select</option>
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-[0.14em] text-sbs-muted">
            Wear notes
          </span>
          <textarea
            className={`${fieldClass} min-h-24`}
            value={draft.wear}
            onChange={(e) => update("wear", e.target.value)}
            required
          />
        </label>
      </Section>

      <Section index="07" title="Service history">
        <textarea
          className={`${fieldClass} min-h-24`}
          value={draft.serviceHistory}
          onChange={(e) => update("serviceHistory", e.target.value)}
          required
        />
      </Section>

      <Section index="08" title="Price expectation">
        <input
          className={fieldClass}
          inputMode="decimal"
          value={draft.priceExpectation}
          onChange={(e) => update("priceExpectation", e.target.value)}
          placeholder="4200"
          required
        />
      </Section>

      <Section index="09" title="Path interest">
        <div className="grid grid-cols-2 gap-2">
          {PATH_INTERESTS.map((path) => (
            <label
              key={path.id}
              className={`border px-3 py-3 text-sm ${
                draft.pathInterest === path.id
                  ? "border-sbs-black bg-sbs-surface"
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
                required
              />
              {path.label}
            </label>
          ))}
        </div>
      </Section>

      <Section index="10" title="Photos">
        <p className="text-sm text-sbs-ink">
          At least {MIN_PHOTOS} angles. Near-side, off-side, seat, front, rear,
          flaps, billets, panels, stamps, and damage.
        </p>
        <p className="font-mono text-xs text-sbs-muted">
          {photosReady} / {PHOTO_ANGLES.length} attached
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PHOTO_ANGLES.map((angle) => {
            const current = draft.photos[angle.id];
            return (
              <label
                key={angle.id}
                className="relative block aspect-[4/5] overflow-hidden border border-sbs-border bg-sbs-surface"
              >
                {current?.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={current.thumb}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-end p-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sbs-muted">
                    {angle.label}
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => onPhoto(angle.id, e.target.files?.[0])}
                />
              </label>
            );
          })}
        </div>
      </Section>

      {error ? <p className="text-sm text-sbs-text">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-sbs-accent px-5 py-3.5 text-sm tracking-wide text-sbs-on-accent disabled:opacity-60"
      >
        {busy ? "Sending…" : "Present Your Saddle"}
      </button>
    </form>
  );
}
