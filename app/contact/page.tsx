import type { Metadata } from "next";
import { InquiryForm } from "@/components/InquiryForm";

export const metadata: Metadata = {
  title: "Custom Orders — South Bay Saddlery",
  description: "Start a custom saddle or leather goods order.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-saddle-950">
          Start a custom order
        </h1>
        <p className="mt-3 text-lg text-saddle-700">
          Tell us what you have in mind and we&apos;ll follow up to talk
          measurements, leather, and tooling. No deposit required to start the
          conversation.
        </p>
      </header>
      <InquiryForm initialProduct={product ?? ""} />
    </div>
  );
}
