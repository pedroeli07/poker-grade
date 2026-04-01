"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CalendarDays,
  Clock,
  DollarSign,
  Pencil,
  Tag,
  Timer,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { LobbyzeFilterItem } from "@/lib/types";
import {
  deleteGradeRule,
  updateGradeRule,
} from "@/app/dashboard/grades/actions";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export type GradeRuleCardRule = {
  id: string;
  filterName: string;
  lobbyzeFilterId: number | null;
  sites: LobbyzeFilterItem[];
  buyInMin: number | null;
  buyInMax: number | null;
  speed: LobbyzeFilterItem[];
  variant: LobbyzeFilterItem[];
  tournamentType: LobbyzeFilterItem[];
  gameType: LobbyzeFilterItem[];
  playerCount: LobbyzeFilterItem[];
  weekDay: LobbyzeFilterItem[];
  prizePoolMin: number | null;
  prizePoolMax: number | null;
  minParticipants: number | null;
  fromTime: string | null;
  toTime: string | null;
  excludePattern: string | null;
  timezone: number | null;
  autoOnly: boolean;
  manualOnly: boolean;
};

const SPEED_PRESETS: LobbyzeFilterItem[] = [
  { item_id: 1001, item_text: "Regular" },
  { item_id: 1002, item_text: "Turbo" },
  { item_id: 1003, item_text: "Slow" },
  { item_id: 1004, item_text: "Hyper Turbo" },
];

const TOURNAMENT_TYPE_PRESETS: LobbyzeFilterItem[] = [
  { item_id: 2001, item_text: "Regular" },
  { item_id: 2002, item_text: "Flight" },
];

const VARIANT_PRESETS: LobbyzeFilterItem[] = [
  { item_id: 3001, item_text: "Knockout" },
  { item_id: 3002, item_text: "Mystery Bounty" },
  { item_id: 3003, item_text: "Mystery" },
  { item_id: 3004, item_text: "Regular" },
  { item_id: 3005, item_text: "PKO" },
];

const GAME_TYPE_PRESETS: LobbyzeFilterItem[] = [
  { item_id: 4001, item_text: "NLH" },
  { item_id: 4002, item_text: "PLO" },
  { item_id: 4003, item_text: "PLO5" },
  { item_id: 4004, item_text: "NLH 6+" },
];

const PLAYER_COUNT_PRESETS: LobbyzeFilterItem[] = [
  { item_id: 5001, item_text: "Full Ring" },
  { item_id: 5002, item_text: "6-Max" },
  { item_id: 5003, item_text: "Heads Up" },
  { item_id: 5004, item_text: "8-Max" },
];

const WEEKDAY_PRESETS: LobbyzeFilterItem[] = [
  { item_id: 6001, item_text: "Monday" },
  { item_id: 6002, item_text: "Tuesday" },
  { item_id: 6003, item_text: "Wednesday" },
  { item_id: 6004, item_text: "Thursday" },
  { item_id: 6005, item_text: "Friday" },
  { item_id: 6006, item_text: "Saturday" },
  { item_id: 6007, item_text: "Sunday" },
];

function normText(t: string) {
  return t.toLowerCase().trim();
}

function mergeOptions(
  presets: LobbyzeFilterItem[],
  current: LobbyzeFilterItem[]
): LobbyzeFilterItem[] {
  const m = new Map<string, LobbyzeFilterItem>();
  for (const p of presets) m.set(normText(p.item_text), p);
  for (const c of current) m.set(normText(c.item_text), c);
  return [...m.values()].sort((a, b) =>
    a.item_text.localeCompare(b.item_text, "pt-BR", { sensitivity: "base" })
  );
}

function toggleByText(
  list: LobbyzeFilterItem[],
  opt: LobbyzeFilterItem,
  on: boolean
): LobbyzeFilterItem[] {
  const t = normText(opt.item_text);
  if (on) {
    if (list.some((x) => normText(x.item_text) === t)) return list;
    return [...list, opt];
  }
  return list.filter((x) => normText(x.item_text) !== t);
}

