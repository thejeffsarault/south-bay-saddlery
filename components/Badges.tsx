export function ListingBadges({
  verified,
  selfServe,
}: {
  verified?: boolean;
  southBaySelect?: boolean;
  selfServe?: boolean;
}) {
  if (selfServe) return null;
  if (!verified) return null;
  return (
    <div className="sbs-badge-row">
      <span className="sbs-badge">Verified</span>
    </div>
  );
}
