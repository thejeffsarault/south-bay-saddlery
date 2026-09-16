import type { Metadata } from "next";
import Link from "next/link";
import { ReceivedView } from "./ReceivedView";

export const metadata: Metadata = {
  title: "Submission received",
};

export default async function SellReceivedPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; path?: string }>;
}) {
  const { id, path } = await searchParams;
  return (
    <div className="sbs-page space-y-5">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-sbs-muted">
        Intake
      </p>
      <h1 className="font-serif text-4xl text-sbs-text">Received</h1>
      <p className="text-sbs-ink">
        Your saddle is pending in the founder approval queue. It is not in the
        Collection until it is approved and published.
      </p>
      <ReceivedView id={id} path={path} />
      <Link href="/collection" className="inline-block text-sm underline underline-offset-4">
        Explore the Collection
      </Link>
    </div>
  );
}
