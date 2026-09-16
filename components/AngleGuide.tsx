import { SELL_GUIDE_SRC, type SellGuideId } from "@/lib/sell-guides";

export function AngleGuide({
  id,
  size = "hero",
}: {
  id: SellGuideId;
  size?: "hero" | "slot";
}) {
  const hero = size === "hero";
  return (
    <div
      className={
        hero
          ? "mx-auto flex h-[180px] w-full max-w-sm items-center justify-center"
          : "flex h-16 w-16 shrink-0 items-center justify-center"
      }
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SELL_GUIDE_SRC[id]}
        alt=""
        className={
          hero
            ? "max-h-[180px] w-auto object-contain"
            : "max-h-16 w-auto object-contain"
        }
      />
    </div>
  );
}
