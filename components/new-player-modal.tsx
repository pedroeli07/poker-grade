"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  UserPlus,
  User,
  AtSign,
  Mail,
  ChevronRight,
  Loader2,
  Grid3X3,
  DollarSign,
} from "lucide-react";
import { createPlayer } from "@/app/dashboard/players/actions";
import { toast } from "@/lib/toast";

type Coach = { id: string; name: string; role: string };
type GradeOpt = { id: string; name: string };

interface NewPlayerModalProps {
  coaches: Coach[];
  grades: GradeOpt[];
}

export function NewPlayerModal({ coaches, grades }: NewPlayerModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [coachId, setCoachId] = useState("none");
  const [mainGradeId, setMainGradeId] = useState("none");
  const [abiAlvoValue, setAbiAlvoValue] = useState("");
  const [abiAlvoUnit, setAbiAlvoUnit] = useState("none");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleOpenChange(value: boolean) {
    if (isPending) return;
    setOpen(value);
    if (!value) {
      setTimeout(() => {
        formRef.current?.reset();
        setCoachId("none");
        setMainGradeId("none");
        setAbiAlvoValue("");
        setAbiAlvoUnit("none");
      }, 150);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("coachId", coachId);
    formData.set("mainGradeId", mainGradeId);
    formData.set("abiAlvoValue", abiAlvoValue);
    formData.set("abiAlvoUnit", abiAlvoUnit);

    startTransition(async () => {
      try {
        await createPlayer(formData);
        toast.success("Jogador criado!", "O jogador foi adicionado ao time com sucesso.");
        handleOpenChange(false);
        router.refresh();
      } catch (e) {
        const msg =
          e instanceof Error && e.message
            ? e.message
            : "Verifique os dados e tente novamente.";
        toast.error("Erro ao criar jogador", msg);
      }
    });
  }

  return (
    <>
      <Button
        className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5 text-[15px]"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="mr-2 h-5 w-5" />
        Novo Jogador
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="px-7 pt-7 pb-5 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-xl font-semibold">Novo Jogador</DialogTitle>
                <DialogDescription className="text-[15px]">
                  Preencha os dados para cadastrar um novo membro no time.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <Separator />

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="px-7 py-6 space-y-5">
              {/* Nome + Nickname */}
              <div className="grid gap-5 sm:grid-cols-2">
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
                  <Label htmlFor="nickname" className="text-[15px] font-medium">
                    Nickname
                  </Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                      id="nickname"
                      name="nickname"
                      placeholder="joaosilva_poker"
                      className="pl-10 h-12 text-[15px] bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors"
                      disabled={isPending}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
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

              {/* Coach */}
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
                  <Link href="/dashboard/grades" className="text-primary underline-offset-2 hover:underline">
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
                    href="/dashboard/targets"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    Targets
                  </Link>
                  .
                </p>
              </div>
            </div>

            <Separator />

            <DialogFooter className="px-7 py-5 border-t-0 bg-muted/20 rounded-none">
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
