import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function Home() {
  const featured = products.slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-saddle-100 to-saddle-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-20 md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-6">
            <span className="w-fit rounded-full bg-saddle-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-saddle-800">
              Handmade since 1978
            </span>
            <h1 className="text-balance font-serif text-4xl font-bold leading-tight text-saddle-950 md:text-5xl">
              Custom saddles &amp; leather goods, built by hand on the bay.
            </h1>
            <p className="max-w-md text-lg text-saddle-700">
              Every rig we make is tooled, stitched, and finished in our South
              Bay workshop — made to fit you, your horse, and a lifetime of
              rides.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-full bg-saddle-700 px-6 py-3 font-medium text-saddle-50 transition-colors hover:bg-saddle-600"
              >
                Browse the shop
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-saddle-400 px-6 py-3 font-medium text-saddle-800 transition-colors hover:bg-saddle-100"
              >
                Start a custom order
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex aspect-square w-full max-w-sm items-center justify-center rounded-3xl bg-gradient-to-br from-saddle-300 to-saddle-600 text-[10rem] shadow-lg">
              <span aria-hidden>🐎</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-3xl font-bold text-saddle-900">
            Featured work
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-saddle-600 hover:text-saddle-500"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="border-t border-saddle-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          {[
            {
              title: "Full-grain leather",
              body: "We cut every piece from vegetable-tanned hides chosen for strength and character.",
              emoji: "🧵",
            },
            {
              title: "Fit guaranteed",
              body: "Custom trees and measurements mean your saddle fits right from the first ride.",
              emoji: "📐",
            },
            {
              title: "Built to be repaired",
              body: "Hand-stitched construction means your gear can be serviced for generations.",
              emoji: "🛠️",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col gap-2">
              <span className="text-3xl" aria-hidden>
                {item.emoji}
              </span>
              <h3 className="font-serif text-xl font-bold text-saddle-900">
                {item.title}
              </h3>
              <p className="text-saddle-700">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
