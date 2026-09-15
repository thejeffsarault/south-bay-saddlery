"use client";

import { useState } from "react";
import { LeatherPlate } from "./LeatherPlate";

export function ListingPhoto({
  src,
  alt,
  caption,
  className = "aspect-[4/5]",
  contain = true,
}: {
  src?: string;
  alt: string;
  caption?: string;
  className?: string;
  contain?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <LeatherPlate caption={caption || alt} className={className} />;
  }

  return (
    <figure
      className={`relative overflow-hidden border border-sbs-border bg-sbs-surface ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full ${contain ? "object-contain" : "object-cover"}`}
        onError={() => setFailed(true)}
      />
      {caption ? (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-3 py-2">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-sbs-white">
            {caption}
          </p>
        </figcaption>
      ) : null}
    </figure>
  );
}
