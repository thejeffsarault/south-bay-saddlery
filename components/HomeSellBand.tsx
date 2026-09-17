"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export function HomeSellBand() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        document.documentElement.classList.toggle(
          "sbs-sell-band-inview",
          Boolean(entry?.isIntersecting),
        );
      },
      { threshold: 0.08 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      document.documentElement.classList.remove("sbs-sell-band-inview");
    };
  }, []);

  return (
    <section
      ref={ref}
      className="sbs-home-sell mt-[var(--sbs-space-7)] bg-sbs-black text-sbs-white"
    >
      <div className="sbs-home-sell-inner">
        <h2 className="font-serif text-3xl font-medium">Sell Your Saddle</h2>
        <p className="mt-2 text-sm text-sbs-white/70">
          List in minutes · founder review before live
        </p>
        <Link
          href="/sell"
          className="mt-6 inline-block bg-sbs-white px-5 py-3 text-sm tracking-wide text-sbs-black"
        >
          Sell Your Saddle
        </Link>
      </div>
    </section>
  );
}
