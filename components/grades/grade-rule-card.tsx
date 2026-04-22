"use client";

import { memo, useMemo } from "react";
import { Edit2, Trash2 } from "lucide-react";
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
import { Dialog } from "@/components/ui/dialog";
import ModalDialogContent from "@/components/modals/primitives/modal-dialog-content";
import ModalGradientHeader from "@/components/modals/primitives/modal-gradient-header";
import { GradeRuleCardRule } from "@/lib/types/grade/index";
import { useEditableRule } from "@/hooks/grades/use-editable-rule";
import RuleDisplay from "@/components/grades/rules/rule-display";
import { cn } from "@/lib/utils/cn";
import { mergeOptions } from "@/lib/utils/lobbyze-filters";
import RuleEditor from "./rules/rule-editor";
import { destructiveAlertDialogContentClassName, destructiveAlertHeaderClassName, destructiveAlertTitleClassName, destructiveAlertDescriptionWrapClassName, destructiveAlertFooterClassName, destructiveAlertCancelButtonClassName, destructiveAlertConfirmButtonClassName } from "@/lib/constants/classes";
import { cardClassName } from "@/lib/constants/sharkscope/ui";
import { SPEED_PRESETS, TOURNAMENT_TYPE_PRESETS, VARIANT_PRESETS, GAME_TYPE_PRESETS, PLAYER_COUNT_PRESETS, WEEKDAY_PRESETS, SITES_PRESETS } from "@/lib/constants/presets";
const GradeRuleCard = memo(function GradeRuleCard({
  rule,
  idx,
  manage,
  gradeProfileId,
}: {
  rule: GradeRuleCardRule;
  idx: number;
  manage: boolean;
  gradeProfileId: string;
}) {
  const { form, set, meta, isEditing, actions } = useEditableRule(rule, manage, gradeProfileId);

  const speedOptions = useMemo(() => mergeOptions(SPEED_PRESETS, form.speed), [form.speed]);
  const ttOptions = useMemo(() => mergeOptions(TOURNAMENT_TYPE_PRESETS, form.tournamentType), [form.tournamentType]);
  const vOptions = useMemo(() => mergeOptions(VARIANT_PRESETS, form.variant), [form.variant]);
  const gameOptions = useMemo(() => mergeOptions(GAME_TYPE_PRESETS, form.gameType), [form.gameType]);
  const pcOptions = useMemo(() => mergeOptions(PLAYER_COUNT_PRESETS, form.playerCount), [form.playerCount]);
  const wdOptions = useMemo(() => mergeOptions(WEEKDAY_PRESETS, form.weekDay), [form.weekDay]);
  const sitesOptions = useMemo(() => mergeOptions(SITES_PRESETS, form.sites), [form.sites]);

  return (
    <>
      <div
        className={`flex h-full flex-col rounded-xl border border-blue-500/20 bg-card shadow-sm transition-colors duration-200 hover:border-blue-500/35 hover:shadow-blue-200 hover:shadow-xl ${cardClassName}`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-blue-500/10 bg-blue-500/[0.05] px-2.5 py-2 sm:px-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-blue-500/25 bg-blue-500/10 text-[11px] font-bold tabular-nums text-blue-600">
              {idx + 1}
            </div>
            <h3 className="truncate text-sm font-bold leading-tight tracking-tight text-foreground sm:text-[15px]">
              {rule.filterName}
            </h3>
          </div>
          {manage && (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => actions.setEditing(true)}
                className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-500/10 hover:text-blue-700"
              >
                <Edit2 className="mr-1 h-3.5 w-3.5" />
                Editar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => actions.setDeleteOpen(true)}
                className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label="Excluir regra"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Excluir
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-2.5 sm:p-3">
           <RuleDisplay rule={rule} />
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={(val) => !val && actions.cancelEdit()}>
        <ModalDialogContent size="lg" className="sm:max-w-[1000px] overflow-hidden p-0 border-0 flex flex-col max-h-[90vh]">
          <ModalGradientHeader
            icon={Edit2}
            title="Editar Regra"
            description="Modifique as restrições desta regra de grade."
            density="compact"
          />
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-foreground/90 p-4 ">Nome da restrição</label>
              <input
                type="text"
                value={form.filterName || ""}
                onChange={(e) => set("filterName", e.target.value)}
                className={cn(
                  "bg-muted/40 px-3 py-1.5 h-10 border border-border/80 focus-visible:ring-2 focus-visible:ring-blue-500/20 outline-none w-full max-w-[400px] text-[14px] font-medium",
                  "placeholder:text-muted-foreground/35 dark:placeholder:text-muted-foreground/45"
                )}
                placeholder="Nome da restrição"
              />
            </div>
            
            <RuleEditor 
              form={form}
              set={set}
              speedOptions={speedOptions}
              ttOptions={ttOptions}
              vOptions={vOptions}
              gameOptions={gameOptions}
              pcOptions={pcOptions}
              wdOptions={wdOptions}
              sitesOptions={sitesOptions}
            />

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 mt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => actions.setDeleteOpen(true)}
                className="text-destructive border-transparent hover:border-destructive/30 hover:bg-destructive/10 bg-red-500/10 hover:bg-red-500/20 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Excluir Regra</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={actions.cancelEdit}
                  disabled={meta.saving}
                  className="border-border/60"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={actions.handleSave}
                  disabled={meta.saving}
                  className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 px-6"
                >
                  {meta.saving ? "Salvando…" : "Salvar alterações"}
                </Button>
              </div>
            </div>
          </div>
        </ModalDialogContent>
      </Dialog>

      <AlertDialog open={meta.deleteOpen} onOpenChange={actions.setDeleteOpen}>
        <AlertDialogContent size="default" className={destructiveAlertDialogContentClassName}>
          <DestructiveAlertIconHeader />
          <AlertDialogHeader className={destructiveAlertHeaderClassName}>
            <AlertDialogTitle className={destructiveAlertTitleClassName}>
              Excluir este filtro?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className={destructiveAlertDescriptionWrapClassName}>
                <p>
                  A regra{" "}
                  <span className="font-semibold text-foreground">{rule.filterName}</span> será
                  removida desta grade. Jogadores que usam esta grade deixarão de considerar este
                  filtro.
                </p>
                <DestructiveAlertWarningNote>Esta ação não pode ser desfeita.</DestructiveAlertWarningNote>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <DestructiveAlertDivider />
          <AlertDialogFooter className={destructiveAlertFooterClassName}>
            <AlertDialogCancel
              type="button"
              disabled={meta.deleting}
              className={destructiveAlertCancelButtonClassName}
            >
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={meta.deleting}
              onClick={actions.handleDelete}
              className={destructiveAlertConfirmButtonClassName}
            >
              {meta.deleting ? "Excluindo…" : "Excluir filtro"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

GradeRuleCard.displayName = "GradeRuleCard";

export default GradeRuleCard;
