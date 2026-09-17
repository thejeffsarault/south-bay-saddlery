"use client";

import { useState } from "react";
import {
  HOME_REVIEWS,
  REVIEW_GHOST_COUNT,
  publishedHomeReviews,
  type HomeReview,
} from "@/lib/reviews";

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4"
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

function ReviewGhostCard() {
  return (
    <article className="sbs-review-card sbs-review-ghost" aria-hidden>
      <span className="sbs-review-mark">“</span>
      <div className="sbs-review-slot sbs-review-slot-quote" />
      <div className="sbs-review-slot sbs-review-slot-quote sbs-review-slot-mid" />
      <div className="sbs-review-slot sbs-review-slot-name" />
    </article>
  );
}

function ReviewCard({ review }: { review: HomeReview }) {
  const meta = [review.role, review.location].filter(Boolean).join(" · ");
  return (
    <article className="sbs-review-card">
      <blockquote className="sbs-review-quote">
        <p>{review.quote}</p>
        <footer>
          <cite className="sbs-review-name">{review.name}</cite>
          {meta ? <p className="sbs-review-meta">{meta}</p> : null}
        </footer>
      </blockquote>
    </article>
  );
}

export function ReviewsSection({ demo = false }: { demo?: boolean }) {
  const reviews = publishedHomeReviews(HOME_REVIEWS);
  const ghosts = reviews.length === 0;
  const count = ghosts ? REVIEW_GHOST_COUNT : reviews.length;
  const [index, setIndex] = useState(0);
  const canPage = count > 1;

  function go(next: number) {
    setIndex(((next % count) + count) % count);
  }

  return (
    <section className="sbs-reviews" aria-labelledby="home-reviews-title">
      <div className="sbs-reviews-head">
        <h2 id="home-reviews-title" className="sbs-reviews-title">
          Reviews
        </h2>
        {demo ? (
          <p className="sbs-reviews-demo">Awaiting Jeff review</p>
        ) : null}
      </div>
      {ghosts ? (
        <p className="sr-only">Reviews will appear here when provided.</p>
      ) : null}

      <div className="sbs-reviews-desktop">
        {ghosts
          ? Array.from({ length: REVIEW_GHOST_COUNT }, (_, key) => (
              <ReviewGhostCard key={key} />
            ))
          : reviews.map((review, key) => (
              <ReviewCard key={`${review.name}-${key}`} review={review} />
            ))}
      </div>

      <div className="sbs-reviews-mobile">
        <div className="sbs-reviews-stage">
          {ghosts ? (
            <ReviewGhostCard />
          ) : reviews[index] ? (
            <ReviewCard review={reviews[index]} />
          ) : null}
          {canPage ? (
            <>
              <button
                type="button"
                className="sbs-reviews-edge sbs-reviews-edge-prev"
                aria-label="Previous review"
                onClick={() => go(index - 1)}
              >
                <Chevron dir="prev" />
              </button>
              <button
                type="button"
                className="sbs-reviews-edge sbs-reviews-edge-next"
                aria-label="Next review"
                onClick={() => go(index + 1)}
              >
                <Chevron dir="next" />
              </button>
            </>
          ) : null}
        </div>
        {canPage ? (
          <div className="sbs-reviews-dots" role="tablist" aria-label="Reviews">
            {Array.from({ length: count }, (_, key) => (
              <button
                key={key}
                type="button"
                className="sbs-reviews-dot"
                aria-label={`Review ${key + 1}`}
                aria-current={key === index ? "true" : undefined}
                onClick={() => go(key)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
