import "server-only";
import book from "@/data/bluebook-precomputed-2026-06-01.json";
import { conditionToTier, normalizeKey, tierToBandKey } from "./condition";
import type {
  BluebookBand,
  BluebookProposePublic,
  BluebookProposeRequest,
  ConditionTier,
} from "./types";

type YearBand = BluebookBand;

type FamilyEntry = {
  brands?: string[];
  line?: string;
  namedModelDefault?: boolean;
  sellingByYear?: Record<string, YearBand>;
  tradeInByYearInternal?: Record<string, YearBand>;
  note?: string;
};

type NamedModel = {
  family: string;
  modelAssumption?: string;
};

type BluebookFile = {
  version?: string;
  locks?: { vdNamedModelDefault?: string; modelAssumption?: string };
  families: Record<string, FamilyEntry>;
  brandResolve: Record<string, string>;
  vdNamedModels?: Record<string, NamedModel>;
};

const BOOK = book as BluebookFile;

const SHEETS: Record<string, string> = {
  group_a: "2026 OB",
  group_b: "2026 OB",
  voltaire_elegance: "2026 VD",
  voltaire_essential: "2026 VD",
  forestier: "FS Blue Book - Selling Prices",
};

const VOLTAIRE_BRANDS = new Set(["voltaire", "voltaire design", "vd"]);

function roundToTen(value: number) {
  return Math.round(value / 10) * 10;
}

function parseYear(value: BluebookProposeRequest["year"]): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const match = raw.match(/(?:19|20)\d{2}/);
  if (match) return Number(match[0]);
  const digits = Number(raw);
  if (Number.isFinite(digits) && digits >= 1990 && digits <= 2035) {
    return Math.trunc(digits);
  }
  return null;
}

function isVoltaire(brandKey: string) {
  return VOLTAIRE_BRANDS.has(brandKey);
}

function resolveFamily(
  brand: string,
  model: string,
): { family?: string; flags: string[]; reason?: string } {
  const brandKey = normalizeKey(brand);
  const modelKey = normalizeKey(model);
  const flags: string[] = [];

  if (!brandKey) {
    return { flags, reason: "brand_not_in_bluebook" };
  }

  const named = modelKey ? BOOK.vdNamedModels?.[modelKey] : undefined;
  if (named && (isVoltaire(brandKey) || !brandKey)) {
    if (named.modelAssumption) flags.push(named.modelAssumption);
    return { family: named.family, flags };
  }

  if (isVoltaire(brandKey)) {
    if (modelKey.includes("essential")) {
      return { family: "voltaire_essential", flags };
    }
    if (modelKey === "blue" || modelKey.endsWith(" blue") || modelKey.startsWith("blue ")) {
      return { flags, reason: "line_not_in_bluebook" };
    }
    if (modelKey.includes("elegance")) {
      return { family: "voltaire_elegance", flags };
    }
    flags.push(BOOK.locks?.modelAssumption ?? "elegance_default");
    return { family: "voltaire_elegance", flags };
  }

  const mapped = BOOK.brandResolve[brandKey];
  if (!mapped) {
    return { flags, reason: "brand_not_in_bluebook" };
  }
  return { family: mapped, flags };
}

function pickYearRow(
  sellingByYear: Record<string, YearBand>,
  year: number,
): { year: number; band: YearBand; flag?: string } | null {
  const exact = sellingByYear[String(year)];
  if (exact) return { year, band: exact };

  const years = Object.keys(sellingByYear)
    .map(Number)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  if (years.length === 0) return null;

  const oldest = years[0];
  const newest = years[years.length - 1];
  if (year < oldest) {
    return { year: oldest, band: sellingByYear[String(oldest)], flag: "oldest_row" };
  }
  if (year > newest) {
    return { year: newest, band: sellingByYear[String(newest)], flag: "newest_row" };
  }

  const nearest = years.reduce((best, current) =>
    Math.abs(current - year) < Math.abs(best - year) ? current : best,
  );
  return { year: nearest, band: sellingByYear[String(nearest)], flag: "nearest_row" };
}

function bandValues(band: YearBand) {
  return [band.good, band.excellent, band.likeNew].filter(
    (value): value is number => typeof value === "number",
  );
}

function proposeFromBand(
  band: YearBand,
  tier: ConditionTier | null,
): { amount?: number; usedTier?: string; flags: string[] } {
  const flags: string[] = [];
  const requested = tierToBandKey(tier);
  if (requested && typeof band[requested] === "number") {
    return { amount: band[requested], usedTier: requested, flags };
  }
  if (requested) flags.push("tier_fallback");
  if (!tier) flags.push("conditionConfidence:low");
  if (typeof band.excellent === "number") {
    return { amount: band.excellent, usedTier: "excellent", flags };
  }
  const values = bandValues(band);
  if (values.length === 0) return { flags };
  const mid = values.reduce((sum, value) => sum + value, 0) / values.length;
  return { amount: mid, usedTier: "midpoint", flags };
}

export function proposeBluebook(
  input: BluebookProposeRequest,
): BluebookProposePublic {
  const year = parseYear(input.year);
  if (year === null) {
    return { ok: false, needsJeffReview: true, reason: "year_unreadable" };
  }

  const tier = conditionToTier(input.conditionTier ?? input.condition);
  const resolved = resolveFamily(input.brand ?? "", input.model ?? "");
  if (!resolved.family) {
    return {
      ok: false,
      needsJeffReview: true,
      reason: resolved.reason ?? "brand_not_in_bluebook",
      flags: resolved.flags,
    };
  }

  const family = BOOK.families[resolved.family];
  if (!family?.sellingByYear) {
    return {
      ok: false,
      needsJeffReview: true,
      reason: "brand_not_in_bluebook",
      flags: resolved.flags,
    };
  }

  const row = pickYearRow(family.sellingByYear, year);
  if (!row) {
    return {
      ok: false,
      needsJeffReview: true,
      reason: "brand_not_in_bluebook",
      flags: resolved.flags,
    };
  }

  const proposal = proposeFromBand(row.band, tier);
  if (typeof proposal.amount !== "number") {
    return {
      ok: false,
      needsJeffReview: true,
      reason: "brand_not_in_bluebook",
      flags: [...resolved.flags, ...proposal.flags],
    };
  }

  const flags = [...resolved.flags, ...proposal.flags];
  if (row.flag === "oldest_row") flags.push("extrapolated:oldest_row");
  if (row.flag === "newest_row") flags.push("extrapolated:newest_row");
  if (row.flag === "nearest_row") flags.push("extrapolated:nearest_row");

  const proposedList = roundToTen(proposal.amount);
  const bbBand: BluebookBand = {};
  if (typeof row.band.good === "number") bbBand.good = row.band.good;
  if (typeof row.band.excellent === "number") bbBand.excellent = row.band.excellent;
  if (typeof row.band.likeNew === "number") bbBand.likeNew = row.band.likeNew;

  return {
    ok: true,
    proposedList,
    currency: "USD",
    bbBand,
    bbSource: {
      sheet: SHEETS[resolved.family] ?? resolved.family,
      family: resolved.family,
      year: row.year,
      tier: proposal.usedTier ?? "excellent",
      raw: proposal.amount,
    },
    flags,
    needsJeffReview: false,
  };
}

export function publicBluebookResponse(input: BluebookProposeRequest) {
  return proposeBluebook(input);
}
