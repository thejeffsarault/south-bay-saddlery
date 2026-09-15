import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

const nav = [
  { href: "/sell", label: "Sell Your Saddle" },
  { href: "/collection", label: "Collection" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-sbs-border bg-sbs-white/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="block leading-none">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-sbs-ink sm:flex">
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
    <footer className="mt-auto bg-sbs-black text-sbs-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-8 text-sm text-sbs-white/80">
        <BrandMark inverted size="footer" />
        <p>Pre-owned English saddles. Mobile-first Phase 1.</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sbs-white">
          <Link href="/sell" className="underline-offset-4 hover:underline">
            Sell Your Saddle
          </Link>
          <Link href="/collection" className="underline-offset-4 hover:underline">
            Collection
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function MobileDock() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-px border-t border-sbs-white/20 bg-sbs-black pb-[env(safe-area-inset-bottom)] sm:hidden">
      <Link
        href="/sell"
        className="px-3 py-3 text-center text-[0.78rem] font-medium text-sbs-white"
      >
        Sell Your Saddle
      </Link>
      <Link
        href="/collection"
        className="px-3 py-3 text-center text-[0.78rem] font-medium text-sbs-white"
      >
        Collection
      </Link>
    </nav>
  );
}
