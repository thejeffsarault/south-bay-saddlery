export function LeatherPlate({
  caption,
  className = "",
}: {
  caption: string;
  className?: string;
}) {
  return (
    <div
      className={`leather-plate relative overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-3 border border-sbs-white/35" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-3 py-2">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-sbs-white">
          {caption}
        </p>
      </div>
    </div>
  );
}
