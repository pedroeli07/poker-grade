import { 
   pillClass, 
   roiClass, 
   statBadgeAmber,
   statBadgeEmerald, 
   statBadgeMuted, 
   statBadgeRed, 
   NONE,
   getPokerstarsMainNickFromRows,
} from "@/lib/constants";
import {
  PLAYER_AVATAR_COLOR_CLASS,
  PLAYERS_TABLE_FILTER_NUMERIC_COLUMNS,
  PLAYERS_TABLE_FILTER_SUMMARY_COLUMNS,
  PLAYERS_TABLE_ROW_LABELS,
} from "@/lib/constants/player";
import {
  PLAYERS_TABLE_FP_ATTENTION_THRESHOLD,
  PLAYERS_TABLE_FT_LOW_THRESHOLD,
  PLAYERS_TABLE_ROI_BADGE_THRESHOLDS,
  PLAYERS_TABLE_SORT_LABELS,
} from "@/lib/constants/players-table-ui";
import { NumberFilterValue, OP_LABELS, formatNumberValue, isFilterActive } from "@/lib/number-filter";
import type { PlayerRowInput, PlayerTableRow, PlayersTableColumnFilters, PlayersTableFilterOptions } from "@/lib/types";
import type { PlayerNickFormRow, PlayersTableSortKey } from "@/lib/types/player";
import type { SortDir } from "@/lib/table-sort";
import { 
  DELETE_PLAYER_ERROR_MESSAGES, 
  DELETE_PLAYER_GENERIC_ERROR, 
  PLAYER_ABI_ALVO_CURRENCY_PREFIXES, 
  PLAYER_ABI_ALVO_MAX_NUMERIC, 
  PLAYER_ABI_ALVO_TARGET_NAME_REGEX, 
  PLAYER_ABI_ALVO_UNIT_MAX_LEN,
} from "@/lib/constants/player";

function updateNickNetworkAt(
  rows: PlayerNickFormRow[],
  index: number,
  network: string
): PlayerNickFormRow[] {
  const next = [...rows];
  next[index] = { ...next[index], network };
  if ((network === "pokerstars_fr" || network === "pokerstars_es") && !next[index].nick.trim()) {
    const main = getPokerstarsMainNickFromRows(next);
    if (main) next[index] = { ...next[index], nick: main };
  }
  return next;
}

function updateNickValueAt(
  rows: PlayerNickFormRow[],
  index: number,
  nick: string
): PlayerNickFormRow[] {
  const next = [...rows];
  next[index] = { ...next[index], nick };
  return next;
}

function removeNickRowAt(rows: PlayerNickFormRow[], index: number): PlayerNickFormRow[] {
  return rows.filter((_, i) => i !== index);
}

function appendEmptyNickRow(rows: PlayerNickFormRow[]): PlayerNickFormRow[] {
  return [...rows, { network: "", nick: "" }];
}


function formatNumberFilterSummary(v: NumberFilterValue, suffix: string): string {
  if (v.op === "in" && v.values && v.values.length > 0) {
    return v.values.map((x) => formatNumberValue(x, suffix)).join(", ");
  }
  if (v.op === "between") {
    if (v.min !== null && v.max !== null) {
      return `${formatNumberValue(v.min, suffix)} – ${formatNumberValue(v.max, suffix)}`;
    }
    if (v.min !== null) return `≥ ${formatNumberValue(v.min, suffix)}`;
    if (v.max !== null) return `≤ ${formatNumberValue(v.max, suffix)}`;
  }
  if (v.op === "eq" && v.min !== null) {
    return `= ${formatNumberValue(v.min, suffix)}`;
  }
  if (v.min !== null) {
    return `${OP_LABELS[v.op]} ${formatNumberValue(v.min, suffix)}`;
  }
  return "";
}

function formatPlayersTableRoiPercent(roi: number): string {
  return `${roi.toFixed(1)}%`;
}

function playersTableRoiBadgeClassNames(roi: number): string {
  const base = roiClass;
  const t = PLAYERS_TABLE_ROI_BADGE_THRESHOLDS;
  if (roi < t.strongNegative) return `${base} ${statBadgeRed}`;
  if (roi < t.softNegative) return `${base} ${statBadgeAmber}`;
  if (roi >= 0) return `${base} ${statBadgeEmerald}`;
  return `${base} ${statBadgeMuted}`;
}

function playersTableRoiDisplayText(roi: number): string {
  const pct = formatPlayersTableRoiPercent(roi);
  return roi >= 0 ? `+${pct}` : pct;
}

function playersTableFpTenDayClassName(value: number): string {
  return `${pillClass} ${
    value > PLAYERS_TABLE_FP_ATTENTION_THRESHOLD ? statBadgeAmber : statBadgeEmerald
  }`;
}

function playersTableFtTenDayClassName(value: number): string {
  return `${pillClass} ${
    value < PLAYERS_TABLE_FT_LOW_THRESHOLD ? statBadgeRed : statBadgeEmerald
  }`;
}

function formatPlayersTableSortSummary(
  sort: { key: PlayersTableSortKey; dir: SortDir } | null
): string | null {
  if (!sort) return null;
  const label = PLAYERS_TABLE_SORT_LABELS[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
  return `${label} (${dirPt})`;
}

function deletePlayerActionErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return DELETE_PLAYER_ERROR_MESSAGES[err.message] ?? DELETE_PLAYER_GENERIC_ERROR;
  }
  return DELETE_PLAYER_GENERIC_ERROR;
}

