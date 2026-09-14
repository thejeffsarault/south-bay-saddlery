import Link from "next/link";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-saddle-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-saddle-100 to-saddle-200 text-6xl">
        <span aria-hidden>{product.emoji}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-saddle-500">
          {product.category}
        </span>
        <h3 className="font-serif text-lg font-bold text-saddle-900">
          {product.name}
        </h3>
        <p className="flex-1 text-sm text-saddle-700">{product.blurb}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-saddle-800">
            ${product.price.toLocaleString()}
          </span>
          <Link
            href={`/contact?product=${product.slug}`}
            className="rounded-full bg-saddle-700 px-4 py-1.5 text-sm font-medium text-saddle-50 transition-colors hover:bg-saddle-600"
          >
            Inquire
          </Link>
        </div>
      </div>
    </div>
  );
}
