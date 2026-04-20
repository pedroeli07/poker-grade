"use client";

import { Dialog } from "@/components/ui/dialog";
import ModalDialogContent from "@/components/modals/primitives/modal-dialog-content";
import ModalFormFooter from "@/components/modals/primitives/modal-form-footer";
import ModalGradientHeader from "@/components/modals/primitives/modal-gradient-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { UserPlus, User, AtSign, Mail, ChevronRight, Loader2, Grid3X3, DollarSign, Users } from "lucide-react";
import { POKER_NETWORKS_UI } from "@/lib/constants";
import type { NewPlayerModalProps } from "@/lib/types";
import { useNewPlayerModal } from "@/hooks/players/use-new-player-modal";
import { memo } from "react";

const NewPlayerModal = memo(function NewPlayerModal(props: NewPlayerModalProps) {
  const {
    coaches,
    grades,
    open,
    isPending,
    formRef,
    coachId,
    setCoachId,
    mainGradeId,
    setMainGradeId,
    abiAlvoValue,
    setAbiAlvoValue,
    abiAlvoUnit,
    setAbiAlvoUnit,
    handleOpenChange,
    handleSubmit,
    openModal,
    nicks,
    setNickNetwork,
    setNickValue,
    removeNick,
    addNick,
  } = useNewPlayerModal(props);

  return (
    <>
      <Button
        className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5 text-[15px]"
        onClick={openModal}
      >
        <UserPlus className="mr-2 h-5 w-5" />
        Novo Jogador
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <ModalDialogContent size="xl">
          <ModalGradientHeader
            icon={UserPlus}
            title="Novo Jogador"
            description="Preencha os dados para cadastrar um novo membro no time."
          />

          <Separator />

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
            <div className="px-7 py-6 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[15px] font-medium">
                      Nome Completo <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="name"
                        name="name"
                        required
                        placeholder="João Silva"
                        className="pl-10 h-12 text-[15px] bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors"
                        disabled={isPending}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[15px] font-medium">
                      E-mail
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="joao@time.com"
                        className="pl-10 h-12 text-[15px] bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors"
                        disabled={isPending}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coachId" className="text-[15px] font-medium">
                      Coach Responsável
                    </Label>
                    <Select value={coachId} onValueChange={setCoachId} disabled={isPending}>
                      <SelectTrigger
                        id="coachId"
                        className="w-full h-12 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors text-[15px]"
                      >
                        <SelectValue placeholder="Selecione um coach..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-[15px] py-2.5">
                          <span className="text-muted-foreground">Sem coach</span>
                        </SelectItem>
                        {coaches.map((coach) => (
                          <SelectItem key={coach.id} value={coach.id} className="text-[15px] py-2.5">
                            <span>{coach.name}</span>
                            <span className="ml-1.5 text-xs text-muted-foreground">· {coach.role}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mainGradeId" className="text-[15px] font-medium">
                      Grade principal
                    </Label>
                    <Select
                      value={mainGradeId}
                      onValueChange={setMainGradeId}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="mainGradeId"
                        className="w-full h-12 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors text-[15px] flex items-center gap-2"
                      >
                        <Grid3X3 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <SelectValue
                          placeholder={
                            grades.length === 0
                              ? "Nenhuma grade — só \"Não atribuída\""
                              : "Selecione a grade principal..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-[15px] py-2.5">
                          <span className="text-muted-foreground">Não atribuída</span>
                        </SelectItem>
                        {grades.map((g) => (
                          <SelectItem key={g.id} value={g.id} className="text-[15px] py-2.5">
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Mesmas grades da página{" "}
                      <Link href="/admin/grades/perfis" className="text-primary underline-offset-2 hover:underline">
                        Grades
                      </Link>
                      .
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="abiAlvoValue" className="text-[15px] font-medium">
                      ABI alvo
                    </Label>
                    <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                        <Input
                          id="abiAlvoValue"
                          inputMode="decimal"
                          placeholder="Ex: 35"
                          value={abiAlvoValue}
                          onChange={(e) => setAbiAlvoValue(e.target.value)}
                          className="pl-10 h-12 text-[15px] bg-muted/40 border-border/60"
                          disabled={isPending}
                        />
                      </div>
                      <Select
                        value={abiAlvoUnit}
                        onValueChange={setAbiAlvoUnit}
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-12 bg-muted/40 border-border/60 text-[15px]">
                          <SelectValue placeholder="Moeda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Só número</SelectItem>
                          <SelectItem value="$">$</SelectItem>
                          <SelectItem value="€">€</SelectItem>
                          <SelectItem value="¥">¥</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Opcional. Cria o target &quot;ABI alvo&quot; em{" "}
                      <Link
                        href="/admin/grades/metas"
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        Targets
                      </Link>
                      .
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="playerGroup" className="text-[15px] font-medium">
                      Grupo SharkScope
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="playerGroup"
                        name="playerGroup"
                        placeholder="Ex: CL Team"
                        className="pl-10 h-12 text-[15px] bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors"
                        disabled={isPending}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Opcional. Grupo no SharkScope para análise agregada do time.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label className="text-[15px] font-medium">Contas de Poker (SharkScope)</Label>
                    <div className="space-y-3">
                      {nicks.map((nickObj, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="min-w-0 flex-1 space-y-2">
                            <Select
                              value={nickObj.network}
                              onValueChange={(val) => setNickNetwork(index, val)}
                              disabled={isPending}
                            >
                              <SelectTrigger className="h-10 w-full bg-muted/40 border-border/60">
                                <SelectValue placeholder="Rede" />
                              </SelectTrigger>
                              <SelectContent>
                                {POKER_NETWORKS_UI.map((net) => (
                                  <SelectItem key={net.value} value={net.value}>
                                    <div className="flex items-center gap-2">
                                      {net.icon && (
                                        // eslint-disable-next-line @next/next/no-img-element -- small static network icons
                                        <img src={net.icon} alt={net.label} className="w-5 h-5 rounded object-contain" />
                                      )}
                                      <span>{net.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="relative">
                              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                              <Input
                                placeholder="Nickname na rede"
                                value={nickObj.nick}
                                onChange={(e) => setNickValue(index, e.target.value)}
                                className="pl-9 h-10 w-full text-[14px] bg-muted/40 border-border/60"
                                disabled={isPending}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeNick(index)}
                            disabled={isPending}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 border-dashed border-border/60 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        onClick={addNick}
                        disabled={isPending}
                      >
                        + Adicionar Conta (Nick)
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <ModalFormFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="border-border/60 h-10 px-5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 min-w-[150px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    Salvar Jogador
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </ModalFormFooter>
          </form>
        </ModalDialogContent>
      </Dialog>
    </>
  );
})

NewPlayerModal.displayName = "NewPlayerModal";

export default NewPlayerModal;

