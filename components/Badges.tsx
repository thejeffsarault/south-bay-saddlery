export function ListingBadges({
  verified,
  selfServe,
}: {
  verified?: boolean;
  selfServe?: boolean;
}) {
  if (selfServe || !verified) return null;
  return (
    <div className="sbs-badge-row">
      <span className="sbs-badge">Verified</span>
    </div>
  );
}