function isTextSelected(list: LobbyzeFilterItem[], opt: LobbyzeFilterItem) {
  return list.some((x) => normText(x.item_text) === normText(opt.item_text));
}

function MultiToggleRow({
  options,
  selected,
  onChange,
}: {
  options: LobbyzeFilterItem[];
  selected: LobbyzeFilterItem[];
  onChange: (next: LobbyzeFilterItem[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = isTextSelected(selected, opt);
        return (
          <button
            key={`${String(opt.item_id)}-${opt.item_text}`}
            type="button"
            onClick={() => onChange(toggleByText(selected, opt, !on))}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors select-none",
              on
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted/50"
            )}
          >
            {opt.item_text}
          </button>
        );
      })}
    </div>
  );
}

function InputEndPencil({ className }: { className?: string }) {
  return (
    <Pencil
      className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground/55", className)}
      aria-hidden
    />
  );
}

function LabeledTextRow({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div>{label}</div>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">{children}</div>
        <InputEndPencil className="self-center" />
      </div>
    </div>
  );
}

function Pills({
  items,
  variant = "variant",
}: {
  items: LobbyzeFilterItem[];
  variant?: "sites" | "speed" | "variant";
}) {
  if (!items.length)
    return (
      <span className="text-muted-foreground/50 text-sm">Todos</span>
    );

  const cls =
    variant === "sites"
      ? (text: string) =>
          text.toLowerCase().includes("pokerstars")
            ? "bg-blue-500/12 text-blue-600 border-blue-500/25"
            : "bg-blue-500/12 text-blue-600 border-blue-500/25"
      : variant === "speed"
        ? () => "bg-blue-500/12 text-blue-600 border-blue-500/25"
        : () => "bg-blue-500/12 text-blue-600 border-blue-500/25";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${cls(item.item_text)}`}
        >
          {item.item_text}
        </span>
      ))}
    </div>
  );
}

function BuyInRange({
  min,
  max,
}: {
  min: number | null;
  max: number | null;
}) {
  if (!min && !max)
    return (
      <span className="text-muted-foreground/50 text-sm">Sem restrição</span>
    );

  const pct = min && max ? ((min / max) * 100).toFixed(0) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-lg font-bold text-blue-400">
          ${min ?? "—"}
        </span>
        <span className="text-muted-foreground/60">—</span>
        <span className="font-mono text-lg font-bold text-blue-400">
          ${max ?? "—"}
        </span>
      </div>
      {min && max && (
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden w-full max-w-[140px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
            style={{ width: `${100 - Number(pct)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function parseOptionalFloat(s: string): number | null | typeof NaN {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t.replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return NaN;
  return n;
}

function parseOptionalInt(s: string): number | null | typeof NaN {
  const t = s.trim();
  if (t === "") return null;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) return NaN;
  return n;
}

function ruleSyncKey(r: GradeRuleCardRule) {
  return JSON.stringify({
    id: r.id,
    filterName: r.filterName,
    sites: r.sites,
    buyInMin: r.buyInMin,
    buyInMax: r.buyInMax,
    speed: r.speed,
    variant: r.variant,
    tournamentType: r.tournamentType,
    gameType: r.gameType,
    playerCount: r.playerCount,
    weekDay: r.weekDay,
    prizePoolMin: r.prizePoolMin,
    prizePoolMax: r.prizePoolMax,
    minParticipants: r.minParticipants,
    fromTime: r.fromTime,
    toTime: r.toTime,
    excludePattern: r.excludePattern,
    timezone: r.timezone,
    autoOnly: r.autoOnly,
    manualOnly: r.manualOnly,
  });
}

export function GradeRuleCard({
  rule,
  idx,
  manage,
}: {
  rule: GradeRuleCardRule;
  idx: number;
  manage: boolean;
}) {
  const router = useRouter();
  const [filterNameStr, setFilterNameStr] = useState(rule.filterName);
  const [localSites, setLocalSites] = useState(rule.sites);
  const [minStr, setMinStr] = useState(
    rule.buyInMin != null ? String(rule.buyInMin) : ""
  );
  const [maxStr, setMaxStr] = useState(
    rule.buyInMax != null ? String(rule.buyInMax) : ""
  );
  const [localSpeed, setLocalSpeed] = useState(rule.speed);
  const [localTournamentType, setLocalTournamentType] = useState(
    rule.tournamentType
  );
  const [localVariant, setLocalVariant] = useState(rule.variant);
  const [localGameType, setLocalGameType] = useState(rule.gameType);
  const [localPlayerCount, setLocalPlayerCount] = useState(rule.playerCount);
  const [localWeekDay, setLocalWeekDay] = useState(rule.weekDay);
  const [prizeMinStr, setPrizeMinStr] = useState(
    rule.prizePoolMin != null ? String(rule.prizePoolMin) : ""
  );
  const [prizeMaxStr, setPrizeMaxStr] = useState(
    rule.prizePoolMax != null ? String(rule.prizePoolMax) : ""
  );
  const [minPartStr, setMinPartStr] = useState(
    rule.minParticipants != null ? String(rule.minParticipants) : ""
  );
  const [fromTimeStr, setFromTimeStr] = useState(rule.fromTime ?? "");
  const [toTimeStr, setToTimeStr] = useState(rule.toTime ?? "");
  const [excludeStr, setExcludeStr] = useState(rule.excludePattern ?? "");
  const [timezoneStr, setTimezoneStr] = useState(
    rule.timezone != null ? String(rule.timezone) : ""
  );
  const [autoOnly, setAutoOnly] = useState(rule.autoOnly);
  const [manualOnly, setManualOnly] = useState(rule.manualOnly);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const isEditing = manage && editing;

  const bump = useMemo(() => ruleSyncKey(rule), [rule]);

  const applyServerRule = useCallback((r: GradeRuleCardRule) => {
    setFilterNameStr(r.filterName);
    setLocalSites(r.sites);
    setMinStr(r.buyInMin != null ? String(r.buyInMin) : "");
    setMaxStr(r.buyInMax != null ? String(r.buyInMax) : "");
    setLocalSpeed(r.speed);
    setLocalTournamentType(r.tournamentType);
    setLocalVariant(r.variant);
    setLocalGameType(r.gameType);
    setLocalPlayerCount(r.playerCount);
    setLocalWeekDay(r.weekDay);
    setPrizeMinStr(r.prizePoolMin != null ? String(r.prizePoolMin) : "");
    setPrizeMaxStr(r.prizePoolMax != null ? String(r.prizePoolMax) : "");
    setMinPartStr(
      r.minParticipants != null ? String(r.minParticipants) : ""
    );
    setFromTimeStr(r.fromTime ?? "");
    setToTimeStr(r.toTime ?? "");
    setExcludeStr(r.excludePattern ?? "");
    setTimezoneStr(r.timezone != null ? String(r.timezone) : "");
    setAutoOnly(r.autoOnly);
    setManualOnly(r.manualOnly);
  }, []);

  useEffect(() => {
    applyServerRule(rule);
  }, [bump, applyServerRule]); // eslint-disable-line react-hooks/exhaustive-deps -- sync só quando bump muda

  useEffect(() => {
    if (!manage) setEditing(false);
  }, [manage]);

  function cancelEdit() {
    applyServerRule(rule);
    setEditing(false);
  }

  const speedOptions = useMemo(
    () => mergeOptions(SPEED_PRESETS, localSpeed),
    [localSpeed]
  );
  const ttOptions = useMemo(
    () => mergeOptions(TOURNAMENT_TYPE_PRESETS, localTournamentType),
    [localTournamentType]
  );
  const variantOptions = useMemo(
    () => mergeOptions(VARIANT_PRESETS, localVariant),
    [localVariant]
  );
  const gameTypeOptions = useMemo(
    () => mergeOptions(GAME_TYPE_PRESETS, localGameType),
    [localGameType]
  );
  const playerCountOptions = useMemo(
    () => mergeOptions(PLAYER_COUNT_PRESETS, localPlayerCount),
    [localPlayerCount]
  );
  const weekOptions = useMemo(
    () => mergeOptions(WEEKDAY_PRESETS, localWeekDay),
    [localWeekDay]
  );

  const hasExtraRead =
    rule.prizePoolMin != null ||
    rule.prizePoolMax != null ||
    rule.minParticipants != null ||
    rule.excludePattern ||
    (rule.fromTime && rule.toTime) ||
    rule.weekDay.length > 0 ||
    rule.timezone != null ||
    rule.autoOnly ||
    rule.manualOnly;

  async function handleSave() {
    if (saving) return;
    const name = filterNameStr.trim();
    if (name.length < 1) {
      toast.error("Informe um nome para o filtro");
      return;
    }

    const buyInMin =
      minStr.trim() === "" ? null : Number(minStr.replace(",", "."));
    const buyInMax =
      maxStr.trim() === "" ? null : Number(maxStr.replace(",", "."));
    if (minStr.trim() !== "" && Number.isNaN(buyInMin)) {
      toast.error("Buy-in mínimo inválido");
      return;
    }
    if (maxStr.trim() !== "" && Number.isNaN(buyInMax)) {
      toast.error("Buy-in máximo inválido");
      return;
    }
    if (
      buyInMin != null &&
      buyInMax != null &&
      buyInMin > buyInMax
    ) {
      toast.error("Buy-in mínimo não pode ser maior que o máximo");
      return;
    }
    if (localSites.length < 1) {
      toast.error("Mantenha pelo menos um site na regra");
      return;
    }

    const prizePoolMin = parseOptionalFloat(prizeMinStr);
    const prizePoolMax = parseOptionalFloat(prizeMaxStr);
    const minParticipants = parseOptionalInt(minPartStr);
    if (Number.isNaN(prizePoolMin) || Number.isNaN(prizePoolMax)) {
      toast.error("Valor de garantido inválido");
      return;
    }
    if (Number.isNaN(minParticipants)) {
      toast.error("Mín. entrants inválido");
      return;
    }

    let timezone: number | null = null;
    if (timezoneStr.trim() !== "") {
      const tz = parseInt(timezoneStr.trim(), 10);
      if (!Number.isFinite(tz) || tz < -840 || tz > 840) {
        toast.error("Timezone inválido (minutos, entre -840 e 840)");
        return;
      }
      timezone = tz;
    }

    setSaving(true);
    try {
      const res = await updateGradeRule(rule.id, {
        filterName: name,
        sites: localSites,
        buyInMin,
        buyInMax,
        speed: localSpeed,
        tournamentType: localTournamentType,
        variant: localVariant,
        gameType: localGameType,
        playerCount: localPlayerCount,
        weekDay: localWeekDay,
        prizePoolMin,
        prizePoolMax,
        minParticipants,
        fromTime: fromTimeStr.trim() === "" ? null : fromTimeStr.trim(),
        toTime: toTimeStr.trim() === "" ? null : toTimeStr.trim(),
        excludePattern: excludeStr.trim() === "" ? null : excludeStr.trim(),
        timezone,
        autoOnly,
        manualOnly,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Regra atualizada");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRule() {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await deleteGradeRule(rule.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Filtro removido");
      setDeleteOpen(false);
      router.refresh();
    } catch {
      toast.error("Não foi possível excluir");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-blue-500/30 bg-white overflow-hidden hover:border-blue-500/40 transition-colors group",
        "dark:bg-card"
      )}
    >
      <div className="flex flex-col gap-3 px-5 py-4 border-b border-blue-500/30 bg-blue-500/8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="w-7 h-7 rounded-md bg-blue-500/15 flex items-center justify-center text-[13px] font-bold text-blue-600 shrink-0">
            {idx + 1}
          </span>
          {isEditing ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Input
                id={`fn-${rule.id}`}
                value={filterNameStr}
                onChange={(e) => setFilterNameStr(e.target.value)}
                maxLength={500}
                className="min-w-0 flex-1 font-semibold text-base text-blue-600 border-blue-500/25"
              />
              <InputEndPencil />
            </div>
          ) : (
            <span className="font-semibold text-base text-blue-600 truncate">
              {rule.filterName}
            </span>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {rule.lobbyzeFilterId != null && (
            <span className="text-xs text-blue-600/50 font-mono">
              #{rule.lobbyzeFilterId}
            </span>
          )}
          {manage ? (
            isEditing ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground"
                onClick={cancelEdit}
              >
                Cancelar edição
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-blue-500/25"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            )
          ) : null}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-2 min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground uppercase tracking-wide">
              Sites
            </p>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {localSites.map((item, i) => (
                  <span
                    key={`${item.item_id}-${i}`}
                    className="inline-flex cursor-default items-center gap-1 rounded-full border border-blue-500/25 bg-blue-500/12 px-2 py-1 text-xs font-medium text-blue-600"
                  >
                    {item.item_text}
                    <button
                      type="button"
                      className="cursor-pointer rounded-full p-0.5 hover:bg-blue-500/20 transition-colors"
                      aria-label={`Remover ${item.item_text}`}
                      onClick={() =>
                        setLocalSites((prev) => prev.filter((_, j) => j !== i))
                      }
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <Pills items={rule.sites} variant="sites" />
            )}
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground uppercase tracking-wide">
              Buy-in
            </p>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor={`bi-min-${rule.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Mín ($)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`bi-min-${rule.id}`}
                        type="text"
                        inputMode="decimal"
                        className="w-[120px]"
                        value={minStr}
                        onChange={(e) => setMinStr(e.target.value)}
                        placeholder="—"
                      />
                      <InputEndPencil />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`bi-max-${rule.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Máx ($)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`bi-max-${rule.id}`}
                        type="text"
                        inputMode="decimal"
                        className="w-[120px]"
                        value={maxStr}
                        onChange={(e) => setMaxStr(e.target.value)}
                        placeholder="—"
                      />
                      <InputEndPencil />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Vazio = sem limite nesse extremo.
                </p>
              </div>
            ) : (
              <BuyInRange min={rule.buyInMin} max={rule.buyInMax} />
            )}
          </div>
        </div>

        {(isEditing || rule.speed.length > 0) && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground uppercase tracking-wide">
                Speed
              </p>
              {isEditing ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum selecionado = qualquer speed. Clique para incluir ou
                  excluir da grade.
                </p>
              ) : null}
              {isEditing ? (
                <MultiToggleRow
                  options={speedOptions}
                  selected={localSpeed}
                  onChange={setLocalSpeed}
                />
              ) : (
                <Pills items={rule.speed} variant="speed" />
              )}
            </div>
          </div>
        )}

        {(isEditing ||
          rule.tournamentType.length > 0 ||
          rule.variant.length > 0) && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-4 flex-1 min-w-0">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground uppercase tracking-wide">
                  Tipo de torneio
                </p>
                {isEditing ? (
                  <MultiToggleRow
                    options={ttOptions}
                    selected={localTournamentType}
                    onChange={setLocalTournamentType}
                  />
                ) : (
                  <Pills items={rule.tournamentType} variant="variant" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground uppercase tracking-wide">
                  Variante
                </p>
                {isEditing ? (
                  <MultiToggleRow
                    options={variantOptions}
                    selected={localVariant}
                    onChange={setLocalVariant}
                  />
                ) : (
                  <Pills items={rule.variant} variant="variant" />
                )}
              </div>
            </div>
          </div>
        )}

        {(isEditing || rule.gameType.length > 0) && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-foreground uppercase tracking-wide">
                Tipo de jogo
              </p>
              {isEditing ? (
                <MultiToggleRow
                  options={gameTypeOptions}
                  selected={localGameType}
                  onChange={setLocalGameType}
                />
              ) : (
                <Pills items={rule.gameType} variant="variant" />
              )}
            </div>
          </div>
        )}

        {(isEditing || rule.playerCount.length > 0) && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-foreground uppercase tracking-wide">
                Tamanho da mesa
              </p>
              {isEditing ? (
                <MultiToggleRow
                  options={playerCountOptions}
                  selected={localPlayerCount}
                  onChange={setLocalPlayerCount}
                />
              ) : (
                <Pills items={rule.playerCount} variant="variant" />
              )}
            </div>
          </div>
        )}

        {(isEditing || hasExtraRead) && (
          <div className="pt-4 border-t border-blue-500/30 space-y-4">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Restrições extras
            </p>
            {isEditing ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <LabeledTextRow
                  label={
                    <Label className="text-xs text-muted-foreground">
                      Garantido mín ($)
                    </Label>
                  }
                >
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={prizeMinStr}
                    onChange={(e) => setPrizeMinStr(e.target.value)}
                    placeholder="—"
                  />
                </LabeledTextRow>
                <LabeledTextRow
                  label={
                    <Label className="text-xs text-muted-foreground">
                      Garantido máx ($)
                    </Label>
                  }
                >
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={prizeMaxStr}
                    onChange={(e) => setPrizeMaxStr(e.target.value)}
                    placeholder="—"
                  />
                </LabeledTextRow>
                <LabeledTextRow
                  label={
                    <Label className="text-xs text-muted-foreground">
                      Mín. entrants
                    </Label>
                  }
                >
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={minPartStr}
                    onChange={(e) => setMinPartStr(e.target.value)}
                    placeholder="—"
                  />
                </LabeledTextRow>
                <LabeledTextRow
                  label={
                    <Label className="text-xs text-muted-foreground">
                      Timezone (min UTC, ex. -180 BRT)
                    </Label>
                  }
                >
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={timezoneStr}
                    onChange={(e) => setTimezoneStr(e.target.value)}
                    placeholder="—"
                  />
                </LabeledTextRow>
                <LabeledTextRow
                  label={
                    <Label className="text-xs text-muted-foreground">
                      Horário início (HH:mm)
                    </Label>
                  }
                >
                  <Input
                    type="time"
                    value={
                      fromTimeStr.length >= 5
                        ? fromTimeStr.slice(0, 5)
                        : fromTimeStr
                    }
                    onChange={(e) => setFromTimeStr(e.target.value)}
                  />
                </LabeledTextRow>
                <LabeledTextRow
                  label={
                    <Label className="text-xs text-muted-foreground">
                      Horário fim (HH:mm)
                    </Label>
                  }
                >
                  <Input
                    type="time"
                    value={
                      toTimeStr.length >= 5 ? toTimeStr.slice(0, 5) : toTimeStr
                    }
                    onChange={(e) => setToTimeStr(e.target.value)}
                  />
                </LabeledTextRow>
              </div>
            ) : null}

            {isEditing ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Dias</Label>
                <MultiToggleRow
                  options={weekOptions}
                  selected={localWeekDay}
                  onChange={setLocalWeekDay}
                />
              </div>
            ) : null}

            {isEditing ? (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Excluir no nome (use | entre termos)
                </Label>
                <div className="relative">
                  <Textarea
                    value={excludeStr}
                    onChange={(e) => setExcludeStr(e.target.value)}
                    rows={2}
                    className="resize-y min-h-[60px] pr-9 text-sm"
                    placeholder="ex.: red lotus|encore"
                  />
                  <Pencil
                    className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/55"
                    aria-hidden
                  />
                </div>
              </div>
            ) : null}

            {isEditing ? (
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex cursor-pointer items-center gap-2">
                  <Switch
                    checked={autoOnly}
                    onCheckedChange={setAutoOnly}
                    id={`auto-${rule.id}`}
                    className="cursor-pointer"
                  />
                  <Label
                    htmlFor={`auto-${rule.id}`}
                    className="cursor-pointer text-sm"
                  >
                    Somente auto
                  </Label>
                </div>
                <div className="flex cursor-pointer items-center gap-2">
                  <Switch
                    checked={manualOnly}
                    onCheckedChange={setManualOnly}
                    id={`man-${rule.id}`}
                    className="cursor-pointer"
                  />
                  <Label
                    htmlFor={`man-${rule.id}`}
                    className="cursor-pointer text-sm"
                  >
                    Somente manual
                  </Label>
                </div>
              </div>
            ) : null}

            {(!manage || !isEditing) && (
              <>
                {rule.prizePoolMin != null && (
                  <div className="flex items-center gap-3 text-base text-blue-600">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>
                      Garantido mín:{" "}
                      <strong className="text-blue-600/80">
                        ${rule.prizePoolMin.toLocaleString()}
                      </strong>
                    </span>
                  </div>
                )}
                {rule.prizePoolMax != null && (
                  <div className="flex items-center gap-3 text-base text-blue-600">
                    <TrendingUp className="h-5 w-5 text-blue-600/70" />
                    <span>
                      Garantido máx:{" "}
                      <strong className="text-blue-600/80">
                        ${rule.prizePoolMax.toLocaleString()}
                      </strong>
                    </span>
                  </div>
                )}
                {rule.minParticipants != null && (
                  <div className="flex items-center gap-3 text-base text-blue-600">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>
                      Mín. entrants:{" "}
                      <strong className="text-blue-600/80">
                        {rule.minParticipants}
                      </strong>
                    </span>
                  </div>
                )}
                {rule.fromTime && rule.toTime && (
                  <div className="flex items-center gap-3 text-base text-blue-600">
                    <Timer className="h-5 w-5 text-blue-600/70" />
                    <span>
                      Horário:{" "}
                      <strong className="text-blue-600/80">
                        {rule.fromTime} — {rule.toTime}
                      </strong>
                    </span>
                  </div>
                )}
                {rule.weekDay.length > 0 && (
                  <div className="flex items-center gap-3 text-base text-muted-foreground">
                    <CalendarDays className="h-5 w-5 text-primary/70" />
                    <span>
                      Dias:{" "}
                      <strong className="text-foreground/80">
                        {rule.weekDay.map((d) => d.item_text).join(", ")}
                      </strong>
                    </span>
                  </div>
                )}
                {rule.excludePattern && (
                  <div className="flex items-center gap-3 text-base text-muted-foreground">
                    <Ban className="h-5 w-5 text-red-500/70" />
                    <span>
                      Excluir:{" "}
                      <strong className="text-red-500/80">
                        {rule.excludePattern.replace(/\|/g, ", ")}
                      </strong>
                    </span>
                  </div>
                )}
                {rule.timezone != null && (
                  <p className="text-sm text-muted-foreground">
                    Timezone:{" "}
                    <span className="font-mono text-foreground">
                      {rule.timezone} min UTC
                    </span>
                  </p>
                )}
                {(rule.autoOnly || rule.manualOnly) && (
                  <p className="text-sm text-muted-foreground">
                    {rule.autoOnly && <span className="mr-2">Auto only</span>}
                    {rule.manualOnly && <span>Manual only</span>}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {isEditing && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Salvando…" : "Salvar alterações"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancelEdit}
              disabled={saving}
            >
              Cancelar
            </Button>
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button type="button" size="sm" variant="outline">
                  Excluir filtro
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="default" className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir este filtro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A regra{" "}
                    <span className="font-semibold text-foreground">
                      {rule.filterName}
                    </span>{" "}
                    será removida desta grade. Jogadores que usam esta grade
                    deixam de considerar este filtro no matcher.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel type="button" disabled={deleting}>
                    Cancelar
                  </AlertDialogCancel>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleting}
                    onClick={handleDeleteRule}
                  >
                    {deleting ? "Excluindo…" : "Excluir filtro"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}
