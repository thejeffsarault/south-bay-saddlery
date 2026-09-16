"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { selectHeroListings, type PublicListing } from "@/lib/catalog";
import { useStore } from "@/lib/store";
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
      strokeWidth="1.4"
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

function HeroStill({ listing, priority }: { listing: PublicListing; priority?: boolean }) {
  return (
    <div className="relative h-full w-full">
      <Link
        href={`/collection/${listing.id}`}
        className="block h-full w-full"
        aria-label={`${listing.name} details`}
      >
        <ListingPhoto
          src={listing.heroSrc}
          alt={listing.name}
          className="h-full w-full"
          contain={false}
          priority={priority}
        />
      </Link>
      {listing.verified ? <VerifiedMarkOverlay /> : null}
    </div>
  );
}

export function HeroCarousel({ seed }: { seed: PublicListing[] }) {
  const { listings, ready } = useStore();
  const slides = selectHeroListings(ready ? listings : seed);

  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<DragSession | null>(null);
  const suppressClick = useRef(false);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  const slideCount = slides.length;
  indexRef.current = index;

  const goTo = useCallback(
    (next: number) => {
      if (slideCount < 2) return;
      const clamped = ((next % slideCount) + slideCount) % slideCount;
      indexRef.current = clamped;
      setOffsetX(0);
      setIndex(clamped);
    },
    [slideCount],
  );

  useEffect(() => {
    if (index >= slideCount && slideCount > 0) {
      goTo(0);
    }
  }, [goTo, index, slideCount]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const sync = () => setWidth(el.clientWidth);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [slideCount]);

  useEffect(() => {
    if (slideCount < 2) return;
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
  }, [goTo, slideCount]);

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
      suppressClick.current = true;
      const stageWidth = stage.current?.clientWidth || width || 320;
      const threshold = Math.max(28, stageWidth * 0.1);
      if (dx <= -threshold) goTo(indexRef.current + 1);
      else if (dx >= threshold) goTo(indexRef.current - 1);
    }
  }

  function startGesture(startX: number, startY: number) {
    drag.current?.unbind();
    suppressClick.current = false;

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
    if ((event.target as HTMLElement).closest("button")) return;
    startGesture(event.clientX, event.clientY);
  }

  const listing = slides[0];
  if (!listing) return null;

  if (slideCount < 2) {
    return (
      <div className="sbs-hero">
        <HeroStill listing={listing} priority />
      </div>
    );
  }

  const slideWidth = width || 1;
  const trackX = -index * slideWidth + offsetX;
  const dragging = offsetX !== 0;

  return (
    <div className="sbs-hero">
      <div className="sbs-gallery-stage sbs-hero-stage" ref={stage}>
        <div
          className={`sbs-gallery-track${dragging ? " is-dragging" : ""}`}
          style={{ transform: `translate3d(${trackX}px, 0, 0)` }}
          onPointerDown={onPointerDown}
          onDragStart={(event) => event.preventDefault()}
          aria-roledescription="carousel"
          aria-label="Verified saddles in stock"
        >
          {slides.map((slide, slideIndex) => (
            <div key={slide.id} className="sbs-gallery-slide sbs-hero-slide">
              <Link
                href={`/collection/${slide.id}`}
                className="block h-full w-full"
                aria-label={`${slide.name} details`}
                draggable={false}
                onClick={(event) => {
                  if (suppressClick.current) {
                    event.preventDefault();
                    suppressClick.current = false;
                  }
                }}
              >
                <ListingPhoto
                  src={slide.heroSrc}
                  alt={slide.name}
                  className="h-full w-full"
                  contain={false}
                  priority={slideIndex === 0}
                />
              </Link>
            </div>
          ))}
        </div>
        {slides.some((slide) => slide.verified) ? <VerifiedMarkOverlay /> : null}
        <button
          type="button"
          className="sbs-gallery-arrow sbs-hero-arrow sbs-gallery-arrow-prev"
          aria-label="Previous saddle"
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
          className="sbs-gallery-arrow sbs-hero-arrow sbs-gallery-arrow-next"
          aria-label="Next saddle"
          onClick={(event) => {
            event.stopPropagation();
            goTo(index + 1);
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Chevron dir="next" />
        </button>
      </div>
    </div>
  );
}
