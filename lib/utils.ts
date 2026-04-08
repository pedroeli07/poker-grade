import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Prisma, UserRole } from "@prisma/client";
import { GradeListRow, ImportListRow, LobbyzeFilterItem, PlayerRowInput, PokerNetworkOption, ReviewItem, SharkScopeResponse } from "./types";
import { EMPTY_DESC, GRADE_ADMIN_ROLES, IMPORT_ROLES, NONE, POKER_NETWORKS, STAFF_WRITE_ROLES, STATUS_CONFIG } from "./constants";
import { TargetListRow, PlayerTableRow } from "./types";
import { NextResponse } from "next/server";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import crypto from "node:crypto";
import DOMPurify from "isomorphic-dompurify";
import { AppSession } from "./auth/session";

export function isNextRedirectError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const digest = (err as { digest?: string }).digest;
  return (
    err.message === "NEXT_REDIRECT" ||
    (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT"))
  );
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatList = (jsonObj: unknown) => {
  if (!jsonObj) return "Todos";
  try {
    const arr = typeof jsonObj === "string" ? JSON.parse(jsonObj) : jsonObj;
    if (!Array.isArray(arr) || arr.length === 0) return "Todos";
    return arr.map((item: LobbyzeFilterItem) => item.item_text).join(", ");
  } catch {
    return "Todos";
  }
};

export const formatBuyIn = (min: number | null, max: number | null) => {
  if (min === null && max === null) return "Qualquer";
  if (min !== null && max === null) return `+$${min}`;
  if (min === null && max !== null) return `Até $${max}`;
  return `$${min} - $${max}`;
};

export const canViewPlayer = (
  session: { role: string; coachId?: string | null; playerId?: string | null },
  player: { id: string; coachId: string | null; driId: string | null }
) => {
  if (
    session.role === "ADMIN" ||
    session.role === "MANAGER" ||
    session.role === "VIEWER"
  )
    return true;
  if (session.role === "COACH" && session.coachId)
    return (
      player.coachId === session.coachId || player.driId === session.coachId
    );
  if (session.role === "PLAYER") return session.playerId === player.id;
  return false;
};

/** Edição de perfil / grades do jogador no UI (server-only; APIs revalidam de novo). */
export function canManagePlayerProfile(
  session: AppSession,
  player: { coachId: string | null; driId: string | null }
): boolean {
  if (session.role === "ADMIN" || session.role === "MANAGER") return true;
  if (session.role === "COACH" && session.coachId) {
    return (
      player.coachId === session.coachId || player.driId === session.coachId
    );
  }
  return false;
}

export function schedulingCategory(scheduling: string | null) {
  const s = (scheduling ?? "").toLowerCase();
  if (s.includes("extra")) return "extra";
  if (s === "played" || s === "jogado") return "played";
  return "missed";
}

export function formatAbiAlvo(value: number, unit: string | null): string {
  const u = unit?.trim() ?? "";
  if (u === "$" || u === "€" || u === "¥") return `${u}${value}`;
  if (u) return `${value} ${u}`.trim();
  return String(value);
}

export function buildAbiByPlayer(
  targets: Array<{
    playerId: string;
    name: string;
    numericValue: number | null;
    unit: string | null;
  }>
): Map<string, { numericValue: number; unit: string | null }> {
  const map = new Map<string, { numericValue: number; unit: string | null }>();
  for (const t of targets) {
    if (t.numericValue == null) continue;
    if (!/\babi\b/i.test(t.name.trim())) continue;
    if (!map.has(t.playerId)) {
      map.set(t.playerId, { numericValue: t.numericValue, unit: t.unit });
    }
  }
  return map;
}

export function toTableRows(
  players: PlayerRowInput[],
  abiByPlayer: Map<string, { numericValue: number; unit: string | null }>
): PlayerTableRow[] {
  return players.map((player) => {
    const mainGrade = player.gradeAssignments[0]?.gradeProfile;
    const abi = abiByPlayer.get(player.id);
    const abiKey = abi ? `v-${abi.numericValue}` : NONE;
    const abiLabel = abi ? formatAbiAlvo(abi.numericValue, abi.unit) : "—";
    return {
      id: player.id,
      name: player.name,
      nickname: player.nickname,
      email: player.email ?? null,
      coachKey: player.coachId ?? NONE,
      coachLabel: player.coach?.name ?? "Sem Coach",
      gradeKey: mainGrade?.id ?? NONE,
      gradeLabel: mainGrade?.name ?? "Não atribuída",
      abiKey,
      abiLabel,
      abiNumericValue: abi?.numericValue ?? null,
      abiUnit: abi?.unit ?? null,
      status: player.status,
      playerGroup: player.playerGroup ?? null,
      roiTenDay: null,
      fpTenDay: null,
      ftTenDay: null,
      nicks: player.nicks ?? [],
    };
  });
}


export function buildAssignedPlayersByGrade(
  assignments: {
    gradeId: string;
    player: { id: string; name: string };
  }[]
) {
  const m = new Map<string, Map<string, { id: string; name: string }>>();
  for (const a of assignments) {
    if (!m.has(a.gradeId)) m.set(a.gradeId, new Map());
    m.get(a.gradeId)!.set(a.player.id, {
      id: a.player.id,
      name: a.player.name,
    });
  }
  const out = new Map<string, { id: string; name: string }[]>();
  for (const [gradeId, pmap] of m) {
    out.set(
      gradeId,
      [...pmap.values()].sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR")
      )
    );
  }
  return out;
}


