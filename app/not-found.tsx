import Link from "next/link";

export default function NotFound() {
  return (
    <div className="sbs-page space-y-4">
      <h1 className="font-serif text-4xl text-sbs-text">Not in the Collection</h1>
      <p className="text-sbs-ink">That listing is unpublished or unknown.</p>
      <Link href="/collection" className="text-sm underline underline-offset-4">
        Explore the Collection
      </Link>
    </div>
  );
}
