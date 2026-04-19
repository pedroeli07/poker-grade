"use client";

import { memo, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POKER_NETWORKS_UI } from "@/lib/constants";
import { Search, FileSpreadsheet, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerTourneyRow } from "@/lib/data/minha-grade-tourneys";

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

type FilterKey = "all" | "played" | "extra" | "missed";

const PlayerTourneysClient = memo(function PlayerTourneysClient({
  rows,
}: {
  rows: PlayerTourneyRow[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && schedulingCategory(r.scheduling) !== filter) return false;
      if (!q) return true;
      return (
        r.tournamentName.toLowerCase().includes(q) ||
        r.site.toLowerCase().includes(q) ||
        (r.sharkId ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, filter]);

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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={counts.total} />
        <StatCard label="Played" value={counts.played} tone="emerald" />
        <StatCard label="Extra play" value={counts.extra} tone="red" />
        <StatCard label="Didn't play" value={counts.missed} tone="zinc" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar torneio, site, ID..."
            className="pl-9 h-10"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
          <SelectTrigger className="h-10 w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="played">Played</SelectItem>
            <SelectItem value="extra">Extra play</SelectItem>
            <SelectItem value="missed">Didn&apos;t play</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500/15 hover:bg-blue-500/15">
                <TableHead className="w-[150px] whitespace-nowrap">Data</TableHead>
                <TableHead className="w-[170px]">Site</TableHead>
                <TableHead className="w-[110px] text-right">Buy-In</TableHead>
                <TableHead>Torneio</TableHead>
                <TableHead className="w-[120px] text-center">Agenda</TableHead>
                <TableHead className="w-[80px] text-center">Reentry</TableHead>
                <TableHead className="w-[90px] text-center">Velocidade</TableHead>
                <TableHead className="w-[110px] text-center">Shark ID</TableHead>
                <TableHead className="w-[100px] text-center">Prioridade</TableHead>
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
                filtered.map((r) => {
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
                      <TableCell className="text-right tabular-nums text-sm font-medium">
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
                        {r.rebuy ? (
                          <RefreshCcw className="mx-auto size-4 text-amber-500" />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {r.speed ?? "—"}
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
  tone?: "emerald" | "red" | "zinc";
}) {
  const toneClasses =
    tone === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "red"
        ? "text-red-600 dark:text-red-400"
        : tone === "zinc"
          ? "text-zinc-600 dark:text-zinc-400"
          : "text-primary";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-2xl font-bold tabular-nums mt-1", toneClasses)}>{value}</p>
    </div>
  );
}

PlayerTourneysClient.displayName = "PlayerTourneysClient";

export default PlayerTourneysClient;
