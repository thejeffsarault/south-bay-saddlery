import type { ConditionTier } from "./types";

export function normalizeKey(value: string | undefined | null) {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function conditionToTier(
  value: string | undefined | null,
): ConditionTier | null {
  const key = normalizeKey(value);
  if (!key) return null;
  if (
    key === "like new" ||
    key === "like_new" ||
    key === "likenew" ||
    key === "buffalo" ||
    key === "b like new"
  ) {
    return "like_new";
  }
  if (
    key === "excellent" ||
    key === "very good" ||
    key === "calf" ||
    key === "c excellent"
  ) {
    return "excellent";
  }
  if (
    key === "good" ||
    key === "fair" ||
    key === "needs work" ||
    key === "grained" ||
    key === "g good"
  ) {
    return "good";
  }
  return null;
}

export function tierToBandKey(
  tier: ConditionTier | null,
): "good" | "excellent" | "likeNew" | null {
  if (tier === "like_new") return "likeNew";
  if (tier === "excellent") return "excellent";
  if (tier === "good") return "good";
  return null;
}
