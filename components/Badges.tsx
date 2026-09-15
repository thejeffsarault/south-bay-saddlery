export function ListingBadges({
  verified,
  southBaySelect,
}: {
  verified?: boolean;
  southBaySelect?: boolean;
}) {
  if (!verified && !southBaySelect) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {verified ? <Badge>Verified</Badge> : null}
      {southBaySelect ? <Badge>South Bay Select</Badge> : null}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-sbs-black px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-sbs-text">
      {children}
    </span>
  );
}
