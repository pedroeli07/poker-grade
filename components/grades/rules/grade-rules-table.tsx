"use client";

import { memo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DataTableShell from "@/components/data-table/data-table-shell";
import ColumnFilter from "@/components/column-filter";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import { cn } from "@/lib/utils";
import type { GradeRulesColumnFilters, GradeRulesColumnOptions, GradeRulesColumnKey } from "@/hooks/grades/use-grade-rules-list";
import type { GradeRuleCardRule } from "@/lib/types";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditableRule } from "@/hooks/grades/use-editable-rule";
import RuleDisplay from "./rule-display";

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
import RuleEditor from "./rule-editor";
import { mergeOptions } from "@/lib/utils";
import {
  destructiveAlertDialogContentClassName,
  destructiveAlertHeaderClassName,
  destructiveAlertTitleClassName,
  destructiveAlertDescriptionWrapClassName,
  destructiveAlertFooterClassName,
  destructiveAlertCancelButtonClassName,
  destructiveAlertConfirmButtonClassName,
  SPEED_PRESETS,
  TOURNAMENT_TYPE_PRESETS,
  VARIANT_PRESETS,
  GAME_TYPE_PRESETS,
  PLAYER_COUNT_PRESETS,
  WEEKDAY_PRESETS,
  SITES_PRESETS,
} from "@/lib/constants";

function GradeRulesTableRow({
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

  const speedOptions = mergeOptions(SPEED_PRESETS, form.speed);
  const ttOptions = mergeOptions(TOURNAMENT_TYPE_PRESETS, form.tournamentType);
  const vOptions = mergeOptions(VARIANT_PRESETS, form.variant);
  const gameOptions = mergeOptions(GAME_TYPE_PRESETS, form.gameType);
  const pcOptions = mergeOptions(PLAYER_COUNT_PRESETS, form.playerCount);
  const wdOptions = mergeOptions(WEEKDAY_PRESETS, form.weekDay);
  const sitesOptions = mergeOptions(SITES_PRESETS, form.sites);

  return (
    <>
      <TableRow className="group">
        <TableCell className="w-[40px] text-center text-xs text-muted-foreground font-medium">
          {idx + 1}
        </TableCell>
        <TableCell className="font-medium">
          <div className="flex flex-col">
            <span>{rule.filterName}</span>
          </div>
        </TableCell>
        <TableCell colSpan={6} className="p-0">
          <div className="py-2 pr-2">
            <RuleDisplay rule={rule} />
          </div>
        </TableCell>
        <TableCell className="text-right">
          {manage && (
            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => actions.setEditing(true)}
                className="h-8 w-8 text-blue-600 hover:bg-blue-500/10 hover:text-blue-700"
                title="Editar regra"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => actions.setDeleteOpen(true)}
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                title="Excluir regra"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TableCell>
      </TableRow>

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
}

const GradeRulesTable = memo(function GradeRulesTable({
  rules,
  manage,
  gradeId,
  options,
  filters,
  setCol,
  anyFilter,
}: {
  rules: GradeRuleCardRule[];
  manage: boolean;
  gradeId: string;
  options: GradeRulesColumnOptions;
  filters: GradeRulesColumnFilters;
  setCol: (col: GradeRulesColumnKey) => (next: Set<string> | null) => void;
  anyFilter: boolean;
}) {
  return (
    <DataTableShell hasActiveView={anyFilter}>
      <Table className="w-full max-w-full">
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/20 border-b border-border/60">
            <TableHead className="w-[40px] text-center">#</TableHead>
            <TableHead className="w-[200px]">Regra</TableHead>
            <TableHead className="text-center w-[120px]">
              <div className="flex items-center justify-center gap-0.5">
                <ColumnFilter
                  columnId="sites"
                  label={<FilteredColumnTitle active={filters.sites !== null}>Sites</FilteredColumnTitle>}
                  options={options.sites}
                  applied={filters.sites}
                  onApply={setCol("sites")}
                  ariaLabel="Sites"
                />
              </div>
            </TableHead>
            <TableHead className="text-center w-[120px]">
              <div className="flex items-center justify-center gap-0.5">
                <ColumnFilter
                  columnId="speed"
                  label={<FilteredColumnTitle active={filters.speed !== null}>Velocidade</FilteredColumnTitle>}
                  options={options.speed}
                  applied={filters.speed}
                  onApply={setCol("speed")}
                  ariaLabel="Velocidade"
                />
              </div>
            </TableHead>
            <TableHead className="text-center w-[120px]">
              <div className="flex items-center justify-center gap-0.5">
                <ColumnFilter
                  columnId="variant"
                  label={<FilteredColumnTitle active={filters.variant !== null}>Variante</FilteredColumnTitle>}
                  options={options.variant}
                  applied={filters.variant}
                  onApply={setCol("variant")}
                  ariaLabel="Variante"
                />
              </div>
            </TableHead>
            <TableHead className="text-center w-[120px]">
              <div className="flex items-center justify-center gap-0.5">
                <ColumnFilter
                  columnId="gameType"
                  label={<FilteredColumnTitle active={filters.gameType !== null}>Game Type</FilteredColumnTitle>}
                  options={options.gameType}
                  applied={filters.gameType}
                  onApply={setCol("gameType")}
                  ariaLabel="Game Type"
                />
              </div>
            </TableHead>
            <TableHead className="text-center w-[120px]">
              <div className="flex items-center justify-center gap-0.5">
                <ColumnFilter
                  columnId="tournamentType"
                  label={<FilteredColumnTitle active={filters.tournamentType !== null}>Torneio</FilteredColumnTitle>}
                  options={options.tournamentType}
                  applied={filters.tournamentType}
                  onApply={setCol("tournamentType")}
                  ariaLabel="Tipo de Torneio"
                />
              </div>
            </TableHead>
            <TableHead className="text-center w-[120px]">
              <div className="flex items-center justify-center gap-0.5">
                <ColumnFilter
                  columnId="playerCount"
                  label={<FilteredColumnTitle active={filters.playerCount !== null}>Field</FilteredColumnTitle>}
                  options={options.playerCount}
                  applied={filters.playerCount}
                  onApply={setCol("playerCount")}
                  ariaLabel="Field"
                />
              </div>
            </TableHead>
            <TableHead className="w-[80px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                Nenhuma regra encontrada.
              </TableCell>
            </TableRow>
          ) : (
            rules.map((rule, idx) => (
              <GradeRulesTableRow
                key={rule.id}
                rule={rule}
                idx={idx}
                manage={manage}
                gradeProfileId={gradeId}
              />
            ))
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
});

GradeRulesTable.displayName = "GradeRulesTable";

export default GradeRulesTable;
