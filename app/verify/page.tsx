import type { Metadata } from "next";
import { VerifyPageClient } from "./VerifyPageClient";

export const metadata: Metadata = {
  title: "Verification",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ submissionId?: string }>;
}) {
  const { submissionId } = await searchParams;
  return <VerifyPageClient submissionId={submissionId} />;
}
