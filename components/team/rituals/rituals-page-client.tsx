"use client";

import { memo } from "react";
import { CalendarDays, Plus } from "lucide-react";
import TeamBlueTabBar from "@/components/team/team-blue-tab-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DestructiveAlertDivider,
  DestructiveAlertIconHeader,
  DestructiveAlertWarningNote,
} from "@/components/modals/primitives/destructive-alert-dialog";
import {
  destructiveAlertCancelButtonClassName,
  destructiveAlertConfirmButtonClassName,
  destructiveAlertDescriptionWrapClassName,
  destructiveAlertDialogContentClassName,
  destructiveAlertFooterClassName,
  destructiveAlertHeaderClassName,
  destructiveAlertTitleClassName,
} from "@/lib/constants/classes";
import { RITUALS_PAGE_TABS, type RitualsPageTab } from "@/lib/constants/team/rituals-page-ui";
import { useRitualsPage } from "@/hooks/team/use-rituals-page";
import type { RitualsPageData } from "@/lib/data/team/rituals-page";
import PlayerTourneyStatCard from "@/components/meus-torneios/player-tourney-stat-card";
import RitualFormModal from "./ritual-form-modal";
import ExecuteRitualModal from "./execute-ritual-modal";
import RitualsGoogleCalendarPanel from "./rituals-google-calendar-panel";
import { RitualsListSection } from "./rituals-list-section";
import RitualsAdherenceDashboard from "./rituals-adherence-dashboard";

export type RitualsPageContentProps = RitualsPageData & {
  activeTab: RitualsPageTab;
  onTabChange: (tab: RitualsPageTab) => void;
};

export const RitualsPageContent = memo(function RitualsPageContent({
  rituals,
  staff,
  activeTab,
  onTabChange,
}: RitualsPageContentProps) {
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

  return (
    <div className="w-full max-w-[1920px] mx-auto space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Rituais</h2>
          <p className="mt-1 text-muted-foreground">
            Calendário, execução e acompanhamento de rituais do time.
          </p>
        </div>
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Novo ritual
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <PlayerTourneyStatCard label="Atrasados" value={stats.overdue} tone="red" />
        <PlayerTourneyStatCard label="Agendados" value={stats.scheduled} tone="blue" />
        <PlayerTourneyStatCard label="Concluídos" value={stats.completed} tone="emerald" />
        <PlayerTourneyStatCard label="Taxa de adesão" value={`${stats.rate}%`} tone="zinc" />
      </div>

      <div className="space-y-4">
        <TeamBlueTabBar
          tabs={RITUALS_PAGE_TABS}
          activeTab={activeTab}
          onTabChange={(v) => onTabChange(v as RitualsPageTab)}
        />

        <div className="mt-6">
          {activeTab === "lista" &&
            (rituals.length === 0 ? (
              <RitualsEmptyState onNew={openNew} />
            ) : (
              <RitualsListSection
                rituals={rituals}
                onExecute={setExecuting}
                onEdit={openEdit}
                onDelete={setDeleting}
                onUndo={handleUndo}
                undoPending={undoPending}
              />
            ))}

          {activeTab === "calendario" && <RitualsGoogleCalendarPanel />}

          {activeTab === "adesao" && <RitualsAdherenceDashboard rituals={rituals} />}
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
        <AlertDialogContent size="default" className={destructiveAlertDialogContentClassName}>
          <DestructiveAlertIconHeader />
          <AlertDialogHeader className={destructiveAlertHeaderClassName}>
            <AlertDialogTitle className={destructiveAlertTitleClassName}>Excluir ritual?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className={destructiveAlertDescriptionWrapClassName}>
                <p>
                  O ritual{" "}
                  <span className="font-semibold text-foreground">
                    &quot;{deleting?.name ?? ""}&quot;
                  </span>{" "}
                  será excluído. Todas as execuções registradas também serão removidas.
                </p>
                <DestructiveAlertWarningNote>Esta ação não pode ser desfeita.</DestructiveAlertWarningNote>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <DestructiveAlertDivider />
          <AlertDialogFooter className={destructiveAlertFooterClassName}>
            <AlertDialogCancel
              type="button"
              disabled={deletePending}
              className={destructiveAlertCancelButtonClassName}
            >
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={deletePending}
              onClick={handleDelete}
              className={destructiveAlertConfirmButtonClassName}
            >
              {deletePending ? "Excluindo…" : "Excluir"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

RitualsPageContent.displayName = "RitualsPageContent";

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