function formatAbiAlvo(value: number, unit: string | null): string {
  const u = unit?.trim() ?? "";
  return PLAYER_ABI_ALVO_CURRENCY_PREFIXES.has(u) ? `${u}${value}` : u ? `${value} ${u}` : String(value);
}

function isAbiAlvoTargetName(name: string): boolean {
  return PLAYER_ABI_ALVO_TARGET_NAME_REGEX.test(name.trim());
}

function parseAbiAlvoInput(valueRaw?: string | null, unitRaw?: string | null) {
  const value = String(valueRaw ?? "").trim().replace(/\s/g, "").replace(",", ".");
  const unit = (unitRaw ?? "").trim();

  if (!value) return { ok: true, value: null, unit: null };

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > PLAYER_ABI_ALVO_MAX_NUMERIC) {
    return { ok: false, message: "ABI alvo inválido." };
  }

  return {
    ok: true,
    value: parsed,
    unit: unit && unit !== "none" ? unit.slice(0, PLAYER_ABI_ALVO_UNIT_MAX_LEN) : null,
  };
}

function buildAbiByPlayer(
  targets: Array<{
    playerId: string;
    name: string;
    numericValue: number | null;
    unit: string | null;
  }>
) {
  const map = new Map<string, { numericValue: number; unit: string | null }>();

  for (const t of targets) {
    if (!t.numericValue || !isAbiAlvoTargetName(t.name) || map.has(t.playerId)) continue;
    map.set(t.playerId, { numericValue: t.numericValue, unit: t.unit });
  }

  return map;
}

function toTableRows(
  players: PlayerRowInput[],
  abiByPlayer: Map<string, { numericValue: number; unit: string | null }>
): PlayerTableRow[] {
  const L = PLAYERS_TABLE_ROW_LABELS;
  return players.map((player) => {
    const mainGrade = player.gradeAssignments[0]?.gradeProfile;
    const abi = abiByPlayer.get(player.id);

    return {
      id: player.id,
      name: player.name,
      nickname: player.nickname,
      email: player.email ?? null,
      coachKey: player.coachId ?? NONE,
      coachLabel: player.coach?.name ?? L.noCoach,
      gradeKey: mainGrade?.id ?? NONE,
      gradeLabel: mainGrade?.name ?? L.noGrade,
      abiKey: abi ? `v-${abi.numericValue}` : NONE,
      abiLabel: abi ? formatAbiAlvo(abi.numericValue, abi.unit) : L.abiEmpty,
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

function buildAssignedPlayersByGrade(
  assignments: {
    gradeId: string;
    player: { id: string; name: string };
  }[]
) {
  const map = new Map<string, Map<string, { id: string; name: string }>>();

  for (const { gradeId, player } of assignments) {
    if (!map.has(gradeId)) map.set(gradeId, new Map());
    map.get(gradeId)!.set(player.id, player);
  }

  return new Map(
    Array.from(map.entries(), ([id, players]) => [
      id,
      Array.from(players.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    ])
  );
}

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const avatarColor = () => PLAYER_AVATAR_COLOR_CLASS;

const schedulingCategory = (scheduling: string | null) => {
  const s = scheduling?.toLowerCase() ?? "";
  if (s.includes("extra")) return "extra";
  if (s === "played" || s === "jogado") return "played";
  return "missed";
};

const filterNicksExcludingPlayerGroup = <T extends { network: string }>(nicks?: T[]) =>
  nicks?.filter((n) => n.network !== "PlayerGroup") ?? [];

function createLabelMap(opts: { value: string; label: string }[]) {
  return new Map(opts.map((o) => [o.value, o.label]));
}

function labelsFromSet(set: Set<string>, map: Map<string, string>) {
  if (!set.size) return "(nenhum valor selecionado)";
  return [...set].map((v) => map.get(v) ?? v).join(", ");
}

function buildPlayersFilterSummaryLines(
  filters: PlayersTableColumnFilters,
  options: PlayersTableFilterOptions,
  numFilters: Record<string, NumberFilterValue | null | undefined>
): string[] {
  const lines: string[] = [];

  for (const [key, label] of PLAYERS_TABLE_FILTER_SUMMARY_COLUMNS) {
    const col = key as keyof PlayersTableFilterOptions;
    const value = filters[col];
    if (value !== null) {
      const map = createLabelMap(options[col]);
      lines.push(`${label}: ${labelsFromSet(value, map)}`);
    }
  }

  for (const [key, label, suffix] of PLAYERS_TABLE_FILTER_NUMERIC_COLUMNS) {
    const f = numFilters[key];
    if (f && isFilterActive(f)) {
      lines.push(`${label}: ${formatNumberFilterSummary(f, suffix)}`);
    }
  }

  return lines;
}

export {
  updateNickNetworkAt,
  updateNickValueAt,
  removeNickRowAt,
  appendEmptyNickRow,
  formatNumberFilterSummary,
  formatPlayersTableRoiPercent,
  playersTableRoiBadgeClassNames,
  playersTableRoiDisplayText,
  playersTableFpTenDayClassName,
  playersTableFtTenDayClassName,
  formatPlayersTableSortSummary,
  deletePlayerActionErrorMessage,
  formatAbiAlvo,
  parseAbiAlvoInput,
  isAbiAlvoTargetName,
  buildAbiByPlayer,
  toTableRows,
  buildAssignedPlayersByGrade,
  initials,
  avatarColor,
  schedulingCategory,
  filterNicksExcludingPlayerGroup,
  buildPlayersFilterSummaryLines,
};