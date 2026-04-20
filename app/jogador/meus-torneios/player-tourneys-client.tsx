"use client";

import { memo, useMemo, useState, useCallback, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { POKER_NETWORKS_UI } from "@/lib/constants";
import { FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerTourneyRow } from "@/lib/data/minha-grade-tourneys";
import ColumnFilter from "@/components/column-filter";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import SortButton from "@/components/sort-button";
import PaginationToolbarControls from "@/components/data-table/pagination-toolbar-controls";
import { usePersistentState } from "@/hooks/use-persistent-state";

const LS_PREFIX = "gestao-grades:player-tourneys:";

const WEEKDAY_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

function fmtDate(d: Date): { weekday: string; date: string; time: string } {
  const wd = WEEKDAY_PT[d.getDay()];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return { weekday: wd, date: `${dd}/${mm}/${yyyy}`, time: `${hh}:${mi}` };
}

function schedulingCategory(s: string | null): "played" | "extra" | "missed" {
  const v = (s ?? "").toLowerCase().trim();
  if (!v) return "missed";
  if (v.includes("extra")) return "extra";
  if (v === "played" || v.includes("played")) return "played";
  return "missed";
}

function SiteCell({ network, label }: { network: string | null; label: string }) {
  const icon = network ? POKER_NETWORKS_UI.find((n) => n.value === network)?.icon : null;
  return (
    <div className="flex min-w-0 items-center gap-2">
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" width={22} height={22} className="size-[22px] shrink-0 rounded object-contain" />
      ) : (
        <span className="flex size-[22px] shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
          {label.trim().slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="truncate text-sm">{label}</span>
    </div>
  );
}

function SchedulingBadge({ scheduling }: { scheduling: string | null }) {
  const cat = schedulingCategory(scheduling);
  if (cat === "extra") {
    return (
      <Badge className="border border-red-500/30 bg-red-500/15 text-red-500 text-xs">Extra play</Badge>
    );
  }
  if (cat === "played") {
    return (
      <Badge className="border border-emerald-500/30 bg-emerald-500/15 text-emerald-500 text-xs">Played</Badge>
    );
  }
  return (
    <Badge className="border border-zinc-500/30 bg-zinc-500/15 text-zinc-500 text-xs">Didn&apos;t play</Badge>
  );
}

function PriorityBadge({ priority }: { priority: string | null }) {
  const p = (priority ?? "").toUpperCase();
  if (p === "HIGH")
    return <Badge className="border border-rose-500/30 bg-rose-500/15 text-rose-500 text-xs">High</Badge>;
  if (p === "MEDIUM")
    return <Badge className="border border-amber-500/30 bg-amber-500/15 text-amber-600 text-xs">Medium</Badge>;
  return <span className="text-xs text-muted-foreground">—</span>;
}

const PlayerTourneysClient = memo(function PlayerTourneysClient({
  rows,
}: {
  rows: PlayerTourneyRow[];
}) {
  const [search] = usePersistentState<string>(`${LS_PREFIX}search`, "");
  const [sort, setSort, sortHydrated] = usePersistentState<{ key: string; dir: "asc" | "desc" } | null>(
    `${LS_PREFIX}sort`,
    null
  );

  const toggleSort = useCallback((key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        if (prev.dir === "asc") return { key, dir: "desc" };
        return null;
      }
      return { key, dir: "asc" };
    });
  }, [setSort]);

  const [siteFilter, setSiteFilter, h1] = usePersistentState<Set<string> | null>(`${LS_PREFIX}site`, null);
  const [schedulingFilter, setSchedulingFilter, h2] = usePersistentState<Set<string> | null>(`${LS_PREFIX}scheduling`, null);
  const [speedFilter, setSpeedFilter, h3] = usePersistentState<Set<string> | null>(`${LS_PREFIX}speed`, null);
  const [priorityFilter, setPriorityFilter, h4] = usePersistentState<Set<string> | null>(`${LS_PREFIX}priority`, null);
  const [rebuyFilter, setRebuyFilter, h5] = usePersistentState<Set<string> | null>(`${LS_PREFIX}rebuy`, null);
  const [dateFilter, setDateFilter, h6] = usePersistentState<Set<string> | null>(`${LS_PREFIX}date`, null);
  const [buyInFilter, setBuyInFilter, h7] = usePersistentState<Set<string> | null>(`${LS_PREFIX}buyIn`, null);
  const [tourneyFilter, setTourneyFilter, h8] = usePersistentState<Set<string> | null>(`${LS_PREFIX}tournamentName`, null);
  const [sharkIdFilter, setSharkIdFilter, h9] = usePersistentState<Set<string> | null>(`${LS_PREFIX}sharkId`, null);

  const filtersHydrated = sortHydrated && h1 && h2 && h3 && h4 && h5 && h6 && h7 && h8 && h9;

  const options = useMemo(() => {
    const sites = new Set<string>();
    const speeds = new Set<string>();
    const priorities = new Set<string>();
    const dates = new Set<string>();
    const buyIns = new Set<string>();
    const tourneys = new Set<string>();
    const sharkIds = new Set<string>();
    const rebuys = new Set<number>();

    for (const r of rows) {
      if (r.site) sites.add(r.site);
      if (r.speed) speeds.add(r.speed);
      if (r.priority) priorities.add(r.priority);

      const { date } = fmtDate(new Date(r.date));
      dates.add(date);

      const bi = `${r.buyInCurrency ?? ""}${Number.isFinite(r.buyInValue) ? r.buyInValue.toFixed(2) : "—"}`;
      buyIns.add(bi);

      if (r.tournamentName) tourneys.add(r.tournamentName);
      if (r.sharkId) sharkIds.add(r.sharkId);
      rebuys.add(r.rebuys ?? 0);
    }

    return {
      site: Array.from(sites).sort().map(s => ({ value: s, label: s })),
      scheduling: [
        { value: "played", label: "Played" },
        { value: "extra", label: "Extra play" },
        { value: "missed", label: "Didn't play" },
      ],
      speed: Array.from(speeds).sort().map(s => ({ value: s, label: s })),
      priority: Array.from(priorities).sort().map(s => ({ value: s, label: s })),
      rebuy: Array.from(rebuys)
        .sort((a, b) => a - b)
        .map((n) => ({ value: String(n), label: n === 0 ? "Sem reentry" : String(n) })),
      date: Array.from(dates).sort().map(s => ({ value: s, label: s })),
      buyIn: Array.from(buyIns).sort().map(s => ({ value: s, label: s })),
      tournamentName: Array.from(tourneys).sort().map(s => ({ value: s, label: s })),
      sharkId: Array.from(sharkIds).sort().map(s => ({ value: s, label: s })),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = rows.filter((r) => {
      const cat = schedulingCategory(r.scheduling);
      if (schedulingFilter && !schedulingFilter.has(cat)) return false;
      if (siteFilter && !siteFilter.has(r.site)) return false;
      if (speedFilter && !speedFilter.has(r.speed ?? "")) return false;
      if (priorityFilter && !priorityFilter.has(r.priority ?? "")) return false;
      if (rebuyFilter && !rebuyFilter.has(String(r.rebuys ?? 0))) return false;

      const { date } = fmtDate(new Date(r.date));
      if (dateFilter && !dateFilter.has(date)) return false;
      
      const bi = `${r.buyInCurrency ?? ""}${Number.isFinite(r.buyInValue) ? r.buyInValue.toFixed(2) : "—"}`;
      if (buyInFilter && !buyInFilter.has(bi)) return false;
      
      if (tourneyFilter && !tourneyFilter.has(r.tournamentName)) return false;
      if (sharkIdFilter && !sharkIdFilter.has(r.sharkId ?? "")) return false;

      if (!q) return true;
      return (
        r.tournamentName.toLowerCase().includes(q) ||
        r.site.toLowerCase().includes(q) ||
        (r.sharkId ?? "").toLowerCase().includes(q)
      );
    });

    if (sort) {
      result = [...result].sort((a, b) => {
        let va: string | number;
        let vb: string | number;
        switch (sort.key) {
          case "date":
            va = new Date(a.date).getTime();
            vb = new Date(b.date).getTime();
            break;
          case "site":
            va = a.site;
            vb = b.site;
            break;
          case "buyIn":
            va = a.buyInValue ?? 0;
            vb = b.buyInValue ?? 0;
            break;
          case "tournamentName":
            va = a.tournamentName;
            vb = b.tournamentName;
            break;
          case "scheduling":
            va = schedulingCategory(a.scheduling);
            vb = schedulingCategory(b.scheduling);
            break;
          case "rebuy":
            va = a.rebuys ?? 0;
            vb = b.rebuys ?? 0;
            break;
          case "speed":
            va = a.speed ?? "";
            vb = b.speed ?? "";
            break;
          case "sharkId":
            va = a.sharkId ?? "";
            vb = b.sharkId ?? "";
            break;
          case "priority":
            va = a.priority ?? "";
            vb = b.priority ?? "";
            break;
          default:
            va = 0;
            vb = 0;
        }
        if (va < vb) return sort.dir === "asc" ? -1 : 1;
        if (va > vb) return sort.dir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rows, search, schedulingFilter, siteFilter, speedFilter, priorityFilter, rebuyFilter, dateFilter, buyInFilter, tourneyFilter, sharkIdFilter, sort]);

  const counts = useMemo(() => {
    let played = 0;
    let extra = 0;
    let missed = 0;
    for (const r of rows) {
      const c = schedulingCategory(r.scheduling);
      if (c === "played") played++;
      else if (c === "extra") extra++;
      else missed++;
    }
    return { played, extra, missed, total: rows.length };
  }, [rows]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);

  // UX: voltar à página 1 quando filtros/ordenação mudam (padrão de grelha filtrada).
  /* eslint-disable react-hooks/set-state-in-effect -- reset de paginação depende de múltiplos filtros persistidos */
  useEffect(() => {
    setPage(1);
  }, [search, sort, siteFilter, schedulingFilter, speedFilter, priorityFilter, rebuyFilter, dateFilter, buyInFilter, tourneyFilter, sharkIdFilter]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  if (!filtersHydrated) {
    return <div aria-busy className="min-h-[400px]" />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={counts.total} tone="blue" />
        <StatCard label="Played" value={counts.played} tone="emerald" />
        <StatCard label="Extra play" value={counts.extra} tone="red" />
        <StatCard label="Didn't play" value={counts.missed} tone="zinc" />
      </div>

      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 sm:gap-6">
        <PaginationToolbarControls
          page={currentPage}
          pageSize={pageSize}
          total={filtered.length}
          totalPages={totalPages}
          onChangePage={setPage}
          onChangePageSize={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500/15 hover:bg-blue-500/15">
                <TableHead className="w-[150px] whitespace-nowrap">
                  <div className="flex items-center gap-0.5">
                    <SortButton columnKey="date" sort={sort} toggleSort={toggleSort} kind="string" label="Data" />
                    <ColumnFilter
                      columnId="date"
                      ariaLabel="Data"
                      label={<FilteredColumnTitle active={dateFilter !== null}>Data</FilteredColumnTitle>}
                      options={options.date}
                      applied={dateFilter}
                      onApply={setDateFilter}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[170px]">
                  <div className="flex items-center gap-0.5">
                    <SortButton columnKey="site" sort={sort} toggleSort={toggleSort} kind="string" label="Site" />
                    <ColumnFilter
                      columnId="site"
                      ariaLabel="Site"
                      label={<FilteredColumnTitle active={siteFilter !== null}>Site</FilteredColumnTitle>}
                      options={options.site}
                      applied={siteFilter}
                      onApply={setSiteFilter}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <SortButton columnKey="buyIn" sort={sort} toggleSort={toggleSort} kind="number" label="Buy-In" />
                    <ColumnFilter
                      columnId="buyIn"
                      ariaLabel="Buy-In"
                      label={<FilteredColumnTitle active={buyInFilter !== null}>Buy-In</FilteredColumnTitle>}
                      options={options.buyIn}
                      applied={buyInFilter}
                      onApply={setBuyInFilter}
                    />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-0.5">
                    <SortButton columnKey="tournamentName" sort={sort} toggleSort={toggleSort} kind="string" label="Torneio" />
                    <ColumnFilter
                      columnId="tournamentName"
                      ariaLabel="Torneio"
                      label={<FilteredColumnTitle active={tourneyFilter !== null}>Torneio</FilteredColumnTitle>}
                      options={options.tournamentName}
                      applied={tourneyFilter}
                      onApply={setTourneyFilter}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <SortButton columnKey="scheduling" sort={sort} toggleSort={toggleSort} kind="string" label="Agenda" />
                    <ColumnFilter
                      columnId="scheduling"
                      ariaLabel="Agenda"
                      label={<FilteredColumnTitle active={schedulingFilter !== null}>Agenda</FilteredColumnTitle>}
                      options={options.scheduling}
                      applied={schedulingFilter}
                      onApply={setSchedulingFilter}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <SortButton columnKey="rebuy" sort={sort} toggleSort={toggleSort} kind="string" label="Reentry" />
                    <ColumnFilter
                      columnId="rebuy"
                      ariaLabel="Reentry"
                      label={<FilteredColumnTitle active={rebuyFilter !== null}>Reentry</FilteredColumnTitle>}
                      options={options.rebuy}
                      applied={rebuyFilter}
                      onApply={setRebuyFilter}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <SortButton columnKey="speed" sort={sort} toggleSort={toggleSort} kind="string" label="Velocidade" />
                    <ColumnFilter
                      columnId="speed"
                      ariaLabel="Velocidade"
                      label={<FilteredColumnTitle active={speedFilter !== null}>Velocidade</FilteredColumnTitle>}
                      options={options.speed}
                      applied={speedFilter}
                      onApply={setSpeedFilter}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <SortButton columnKey="sharkId" sort={sort} toggleSort={toggleSort} kind="string" label="Shark ID" />
                    <ColumnFilter
                      columnId="sharkId"
                      ariaLabel="Shark ID"
                      label={<FilteredColumnTitle active={sharkIdFilter !== null}>Shark ID</FilteredColumnTitle>}
                      options={options.sharkId}
                      applied={sharkIdFilter}
                      onApply={setSharkIdFilter}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <SortButton columnKey="priority" sort={sort} toggleSort={toggleSort} kind="string" label="Prioridade" />
                    <ColumnFilter
                      columnId="priority"
                      ariaLabel="Prioridade"
                      label={<FilteredColumnTitle active={priorityFilter !== null}>Prioridade</FilteredColumnTitle>}
                      options={options.priority}
                      applied={priorityFilter}
                      onApply={setPriorityFilter}
                    />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhum torneio importado ainda.</p>
                    <p className="text-xs mt-1">Peça ao seu coach para importar sua planilha de torneios.</p>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    Nenhum torneio com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((r) => {
                  const { weekday, date, time } = fmtDate(new Date(r.date));
                  const cat = schedulingCategory(r.scheduling);
                  return (
                    <TableRow
                      key={r.id}
                      className={cn(
                        "hover:bg-muted/40",
                        cat === "extra" && "bg-red-500/[0.04]",
                      )}
                    >
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col leading-tight">
                          <span className="text-[11px] text-muted-foreground">{weekday}</span>
                          <span className="text-sm font-medium tabular-nums">{date}</span>
                          <span className="text-[11px] text-muted-foreground tabular-nums">{time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <SiteCell network={r.siteNetworkKey} label={r.site} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm font-extrabold">
                        {r.buyInCurrency ?? ""}
                        {Number.isFinite(r.buyInValue) ? r.buyInValue.toFixed(2) : "—"}
                      </TableCell>
                      <TableCell className="max-w-[340px]">
                        <span className="text-sm truncate block" title={r.tournamentName}>
                          {r.tournamentName}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <SchedulingBadge scheduling={r.scheduling} />
                      </TableCell>
                      <TableCell className="text-center">
                        {r.rebuys && r.rebuys > 0 ? (
                          <span className="inline-block">
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-muted text-foreground tabular-nums border border-border">
                              {r.rebuys}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                 
                      <TableCell className="text-center text-xs text-muted-foreground">
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded-full border border-border",
                            r.speed === "Turbo"
                              ? "bg-violet-900 text-violet-200"
                              : r.speed === "Regular"
                              ? "bg-violet-700 text-violet-200"
                              : r.speed === "Slow"
                              ? "bg-violet-400 text-white"
                              : r.speed === "Hyper-Turbo"
                              ? "bg-violet-200 text-violet-900"
                              : "bg-muted text-foreground"
                          )}
                        >
                          {r.speed ?? "—"}
                        </span>
                      </TableCell>
                 
                 
                      <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
                        {r.sharkId ?? "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <PriorityBadge priority={r.priority} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
});

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "emerald" | "red" | "zinc" | "blue";
}) {
  const toneMap = {
    emerald:
      "border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/[0.06] text-emerald-600 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.25),0_4px_14px_-4px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500/15 dark:text-emerald-400 hover:shadow-[inset_0_1px_0_0_rgba(16,185,129,0.25),0_8px_20px_-4px_rgba(16,185,129,0.5)] hover:-translate-y-0.5",
    red: "border-red-500/30 bg-gradient-to-br from-red-500/20 via-red-500/10 to-red-500/[0.06] text-red-600 shadow-[inset_0_1px_0_0_rgba(239,68,68,0.25),0_4px_14px_-4px_rgba(239,68,68,0.35)] ring-1 ring-red-500/15 dark:text-red-400 hover:shadow-[inset_0_1px_0_0_rgba(239,68,68,0.25),0_8px_20px_-4px_rgba(239,68,68,0.5)] hover:-translate-y-0.5",
    zinc: "border-zinc-500/30 bg-gradient-to-br from-zinc-500/20 via-zinc-500/10 to-zinc-500/[0.06] text-zinc-600 shadow-[inset_0_1px_0_0_rgba(113,113,122,0.25),0_4px_14px_-4px_rgba(113,113,122,0.35)] ring-1 ring-zinc-500/15 dark:text-zinc-400 hover:shadow-[inset_0_1px_0_0_rgba(113,113,122,0.25),0_8px_20px_-4px_rgba(113,113,122,0.5)] hover:-translate-y-0.5",
    blue: "border-blue-500/30 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-blue-500/[0.06] text-blue-600 shadow-[inset_0_1px_0_0_rgba(59,130,246,0.25),0_4px_14px_-4px_rgba(37,99,235,0.35)] ring-1 ring-blue-500/15 dark:text-blue-400 hover:shadow-[inset_0_1px_0_0_rgba(59,130,246,0.25),0_8px_20px_-4px_rgba(37,99,235,0.5)] hover:-translate-y-0.5",
  } as Record<string, string>;

  const toneClasses = tone ? toneMap[tone as keyof typeof toneMap] : "";

  return (
    <div className={cn("rounded-xl border p-5 transition-all duration-300", toneClasses)}>
      <p className="text-sm font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-4xl font-bold tabular-nums mt-1">{value}</p>
    </div>
  );
}

PlayerTourneysClient.displayName = "PlayerTourneysClient";

export default PlayerTourneysClient;
