const VERIFIED_MARK_SRC = "/brand/verified-mark.svg";

export function VerifiedMarkOverlay() {
  return (
    <span className="sbs-verified-mark-slot" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={VERIFIED_MARK_SRC}
        alt=""
        className="sbs-verified-mark"
      />
    </span>
  );
}
