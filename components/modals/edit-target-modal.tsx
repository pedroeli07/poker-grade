"use client";

import { memo } from "react";
import { Dialog } from "@/components/ui/dialog";
import ModalDialogContent from "@/components/modals/primitives/modal-dialog-content";
import ModalFormFooter from "@/components/modals/primitives/modal-form-footer";
import ModalGradientHeader from "@/components/modals/primitives/modal-gradient-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Pencil, Loader2, ChevronRight } from "lucide-react";
import { useEditTargetModal } from "@/hooks/targets/use-edit-target-modal";
import type { EditTargetModalProps } from "@/lib/types/target/index";
import { CATEGORIES, LIMIT_ACTIONS } from "@/lib/constants/target";
const EditTargetModal = memo(function EditTargetModal(props: EditTargetModalProps) {
  const { target } = props;
  const {
    open,
    isPending,
    formRef,
    targetType,
    setTargetType,
    category,
    setCategory,
    limitAction,
    setLimitAction,
    handleOpenChange,
    handleSubmit,
  } = useEditTargetModal(props);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <ModalDialogContent>
        <ModalGradientHeader
          icon={Pencil}
          title="Editar Target"
          description={`Atualize os dados de "${target.name}" para ${target.playerName}.`}
          density="compact"
        />

        <Separator />

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Jogador
              </Label>
              <div className="h-9 px-3 flex items-center rounded-md bg-muted/30 border border-border/40 text-sm text-muted-foreground">
                {target.playerName}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Nome da Meta <span className="text-destructive normal-case">*</span>
              </Label>
              <Input
                id="edit-name"
                name="name"
                required
                defaultValue={target.name}
                className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Categoria
                </Label>
                <Select value={category} onValueChange={setCategory} disabled={isPending}>
                  <SelectTrigger className="w-full h-9 bg-muted/40 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tipo
                </Label>
                <Select value={targetType} onValueChange={setTargetType} disabled={isPending}>
                  <SelectTrigger className="w-full h-9 bg-muted/40 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NUMERIC">Numérico</SelectItem>
                    <SelectItem value="TEXT">Texto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {targetType === "NUMERIC" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-numericValue" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Valor Alvo
                  </Label>
                  <Input
                    id="edit-numericValue"
                    name="numericValue"
                    type="number"
                    step="0.01"
                    defaultValue={target.numericValue ?? ""}
                    className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-numericCurrent" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Valor Atual
                  </Label>
                  <Input
                    id="edit-numericCurrent"
                    name="numericCurrent"
                    type="number"
                    step="0.01"
                    defaultValue={target.numericCurrent ?? ""}
                    className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-unit" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Unidade
                  </Label>
                  <Input
                    id="edit-unit"
                    name="unit"
                    defaultValue={target.unit ?? ""}
                    placeholder="$, %, sessões..."
                    className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1.5" />
                <div className="space-y-1.5">
                  <Label htmlFor="edit-greenThreshold" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Limite Verde (≥)
                  </Label>
                  <Input
                    id="edit-greenThreshold"
                    name="greenThreshold"
                    type="number"
                    step="0.01"
                    defaultValue={target.greenThreshold ?? ""}
                    className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-yellowThreshold" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Limite Amarelo (≥)
                  </Label>
                  <Input
                    id="edit-yellowThreshold"
                    name="yellowThreshold"
                    type="number"
                    step="0.01"
                    defaultValue={target.yellowThreshold ?? ""}
                    className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                    disabled={isPending}
                  />
                </div>
              </div>
            )}

            {targetType === "TEXT" && (
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-textValue" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Valor / Descrição alvo
                  </Label>
                  <Textarea
                    id="edit-textValue"
                    name="textValue"
                    defaultValue={target.textValue ?? ""}
                    rows={2}
                    className="bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 resize-none"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-textCurrent" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Situação atual
                  </Label>
                  <Textarea
                    id="edit-textCurrent"
                    name="textCurrent"
                    defaultValue={target.textCurrent ?? ""}
                    rows={2}
                    className="bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 resize-none"
                    disabled={isPending}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Gatilho de Limite
              </Label>
              <Select value={limitAction} onValueChange={setLimitAction} disabled={isPending}>
                <SelectTrigger className="w-full h-9 bg-muted/40 border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIMIT_ACTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-coachNotes" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Notas do Coach
              </Label>
              <Textarea
                id="edit-coachNotes"
                name="coachNotes"
                defaultValue={target.coachNotes ?? ""}
                placeholder="Contexto, observações, critérios de avaliação..."
                rows={3}
                className="bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 resize-none"
                disabled={isPending}
              />
            </div>
          </div>

          <Separator />

          <ModalFormFooter className="p-6 pt-2 border-t-0 bg-muted/20 gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="border-border/60"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 min-w-[130px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Salvar alterações
                  <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </ModalFormFooter>
        </form>
      </ModalDialogContent>
    </Dialog>
  );
});

EditTargetModal.displayName = "EditTargetModal";

export default EditTargetModal;
