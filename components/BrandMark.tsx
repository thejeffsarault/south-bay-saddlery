/**
 * Official SBS marks (vector preferred over PNG interim):
 * - /brand/SBS-logo-black.svg — header / light chrome
 * - /brand/SBS-logo-white.svg — dark footer / nav
 * - /brand/SBS-favicon.ico and app/favicon.ico
 */
export function BrandMark({
  inverted = false,
  subtitle,
  size = "header",
}: {
  inverted?: boolean;
  subtitle?: string;
  size?: "header" | "footer";
}) {
  const src = inverted
    ? "/brand/SBS-logo-white.svg"
    : "/brand/SBS-logo-black.svg";
  const imgClass =
    size === "footer"
      ? "h-12 w-auto max-w-[220px]"
      : "h-11 w-auto max-w-[200px] sm:h-12 sm:max-w-[240px]";

  return (
    <span className="block leading-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="South Bay Saddlery" className={imgClass} />
      {subtitle ? (
        <span
          className={`mt-1 block font-mono text-[0.62rem] uppercase tracking-[0.28em] ${
            inverted ? "text-sbs-white/70" : "text-sbs-muted"
          }`}
        >
          {subtitle}
        </span>
      ) : null}
    </span>
  );
}
