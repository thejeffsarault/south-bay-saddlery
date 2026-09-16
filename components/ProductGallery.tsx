"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { shotLabel } from "@/lib/catalog";
import { ListingPhoto } from "./ListingPhoto";

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      {dir === "prev" ? (
        <path d="M15 5 L8 12 L15 19" />
      ) : (
        <path d="M9 5 L16 12 L9 19" />
      )}
    </svg>
  );
}

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
  const thumbs = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
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

  const mediaCount = media.length;
  indexRef.current = index;

  const goTo = useCallback(
    (next: number) => {
      const el = scroller.current;
      if (!el || mediaCount === 0) return;
      const clamped = ((next % mediaCount) + mediaCount) % mediaCount;
      el.scrollTo({
        left: clamped * el.clientWidth,
        behavior: "smooth",
      });
      indexRef.current = clamped;
      setIndex(clamped);
    },
    [mediaCount],
  );

  function onScroll() {
    const el = scroller.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next !== indexRef.current) {
      indexRef.current = next;
      setIndex(next);
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
      }
      event.preventDefault();
      goTo(indexRef.current + (event.key === "ArrowLeft" ? -1 : 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const keepPinned = () => {
      el.scrollLeft = indexRef.current * el.clientWidth;
    };
    const observer = new ResizeObserver(keepPinned);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const active = thumbs.current?.querySelector<HTMLElement>(
      `[data-gallery-thumb="${index}"]`,
    );
    active?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [index]);

  if (media.length === 0) {
    return <ListingPhoto alt="Showroom" className="aspect-[4/5] w-full" />;
  }

  const canNav = media.length > 1;

  return (
    <div className="sbs-gallery-root min-w-0 w-full">
      <div className="relative min-w-0">
        <div
          ref={scroller}
          onScroll={onScroll}
          className="sbs-gallery bg-sbs-white"
          aria-roledescription="carousel"
          aria-label="Showroom photos"
        >
          {media.map((item, itemIndex) => (
            <div key={item.key} className="sbs-gallery-slide">
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
        {canNav ? (
          <>
            <button
              type="button"
              className="sbs-gallery-arrow sbs-gallery-arrow-prev"
              aria-label="Previous photo"
              onClick={() => goTo(index - 1)}
            >
              <Chevron dir="prev" />
            </button>
            <button
              type="button"
              className="sbs-gallery-arrow sbs-gallery-arrow-next"
              aria-label="Next photo"
              onClick={() => goTo(index + 1)}
            >
              <Chevron dir="next" />
            </button>
          </>
        ) : null}
      </div>
      {canNav ? (
        <div
          ref={thumbs}
          className="sbs-gallery-thumbs"
          aria-label="Showroom stills"
        >
          {media.map((item, itemIndex) => (
            <button
              key={item.key}
              type="button"
              data-gallery-thumb={itemIndex}
              aria-label={`Show ${item.alt}`}
              aria-current={itemIndex === index ? "true" : undefined}
              className="sbs-gallery-thumb"
              onClick={() => goTo(itemIndex)}
            >
              {item.type === "video" && item.src ? (
                <span className="leather-plate relative block aspect-[4/5] w-full">
                  <span className="sr-only">Video</span>
                </span>
              ) : (
                <ListingPhoto
                  src={item.src}
                  alt=""
                  className="aspect-[4/5] w-full"
                  contain
                />
              )}
            </button>
          ))}
        </div>
      ) : null}
      {canNav ? (
        <p
          className="mt-2 text-center text-[var(--sbs-text-meta)] text-sbs-muted"
          aria-live="polite"
        >
          {index + 1} / {media.length}
        </p>
      ) : null}
    </div>
  );
}
