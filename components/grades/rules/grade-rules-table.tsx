"use client";

import { memo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DataTableShell from "@/components/data-table/data-table-shell";
import ColumnFilter from "@/components/column-filter";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import { cn } from "@/lib/utils/cn";
import type { GradeRulesColumnFilters, GradeRulesColumnOptions, GradeRulesColumnKey } from "@/hooks/grades/use-grade-rules-list";
import type { GradeRuleCardRule } from "@/lib/types/grade/index";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditableRule } from "@/hooks/grades/use-editable-rule";
import {
  BuyInCell,
  ExcludeCell,
  FieldCell,
  GtdCell,
  StackedPills,
  TipoTorneioCell,
} from "./grade-rules-table-cells";

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
import { mergeOptions } from "@/lib/utils/lobbyze-filters";
import { destructiveAlertDialogContentClassName, destructiveAlertHeaderClassName, destructiveAlertTitleClassName, destructiveAlertDescriptionWrapClassName, destructiveAlertFooterClassName, destructiveAlertCancelButtonClassName, destructiveAlertConfirmButtonClassName, dataTableHeaderRowClass, dataTableShellActiveClass } from "@/lib/constants/classes";
import { SPEED_PRESETS, TOURNAMENT_TYPE_PRESETS, VARIANT_PRESETS, GAME_TYPE_PRESETS, PLAYER_COUNT_PRESETS, WEEKDAY_PRESETS, SITES_PRESETS } from "@/lib/constants/presets";
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
      <TableRow
        className={cn(
          "group border-b border-border/70 transition-colors duration-150",
          "odd:bg-card/90 even:bg-muted/[0.28]",
          "hover:bg-blue-500/[0.06] hover:shadow-[inset_3px_0_0_0_rgba(59,130,246,0.35)]"
        )}
      >
        <TableCell className="w-[40px] align-top text-center text-xs font-semibold tabular-nums text-muted-foreground">
          {idx + 1}
        </TableCell>
        <TableCell className="max-w-[200px] align-top font-medium text-foreground">
          <span className="leading-snug">{rule.filterName}</span>
        </TableCell>
        <TableCell className="min-w-[72px] max-w-[100px] whitespace-normal align-top">
          <BuyInCell rule={rule} />
        </TableCell>
        <TableCell className="min-w-[120px] max-w-[180px] whitespace-normal border-l border-border/40 align-top">
          {rule.sites.length > 0 ? <StackedPills items={rule.sites} /> : <span className="text-xs text-muted-foreground">—</span>}
        </TableCell>
        <TableCell className="min-w-[100px] max-w-[140px] whitespace-normal align-top">
          {rule.speed.length > 0 ? <StackedPills items={rule.speed} /> : <span className="text-xs text-muted-foreground">—</span>}
        </TableCell>
        <TableCell className="min-w-[100px] max-w-[140px] whitespace-normal align-top">
          {rule.variant.length > 0 ? <StackedPills items={rule.variant} /> : <span className="text-xs text-muted-foreground">—</span>}
        </TableCell>
        <TableCell className="min-w-[100px] max-w-[160px] whitespace-normal align-top">
          <TipoTorneioCell rule={rule} />
        </TableCell>
        <TableCell className="min-w-[120px] max-w-[200px] whitespace-normal align-top">
          <GtdCell rule={rule} />
        </TableCell>
        <TableCell className="min-w-[72px] whitespace-normal align-top">
          <FieldCell rule={rule} />
        </TableCell>
        <TableCell className="min-w-[120px] max-w-[220px] whitespace-normal align-top">
          <ExcludeCell rule={rule} />
        </TableCell>
        <TableCell className="w-[88px] align-top text-right">
          {manage && (
            <div className="flex items-start justify-end gap-1 pt-1 opacity-0 transition-opacity group-hover:opacity-100">
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
    <div
      className={cn(
        "min-w-0 max-w-full overflow-hidden rounded-xl transition-all duration-300",
        anyFilter
          ? dataTableShellActiveClass
          : "border border-border/50 bg-card/40 shadow-sm ring-1 ring-border/20"
      )}
    >
      <DataTableShell hasActiveView={false} className="!border-0 !bg-transparent shadow-none">
        <Table className="w-full max-w-full text-[14px]">
        <TableHeader className="[&_tr]:border-b-0">
          <TableRow
            className={cn(
              dataTableHeaderRowClass,
              "border-b border-blue-500/35 shadow-[inset_0_-1px_0_0_rgba(59,130,246,0.18)]",
              anyFilter && "ring-1 ring-inset ring-primary/25"
            )}
          >
            <TableHead className="w-[40px] text-center text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              #
            </TableHead>
            <TableHead className="min-w-[160px] max-w-[220px] text-left text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <div className="flex items-center justify-start gap-0.5">
                <ColumnFilter
                  columnId="filterName"
                  label={<FilteredColumnTitle active={filters.filterName !== null}>Regra</FilteredColumnTitle>}
                  options={options.filterName}
                  applied={filters.filterName}
                  onApply={setCol("filterName")}
                  ariaLabel="Regra"
                />
              </div>
            </TableHead>
            <TableHead className="w-[100px] min-w-[88px] text-left text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <div className="flex items-center justify-start gap-0.5">
                <ColumnFilter
                  columnId="buyIn"
                  label={<FilteredColumnTitle active={filters.buyIn !== null}>Buy-in</FilteredColumnTitle>}
                  options={options.buyIn}
                  applied={filters.buyIn}
                  onApply={setCol("buyIn")}
                  ariaLabel="Buy-in"
                />
              </div>
            </TableHead>
            <TableHead className="min-w-[120px] border-l border-blue-500/25 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
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
            <TableHead className="min-w-[100px] text-center text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
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
            <TableHead className="min-w-[100px] text-center text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
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
            <TableHead className="min-w-[100px] text-center text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <div className="flex items-center justify-center gap-0.5">
                <ColumnFilter
                  columnId="tournamentType"
                  label={<FilteredColumnTitle active={filters.tournamentType !== null}>Tipo</FilteredColumnTitle>}
                  options={options.tournamentType}
                  applied={filters.tournamentType}
                  onApply={setCol("tournamentType")}
                  ariaLabel="Tipo de torneio"
                />
              </div>
            </TableHead>
            <TableHead className="min-w-[120px] text-left text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <div className="flex items-center justify-start gap-0.5">
                <ColumnFilter
                  columnId="prizePool"
                  label={<FilteredColumnTitle active={filters.prizePool !== null}>Garantido</FilteredColumnTitle>}
                  options={options.prizePool}
                  applied={filters.prizePool}
                  onApply={setCol("prizePool")}
                  ariaLabel="Garantido"
                />
              </div>
            </TableHead>
            <TableHead className="min-w-[88px] text-center text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
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
            <TableHead className="min-w-[120px] max-w-[200px] text-left text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <div className="flex items-center justify-start gap-0.5">
                <ColumnFilter
                  columnId="excludePattern"
                  label={<FilteredColumnTitle active={filters.excludePattern !== null}>Excluir</FilteredColumnTitle>}
                  options={options.excludePattern}
                  applied={filters.excludePattern}
                  onApply={setCol("excludePattern")}
                  ariaLabel="Padrão de exclusão"
                />
              </div>
            </TableHead>
            <TableHead className="w-[88px] border-l border-border/40 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:last-child]:border-b [&_tr:last-child]:border-border/60">
          {rules.length === 0 ? (
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
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
    </div>
  );
});

GradeRulesTable.displayName = "GradeRulesTable";

export default GradeRulesTable;
