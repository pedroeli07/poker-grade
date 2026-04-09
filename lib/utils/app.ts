import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserRole } from "@prisma/client";
import {
  ErrorTypes,
  type GradeListRow, type GradeRuleCardRule, type LobbyzeFilterItem, type LogLevel,
  type NetworkStat, type PokerNetworkOption,
  type ScoutingSearchStats, type SharkscopeAlertFilters, type SharkscopeAlertRow,
  type SharkscopeAnalyticsPeriod, type SharkScopeResponse, type StatisticJson, type TargetListRow,
} from "@/lib/types";
import {
  ALLOWED_SCOPES, ANSI, CTRL, EMPTY_DESC, GRADE_ADMIN_ROLES,
  HOVER_PREVIEW_MIN_CHARS, IMPORT_ROLES, LEVEL_ORDER, LEVEL_STYLE,
  logLevel,
  nodeEnv, POKER_NETWORKS, prodLogger, SENSITIVE_KEYS,
  sharkScopeAppKey,
  sharkScopeAppName,
  sharkScopePasswordHash,
  sharkScopeUsername,
  STAFF_WRITE_ROLES, STATUS_CONFIG, SUPER_ADMIN_EMAIL,
} from "@/lib/constants";
import { NextResponse } from "next/server";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import crypto from "node:crypto";
import DOMPurify from "isomorphic-dompurify";
import type { AppSession } from "@/lib/auth/session";
import { StrengthLevel } from "@/lib/auth/password-policy";
import { parseJson } from "./parse";

// ─── CSS / Tailwind ───────────────────────────────────────────────────────────

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// ─── Text Sanitization ────────────────────────────────────────────────────────

export function sanitizeText(input: string, maxLen: number): string {
  const s = input.replace(CTRL, "").trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

export function sanitizeOptional(input: string | null | undefined, maxLen: number): string | null {
  if (input == null || input === "") return null;
  const s = sanitizeText(input, maxLen);
  return s === "" ? null : s;
}

export const sanitizeUserHtml = (dirty: string) =>
  DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });

// ─── Auth / Permissions ───────────────────────────────────────────────────────

export const canWriteOperations = (s: AppSession) => STAFF_WRITE_ROLES.includes(s.role);
export const canManageGrades = (s: AppSession) => GRADE_ADMIN_ROLES.includes(s.role);
export const canEditGradeCoachNote = canWriteOperations;
export const canReview = canWriteOperations;
export const canDeleteImports = canWriteOperations;

export const canViewPlayer = (
  session: { role: string; coachId?: string | null; playerId?: string | null },
  player: { id: string; coachId: string | null; driId: string | null }
) => {
  const viewAllRoles: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER];
  if (viewAllRoles.includes(session.role as UserRole)) return true;
  if (session.role === UserRole.COACH && session.coachId)
    return player.coachId === session.coachId || player.driId === session.coachId;
  if (session.role === UserRole.PLAYER) return session.playerId === player.id;
  return false;
};

export function canManagePlayerProfile(
  session: AppSession,
  player: { coachId: string | null; driId: string | null }
): boolean {
  if (session.role === UserRole.ADMIN || session.role === UserRole.MANAGER) return true;
  return session.role === UserRole.COACH && !!session.coachId &&
    (player.coachId === session.coachId || player.driId === session.coachId);
}

/** Factory de asserts de permissão — lança FORBIDDEN se o predicado falhar */
const assertCan = (predicate: (s: AppSession) => boolean) => (s: AppSession) => {
  if (!predicate(s)) throw new Error(ErrorTypes.FORBIDDEN);
};

export const assertCanWrite        = assertCan(canWriteOperations);
export const assertCanManageGrades = assertCan(canManageGrades);
export const assertCanReview       = assertCan(canReview);
export const assertCanImport       = assertCan(s => IMPORT_ROLES.includes(s.role));

export const isSharkscopeStaffRole = (role: UserRole) => STAFF_WRITE_ROLES.includes(role);
export const isScoutingStaffRole   = (role: UserRole) => GRADE_ADMIN_ROLES.includes(role);

// ─── Auth Utilities ───────────────────────────────────────────────────────────

export const normalizeAuthEmail = (raw: string) => raw.toLowerCase().trim();
export const isSuperAdminEmail  = (email: string) => normalizeAuthEmail(email) === SUPER_ADMIN_EMAIL;
export const generateOTP        = () => Math.floor(100000 + Math.random() * 900000).toString();

export function isNextRedirectError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const digest = (err as { digest?: string }).digest;
  return err.message === "NEXT_REDIRECT" ||
    (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT"));
}

