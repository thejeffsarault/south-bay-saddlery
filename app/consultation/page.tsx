"use client";

import { useState } from "react";

export default function ConsultationPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-6">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-cognac">
        Private
      </p>
      <h1 className="font-serif text-4xl text-espresso">
        Request a Private Consultation
      </h1>
      <p className="text-charcoal">
        Stub only — no messaging desk in this Congress slice. Leave a note and
        we will treat it as received on-device.
      </p>
      {sent ? (
        <p className="border border-border bg-ivory-soft px-4 py-4 text-sm">
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
            className="w-full border border-border bg-ivory-soft px-3 py-2.5 text-sm outline-none focus:border-cognac"
            placeholder="Name"
          />
          <input
            required
            type="email"
            className="w-full border border-border bg-ivory-soft px-3 py-2.5 text-sm outline-none focus:border-cognac"
            placeholder="Email"
          />
          <textarea
            required
            className="min-h-28 w-full border border-border bg-ivory-soft px-3 py-2.5 text-sm outline-none focus:border-cognac"
            placeholder="What would you like to discuss?"
          />
          <button
            type="submit"
            className="w-full bg-espresso px-5 py-3.5 text-sm text-ivory"
          >
            Request a Private Consultation
          </button>
        </form>
      )}
    </div>
  );
}
