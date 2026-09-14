"use client";

import Link from "next/link";
import { useState } from "react";
import {
  PHOTO_ANGLES,
  PUBLISH_ROUTES,
  formatUsd,
  pathLabel,
  photoCount,
  type RouteId,
} from "@/lib/catalog";
import { useStore } from "@/lib/store";

const fieldClass =
  "w-full border border-border bg-ivory px-3 py-2 text-sm text-espresso outline-none focus:border-cognac";

export function QueueBoard() {
  const { ready, submissions, updateGate, publish } = useStore();
  const [notice, setNotice] = useState<Record<string, string>>({});

  if (!ready) {
    return <p className="text-sm text-charcoal">Opening the founder queue…</p>;
  }

  const open = submissions.filter((item) => !item.publishedListingId);
  const done = submissions.filter((item) => item.publishedListingId);

  return (
    <div className="space-y-8">
      {open.length === 0 ? (
        <p className="text-sm text-charcoal">
          No saddles waiting on price, route, or publish.
        </p>
      ) : null}

      {open.map((item) => {
        const priceOk = Number(item.founderPrice) > 0;
        const routeOk = Boolean(item.founderRoute);
        const gated = !(priceOk && routeOk);
        return (
          <article key={item.id} className="border border-border bg-ivory-soft p-4">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-cognac">
              Intake · {new Date(item.submittedAt).toLocaleDateString()}
            </p>
            <h2 className="mt-1 font-serif text-2xl text-espresso">
              {item.brand} {item.model} {item.seat} {item.year}
            </h2>
            <dl className="mt-3 grid gap-2 text-sm text-charcoal">
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                  Contact
                </dt>
                <dd>
                  {item.contactName} · {item.email} · {item.phone}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                  Location
                </dt>
                <dd>{item.location}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                  Seat / flap / tree
                </dt>
                <dd>
                  {item.seat} · {item.flap} · {item.tree}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                  Stamps
                </dt>
                <dd>{item.stamps}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                  Condition + wear
                </dt>
                <dd>
                  {item.condition}. {item.wear}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                  Service history
                </dt>
                <dd>{item.serviceHistory}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                  Price expectation
                </dt>
                <dd>{item.priceExpectation}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                  Path interest
                </dt>
                <dd>{item.pathInterest ? pathLabel(item.pathInterest) : "—"}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                  Photos
                </dt>
                <dd>
                  {photoCount(item.photos)} / {PHOTO_ANGLES.length} angles
                </dd>
              </div>
            </dl>

            {photoCount(item.photos) > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-1">
                {PHOTO_ANGLES.map((angle) => {
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
              </div>
            ) : (
              <p className="mt-3 text-xs text-charcoal">
                Seed intake has no attached files. Live presentations store
                angle thumbnails here.
              </p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cognac">
                  Jeff price
                </span>
                <input
                  className={fieldClass}
                  inputMode="decimal"
                  value={item.founderPrice}
                  onChange={(e) =>
                    updateGate(item.id, { founderPrice: e.target.value })
                  }
                  placeholder="4690"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cognac">
                  Route
                </span>
                <select
                  className={fieldClass}
                  value={item.founderRoute}
                  onChange={(e) =>
                    updateGate(item.id, {
                      founderRoute: e.target.value as RouteId | "",
                    })
                  }
                >
                  <option value="">Select route</option>
                  {PUBLISH_ROUTES.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              disabled={gated}
              onClick={() => {
                const result = publish(item.id);
                setNotice((current) => ({
                  ...current,
                  [item.id]: result.ok
                    ? `Published to /collection/${result.listingId}`
                    : result.reason,
                }));
              }}
              className="mt-4 w-full bg-espresso px-4 py-3 text-sm text-ivory disabled:opacity-40"
            >
              {gated ? "Price and route required to publish" : "Publish"}
            </button>
            {notice[item.id] ? (
              <p className="mt-2 text-sm text-charcoal">{notice[item.id]}</p>
            ) : null}
          </article>
        );
      })}

      {done.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-espresso">Published</h2>
          {done.map((item) => (
            <p key={item.id} className="text-sm text-charcoal">
              {item.brand} {item.model} · {formatUsd(Number(item.founderPrice))} ·{" "}
              <Link
                href={`/collection/${item.publishedListingId}`}
                className="underline underline-offset-4"
              >
                Details
              </Link>
            </p>
          ))}
        </section>
      ) : null}
    </div>
  );
}
