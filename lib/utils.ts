import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PlayerStatus } from "@prisma/client";
import { GradeListRow, LobbyzeFilterItem } from "./types";
import { PlayerTableRow } from "./types/player-table-row";
import { EMPTY_DESC, STATUS_CONFIG } from "./constants";
import { TargetListRow } from "./types/target-list-row";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

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

const NONE = "__none__";

export type PlayerRowInput = {
  id: string;
  name: string;
  nickname: string | null;
  email: string | null;
  coachId: string | null;
  status: PlayerStatus;
  coach: { name: string } | null;
  gradeAssignments: Array<{ gradeProfile: { id: string; name: string } }>;
};

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

