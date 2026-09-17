"use client";

import { useState } from "react";
import { VERIFIED_MARK_TOOLTIP } from "@/lib/verified-copy";

const VERIFIED_MARK_SRC = "/brand/verified-mark.svg";

export function VerifiedMarkOverlay({
  surface = "card",
}: {
  surface?: "card" | "details";
}) {
  const [open, setOpen] = useState(false);

  if (surface === "details") {
    return (
      <span className="sbs-verified-mark-slot sbs-verified-mark-details" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={VERIFIED_MARK_SRC} alt="" className="sbs-verified-mark" />
      </span>
    );
  }

  return (
    <button
      type="button"
      className="sbs-verified-mark-slot sbs-verified-mark-card"
      title={VERIFIED_MARK_TOOLTIP}
      aria-label={VERIFIED_MARK_TOOLTIP}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpen((current) => !current);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={VERIFIED_MARK_SRC} alt="" className="sbs-verified-mark" />
      <span
        className={`sbs-verified-tip${open ? " is-open" : ""}`}
        role="tooltip"
      >
        {VERIFIED_MARK_TOOLTIP}
      </span>
    </button>
  );
}
