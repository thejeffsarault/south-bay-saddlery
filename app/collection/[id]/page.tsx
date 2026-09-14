import type { Metadata } from "next";
import { DetailsView } from "@/components/DetailsView";
import { PUBLISHED_LISTINGS, getSeedListing } from "@/lib/inventory";

export function generateStaticParams() {
  return PUBLISHED_LISTINGS.map((listing) => ({ id: listing.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = getSeedListing(id);
  return {
    title: listing?.name ?? "Details",
  };
}

export default async function DetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetailsView id={id} />;
}
