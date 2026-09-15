/**
 * Interim PNG logos (SVG drop-in later, do not block):
 * - /brand/SBS-logo-black.png — header / light chrome
 * - /brand/SBS-logo-white.png — dark footer / nav
 * - /brand/SBS-favicon.ico or app/favicon.ico / app/icon.png
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
    ? "/brand/SBS-logo-white.png"
    : "/brand/SBS-logo-black.png";
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
