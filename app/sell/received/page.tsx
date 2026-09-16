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
      <h1 className="font-serif text-3xl font-medium text-sbs-text sm:text-4xl">
        Received
      </h1>
      <p className="text-sm text-sbs-muted">
        In the founder queue. Not live until approved.
      </p>
      <ReceivedView id={id} path={path} />
      <Link href="/collection" className="inline-block text-sm underline underline-offset-4">
        Explore the Collection
      </Link>
    </div>
  );
}
