"use client";

import { useState } from "react";
import { products } from "@/lib/products";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; id: string }
  | { state: "error"; message: string };

export function InquiryForm({ initialProduct = "" }: { initialProduct?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState(initialProduct);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus({ state: "submitting" });

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, product, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({
          state: "error",
          message: data?.error ?? "Something went wrong. Please try again.",
        });
        return;
      }

      setStatus({ state: "success", id: data.inquiry.id });
      setName("");
      setEmail("");
      setProduct("");
      setMessage("");
    } catch {
      setStatus({
        state: "error",
        message: "Network error. Please try again.",
      });
    }
  }

  if (status.state === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-saddle-300 bg-saddle-100 p-8 text-center"
      >
        <p className="text-3xl" aria-hidden>
          ✅
        </p>
        <h2 className="mt-3 font-serif text-2xl font-bold text-saddle-900">
          Inquiry received!
        </h2>
        <p className="mt-2 text-saddle-700">
          Thanks for reaching out. We&apos;ll be in touch within two business
          days.
        </p>
        <p className="mt-4 text-xs text-saddle-500">
          Reference: <span className="font-mono">{status.id}</span>
        </p>
        <button
          onClick={() => setStatus({ state: "idle" })}
          className="mt-6 rounded-full border border-saddle-400 px-5 py-2 text-sm font-medium text-saddle-800 hover:bg-saddle-200"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-saddle-200 bg-white p-8 shadow-sm"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-saddle-800">
          Name
          <input
            required
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-saddle-300 px-3 py-2 text-saddle-900 outline-none focus:border-saddle-500 focus:ring-1 focus:ring-saddle-500"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-saddle-800">
          Email
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-saddle-300 px-3 py-2 text-saddle-900 outline-none focus:border-saddle-500 focus:ring-1 focus:ring-saddle-500"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-saddle-800">
        Interested in
        <select
          name="product"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className="rounded-lg border border-saddle-300 bg-white px-3 py-2 text-saddle-900 outline-none focus:border-saddle-500 focus:ring-1 focus:ring-saddle-500"
        >
          <option value="">A custom piece / not sure yet</option>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-saddle-800">
        Tell us about your project
        <textarea
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Discipline, horse measurements, tooling preferences, timeline…"
          className="rounded-lg border border-saddle-300 px-3 py-2 text-saddle-900 outline-none focus:border-saddle-500 focus:ring-1 focus:ring-saddle-500"
        />
      </label>

      {status.state === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={status.state === "submitting"}
        className="rounded-full bg-saddle-700 px-6 py-3 font-medium text-saddle-50 transition-colors hover:bg-saddle-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.state === "submitting" ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
