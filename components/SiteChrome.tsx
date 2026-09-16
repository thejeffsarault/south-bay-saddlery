import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

const nav = [
  { href: "/collection", label: "Collection" },
  { href: "/sell", label: "Sell Your Saddle" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-sbs-border bg-sbs-white/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[var(--sbs-max)] items-center justify-between px-[var(--sbs-page-pad-x)] py-2.5 md:px-[var(--sbs-page-pad-x-md)]">
        <Link href="/" className="block leading-none">
          <BrandMark />
        </Link>
        <nav className="flex items-center gap-4 text-[0.8125rem] text-sbs-ink sm:gap-5 sm:text-sm">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-sbs-black">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-sbs-border bg-sbs-white">
      <div className="mx-auto flex w-full max-w-[var(--sbs-max)] flex-col gap-3 px-[var(--sbs-page-pad-x)] py-[var(--sbs-space-6)] md:px-[var(--sbs-page-pad-x-md)]">
        <BrandMark size="footer" />
        <p className="text-[var(--sbs-text-meta)] text-sbs-muted">
          Shipping & escrow · English saddles
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[var(--sbs-text-meta)] text-sbs-muted">
          <Link href="/collection" className="hover:text-sbs-black">
            Collection
          </Link>
          <Link href="/sell" className="hover:text-sbs-black">
            Sell Your Saddle
          </Link>
        </div>
      </div>
    </footer>
  );
}
