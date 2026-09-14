import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/contact", label: "Custom Orders" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-saddle-200 bg-saddle-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🐎
          </span>
          <span className="font-serif text-xl font-bold tracking-tight text-saddle-900">
            South Bay Saddlery
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-saddle-800">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-saddle-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