// ─── Severity Thresholds ──────────────────────────────────────────────────────

type Severity = "red" | "yellow" | "green";
type Threshold = [number, Severity];

function thresholdSeverity(value: number, thresholds: Threshold[], above: boolean): Severity {
  for (const [limit, sev] of thresholds) {
    if (above ? value > limit : value < limit) return sev;
  }
  return "green";
}

const mkSeverity = (thresholds: Threshold[], above: boolean) => (value: number) =>
  thresholdSeverity(value, thresholds, above);

export const roiSeverity = mkSeverity([[-40, "red"], [-20, "yellow"]], false);
export const reentrySeverity = mkSeverity([[25, "red"], [18, "yellow"]], true);
export const earlyFinishSeverity = mkSeverity([[8, "red"], [6, "yellow"]], true);
export const lateFinishSeverity = mkSeverity([[8, "red"], [10, "yellow"]], false);

// ─── Password Strength ────────────────────────────────────────────────────────

const STRENGTH_STYLES = Object.fromEntries(
  (
    [
      ["empty", "bg-zinc-600", "text-zinc-500"],
      ["weak", "bg-red-500", "text-red-400"],
      ["fair", "bg-amber-400", "text-amber-400"],
      ["good", "bg-lime-500", "text-lime-400"],
      ["strong", "bg-emerald-500", "text-emerald-400"],
    ] as const satisfies readonly (readonly [StrengthLevel, string, string])[]
  ).map(([k, bar, label]) => [k, { bar, label }]),
) as Record<StrengthLevel, { bar: string; label: string }>;

export const barColor = (level: StrengthLevel) => STRENGTH_STYLES[level]?.bar ?? "bg-zinc-600";
export const labelColor = (level: StrengthLevel) => STRENGTH_STYLES[level]?.label ?? "text-zinc-500";

// ─── Lobbyze Helpers ──────────────────────────────────────────────────────────

export const normText = (t: string) => t.toLowerCase().trim();

export const isTextSelected = (list: LobbyzeFilterItem[], opt: LobbyzeFilterItem) =>
  list.some(x => normText(x.item_text) === normText(opt.item_text));

export function mergeOptions(presets: LobbyzeFilterItem[], current: LobbyzeFilterItem[]): LobbyzeFilterItem[] {
  const m = new Map<string, LobbyzeFilterItem>();
  [...presets, ...current].forEach(item => m.set(normText(item.item_text), item));
  return [...m.values()].sort((a, b) => a.item_text.localeCompare(b.item_text));
}

export const formatList = (jsonObj: unknown): string => {
  if (!jsonObj) return "Todos";
  try {
    const arr = typeof jsonObj === "string" ? JSON.parse(jsonObj) : jsonObj;
    if (!Array.isArray(arr) || arr.length === 0) return "Todos";
    return (arr as LobbyzeFilterItem[]).map(i => i.item_text).join(", ");
  } catch { return "Todos"; }
};

export const formatBuyIn = (min: number | null, max: number | null) => {
  if (min === null && max === null) return "Qualquer";
  if (min !== null && max === null) return `+$${min}`;
  if (min === null && max !== null) return `Até $${max}`;
  return `$${min} - $${max}`;
};

export function matchesExcludePattern(name: string, pattern: string): boolean {
  if (!pattern) return false;
  const lower = name.toLowerCase();
  return pattern.split("|").map(p => p.trim().toLowerCase()).some(p => lower.includes(p));
}

export function matchesSpeed(speed: string | undefined, ruleSpeed: LobbyzeFilterItem[] | null): boolean {
  if (!ruleSpeed || ruleSpeed.length === 0) return true;
  if (!speed) return false;
  return ruleSpeed.some(s => s.item_text.toLowerCase() === speed.toLowerCase());
}

const SITE_NAME_STRIP = ["network", "poker"] as const;

export function normalizeSiteName(name: string): string {
  let s = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const tok of SITE_NAME_STRIP) s = s.replace(tok, "");
  return s;
}

// ─── Filter Options ───────────────────────────────────────────────────────────

export function filterOptionPreviewText(opt: { value: string; label: string }): string {
  if (opt.label.endsWith("…") || opt.label.endsWith("...")) return opt.value;
  return opt.value.length > opt.label.length ? opt.value : opt.label;
}

export const filterOptionNeedsHoverPreview = (opt: { value: string; label: string }) =>
  filterOptionPreviewText(opt).length > HOVER_PREVIEW_MIN_CHARS;

// ─── Grade Utilities ──────────────────────────────────────────────────────────

const RULE_LOBBYZE_JSON_KEYS = [
  "sites",
  "speed",
  "variant",
  "tournamentType",
  "gameType",
  "playerCount",
  "weekDay",
] as const;

