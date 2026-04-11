"use client";

import { memo, useMemo } from "react";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { GradeRuleCardRule } from "@/lib/types";
import { cardClassName } from "@/lib/constants";
import { useEditableRule } from "@/hooks/grades/use-editable-rule";
import { RuleDisplay } from "@/components/grades/rules/rule-display";
import { RuleEditor } from "@/components/grades/rules/rule-editor";
import {
  SPEED_PRESETS,
  TOURNAMENT_TYPE_PRESETS,
  VARIANT_PRESETS,
  GAME_TYPE_PRESETS,
  PLAYER_COUNT_PRESETS,
  WEEKDAY_PRESETS,
} from "@/lib/constants";
import { mergeOptions } from "@/lib/utils";

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

  return (
    <div
      className={`rounded-2xl border border-blue-500/15 bg-card overflow-hidden transition-all duration-300 ${
        isEditing ? "ring-2 ring-blue-500/20 shadow-xl" : `hover:border-blue-500/30 ${cardClassName}`
      }`}
    >
      {/* HEADER */}
      <div className="bg-blue-500/[0.04] border-b border-blue-500/10 px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 font-bold text-sm tracking-tight border border-blue-500/20">
            {idx + 1}
          </div>
          {isEditing ? (
            <input
              type="text"
              value={form.filterName || ""}
              onChange={(e) => set("filterName", e.target.value)}
              className="bg-background px-3 py-1.5 h-8 text-sm font-semibold rounded-md border border-border focus-visible:ring-2 focus-visible:ring-blue-500/20 outline-none w-full max-w-[300px]"
              placeholder="Nome da restrição"
            />
          ) : (
            <h3 className="text-lg font-bold text-foreground truncate tracking-tight">
              {rule.filterName}
            </h3>
          )}
        </div>
        {!isEditing && manage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => actions.setEditing(true)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 h-8 px-3 shrink-0"
          >
            <Edit2 className="h-4 w-4 mr-1.5" />
            Editar
          </Button>
        )}
      </div>

      <div className="p-5">
        {!isEditing ? (
           <RuleDisplay rule={rule} />
        ) : (
           <div className="space-y-6">
              <RuleEditor 
                form={form}
                set={set}
                speedOptions={speedOptions}
                ttOptions={ttOptions}
                vOptions={vOptions}
                gameOptions={gameOptions}
                pcOptions={pcOptions}
                wdOptions={wdOptions}
              />
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  size="sm"
                  onClick={actions.handleSave}
                  disabled={meta.saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {meta.saving ? "Salvando…" : "Salvar alterações"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={actions.cancelEdit}
                  disabled={meta.saving}
                >
                  Cancelar
                </Button>
                <AlertDialog open={meta.deleteOpen} onOpenChange={actions.setDeleteOpen}>
                  <AlertDialogTrigger asChild>
                    <Button type="button" size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                      Excluir filtro
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="default" className="sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir este filtro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        A regra <span className="font-semibold text-foreground">{rule.filterName}</span> será removida desta grade. 
                        Jogadores que usam esta grade deixarão de considerar este filtro.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel type="button" disabled={meta.deleting}>
                        Cancelar
                      </AlertDialogCancel>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={meta.deleting}
                        onClick={actions.handleDelete}
                      >
                        {meta.deleting ? "Excluindo…" : "Excluir filtro"}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
           </div>
        )}
      </div>
    </div>
  );
});

GradeRuleCard.displayName = "GradeRuleCard";

export default GradeRuleCard;
