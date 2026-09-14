import Link from "next/link";

const nav = [
  { href: "/present", label: "Present Your Saddle" },
  { href: "/collection", label: "Explore the Collection" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-ivory/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="block leading-none">
          <span className="block font-serif text-[1.35rem] tracking-[0.04em] text-espresso">
            South Bay Saddlery
          </span>
          <span className="mt-0.5 block font-mono text-[0.62rem] uppercase tracking-[0.28em] text-cognac">
            Congress
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-charcoal sm:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-cognac">
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
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-8 text-sm text-charcoal">
        <p className="font-serif text-lg text-espresso">South Bay Saddlery</p>
        <p>Pre-owned English saddles. Congress mobile MVP.</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
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
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-px border-t border-border bg-ivory-soft sm:hidden">
      <Link
        href="/present"
        className="px-3 py-3 text-center text-[0.78rem] font-medium text-espresso"
      >
        Present Your Saddle
      </Link>
      <Link
        href="/collection"
        className="px-3 py-3 text-center text-[0.78rem] font-medium text-espresso"
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
          ? "inline-flex border border-border px-4 py-2.5 text-sm text-espresso hover:border-cognac"
          : "inline-flex w-full items-center justify-center border border-border bg-ivory-soft px-5 py-3.5 text-sm tracking-wide text-espresso hover:border-cognac sm:w-auto"
      }
    >
      Request a Private Consultation
    </Link>
  );
}