export function mapPrismaRuleToCard(rule: {
  id: string; filterName: string; lobbyzeFilterId: number | null;
  sites: unknown; buyInMin: number | null; buyInMax: number | null;
  speed: unknown; variant: unknown; tournamentType: unknown;
  gameType: unknown; playerCount: unknown; weekDay: unknown;
  prizePoolMin: number | null; prizePoolMax: number | null;
  minParticipants: number | null; fromTime: string | null; toTime: string | null;
  excludePattern: string | null; timezone: number | null;
  autoOnly: boolean; manualOnly: boolean;
}): GradeRuleCardRule {
  const j = (v: unknown) => parseJson<LobbyzeFilterItem>(v);
  const parsed = Object.fromEntries(RULE_LOBBYZE_JSON_KEYS.map((k) => [k, j(rule[k])])) as Pick<
    GradeRuleCardRule,
    (typeof RULE_LOBBYZE_JSON_KEYS)[number]
  >;
  return {
    id: rule.id,
    filterName: rule.filterName,
    lobbyzeFilterId: rule.lobbyzeFilterId,
    buyInMin: rule.buyInMin,
    buyInMax: rule.buyInMax,
    prizePoolMin: rule.prizePoolMin,
    prizePoolMax: rule.prizePoolMax,
    minParticipants: rule.minParticipants,
    fromTime: rule.fromTime,
    toTime: rule.toTime,
    excludePattern: rule.excludePattern,
    timezone: rule.timezone,
    autoOnly: rule.autoOnly,
    manualOnly: rule.manualOnly,
    ...parsed,
  };
}

export function descriptionPick(r: GradeListRow) {
  const raw = r.description?.trim() ?? "";
  return {
    value: raw || EMPTY_DESC,
    label: raw ? (raw.length > 80 ? `${raw.slice(0, 80)}…` : raw) : "(sem descrição)",
  };
}

// ─── Target Utilities ─────────────────────────────────────────────────────────

export function progressLabel(r: TargetListRow): string {
  if (r.targetType === "NUMERIC" && r.numericValue != null)
    return `${r.numericCurrent ?? "—"} / ${r.numericValue}${r.unit ? ` ${r.unit}` : ""}`;
  if (r.targetType === "TEXT")
    return `${r.textCurrent ?? "—"} / ${r.textValue ?? "—"}`;
  return "—";
}

export const statusLabel = (s: TargetListRow["status"]) => STATUS_CONFIG[s].label;

const TIER_UPPER: [number, "Low" | "Mid" | "High"][] = [
  [15, "Low"],
  [50, "Mid"],
];

export const classifyTier = (stake: number | null): "Low" | "Mid" | "High" | null => {
  if (stake === null) return null;
  for (const [max, tier] of TIER_UPPER) {
    if (stake < max) return tier;
  }
  return "High";
};

// ─── Distinct Options ─────────────────────────────────────────────────────────

export function distinctOptions<T>(rows: T[], pick: (r: T) => { value: string; label: string }) {
  const map = new Map<string, string>();
  for (const r of rows) {
    const { value, label } = pick(r);
    if (!map.has(value)) map.set(value, label);
  }
  return [...map.entries()]
    .sort(([, a], [, b]) => a.localeCompare(b, "pt-BR"))
    .map(([value, label]) => ({ value, label }));
}

// ─── App / URL ────────────────────────────────────────────────────────────────

export const redirectTo = (baseUrl: string, path: string) =>
  NextResponse.redirect(new URL(path, baseUrl));

export function getAppBaseUrl(): string {
  const pub = globalThis.process?.env?.["NEXT_PUBLIC_APP_URL"]?.replace(/\/$/, "");
  if (pub) return pub;
  const vercel = globalThis.process?.env?.["VERCEL_URL"];
  return vercel ? `https://${vercel}` : "";
}

export function buildNetworkOptions(): PokerNetworkOption[] {
  return Object.entries(POKER_NETWORKS).map(([value, v]) => ({ value, label: v.label }));
}

export function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}min`;
  if (h < 24) return `${h}h`;
  if (d === 1) return "ontem";
  return format(new Date(date), "dd/MM", { locale: ptBR });
}

export function getInitials(email: string): string {
  const local = email.split("@")[0] ?? "";
  const clean = local.replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length >= 2) return clean.slice(0, 2).toUpperCase();
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase() || "?";
}

// ─── SharkScope Client ────────────────────────────────────────────────────────

export function encodeSharkScopePassword(): string {
  const combined = sharkScopePasswordHash!.toLowerCase() + sharkScopeAppKey!;
  return crypto.createHash("md5").update(combined).digest("hex").toLowerCase();
}

export const sharkScopeBaseUrl = () =>
  `https://www.sharkscope.com/api/${sharkScopeAppName}`;

