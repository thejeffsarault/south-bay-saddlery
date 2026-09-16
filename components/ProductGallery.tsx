"use client";

import { useRef, useState } from "react";
import { shotLabel } from "@/lib/catalog";
import { ListingPhoto } from "./ListingPhoto";

export function ProductGallery({
  labels,
  photoSrcs,
  videoSrc,
}: {
  labels: string[];
  photoSrcs?: Record<string, string>;
  videoSrc?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const media: Array<{
    key: string;
    type: "image" | "video";
    src?: string;
    alt: string;
  }> = labels.map((label) => ({
    key: label,
    type: "image",
    src: photoSrcs?.[label],
    alt: shotLabel(label),
  }));

  if (videoSrc) {
    media.splice(1, 0, {
      key: "promo",
      type: "video",
      src: videoSrc,
      alt: "Showroom",
    });
  }

  function onScroll() {
    const el = scroller.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  if (media.length === 0) {
    return <ListingPhoto alt="Showroom" className="aspect-[4/5] w-full" />;
  }

  return (
    <div>
      <div
        ref={scroller}
        onScroll={onScroll}
        className="sbs-gallery bg-sbs-white"
      >
        {media.map((item, itemIndex) => (
          <div key={item.key} className="w-full shrink-0 snap-center">
            {item.type === "video" && item.src ? (
              <video
                src={item.src}
                muted
                autoPlay
                playsInline
                loop
                className="aspect-[4/5] w-full bg-sbs-white object-contain"
              />
            ) : (
              <ListingPhoto
                src={item.src}
                alt={item.alt}
                className="aspect-[4/5] w-full bg-sbs-white"
                contain
                priority={itemIndex === 0}
              />
            )}
          </div>
        ))}
      </div>
      {media.length > 1 ? (
        <p className="mt-2 text-center text-[var(--sbs-text-meta)] text-sbs-muted">
          {index + 1} / {media.length}
        </p>
      ) : null}
    </div>
  );
}
