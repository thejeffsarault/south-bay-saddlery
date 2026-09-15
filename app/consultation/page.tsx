"use client";

import { useState } from "react";

export default function ConsultationPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-6">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-sbs-muted">
        Private
      </p>
      <h1 className="font-serif text-4xl text-sbs-text">
        Request a Private Consultation
      </h1>
      <p className="text-sbs-ink">
        Stub only — no messaging desk in this Congress slice. Leave a note and
        we will treat it as received on-device.
      </p>
      {sent ? (
        <p className="border border-sbs-border bg-sbs-surface px-4 py-4 text-sm">
          Consultation request noted. This MVP does not send messages.
        </p>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          <input
            required
            className="w-full border border-sbs-border bg-sbs-surface px-3 py-2.5 text-sm outline-none focus:border-sbs-black"
            placeholder="Name"
          />
          <input
            required
            type="email"
            className="w-full border border-sbs-border bg-sbs-surface px-3 py-2.5 text-sm outline-none focus:border-sbs-black"
            placeholder="Email"
          />
          <textarea
            required
            className="min-h-28 w-full border border-sbs-border bg-sbs-surface px-3 py-2.5 text-sm outline-none focus:border-sbs-black"
            placeholder="What would you like to discuss?"
          />
          <button
            type="submit"
            className="w-full bg-sbs-accent px-5 py-3.5 text-sm text-sbs-on-accent"
          >
            Request a Private Consultation
          </button>
        </form>
      )}
    </div>
  );
}
