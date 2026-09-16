import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Collection",
};

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
