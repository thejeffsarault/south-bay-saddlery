import type { Metadata } from "next";
import Link from "next/link";
import { BODY_ANGLES } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Photo tips",
};

export default function PhotoTipsPage() {
  return (
    <div className="sbs-page space-y-6">
      <p className="text-[var(--sbs-text-meta)] text-sbs-muted">
        <Link href="/sell" className="hover:text-sbs-black">
          Sell Your Saddle
        </Link>
        {" · "}
        Photo tips
      </p>
      <h1 className="font-serif text-3xl font-medium text-sbs-text">Photo tips</h1>
      <p className="text-sm text-sbs-ink">
        Phone camera. Daylight. Quiet background. Fill the frame. Do not hide wear.
      </p>
      <ol className="space-y-2 text-sm text-sbs-text">
        {BODY_ANGLES.map((angle, index) => (
          <li key={angle.id} className="flex gap-3">
            <span className="w-6 font-mono text-[var(--sbs-text-meta)] text-sbs-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{angle.label}</span>
          </li>
        ))}
        <li className="flex gap-3">
          <span className="w-6 font-mono text-[var(--sbs-text-meta)] text-sbs-muted">
            07
          </span>
          <span>Serial / stamp — readable crop. Do not invent a serial.</span>
        </li>
      </ol>
      <p className="text-sm text-sbs-muted">
        Add damage close-ups when something is worn or repaired.
      </p>
      <Link
        href="/sell"
        className="inline-block bg-sbs-accent px-5 py-3 text-sm tracking-wide text-sbs-on-accent"
      >
        Back to photos
      </Link>
    </div>
  );
}
