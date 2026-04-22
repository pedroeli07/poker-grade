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
import { Plus, Target, Loader2, ChevronRight } from "lucide-react";
import { useNewTargetModal } from "@/hooks/targets/use-new-target-modal";
import type { NewTargetModalProps } from "@/lib/types/target/index";
import { CATEGORIES, LIMIT_ACTIONS } from "@/lib/constants/target";
const NewTargetModal = memo(function NewTargetModal(props: NewTargetModalProps) {
  const {
    players,
    open,
    isPending,
    formRef,
    playerId,
    setPlayerId,
    targetType,
    setTargetType,
    category,
    setCategory,
    limitAction,
    setLimitAction,
    handleOpenChange,
    handleSubmit,
    openModal,
  } = useNewTargetModal(props);

  return (
    <>
      <Button
        className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={openModal}
      >
        <Plus className="mr-2 h-4 w-4" />
        Novo Target
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <ModalDialogContent>
          <ModalGradientHeader
            icon={Target}
            title="Novo Target"
            description="Defina uma meta mensurável para o jogador."
            density="compact"
          />

          <Separator />

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Jogador <span className="text-destructive normal-case">*</span>
                </Label>
                <Select 
                  value={playerId} 
                  onValueChange={setPlayerId} 
                  disabled={isPending}
                  >
                  <SelectTrigger className="w-full h-9 bg-muted/40 border-border/60">
                    <SelectValue placeholder="Selecione um jogador..." />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                        {p.nickname && (
                          <span className="ml-1.5 text-xs text-muted-foreground">@{p.nickname}</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Nome da Meta <span className="text-destructive normal-case">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Ex: ABI médio, ROI mínimo, Sessões por semana"
                  className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Categoria
                  </Label>
                  <Select 
                    value={category} 
                    onValueChange={setCategory} 
                    disabled={isPending}
                    >
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
                  <Select 
                    value={targetType} 
                    onValueChange={setTargetType} 
                    disabled={isPending}
                    >
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
                    <Label htmlFor="numericValue" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Valor Alvo
                    </Label>
                    <Input
                      id="numericValue"
                      name="numericValue"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="unit" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Unidade
                    </Label>
                    <Input
                      id="unit"
                      name="unit"
                      placeholder="$, %, sessões..."
                      className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="greenThreshold" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Limite Verde (≥)
                    </Label>
                    <Input
                      id="greenThreshold"
                      name="greenThreshold"
                      type="number"
                      step="0.01"
                      placeholder="On Track"
                      className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="yellowThreshold" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Limite Amarelo (≥)
                    </Label>
                    <Input
                      id="yellowThreshold"
                      name="yellowThreshold"
                      type="number"
                      step="0.01"
                      placeholder="Atenção"
                      className="h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                      disabled={isPending}
                    />
                  </div>
                </div>
              )}

              {targetType === "TEXT" && (
                <div className="space-y-1.5">
                  <Label htmlFor="textValue" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Valor / Descrição
                  </Label>
                  <Textarea
                    id="textValue"
                    name="textValue"
                    placeholder="Descreva a meta qualitativa..."
                    rows={2}
                    className="bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 resize-none"
                    disabled={isPending}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Gatilho de Limite
                </Label>
                <Select 
                  value={limitAction} 
                  onValueChange={setLimitAction} 
                  disabled={isPending}
                  >
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
                <Label htmlFor="coachNotes" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Notas do Coach
                </Label>
                <Textarea
                  id="coachNotes"
                  name="coachNotes"
                  placeholder="Contexto, observações, critérios de avaliação..."
                  rows={2}
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
                disabled={isPending || !playerId}
                className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 min-w-[130px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    Criar Target
                    <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </ModalFormFooter>
          </form>
        </ModalDialogContent>
      </Dialog>
    </>
  );
});

NewTargetModal.displayName = "NewTargetModal";

export default NewTargetModal;
