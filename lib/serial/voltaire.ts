export type StampToken = {
  raw: string;
  kind:
    | "model"
    | "seat"
    | "flap"
    | "blocks"
    | "leather"
    | "panel"
    | "tree"
    | "serial"
    | "date"
    | "other"
    | "unknown";
};

export type VoltaireParse = {
  confident: boolean;
  brand: string;
  model: string;
  year: string;
  seat: string;
  flap: string;
  panel: string;
  blocks: string;
  leather: string;
  tree: string;
  serial: string;
  dateToken: string;
  flags: string[];
  tokens: StampToken[];
};

const TREE = new Set(["AN", "AO", "AP"]);
const PANEL_BASE = new Set(["PRO", "FIN", "XFIN"]);
const OTHER = new Set(["EF", "SK2", "RBQ"]);
const PANEL_MOD = new Set(["PW", "AS", "BB"]);
const NON_MODEL = new Set([...TREE, ...PANEL_BASE, ...OTHER, ...PANEL_MOD]);

const SEAT_RE = /^(1[4-9]|20)(?:\.\d)?$/;
const FLAP_RE = /^[1-9][A-Z]{1,5}$/;
const PAIR_RE = /^[A-Z]\/[A-Z](?:\s*\d+)?$/;
const B_AREA_RE = /^B\d{2}$/;
const D_AREA_RE = /^D\d{2}$/;
const DATE_RE = /^(\d{2})\.(\d{2})$/;
const YEAR_RE = /^(?:19|20)\d{2}$/;

function emptyParse(flags: string[] = []): VoltaireParse {
  return {
    confident: false,
    brand: "",
    model: "",
    year: "",
    seat: "",
    flap: "",
    panel: "",
    blocks: "",
    leather: "",
    tree: "",
    serial: "",
    dateToken: "",
    flags,
    tokens: [],
  };
}

function tokenize(input: string) {
  return input
    .replace(/[·•]/g, " ")
    .replace(/#\s*/g, "#")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function formatSeat(raw: string) {
  return raw.includes('"') ? raw : `${raw}"`;
}

function yearFromDate(token: string): { year: string; flag?: string } | null {
  const date = token.match(DATE_RE);
  if (date) {
    const yy = Number(date[1]);
    if (yy >= 10 && yy <= 29) {
      return { year: String(2000 + yy), flag: "yearFromDateToken" };
    }
    return null;
  }
  if (YEAR_RE.test(token)) return { year: token };
  return null;
}

export function parseVoltaireStamp(input: string): VoltaireParse {
  const raw = input.trim();
  if (!raw) return emptyParse();

  const parts = tokenize(raw);
  if (parts.length === 0) return emptyParse();

  let model = "";
  let seat = "";
  let flap = "";
  let blocks = "";
  let leather = "";
  let tree = "";
  let serial = "";
  let dateToken = "";
  const panelParts: string[] = [];
  const tokens: StampToken[] = [];
  const flags: string[] = [];

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    const upper = part.toUpperCase();

    if (upper.startsWith("#")) {
      serial = upper.replace(/^#/, "").trim() || serial;
      if (!serial && parts[i + 1] && /^\d/.test(parts[i + 1])) {
        serial = parts[i + 1].replace(/^#/, "");
        i += 1;
      }
      tokens.push({ raw: part, kind: "serial" });
      continue;
    }

    if (upper === "+") {
      if (panelParts.length) panelParts.push("+");
      tokens.push({ raw: part, kind: "panel" });
      continue;
    }

    if (TREE.has(upper)) {
      tree = tree || upper;
      tokens.push({ raw: part, kind: "tree" });
      continue;
    }

    if (PANEL_BASE.has(upper) || PANEL_MOD.has(upper) || B_AREA_RE.test(upper) || D_AREA_RE.test(upper)) {
      panelParts.push(upper);
      tokens.push({ raw: part, kind: "panel" });
      continue;
    }

    if (SEAT_RE.test(upper)) {
      seat = seat || formatSeat(upper);
      tokens.push({ raw: part, kind: "seat" });
      continue;
    }

    if (FLAP_RE.test(upper)) {
      flap = flap || upper;
      tokens.push({ raw: part, kind: "flap" });
      continue;
    }

    if (PAIR_RE.test(upper)) {
      if (!blocks) {
        blocks = upper;
        tokens.push({ raw: part, kind: "blocks" });
      } else if (!leather) {
        leather = upper;
        tokens.push({ raw: part, kind: "leather" });
      } else {
        tokens.push({ raw: part, kind: "other" });
      }
      continue;
    }

    if (!serial && /^\d{2,}$/.test(upper) && i === parts.length - 1) {
      serial = upper;
      tokens.push({ raw: part, kind: "serial" });
      continue;
    }

    const dated = yearFromDate(upper);
    if (dated && serial) {
      dateToken = upper;
      tokens.push({ raw: part, kind: "date" });
      continue;
    }

    if (
      !model &&
      /^[A-Z]{2,4}$/.test(upper) &&
      !NON_MODEL.has(upper) &&
      !OTHER.has(upper)
    ) {
      model = upper;
      tokens.push({ raw: part, kind: "model" });
      continue;
    }

    if (OTHER.has(upper)) {
      tokens.push({ raw: part, kind: "other" });
      continue;
    }

    tokens.push({ raw: part, kind: "unknown" });
  }

  const panel = panelParts.join(" ").replace(/\s+\+\s+/g, " + ").trim();
  const dated = dateToken ? yearFromDate(dateToken) : null;
  const year = dated?.year ?? "";
  if (dated?.flag) flags.push(dated.flag);

  const looksVd = Boolean(
    model || flap || PANEL_BASE.has(panel.split(" ")[0] ?? "") || tree,
  );
  const confident = Boolean(looksVd && model && seat && serial && (flap || panel));

  if (!confident) {
    flags.push("stamp_unparsed");
    return {
      confident: false,
      brand: "",
      model: "",
      year: "",
      seat: "",
      flap: "",
      panel: "",
      blocks: "",
      leather: "",
      tree: "",
      serial: "",
      dateToken,
      flags,
      tokens,
    };
  }

  return {
    confident: true,
    brand: "Voltaire Design",
    model,
    year,
    seat,
    flap,
    panel,
    blocks,
    leather,
    tree,
    serial,
    dateToken,
    flags,
    tokens,
  };
}

export function parseStampBestEffort(input: string): VoltaireParse {
  return parseVoltaireStamp(input);
}
