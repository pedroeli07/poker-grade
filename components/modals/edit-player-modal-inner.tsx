import { memo } from "react";
import type { PlayerTableRow } from "@/lib/types";
import type { CoachOpt, GradeOpt } from "@/lib/types";
import { useEditPlayerModalForm } from "@/hooks/players/use-edit-player-modal-form";
import ModalGradientHeader from "@/components/modals/primitives/modal-gradient-header";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil } from "lucide-react";
import { STATUS_OPTIONS } from "@/lib/constants";
import { PlayerStatus } from "@prisma/client";
import Link from "next/link";
import { POKER_NETWORKS_UI } from "@/lib/constants";
import { Users, AtSign, DollarSign } from "lucide-react";
import ModalFormFooter from "@/components/modals/primitives/modal-form-footer";
import { Grid3X3 } from "lucide-react";

const EditPlayerModalInner = memo(function EditPlayerModalInner({
    player,
    coaches,
    grades,
    allowCoachSelect,
    isPending,
    startTransition,
    onClose,
  }: {
    player: PlayerTableRow;
    coaches: CoachOpt[];
    grades: GradeOpt[];
    allowCoachSelect: boolean;
    isPending: boolean;
    startTransition: (fn: () => void) => void;
    onClose: () => void;
  }) {
    const {
      playerGroup,
      setPlayerGroup,
      nicks,
      coachId,
      setCoachId,
      mainGradeId,
      setMainGradeId,
      abiAlvoValue,
      setAbiAlvoValue,
      abiAlvoUnit,
      setAbiAlvoUnit,
      status,
      setStatus,
      formDisabled,
      handleSubmit,
      gradeOptions,
      setNickNetwork,
      setNickValue,
      removeNick,
      addNick,
    } = useEditPlayerModalForm({
      player,
      coaches,
      grades,
      isPending,
      startTransition,
      onClose,
    });
  
    return (
      <>
        <ModalGradientHeader
          icon={Pencil}
          title="Editar jogador"
          description={
            allowCoachSelect
              ? "Ajuste dados e coach responsável. O perfil detalhado continua na página do jogador."
              : "Ajuste dados e status. A atribuição de coach é feita por admin ou manager."
          }
        />
  
        <Separator />
  
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
          <input type="hidden" name="id" value={player.id} />
  
          <div className="px-7 py-6 overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-5">
            {allowCoachSelect ? (
              <div className="space-y-2">
                <Label className="text-[15px] font-medium">
                  Coach responsável
                </Label>
                <Select
                  value={coachId}
                  onValueChange={setCoachId}
                  disabled={formDisabled}
                >
                  <SelectTrigger className="w-full h-12 bg-muted/40 border-border/60 text-[15px]">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-[15px] py-2.5">
                      <span className="text-muted-foreground">Sem coach</span>
                    </SelectItem>
                    {coaches.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="text-[15px] py-2.5"
                      >
                        <span>{c.name}</span>
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          · {c.role}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
  
            <div className="space-y-2">
              <Label htmlFor="edit-main-grade" className="text-[15px] font-medium">
                Grade principal
              </Label>
              <Select
                value={mainGradeId}
                onValueChange={setMainGradeId}
                disabled={formDisabled}
              >
                <SelectTrigger
                  id="edit-main-grade"
                  className="w-full h-12 bg-muted/40 border-border/60 text-[15px] flex items-center gap-2"
                >
                  <Grid3X3 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <SelectValue
                    placeholder={
                      gradeOptions.length === 0
                        ? "Não atribuída"
                        : "Selecione..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-[15px] py-2.5">
                    <span className="text-muted-foreground">Não atribuída</span>
                  </SelectItem>
                  {gradeOptions.map((g) => (
                    <SelectItem key={g.id} value={g.id} className="text-[15px] py-2.5">
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Lista igual à página{" "}
                <Link
                  href="/dashboard/grades"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Grades
                </Link>
                .
              </p>
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="edit-abi-value" className="text-[15px] font-medium">
                ABI alvo
              </Label>
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="edit-abi-value"
                    inputMode="decimal"
                    placeholder="Ex: 35"
                    value={abiAlvoValue}
                    onChange={(e) => setAbiAlvoValue(e.target.value)}
                    className="pl-10 h-12 text-[15px] bg-muted/40 border-border/60"
                    disabled={formDisabled}
                  />
                </div>
                <Select
                  value={abiAlvoUnit}
                  onValueChange={setAbiAlvoUnit}
                  disabled={formDisabled}
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
                Deixe vazio para remover o target de ABI. Sincroniza com{" "}
                <Link
                  href="/dashboard/targets"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Targets
                </Link>
                .
              </p>
            </div>
  
            <div className="space-y-2">
              <Label className="text-[15px] font-medium">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as PlayerStatus)}
                disabled={formDisabled}
              >
                <SelectTrigger className="w-full h-12 bg-muted/40 border-border/60 text-[15px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="edit-playerGroup" className="text-[15px] font-medium">
                Grupo SharkScope
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="edit-playerGroup"
                  value={playerGroup}
                  onChange={(e) => setPlayerGroup(e.target.value)}
                  placeholder="Ex: CL Team"
                  className="pl-10 h-12 text-[15px] bg-muted/40 border-border/60"
                  disabled={formDisabled}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Opcional. Grupo no SharkScope para análise agregada do time.
              </p>
            </div>
              </div>
  
              {/* Right Column */}
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
                            disabled={formDisabled}
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
                              disabled={formDisabled}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeNick(index)}
                          disabled={formDisabled}
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
                      disabled={formDisabled}
                    >
                      + Adicionar Conta (Nick)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <Separator />
  
          <ModalFormFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={formDisabled}
                className="h-10 px-5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={formDisabled}
                className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </ModalFormFooter>
        </form>
      </>
    );
  });
  
  EditPlayerModalInner.displayName = "EditPlayerModalInner";
  
  export default EditPlayerModalInner;