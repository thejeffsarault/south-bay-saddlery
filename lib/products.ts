export type Product = {
  slug: string;
  name: string;
  category: "Saddles" | "Tack" | "Leather Goods";
  price: number;
  blurb: string;
  emoji: string;
};

export const products: Product[] = [
  {
    slug: "coastal-ranch-saddle",
    name: "Coastal Ranch Saddle",
    category: "Saddles",
    price: 3850,
    blurb:
      "A hard-working roping saddle hand-tooled in full-grain leather, built for long days on the coast.",
    emoji: "🐎",
  },
  {
    slug: "pacific-trail-saddle",
    name: "Pacific Trail Saddle",
    category: "Saddles",
    price: 3200,
    blurb:
      "Lightweight trail saddle with a padded seat and floral tooling for all-day comfort.",
    emoji: "🌵",
  },
  {
    slug: "harbor-headstall",
    name: "Harbor Headstall",
    category: "Tack",
    price: 245,
    blurb:
      "Single-ear headstall with hand-stamped basket weave and stainless hardware.",
    emoji: "🪢",
  },
  {
    slug: "bayside-breast-collar",
    name: "Bayside Breast Collar",
    category: "Tack",
    price: 320,
    blurb:
      "Tripping-style breast collar with buckstitched edges and a solid brass conway.",
    emoji: "🎗️",
  },
  {
    slug: "saddleback-belt",
    name: "Saddleback Belt",
    category: "Leather Goods",
    price: 145,
    blurb:
      "Made-to-measure ranger belt tooled to match your rig, finished with a hand-cast buckle.",
    emoji: "🥾",
  },
  {
    slug: "dockside-journal",
    name: "Dockside Journal Cover",
    category: "Leather Goods",
    price: 95,
    blurb:
      "Refillable leather journal cover that ages beautifully with every trip to the barn.",
    emoji: "📓",
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
