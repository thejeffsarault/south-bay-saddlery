"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { shotLabel } from "@/lib/catalog";
import { ListingPhoto } from "./ListingPhoto";
import { VerifiedMarkOverlay } from "./VerifiedMark";

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {dir === "prev" ? (
        <path d="M15 5 L8 12 L15 19" />
      ) : (
        <path d="M9 5 L16 12 L9 19" />
      )}
    </svg>
  );
}

type DragSession = {
  startX: number;
  startY: number;
  lastX: number;
  dragging: boolean;
  axis: "h" | "v" | null;
  finished: boolean;
  unbind: () => void;
};

export function ProductGallery({
  labels,
  photoSrcs,
  videoSrc,
  verified = false,
}: {
  labels: string[];
  photoSrcs?: Record<string, string>;
  videoSrc?: string;
  verified?: boolean;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const drag = useRef<DragSession | null>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  const media = useMemo(() => {
    const items: Array<{
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
      items.splice(1, 0, {
        key: "promo",
        type: "video",
        src: videoSrc,
        alt: "Showroom",
      });
    }

    return items;
  }, [labels, photoSrcs, videoSrc]);

  const mediaCount = media.length;
  indexRef.current = index;

  const goTo = useCallback(
    (next: number) => {
      if (mediaCount === 0) return;
      const clamped = ((next % mediaCount) + mediaCount) % mediaCount;
      indexRef.current = clamped;
      setOffsetX(0);
      setIndex(clamped);
    },
    [mediaCount],
  );

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const sync = () => setWidth(el.clientWidth);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
    const active = thumbs.current?.querySelector<HTMLElement>(
      `[data-gallery-thumb="${index}"]`,
    );
    active?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [index]);

  useEffect(() => {
    return () => drag.current?.unbind();
  }, []);

  function finishGesture(clientX: number) {
    const session = drag.current;
    if (!session || session.finished) return;
    session.finished = true;
    session.unbind();
    const dx = clientX - session.startX;
    const axis = session.axis;
    const dragged = session.dragging;
    drag.current = null;
    setOffsetX(0);
    if (axis === "v") return;
    if (dragged) {
      const stageWidth = stage.current?.clientWidth || width || 320;
      const threshold = Math.max(28, stageWidth * 0.1);
      if (dx <= -threshold) goTo(indexRef.current + 1);
      else if (dx >= threshold) goTo(indexRef.current - 1);
      return;
    }
    goTo(indexRef.current + 1);
  }

  function startGesture(startX: number, startY: number) {
    drag.current?.unbind();

    const onMove = (clientX: number, clientY: number) => {
      const session = drag.current;
      if (!session || session.finished) return;
      session.lastX = clientX;
      const dx = clientX - session.startX;
      const dy = clientY - session.startY;
      if (!session.axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        session.axis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
        session.dragging = session.axis === "h";
      }
      if (session.axis === "h") {
        setOffsetX(dx);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      onMove(event.clientX, event.clientY);
    };
    const onMouseMove = (event: MouseEvent) => {
      onMove(event.clientX, event.clientY);
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      if (drag.current?.axis === "h") event.preventDefault();
      onMove(touch.clientX, touch.clientY);
    };
    const onPointerUp = (event: PointerEvent) => finishGesture(event.clientX);
    const onMouseUp = (event: MouseEvent) => finishGesture(event.clientX);
    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      finishGesture(touch?.clientX ?? drag.current?.lastX ?? startX);
    };
    const onDragEnd = (event: DragEvent) => finishGesture(event.clientX);

    function unbind() {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("dragend", onDragEnd);
    }

    drag.current = {
      startX,
      startY,
      lastX: startX,
      dragging: false,
      axis: null,
      finished: false,
      unbind,
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("dragend", onDragEnd);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    startGesture(event.clientX, event.clientY);
  }

  if (media.length === 0) {
    return <ListingPhoto alt="Showroom" className="aspect-[4/5] w-full" />;
  }

  const canNav = media.length > 1;
  const slideWidth = width || 1;
  const trackX = -index * slideWidth + offsetX;
  const dragging = offsetX !== 0;

  return (
    <div className="sbs-gallery-root min-w-0 w-full">
      <div className="sbs-gallery-stage" ref={stage}>
        <div
          className={`sbs-gallery-track${dragging ? " is-dragging" : ""}`}
          style={{ transform: `translate3d(${trackX}px, 0, 0)` }}
          onPointerDown={onPointerDown}
          onDragStart={(event) => event.preventDefault()}
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
                  draggable={false}
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
              onClick={(event) => {
                event.stopPropagation();
                goTo(index - 1);
              }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <Chevron dir="prev" />
            </button>
            <button
              type="button"
              className="sbs-gallery-arrow sbs-gallery-arrow-next"
              aria-label="Next photo"
              onClick={(event) => {
                event.stopPropagation();
                goTo(index + 1);
              }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <Chevron dir="next" />
            </button>
          </>
        ) : null}
        {verified ? <VerifiedMarkOverlay /> : null}
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