export function descriptionPick(r: GradeListRow) {
  const raw = r.description?.trim() ?? "";
  const value = raw || EMPTY_DESC;
  const label = raw
    ? raw.length > 80
      ? `${raw.slice(0, 80)}…`
      : raw
    : "(sem descrição)";
  return { value, label };
}


export function progressLabel(r: TargetListRow) {
  if (r.targetType === "NUMERIC" && r.numericValue != null) {
    return `${r.numericCurrent ?? "—"} / ${r.numericValue}${r.unit ? ` ${r.unit}` : ""}`;
  }
  if (r.targetType === "TEXT") {
    const cur = r.textCurrent ?? "—";
    const val = r.textValue ?? "—";
    return `${cur} / ${val}`;
  }
  return "—";
}

export function statusLabel(s: TargetListRow["status"]) {
  return STATUS_CONFIG[s].label;
}

export function distinctOptions<T>(
  rows: T[],
  pick: (r: T) => { value: string; label: string }
): { value: string; label: string }[] {
  const map = new Map<string, string>();
  for (const r of rows) {
    const { value, label } = pick(r);
    if (!map.has(value)) map.set(value, label);
  }
  return [...map.entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "pt-BR"))
    .map(([value, label]) => ({ value, label }));
}

export function redirectTo(baseUrl: string, path: string) {
  return NextResponse.redirect(new URL(path, baseUrl));
}

export function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export function toPrismaJsonOptional(
  value: unknown | null | undefined
): Prisma.InputJsonValue | undefined {
  if (value == null) return undefined;
  return value as Prisma.InputJsonValue;
}

export function importRowDateLabel(r: ImportListRow) {
  return format(new Date(r.createdAt), "dd/MM/yyyy • HH:mm", { locale: ptBR });
}

export function groupByPlayer(reviews: ReviewItem[]) {
  const map = new Map<
    string,
    { player: ReviewItem["player"]; reviews: ReviewItem[] }
  >();
  for (const r of reviews) {
    const pid = r.player.id;
    if (!map.has(pid)) map.set(pid, { player: r.player, reviews: [] });
    map.get(pid)!.reviews.push(r);
  }
  return Array.from(map.values()).sort(
    (a, b) => b.reviews.length - a.reviews.length
  );
}

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function avatarColor() {
  return "bg-primary/15 text-primary";
}

export function isAbiAlvoTargetName(name: string): boolean {
  return /\babi\b/i.test(name.trim());
}

export function parseAbiAlvoInput(
  valueRaw: string | undefined | null,
  unitRaw: string | undefined | null
):
  | { ok: true; value: number | null; unit: string | null }
  | { ok: false; message: string } {
  const v = String(valueRaw ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".");
  const u = String(unitRaw ?? "").trim();
  const unit = u === "" || u === "none" ? null : u.slice(0, 30);
  if (v === "") {
    return { ok: true, value: null, unit: null };
  }
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000) {
    return { ok: false, message: "ABI alvo inválido." };
  }
  return { ok: true, value: n, unit };
}

