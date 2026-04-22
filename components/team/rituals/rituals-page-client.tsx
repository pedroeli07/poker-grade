"use client";

import { memo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  LayoutList,
  MoreVertical,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import TeamBlueTabBar from "@/components/team/team-blue-tab-bar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils/cn";
import { RITUAL_AREA_COLORS } from "@/lib/constants/team/rituals";
import { useRitualsPage } from "@/hooks/team/use-rituals-page";
import type { RitualsPageData } from "@/lib/data/team/rituals-page";
import RitualFormModal from "./ritual-form-modal";
import ExecuteRitualModal from "./execute-ritual-modal";
import RitualsGoogleCalendarPanel from "./rituals-google-calendar-panel";

const RITUALS_PAGE_TABS = [
  { value: "lista", label: "Lista", icon: LayoutList },
  { value: "calendario", label: "Calendário", icon: CalendarDays },
  { value: "adesao", label: "Dashboard de Adesão", icon: BarChart3 },
] as const;

type RitualsPageTab = (typeof RITUALS_PAGE_TABS)[number]["value"];

const RitualsPageClient = memo(function RitualsPageClient({ rituals, staff }: RitualsPageData) {
  const {
    stats,
    formOpen,
    setFormOpen,
    editing,
    setEditing,
    executing,
    setExecuting,
    deleting,
    setDeleting,
    deletePending,
    undoPending,
    openNew,
    openEdit,
    handleDelete,
    handleUndo,
  } = useRitualsPage({ rituals, staff });

  const [activeTab, setActiveTab] = useState<RitualsPageTab>("lista");

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Rituais</h2>
          <p className="mt-1 text-muted-foreground">Calendário, execução e acompanhamento de rituais do time.</p>
        </div>
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Novo ritual
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <RitualsStatCard
          tone="rose"
          icon={<AlertCircle className="h-5 w-5 text-rose-500" />}
          value={stats.overdue}
          label="Atrasados"
        />
        <RitualsStatCard
          tone="sky"
          icon={<Clock className="h-5 w-5 text-sky-500" />}
          value={stats.scheduled}
          label="Agendados"
        />
        <RitualsStatCard
          tone="emerald"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          value={stats.completed}
          label="Concluídos"
        />
        <RitualsStatCard
          tone="violet"
          icon={<BarChart3 className="h-5 w-5 text-violet-500" />}
          value={`${stats.rate}%`}
          label="Taxa de adesão"
        />
      </div>

      <div className="space-y-4">
        <TeamBlueTabBar
          tabs={RITUALS_PAGE_TABS}
          activeTab={activeTab}
          onTabChange={(v) => setActiveTab(v as RitualsPageTab)}
        />

        <div className="mt-6">
          {activeTab === "lista" &&
            (rituals.length === 0 ? (
              <RitualsEmptyState onNew={openNew} />
            ) : (
              <div className="overflow-x-auto rounded-xl border bg-card">
                <Table className="min-w-[880px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-5">Ritual</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>DRI</TableHead>
                      <TableHead>Recorrência</TableHead>
                      <TableHead>Data inicial</TableHead>
                      <TableHead className="text-center">Duração</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="pr-5 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rituals.map((r) => {
                      const data = new Date(r.startAt);
                      const overdue = data < new Date() && r.executions.length === 0;
                      const driName = r.dri?.displayName || r.responsibleName || "—";
                      const hasExec = r.executions.length > 0;
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="max-w-[400px] min-w-[260px] py-4 pl-5">
                            <div className="text-sm font-semibold">{r.name}</div>
                            {r.description && (
                              <div className="text-[11px] leading-relaxed text-muted-foreground">
                                {r.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-medium">
                              {r.ritualType || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {r.area ? (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-medium",
                                  RITUAL_AREA_COLORS[r.area] ?? "bg-muted text-muted-foreground",
                                )}
                              >
                                {r.area}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">{driName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {r.recurrence || "—"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {format(data, "dd MMM yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {r.durationMin ? `${r.durationMin} min` : "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            {hasExec ? (
                              <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
                                Concluído
                              </Badge>
                            ) : overdue ? (
                              <Badge className="bg-rose-500/15 text-rose-700 hover:bg-rose-500/15">Atrasado</Badge>
                            ) : (
                              <Badge className="bg-sky-500/15 text-sky-700 hover:bg-sky-500/15">Agendado</Badge>
                            )}
                          </TableCell>
                          <TableCell className="pr-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {hasExec ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-amber-600 hover:text-amber-700"
                                  onClick={() => handleUndo(r)}
                                  disabled={undoPending}
                                >
                                  Desfazer
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-primary"
                                  onClick={() => setExecuting(r)}
                                >
                                  Executar <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => openEdit(r)}>
                                    <Pencil className="h-3.5 w-3.5" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="cursor-pointer gap-2 text-rose-600 focus:text-rose-600"
                                    onClick={() => setDeleting(r)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ))}

          {activeTab === "calendario" && <RitualsGoogleCalendarPanel />}

          {activeTab === "adesao" && (
            <RitualsPlaceholderCard
              title="Dashboard de adesão"
              description="Métricas de adesão por DRI e por área. Disponível na próxima iteração."
            />
          )}
        </div>
      </div>

      <RitualFormModal
        open={formOpen}
        onOpenChange={(next) => {
          setFormOpen(next);
          if (!next) setEditing(null);
        }}
        editing={editing}
        staff={staff}
      />

      <ExecuteRitualModal
        ritual={executing}
        onOpenChange={(next) => {
          if (!next) setExecuting(null);
        }}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ritual</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o ritual <strong>&quot;{deleting?.name}&quot;</strong>? Todas as
              execuções registradas também serão removidas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePending}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {deletePending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

RitualsPageClient.displayName = "RitualsPageClient";

export default RitualsPageClient;

const STAT_TONE: Record<"rose" | "sky" | "emerald" | "violet", string> = {
  rose: "border-rose-200/80 bg-rose-50/40 shadow-sm shadow-rose-500/10 dark:border-rose-500/25 dark:bg-rose-950/20 dark:shadow-rose-900/20",
  sky: "border-sky-200/80 bg-sky-50/40 shadow-sm shadow-sky-500/10 dark:border-sky-500/25 dark:bg-sky-950/20 dark:shadow-sky-900/20",
  emerald:
    "border-emerald-200/80 bg-emerald-50/40 shadow-sm shadow-emerald-500/10 dark:border-emerald-500/25 dark:bg-emerald-950/20 dark:shadow-emerald-900/20",
  violet:
    "border-violet-200/80 bg-violet-50/40 shadow-sm shadow-violet-500/10 dark:border-violet-500/25 dark:bg-violet-950/20 dark:shadow-violet-900/20",
};

function RitualsStatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  tone: keyof typeof STAT_TONE;
}) {
  return (
    <Card className={cn("border transition-shadow hover:shadow-md", STAT_TONE[tone])}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/60 ring-1 ring-foreground/5">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function RitualsEmptyState({ onNew }: { onNew: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <CalendarDays className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Nenhum ritual cadastrado ainda.</p>
        <Button onClick={onNew} className="gap-1.5">
          <Plus className="h-4 w-4" /> Criar primeiro ritual
        </Button>
      </CardContent>
    </Card>
  );
}

function RitualsPlaceholderCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
        <Sparkles className="h-6 w-6 text-muted-foreground" />
        <div className="font-semibold">{title}</div>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
