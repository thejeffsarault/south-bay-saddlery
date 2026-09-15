export function ListingBadges({
  verified,
  southBaySelect,
  selfServe,
}: {
  verified?: boolean;
  southBaySelect?: boolean;
  selfServe?: boolean;
}) {
  if (selfServe) return null;
  if (!verified && !southBaySelect) return null;
  return (
    <div className="sbs-badge-row">
      {verified ? <span className="sbs-badge">Verified</span> : null}
      {southBaySelect ? <span className="sbs-badge">South Bay Select</span> : null}
    </div>
  );
}
