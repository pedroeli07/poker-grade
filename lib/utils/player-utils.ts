import type { PlayerRowInput, PlayerTableRow } from "@/lib/types";
import { NONE } from "@/lib/constants";

const CURRENCY_PREFIX = new Set(["$", "€", "¥"]);

export function formatAbiAlvo(value: number, unit: string | null): string {
  const u = unit?.trim() ?? "";
  if (CURRENCY_PREFIX.has(u)) return `${u}${value}`;
  return u ? `${value} ${u}`.trim() : String(value);
}

export const isAbiAlvoTargetName = (name: string) => /\babi\b/i.test(name.trim());

export function parseAbiAlvoInput(
  valueRaw: string | undefined | null,
  unitRaw: string | undefined | null
): { ok: true; value: number | null; unit: string | null } | { ok: false; message: string } {
  const v = String(valueRaw ?? "").trim().replace(/\s/g, "").replace(",", ".");
  const u = String(unitRaw ?? "").trim();
  const unit = u === "" || u === "none" ? null : u.slice(0, 30);
  if (v === "") return { ok: true, value: null, unit: null };
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000) return { ok: false, message: "ABI alvo inválido." };
  return { ok: true, value: n, unit };
}

export function buildAbiByPlayer(
  targets: Array<{ playerId: string; name: string; numericValue: number | null; unit: string | null }>
): Map<string, { numericValue: number; unit: string | null }> {
  const map = new Map<string, { numericValue: number; unit: string | null }>();
  for (const t of targets) {
    if (t.numericValue == null || !isAbiAlvoTargetName(t.name) || map.has(t.playerId)) continue;
    map.set(t.playerId, { numericValue: t.numericValue, unit: t.unit });
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
    return {
      id: player.id,
      name: player.name,
      nickname: player.nickname,
      email: player.email ?? null,
      coachKey: player.coachId ?? NONE,
      coachLabel: player.coach?.name ?? "Sem Coach",
      gradeKey: mainGrade?.id ?? NONE,
      gradeLabel: mainGrade?.name ?? "Não atribuída",
      abiKey: abi ? `v-${abi.numericValue}` : NONE,
      abiLabel: abi ? formatAbiAlvo(abi.numericValue, abi.unit) : "—",
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
  assignments: { gradeId: string; player: { id: string; name: string } }[]
): Map<string, { id: string; name: string }[]> {
  const m = new Map<string, Map<string, { id: string; name: string }>>();
  for (const { gradeId, player } of assignments) {
    if (!m.has(gradeId)) m.set(gradeId, new Map());
    m.get(gradeId)!.set(player.id, player);
  }
  return new Map(
    [...m.entries()].map(([id, pmap]) => [
      id,
      [...pmap.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    ])
  );
}

export const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const avatarColor = () => "bg-primary/15 text-primary";

export const schedulingCategory = (scheduling: string | null) => {
  const s = (scheduling ?? "").toLowerCase();
  if (s.includes("extra")) return "extra";
  if (s === "played" || s === "jogado") return "played";
  return "missed";
};
