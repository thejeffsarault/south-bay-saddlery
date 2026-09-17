export type HomeReview = {
  quote: string;
  name: string;
  role?: string;
  location?: string;
};

/** Jeff pastes live reviews here. Stay empty until he greenlights text. */
export const HOME_REVIEWS: HomeReview[] = [];

export const REVIEW_GHOST_COUNT = 3;

export function publishedHomeReviews(reviews: HomeReview[] = HOME_REVIEWS) {
  return reviews.filter((review) => review.quote.trim() && review.name.trim());
}

export function isReviewsDemo(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1";
}