export const sharkScopeHeaders = (): HeadersInit => ({
  Accept: "application/json",
  "User-Agent": "CLTeamApp/1.0",
  Username: sharkScopeUsername!,
  Password: encodeSharkScopePassword(),
});

export function sharkScopeResponseErrorMessage(data: unknown): string | null {
  const r = (data as Record<string, unknown>)?.Response as Record<string, unknown> | undefined;
  if (!r) return null;
  if (r["@success"] !== "false" && r.success !== "false" && r["@success"] !== false) return null;
  const errEl = ((r.ErrorResponse as Record<string, unknown>)?.Error) as Record<string, unknown> | string | undefined;
  if (typeof errEl === "string") return errEl;
  if (errEl && typeof errEl === "object") {
    const msg = (errEl as Record<string, unknown>)["$"];
    if (typeof msg === "string") return msg;
  }
  return "SharkScope retornou success=false";
}

export async function sharkScopeGet<T = unknown>(path: string): Promise<SharkScopeResponse<T>> {
  const res = await fetch(`${sharkScopeBaseUrl()}${path}`, {
    headers: sharkScopeHeaders(),
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`SharkScope HTTP ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as SharkScopeResponse<T>;
  const err = sharkScopeResponseErrorMessage(data);
  if (err) throw new Error(`SharkScope: ${err}`);
  return data;
}

// ─── SharkScope Data Extraction ───────────────────────────────────────────────

function dig(obj: Record<string, unknown>, ...keys: string[]): unknown {
  return keys.reduce<unknown>((cur, k) =>
    cur && typeof cur === "object" ? (cur as Record<string, unknown>)[k] : undefined, obj);
}

function getStatArray(raw: unknown): StatisticJson[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  if ("Statistic" in obj) {
    const st = obj.Statistic;
    return Array.isArray(st) ? st as StatisticJson[]
      : st && typeof st === "object" ? [st as StatisticJson] : [];
  }
  return Array.isArray(raw) ? raw as StatisticJson[] : [];
}

const STAT_CONTAINER_PATHS = [
  ["Response", "PlayerResponse", "PlayerResults", "PlayerResult", "Statistics"],
  ["Response", "PlayerResponse", "PlayerResults", "PlayerResult", "Player", "Statistics"],
  ["Response", "PlayerResponse", "PlayerResults", "PlayerResult", "Statistic"],
  ["PlayerResponse", "PlayerResults", "PlayerResult", "Statistics"],
  ["PlayerResponse", "PlayerResults", "PlayerResult", "Player", "Statistics"],
  ["Statistics"],
  ["PlayerResults", "PlayerResult", "Statistics"],
] as const;

export function extractStat(rawData: unknown, statName: string): number | null {
  if (!rawData || typeof rawData !== "object") return null;
  const root = rawData as Record<string, unknown>;
  const want = statName.toLowerCase();
  const stats = STAT_CONTAINER_PATHS.reduce<unknown>(
    (acc, path) => acc ?? dig(root, ...(path as unknown as string[])),
    undefined,
  );

  const found = getStatArray(stats).find(s => {
    const raw = s["@name"] ?? s["@id"] ?? s.id;
    return (typeof raw === "string" ? raw : undefined)?.toLowerCase() === want;
  });
  if (!found) return null;
  const v = found.$;
  if (v === undefined || v === null) return null;
  const n = parseFloat(typeof v === "number" ? String(v) : v as string);
  return isNaN(n) ? null : n;
}

export function extractRemainingSearches(rawData: unknown): number | null {
  if (!rawData || typeof rawData !== "object") return null;
  const root = rawData as Record<string, unknown>;
  const r = dig(root, "Response", "UserInfo", "RemainingSearches") ?? dig(root, "Response", "RemainingSearches");
  if (r == null) return null;
  if (typeof r === "number") return r;
  const v = typeof r === "object" ? (r as Record<string, unknown>)["$"] : r;
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
}

const SCOUTING_STAT_EXTRACTS: [keyof ScoutingSearchStats, string][] = [
  ["roi", "AvROI"],
  ["profit", "TotalProfit"],
  ["count", "Count"],
  ["abi", "AvStake"],
  ["entrants", "AvEntrants"],
];

const EMPTY_SCOUTING_STATS: ScoutingSearchStats = {
  roi: null,
  profit: null,
  count: null,
  abi: null,
  entrants: null,
};

export function parseScoutingSearchPayload(raw: Record<string, unknown> | null): ScoutingSearchStats {
  if (!raw) return EMPTY_SCOUTING_STATS;
  return Object.fromEntries(
    SCOUTING_STAT_EXTRACTS.map(([k, name]) => [k, extractStat(raw, name)]),
  ) as ScoutingSearchStats;
}

export const parseScoutingSavedRaw = (rawData: unknown): ScoutingSearchStats =>
  parseScoutingSearchPayload(
    rawData && typeof rawData === "object" ? (rawData as Record<string, unknown>) : null
  );

export const sharkscopeStatsHasData = (stats: NetworkStat[]) =>
  stats.some(s => s.roi !== null || s.profit !== null);

export const pickSharkscopeStatsByPeriod = (
  period: SharkscopeAnalyticsPeriod, stats30d: NetworkStat[], stats90d: NetworkStat[]
) => period === "30d" ? stats30d : stats90d;

export function filterSharkscopeAlerts(alerts: SharkscopeAlertRow[], f: SharkscopeAlertFilters): SharkscopeAlertRow[] {
  return alerts.filter(a => {
    if (f.severity !== "all" && a.severity !== f.severity) return false;
    if (f.alertType !== "all" && a.alertType !== f.alertType) return false;
    if (f.ack === "unacknowledged" && a.acknowledged) return false;
    if (f.ack === "acknowledged" && !a.acknowledged) return false;
    return true;
  });
}

export const countUnacknowledgedAlerts = (alerts: SharkscopeAlertRow[]) =>
  alerts.reduce((n, a) => n + (a.acknowledged ? 0 : 1), 0);

// ─── Logger Internals ─────────────────────────────────────────────────────────

export function shouldEmit(scope: string, level: LogLevel): boolean {
  const min = LEVEL_ORDER[minLevelFromEnv()];
  return LEVEL_ORDER[level] >= min && (!ALLOWED_SCOPES || ALLOWED_SCOPES.has(scope));
}

export function minLevelFromEnv(): LogLevel {
  const raw = logLevel?.toLowerCase();
  if (raw === "debug" || raw === "warn" || raw === "error" || raw === "info") return raw;
  return nodeEnv === "production" ? "info" : "debug";
}

export function redactMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  return Object.fromEntries(
    Object.entries(meta).map(([k, v]) => [k, SENSITIVE_KEYS.has(k.toLowerCase()) ? "[REDACTED]" : v])
  );
}

export function shortTime(): string {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => String(n).padStart(2, "0"))
    .join(":") + "." + String(d.getMilliseconds()).padStart(3, "0");
}

export function formatMeta(meta: Record<string, unknown>): string {
  const parts = Object.entries(meta)
    .map(([k, v]) => {
      const val = typeof v === "object" ? JSON.stringify(v) : String(v);
      return `${ANSI.dim}${k}${ANSI.reset}${ANSI.grey}=${ANSI.reset}${ANSI.white}${val}${ANSI.reset}`;
    })
    .join("  ");
  return parts ? `  ${parts}` : "";
}

export function devLine(scope: string, level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const { color, emoji, label } = LEVEL_STYLE[level];
  const ts  = `${ANSI.dim}${shortTime()}${ANSI.reset}`;
  const tag = `${color}${ANSI.bold}${emoji} ${label}${ANSI.reset}`;
  const sc  = `${ANSI.blue}[${scope}]${ANSI.reset}`;
  const msg = `${color}${message}${ANSI.reset}`;
  const metaStr = meta && Object.keys(meta).length > 0 ? formatMeta(meta) : "";
  return `${ts} ${tag} ${sc} ${msg}${metaStr}`;
}

export function emit(scope: string, level: LogLevel, message: string, meta?: Record<string, unknown>, err?: unknown): void {
  if (!shouldEmit(scope, level)) return;
  const safeMeta = redactMeta(meta);

  if (prodLogger) {
    const data = {
      scope, msg: message, level, ...safeMeta,
      ...(err instanceof Error
        ? { errName: err.name, errMessage: err.message }
        : err !== undefined ? { err: String(err) } : {}),
    };
    (level === "error" ? prodLogger.error : level === "warn" ? prodLogger.warn : prodLogger.info).call(
      prodLogger,
      data,
    );
    return;
  }

  const line = devLine(scope, level, message, safeMeta);
  const log =
    level === "error" ? console.error : level === "warn" ? console.warn : level === "debug" ? console.debug : console.info;
  if (level === "error" && err instanceof Error && err.stack) {
    log(line, `\n${ANSI.dim}${err.stack}${ANSI.reset}`);
  } else {
    log(line);
  }
}
