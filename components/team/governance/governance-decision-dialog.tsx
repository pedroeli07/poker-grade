"use client";



import { useState, useTransition, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {

  COMMUNICATION_AREA_OPTIONS,

  DECISION_STATUS_OPTIONS,

  DECISION_VISIBILITY_OPTIONS,

  DECISION_TAG_CHIPS,

} from "@/lib/constants/team/governance-mural-ui";

import type { TeamDecisionUpsert } from "@/lib/types/team/governance";

import { upsertTeamDecision } from "@/lib/queries/db/team/governance/save-decision";

import {

  decisionDtoToGovernanceForm,

  toggleTagInList,

  type GovernanceDecisionFormFields,

} from "@/lib/utils/team/governance-decision-form";

import type { GovernanceDecisionDialogProps } from "@/lib/types/team/governance";

import { cn } from "@/lib/utils/cn";



const labelClass = "text-sm font-semibold text-foreground";



function ReqLabel({ children }: { children: ReactNode }) {

  return (

    <Label className={labelClass}>

      {children} <span className="text-destructive">*</span>

    </Label>

  );

}



export default function GovernanceDecisionDialog({

  open,

  onOpenChange,

  editingId,

  initial,

}: GovernanceDecisionDialogProps) {

  const router = useRouter();

  const [pending, start] = useTransition();

  const [form, setForm] = useState<GovernanceDecisionFormFields>(() => decisionDtoToGovernanceForm(initial));



  const setF = (patch: Partial<GovernanceDecisionFormFields>) => setForm((p) => ({ ...p, ...patch }));



  const save = () => {

    if (!form.title.trim() || !form.summary.trim()) {

      toast.error("Título e resumo são obrigatórios.");

      return;

    }

    if (!form.impact.trim()) {

      toast.error("Indique o impacto esperado.");

      return;

    }

    if (form.selectedTags.length < 1) {

      toast.error("Selecione pelo menos uma tag.");

      return;

    }

    const base: TeamDecisionUpsert = {

      title: form.title.trim(),

      summary: form.summary.trim(),

      impact: form.impact.trim(),

      area: form.area,

      status: form.status,

      visibility: form.visibility,

      tags: form.selectedTags,

    };

    const payload: TeamDecisionUpsert = editingId

      ? {

          ...base,

          id: editingId,

          ...(form.decidedAtLocal ? { decidedAt: new Date(form.decidedAtLocal) } : {}),

        }

      : base;



    start(async () => {

      const r = await upsertTeamDecision(payload);

      if (r.ok) {

        toast.success(editingId ? "Decisão atualizada." : "Decisão registrada.");

        onOpenChange(false);

        router.refresh();

      } else toast.error(r.error || "Falha ao salvar decisão.");

    });

  };



  const inputBase = "rounded-[10px] border-border/80 bg-background";

  const selectTriggerBase = "h-10 w-full rounded-[10px] border-border/80 bg-background";



  return (

    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="max-w-lg sm:max-w-lg">

        <DialogHeader className="text-left">

          <DialogTitle>{editingId ? "Editar decisão" : "Nova Decisão"}</DialogTitle>

          <DialogDescription>
            {editingId
              ? "Atualize título, resumo, impacto, status e visibilidade desta decisão."
              : "Registre a decisão, o impacto esperado e as tags para o time acompanhar."}
          </DialogDescription>

        </DialogHeader>

        <div className="grid max-h-[min(80vh,720px)] min-w-0 gap-5 overflow-y-auto pr-0.5 py-1">

          <div className="space-y-2">

            <ReqLabel>Título</ReqLabel>

            <Input

              className={cn(inputBase)}

              value={form.title}

              onChange={(e) => setF({ title: e.target.value })}

              placeholder="Título da decisão..."

            />

          </div>

          <div className="space-y-2">

            <ReqLabel>Resumo</ReqLabel>

            <Textarea

              className={cn("min-h-[100px] resize-y", inputBase)}

              value={form.summary}

              onChange={(e) => setF({ summary: e.target.value })}

              placeholder="Descreva a decisão em 2-4 linhas..."

            />

          </div>

          <div className="space-y-2">

            <ReqLabel>Impacto Esperado</ReqLabel>

            <Textarea

              className={cn(

                "min-h-[100px] resize-y border-sky-300/80 bg-background focus-visible:border-sky-400/90 focus-visible:ring-sky-400/30 dark:border-sky-500/50 dark:focus-visible:border-sky-500/80",

                "rounded-[10px]",

              )}

              value={form.impact}

              onChange={(e) => setF({ impact: e.target.value })}

              placeholder="Qual o impacto esperado desta decisão..."

            />

          </div>



          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="space-y-2">

              <ReqLabel>Visibilidade</ReqLabel>

              <Select value={form.visibility} onValueChange={(v) => setF({ visibility: v })}>

                <SelectTrigger className={selectTriggerBase}>

                  <SelectValue placeholder="Quem vê" />

                </SelectTrigger>

                <SelectContent>

                  {DECISION_VISIBILITY_OPTIONS.map((o) => (

                    <SelectItem key={o.value} value={o.value}>

                      {o.label}

                    </SelectItem>

                  ))}

                </SelectContent>

              </Select>

            </div>

            <div className="space-y-2">

              <ReqLabel>Status</ReqLabel>

              <Select value={form.status} onValueChange={(v) => setF({ status: v })}>

                <SelectTrigger className={selectTriggerBase}>

                  <SelectValue />

                </SelectTrigger>

                <SelectContent>

                  {DECISION_STATUS_OPTIONS.map((o) => (

                    <SelectItem key={o.value} value={o.value}>

                      {o.label}

                    </SelectItem>

                  ))}

                </SelectContent>

              </Select>

            </div>

          </div>



          {editingId ? (

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="space-y-2">

                <Label className={labelClass}>Área</Label>

                <Select value={form.area} onValueChange={(v) => setF({ area: v })}>

                  <SelectTrigger className={selectTriggerBase}>

                    <SelectValue />

                  </SelectTrigger>

                  <SelectContent>

                    {COMMUNICATION_AREA_OPTIONS.map((a) => (

                      <SelectItem key={a} value={a}>

                        {a}

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

              <div className="space-y-2">

                <Label className={labelClass}>Data da decisão</Label>

                <Input

                  className={cn("h-10 min-w-0 max-w-full", inputBase)}

                  type="datetime-local"

                  value={form.decidedAtLocal}

                  onChange={(e) => setF({ decidedAtLocal: e.target.value })}

                />

              </div>

            </div>

          ) : null}



          <div className="space-y-2.5">

            <Label className={labelClass}>

              Tags<span className="text-destructive">*</span>{" "}

              <span className="font-semibold">(selecione pelo menos uma)</span>

            </Label>

            <div className="flex flex-wrap gap-2">

              {DECISION_TAG_CHIPS.map((tag) => {

                const on = form.selectedTags.includes(tag);

                return (

                  <button

                    key={tag}

                    type="button"

                    onClick={() => setF({ selectedTags: toggleTagInList(form.selectedTags, tag) })}

                    className={cn(

                      "cursor-pointer rounded-full border border-border/80 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-foreground/20 hover:bg-muted/50",

                      on && "border-primary bg-primary/10 text-primary hover:border-primary hover:bg-primary/15",

                    )}

                  >

                    {tag}

                  </button>

                );

              })}

            </div>

          </div>

        </div>

        <DialogFooter>

          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>

            Cancelar

          </Button>

          <Button type="button" onClick={save} disabled={pending}>

            {editingId ? "Guardar alterações" : "Criar Decisão"}

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>

  );

}


