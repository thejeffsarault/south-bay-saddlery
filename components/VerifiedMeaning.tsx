import Link from "next/link";
import {
  VERIFIED_ABOUT_LINK,
  VERIFIED_PANEL_BODY,
  VERIFIED_PANEL_LABEL,
  VERIFIED_SHORT_LINE,
} from "@/lib/verified-copy";

export function VerifiedMeaning() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-sbs-ink">{VERIFIED_SHORT_LINE}</p>
      <details className="border-y border-sbs-border py-3">
        <summary className="cursor-pointer text-sm text-sbs-text">
          {VERIFIED_PANEL_LABEL}
        </summary>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-sbs-ink">
          {VERIFIED_PANEL_BODY.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <Link
            href="/about"
            className="inline-block text-sm text-sbs-ink underline-offset-4 hover:underline"
          >
            {VERIFIED_ABOUT_LINK}
          </Link>
        </div>
      </details>
    </div>
  );
}
