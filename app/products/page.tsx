import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop — South Bay Saddlery",
  description: "Browse handcrafted saddles, tack, and leather goods.",
};

export default function ProductsPage() {
  const categories = ["Saddles", "Tack", "Leather Goods"] as const;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-serif text-4xl font-bold text-saddle-950">
          The Shop
        </h1>
        <p className="mt-3 text-lg text-saddle-700">
          Everything here is made to order in our workshop. Found something you
          like? Send an inquiry and we&apos;ll start the conversation.
        </p>
      </header>

      {categories.map((category) => {
        const items = products.filter((p) => p.category === category);
        return (
          <section key={category} className="mb-12">
            <h2 className="mb-6 font-serif text-2xl font-bold text-saddle-800">
              {category}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
