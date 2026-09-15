import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

const nav = [
  { href: "/present", label: "Present Your Saddle" },
  { href: "/collection", label: "Explore the Collection" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-sbs-border bg-sbs-white/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="block leading-none">
          <BrandMark subtitle="Congress" />
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
        <p>Pre-owned English saddles. Congress mobile MVP.</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sbs-white">
          <Link href="/present" className="underline-offset-4 hover:underline">
            Present Your Saddle
          </Link>
          <Link href="/collection" className="underline-offset-4 hover:underline">
            Explore the Collection
          </Link>
          <Link
            href="/consultation"
            className="underline-offset-4 hover:underline"
          >
            Request a Private Consultation
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
        href="/present"
        className="px-3 py-3 text-center text-[0.78rem] font-medium text-sbs-white"
      >
        Present Your Saddle
      </Link>
      <Link
        href="/collection"
        className="px-3 py-3 text-center text-[0.78rem] font-medium text-sbs-white"
      >
        Explore the Collection
      </Link>
    </nav>
  );
}

export function ConsultationCta({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/consultation"
      className={
        compact
          ? "inline-flex border border-sbs-border px-4 py-2.5 text-sm text-sbs-text hover:border-sbs-black"
          : "inline-flex w-full items-center justify-center bg-sbs-accent px-5 py-3.5 text-sm tracking-wide text-sbs-on-accent sm:w-auto"
      }
    >
      Request a Private Consultation
    </Link>
  );
}
