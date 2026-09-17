"use client";

import { useState } from "react";
import { LeatherPlate } from "./LeatherPlate";

export function ListingPhoto({
  src,
  alt,
  caption,
  className = "aspect-[4/5]",
  contain = true,
  priority = false,
  showCaption = false,
}: {
  src?: string;
  alt: string;
  caption?: string;
  className?: string;
  contain?: boolean;
  priority?: boolean;
  showCaption?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <LeatherPlate caption={caption || alt} className={className} />;
  }

  return (
    <figure
      className={`relative block overflow-hidden bg-sbs-white ${className}`}
      style={{ borderRadius: "var(--sbs-radius)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`absolute inset-0 h-full w-full ${contain ? "object-contain" : "object-cover"} object-center`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onError={() => setFailed(true)}
      />
      {showCaption && caption ? (
        <figcaption className="sr-only">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
