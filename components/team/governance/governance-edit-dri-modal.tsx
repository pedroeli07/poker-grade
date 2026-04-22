"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GOVERNANCE_DRI_AREA_OPTIONS } from "@/lib/constants/team/governance-ui";
import { upsertTeamDri } from "@/lib/queries/db/team/governance/save-dri";
import type { GovernanceEditDriModalProps } from "@/lib/types/team/governance";
import type { GovernanceDriDTO } from "@/lib/data/team/governance-page";
import type { GovernanceStaffOption } from "@/lib/data/team/governance-page";
import {
  DriResponsibleCombobox,
  resolveStaffFromExactName,
  type DriResponsibleValue,
} from "./dri-responsible-combobox";

const labelCls = "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

function initialResponsible(d: GovernanceDriDTO | null, list: readonly GovernanceStaffOption[]): DriResponsibleValue {
  if (!d) return { authUserId: null, text: "" };
  if (d.authUserId) {
    const row = list.find((s) => s.id === d.authUserId);
    if (row) return { authUserId: d.authUserId, text: row.name };
  }
  return {
    authUserId: null,
    text: d.responsibleName?.trim() || d.user?.displayName?.trim() || d.user?.email || "",
  };
}

function GovernanceEditDriForm({
  dri,
  staff,
  onOpenChange,
}: {
  dri: GovernanceDriDTO | null;
  staff: readonly GovernanceStaffOption[];
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [area, setArea] = useState(() => dri?.area ?? "Técnica");
  const [rules, setRules] = useState(() => dri?.rules ?? "");
  const [responsible, setResponsible] = useState<DriResponsibleValue>(() => initialResponsible(dri, staff));

  const save = () => {
    if (!area.trim() || !rules.trim()) {
      toast.error("Área e regras de escalação são obrigatórios.");
      return;
    }
    if (!responsible.text.trim()) {
      toast.error("Indique o responsável final: escolha na lista ou escreva o nome.");
      return;
    }
    const exact = resolveStaffFromExactName(responsible.text, staff);
    const authUserId = responsible.authUserId ?? exact?.id ?? null;
    const responsibleName = authUserId ? null : responsible.text.trim();

    start(async () => {
      const r = await upsertTeamDri({
        id: dri?.id,
        area: area.trim(),
        rules: rules.trim(),
        authUserId,
        responsibleName,
      });
      if (r.ok) {
        toast.success(dri ? "Área DRI atualizada." : "Área DRI criada.");
        onOpenChange(false);
        router.refresh();
      } else toast.error(r.error || "Falha ao salvar DRI.");
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{dri ? "Configurar DRI" : "Nova área DRI"}</DialogTitle>
        <DialogDescription>
          Defina o responsável final e as regras de escalação para esta área da matriz.
        </DialogDescription>
      </DialogHeader>
      <div className="grid max-h-[min(80vh,720px)] gap-5 overflow-y-auto pr-0.5 py-1">
        <div className="space-y-2">
          <Label className={labelCls}>Área de atuação</Label>
          <Select value={area} onValueChange={setArea} disabled={!!dri}>
            <SelectTrigger className="w-full min-w-0">
              <SelectValue placeholder="Selecione a área" />
            </SelectTrigger>
            <SelectContent>
              {GOVERNANCE_DRI_AREA_OPTIONS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {dri ? (
            <p className="text-[10px] text-muted-foreground">
              A área não pode ser alterada. Exclua e crie outra se necessário.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label className={labelCls} htmlFor="dri-resp-combo">
            Responsável final
          </Label>
          <DriResponsibleCombobox
            id="dri-resp-combo"
            staff={staff}
            value={responsible}
            onChange={setResponsible}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Um único campo: abra a lista (seta) ou comece a escrever para filtrar. Pode selecionar alguém com conta ou
            digitar um nome que ainda não existe no app — esse texto aparece na matriz.
          </p>
        </div>

        <div className="space-y-2">
          <Label className={labelCls}>Regras de escalação</Label>
          <Textarea
            className="min-h-[120px] resize-y"
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            placeholder="Ex: Decisões de ABI >30% requerem aprovação do Gestor"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button type="button" onClick={save} disabled={pending}>
          Salvar configuração
        </Button>
      </DialogFooter>
    </>
  );
}

export default function GovernanceEditDriModal({ open, onOpenChange, dri, staff }: GovernanceEditDriModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {open ? (
          <GovernanceEditDriForm
            key={dri?.id ?? "new"}
            dri={dri}
            staff={staff}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
