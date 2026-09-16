export type ConditionTier = "good" | "excellent" | "like_new";

export type BluebookBand = {
  good?: number;
  excellent?: number;
  likeNew?: number;
};

export type BluebookProposeRequest = {
  brand?: string;
  model?: string;
  year?: number | string;
  conditionTier?: string;
  condition?: string;
  serial?: string;
  path?: string;
};

export type BluebookSource = {
  sheet: string;
  family: string;
  year: number;
  tier: string;
  raw?: number;
};

export type BluebookProposeOk = {
  ok: true;
  proposedList: number;
  currency: "USD";
  bbBand: BluebookBand;
  bbSource: BluebookSource;
  flags: string[];
  needsJeffReview: false;
};

export type BluebookProposeMiss = {
  ok: false;
  needsJeffReview: true;
  reason: string;
  flags?: string[];
};

export type BluebookProposePublic = BluebookProposeOk | BluebookProposeMiss;

export const DRAFT_CONDITIONS = ["Good", "Excellent", "Like New"] as const;
export type DraftCondition = (typeof DRAFT_CONDITIONS)[number];
