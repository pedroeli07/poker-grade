import { requireSession } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { getImportDetailForSession } from "@/lib/data/queries";
import { canReview } from "@/lib/auth/rbac";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReviewDecisionButtons } from "@/components/review-decision-buttons";
import { DeleteImportButton } from "./delete-import-button";
import {
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  MinusCircle,
  DollarSign,
  Calendar,
  Building2,
} from "lucide-react";
import { schedulingCategory } from "@/lib/utils";
import { Tab } from "@/lib/types";


function SchedulingBadge({ scheduling }: { scheduling: string | null }) {
  const cat = schedulingCategory(scheduling);
  if (cat === "extra")
    return (
      <Badge className="bg-red-500/15 text-red-500 border-red-500/30 border text-xs">
        Extra Play
      </Badge>
    );
  if (cat === "played")
    return (
      <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 border text-xs">
        Played
      </Badge>
    );
  return (
    <Badge className="bg-zinc-500/15 text-zinc-500 border-zinc-500/30 border text-xs">
      Didn&apos;t play
    </Badge>
  );
}

function ReviewStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: {
      label: "Pendente",
      cls: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    },
    APPROVED: {
      label: "Aprovado",
      cls: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    },
    EXCEPTION: {
      label: "Exceção",
      cls: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    },
    REJECTED: {
      label: "Infração",
      cls: "bg-red-500/15 text-red-500 border-red-500/30",
    },
  };
  const cfg = map[status] ?? map.PENDING;
  return (
    <Badge className={`${cfg.cls} border text-xs`}>{cfg.label}</Badge>
  );
}

export default async function ImportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const sp = await searchParams;
  const activeTab = (sp.tab as Tab) || "extra";
  const showActions = canReview(session);
  const canDelete = ["ADMIN", "MANAGER", "COACH"].includes(session.role);

  const importRecord = await getImportDetailForSession(session, id);
  if (!importRecord) notFound();

  const all = importRecord.tournaments;
  const extraPlay = all.filter((t) => schedulingCategory(t.scheduling) === "extra");
  const withRebuy = all.filter((t) => t.rebuy === true);
  const played = all.filter((t) => schedulingCategory(t.scheduling) === "played");
  const missed = all.filter((t) => schedulingCategory(t.scheduling) === "missed");

  const tabs = [
    {
      id: "extra" as Tab,
      label: "Extra Play",
      count: extraPlay.length,
      icon: AlertTriangle,
      accent: "red",
      activeCls:
        "border-red-500 text-red-500 bg-red-500/10",
      inactiveCls: "border-transparent text-muted-foreground",
      countCls: "bg-red-500/20 text-red-500",
    },
    {
      id: "rebuy" as Tab,
      label: "Com Rebuy",
      count: withRebuy.length,
      icon: RefreshCw,
      accent: "orange",
      activeCls: "border-orange-500 text-orange-500 bg-orange-500/10",
      inactiveCls: "border-transparent text-muted-foreground",
      countCls: "bg-orange-500/20 text-orange-500",
    },
    {
      id: "played" as Tab,
      label: "Jogados",
      count: played.length,
      icon: CheckCircle2,
      accent: "emerald",
      activeCls: "border-emerald-500 text-emerald-500 bg-emerald-500/10",
      inactiveCls: "border-transparent text-muted-foreground",
      countCls: "bg-emerald-500/20 text-emerald-500",
    },
    {
      id: "missed" as Tab,
      label: "Não Jogados",
      count: missed.length,
      icon: MinusCircle,
      accent: "zinc",
      activeCls: "border-zinc-400 text-zinc-500 bg-zinc-500/10",
      inactiveCls: "border-transparent text-muted-foreground",
      countCls: "bg-zinc-500/20 text-zinc-500",
    },
  ];

