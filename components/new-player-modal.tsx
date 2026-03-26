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
import { UserPlus, User, AtSign, Mail, ChevronRight, Loader2 } from "lucide-react";
import { createPlayer } from "@/app/dashboard/players/actions";
import { toast } from "@/lib/toast";

type Coach = { id: string; name: string; role: string };

interface NewPlayerModalProps {
  coaches: Coach[];
}

export function NewPlayerModal({ coaches }: NewPlayerModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [coachId, setCoachId] = useState("none");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleOpenChange(value: boolean) {
    if (isPending) return;
    setOpen(value);
    if (!value) {
      setTimeout(() => {
        formRef.current?.reset();
        setCoachId("none");
      }, 150);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("coachId", coachId);

    startTransition(async () => {
      try {
        await createPlayer(formData);
        toast.success("Jogador criado!", "O jogador foi adicionado ao time com sucesso.");
        handleOpenChange(false);
        router.refresh();
      } catch {
        toast.error("Erro ao criar jogador", "Verifique os dados e tente novamente.");
      }
    });
  }

  return (
    <>
      <Button
        className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Novo Jogador
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          {/* Header com gradiente sutil */}
          <div className="relative px-6 pt-6 pb-5 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                <UserPlus className="h-4 w-4 text-primary" />
              </div>
              <DialogHeader className="space-y-0.5">
                <DialogTitle className="text-base font-semibold">Novo Jogador</DialogTitle>
                <DialogDescription className="text-xs">
                  Preencha os dados para cadastrar um novo membro no time.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <Separator />

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-5">
              {/* Nome + Nickname */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Nome Completo <span className="text-destructive normal-case">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="João Silva"
                      className="pl-9 h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors"
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nickname" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Nickname
                  </Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      id="nickname"
                      name="nickname"
                      placeholder="joaosilva_poker"
                      className="pl-9 h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors"
                      disabled={isPending}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="joao@time.com"
                    className="pl-9 h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors"
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Coach */}
              <div className="space-y-1.5">
                <Label htmlFor="coachId" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Coach Responsável
                </Label>
                <Select
                  value={coachId}
                  onValueChange={setCoachId}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="coachId"
                    className="w-full h-9 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors"
                  >
                    <SelectValue placeholder="Selecione um coach..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">Sem coach</span>
                    </SelectItem>
                    {coaches.map((coach) => (
                      <SelectItem key={coach.id} value={coach.id}>
                        <span>{coach.name}</span>
                        <span className="ml-1.5 text-xs text-muted-foreground">· {coach.role}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <DialogFooter className="px-6 py-4 border-t-0 bg-muted/20 rounded-none">
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
                    Salvar Jogador
                    <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
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