export function encodeSharkScopePassword(): string {
  const hash1 = process.env.SHARKSCOPE_PASSWORD_HASH!.toLowerCase();
  const combined = hash1 + process.env.SHARKSCOPE_APP_KEY!;
  return crypto.createHash("md5").update(combined).digest("hex").toLowerCase();
}

export function sharkScopeHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "User-Agent": "CLTeamApp/1.0",
    Username: process.env.SHARKSCOPE_USERNAME!,
    Password: encodeSharkScopePassword(),
  };
}

export function sharkScopeBaseUrl(): string {
  return `https://www.sharkscope.com/api/${process.env.SHARKSCOPE_APP_NAME}`;
}


export function sharkScopeResponseErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const resp = (data as Record<string, unknown>).Response;
  if (!resp || typeof resp !== "object") return null;
  const r = resp as Record<string, unknown>;
  const failed =
    r["@success"] === "false" ||
    r.success === "false" ||
    r["@success"] === false;
  if (!failed) return null;

  const er = r.ErrorResponse;
  if (er && typeof er === "object") {
    const errEl = (er as Record<string, unknown>).Error;
    if (typeof errEl === "string") return errEl;
    if (errEl && typeof errEl === "object") {
      const msg = (errEl as Record<string, unknown>)["$"];
      if (typeof msg === "string") return msg;
    }
  }
  return "SharkScope retornou success=false";
}



export async function sharkScopeGet<T = unknown>(
  path: string
): Promise<SharkScopeResponse<T>> {
  const url = `${sharkScopeBaseUrl()}${path}`;
  const res = await fetch(url, {
    headers: sharkScopeHeaders(),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`SharkScope HTTP ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as SharkScopeResponse<T>;
  const bizErr = sharkScopeResponseErrorMessage(data);
  if (bizErr) {
    throw new Error(`SharkScope: ${bizErr}`);
  }

  return data;
}

export function buildNetworkOptions(): PokerNetworkOption[] {
  return Object.entries(POKER_NETWORKS).map(([value, v]) => ({
    value,
    label: v.label,
  }));
}

/** URL pública do app (links em e-mails / webhooks). */
export function getAppBaseUrl(): string {
  const pub = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (pub) return pub;
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "";
}



/**
 * HTML vindo de fontes não confiáveis (ex.: IA) antes de dangerouslySetInnerHTML.
 */
export function sanitizeUserHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
  });
}

export function canWriteOperations(session: AppSession): boolean {
  return STAFF_WRITE_ROLES.includes(session.role);
}

export function canManageGrades(session: AppSession): boolean {
  return GRADE_ADMIN_ROLES.includes(session.role);
}

/** Texto livre da grade (nota do coach) — admin, manager e coach. */
export function canEditGradeCoachNote(session: AppSession): boolean {
  return (
    session.role === "ADMIN" ||
    session.role === "MANAGER" ||
    session.role === "COACH"
  );
}

export function canReview(session: AppSession): boolean {
  return (
    session.role === "ADMIN" ||
    session.role === "MANAGER" ||
    session.role === "COACH"
  );
}

export function assertCanWrite(session: AppSession): void {
  if (!canWriteOperations(session)) {
    throw new Error("FORBIDDEN");
  }
}



export function assertCanImport(session: AppSession): void {
  if (!IMPORT_ROLES.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
}

export function canDeleteImports(session: AppSession): boolean {
  return (
    session.role === "ADMIN" ||
    session.role === "MANAGER" ||
    session.role === "COACH"
  );
}

export function assertCanManageGrades(session: AppSession): void {
  if (!canManageGrades(session)) {
    throw new Error("FORBIDDEN");
  }
}

export function assertCanReview(session: AppSession): void {
  if (!canReview(session)) {
    throw new Error("FORBIDDEN");
  }
}

/** Proxy SharkScope, nicks, NLQ e API de alertas (mesmo conjunto que STAFF_WRITE_ROLES). */
export function isSharkscopeStaffRole(role: UserRole): boolean {
  return STAFF_WRITE_ROLES.includes(role);
}

/** Scouting e buscas avulsas que consomem cota (Admin/Manager). */
export function isScoutingStaffRole(role: UserRole): boolean {
  return GRADE_ADMIN_ROLES.includes(role);
}