const activeTournaments =
    activeTab === "extra"
      ? extraPlay
      : activeTab === "rebuy"
        ? withRebuy
        : activeTab === "played"
          ? played
          : missed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/imports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold tracking-tight truncate text-primary">
            {importRecord.fileName}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-0.5">
            {importRecord.playerName && (
              <span className="font-medium text-foreground">
                {importRecord.playerName}
              </span>
            )}
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(importRecord.createdAt, "dd 'de' MMMM 'de' yyyy, HH:mm", {
                locale: ptBR,
              })}
            </span>
            <span>·</span>
            <span>{all.length} torneios no total</span>
          </div>
        </div>
        {canDelete && <DeleteImportButton importId={id} />}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/dashboard/imports/${id}?tab=${tab.id}`}
              className={`group rounded-xl border p-5 transition-all hover:scale-[1.02] ${
                isActive
                  ? tab.id === "extra"
                    ? "border-red-500/30 bg-red-500/20 shadow-md shadow-red-500 hover:shadow-lg hover:shadow-red-400"
                    : tab.id === "rebuy"
                      ? "border-orange-500/30 bg-orange-500/20 shadow-md shadow-orange-500 hover:shadow-lg hover:shadow-orange-400"
                      : tab.id === "played"
                        ? "border-emerald-500/30 bg-emerald-500/20 shadow-md shadow-emerald-500 hover:shadow-lg hover:shadow-emerald-400"
                        : "border-zinc-500/30 bg-zinc-500/20 shadow-md shadow-zinc-500 hover:shadow-lg hover:shadow-zinc-400"
                  : "border-border bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon
                  className={`h-5 w-5 ${
                    tab.id === "extra"
                      ? "text-red-500"
                      : tab.id === "rebuy"
                        ? "text-orange-500"
                        : tab.id === "played"
                          ? "text-emerald-500"
                          : "text-zinc-500"
                  }`}
                />
                {tab.count > 0 && (
                  <span
                    className={`text-xs font-bold rounded-full px-2 py-0.5 ${tab.countCls}`}
                  >
                    {tab.count}
                  </span>
                )}
              </div>
              <div
                className={`text-4xl font-bold tabular-nums ${
                  tab.id === "extra"
                    ? "text-red-500"
                    : tab.id === "rebuy"
                      ? "text-orange-500"
                      : tab.id === "played"
                        ? "text-emerald-500"
                        : "text-zinc-600"
                }`}
              >
                {tab.count}
              </div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                {tab.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/dashboard/imports/${id}?tab=${tab.id}`}
              className={`flex items-center gap-2 px-5 py-3 text-[15px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive ? tab.activeCls : tab.inactiveCls + " hover:text-foreground/80"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${tab.countCls}`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      {activeTournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <CheckCircle2 className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Nenhum torneio nesta categoria.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-500/20">
                <TableHead className="pl-6 w-[380px]">Torneio</TableHead>
                <TableHead>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    Site
                  </span>
                </TableHead>
                <TableHead>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    Buy-in
                  </span>
                </TableHead>
                <TableHead>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Data
                  </span>
                </TableHead>
                <TableHead>Status</TableHead>
                {activeTab === "rebuy" && <TableHead>Rebuy</TableHead>}
                {showActions && activeTab === "extra" && (
                  <TableHead className="text-right pr-6">Decisão</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTournaments.map((t) => (
                <TableRow
                  key={t.id}
                  className="bg-white hover:bg-sidebar-accent/30 group border-b border-border/50 last:border-0"
                >
                  <TableCell className="pl-6">
                    <div
                      className="font-medium text-[15px] line-clamp-2 max-w-[360px]"
                      title={t.tournamentName}
                    >
                      {t.tournamentName}
                    </div>
                    {t.speed && (
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {t.speed}
                        {t.priority && t.priority !== "None" && (
                          <span
                            className={`ml-2 font-medium ${
                              t.priority === "HIGH"
                                ? "text-amber-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            · {t.priority}
                          </span>
                        )}
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs border ${
                        t.site.toLowerCase().includes("pokerstars")
                          ? "border-red-500/30 text-red-500 bg-red-500/5"
                          : "border-blue-500/30 text-blue-500 bg-blue-500/5"
                      }`}
                    >
                      {t.site}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-[15px] font-semibold text-foreground/90">
                      {t.buyInCurrency ?? "$"}
                      {t.buyInValue.toFixed(2)}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(t.date, "dd/MM/yy HH:mm")}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1.5 items-start">
                      <SchedulingBadge scheduling={t.scheduling} />
                      {t.reviewItem && (
                        <ReviewStatusBadge status={t.reviewItem.status} />
                      )}
                    </div>
                  </TableCell>

                  {activeTab === "rebuy" && (
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-orange-500 text-sm font-semibold">
                        <RefreshCw className="h-4 w-4" />
                        Rebuy
                      </span>
                    </TableCell>
                  )}

                  {showActions && activeTab === "extra" && (
                    <TableCell className="text-right pr-6">
                      {t.reviewItem ? (
                        t.reviewItem.status === "PENDING" ? (
                          <ReviewDecisionButtons reviewId={t.reviewItem.id} />
                        ) : (
                          <ReviewStatusBadge status={t.reviewItem.status} />
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
