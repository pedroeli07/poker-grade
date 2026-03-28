"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PlayerStatus } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  User,
  AtSign,
  Mail,
  Loader2,
  Pencil,
  Grid3X3,
  DollarSign,
} from "lucide-react";
import { deletePlayer, updatePlayer } from "@/app/dashboard/players/actions";
import { toast } from "@/lib/toast";
import type { PlayerTableRow } from "@/lib/types/player-table-row";

const NONE = "__none__";

type CoachOpt = { id: string; name: string; role: string };
type GradeOpt = { id: string; name: string };

const STATUS_OPTIONS: { value: PlayerStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "SUSPENDED", label: "Suspenso" },
  { value: "INACTIVE", label: "Inativo" },
];

type Props = {
  player: PlayerTableRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coaches: CoachOpt[];
  grades: GradeOpt[];
  allowCoachSelect: boolean;
};

function EditPlayerModalInner({
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
  const [name, setName] = useState(player.name);
  const [nickname, setNickname] = useState(player.nickname ?? "");
  const [email, setEmail] = useState(player.email ?? "");
  const [coachId, setCoachId] = useState(
    player.coachKey === NONE ? "none" : player.coachKey
  );
  const [mainGradeId, setMainGradeId] = useState(
    player.gradeKey === NONE ? "none" : player.gradeKey
  );
  const [abiAlvoValue, setAbiAlvoValue] = useState(
    player.abiNumericValue != null ? String(player.abiNumericValue) : ""
  );
  const [abiAlvoUnit, setAbiAlvoUnit] = useState(() => {
    const u = player.abiUnit?.trim();
    if (!u) return "none";
    if (u === "$" || u === "€" || u === "¥") return u;
    return "none";
  });
  const [status, setStatus] = useState<PlayerStatus>(player.status);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();
  const formDisabled = isPending || deleteOpen;

  const gradeOptions = useMemo(() => {
    const list = [...grades];
    if (
      player.gradeKey !== NONE &&
      !list.some((g) => g.id === player.gradeKey)
    ) {
      list.push({ id: player.gradeKey, name: player.gradeLabel });
    }
    return list;
  }, [grades, player.gradeKey, player.gradeLabel]);

  function handleDeleteConfirm() {
    const fd = new FormData();
    fd.set("id", player.id);
    startTransition(() => {
      void (async () => {
        try {
          await deletePlayer(fd);
          toast.success(
            "Jogador excluído",
            `${player.name} e dados vinculados foram removidos.`
          );
          setDeleteOpen(false);
          onClose();
          router.refresh();
        } catch (err) {
          const msg =
            err instanceof Error && err.message === "FORBIDDEN"
              ? "Sem permissão para excluir este jogador."
              : err instanceof Error && err.message === "NOT_FOUND"
                ? "Jogador não encontrado."
                : "Não foi possível excluir. Tente novamente.";
          toast.error("Erro ao excluir", msg);
        }
      })();
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", player.id);
    formData.set("name", name.trim());
    formData.set("nickname", nickname.trim());
    formData.set("email", email.trim());
    formData.set("coachId", coachId);
    formData.set("mainGradeId", mainGradeId);
    formData.set("abiAlvoValue", abiAlvoValue);
    formData.set("abiAlvoUnit", abiAlvoUnit);
    formData.set("status", status);

    startTransition(() => {
      void (async () => {
        try {
          await updatePlayer(formData);
          toast.success("Jogador atualizado", "As alterações foram salvas.");
          onClose();
          router.refresh();
        } catch (err) {
          const msg =
            err instanceof Error && err.message === "FORBIDDEN"
              ? "Sem permissão para editar este jogador."
              : err instanceof Error && err.message
                ? err.message
                : "Verifique os dados e tente novamente.";
          toast.error("Erro ao atualizar", msg);
        }
      })();
    });
  }

  return (
    <>
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          if (!o && isPending) return;
          setDeleteOpen(o);
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir jogador?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove {player.name} do sistema, incluindo grades, targets,
              importações de torneios e revisões. Se existir conta de login
              vinculada, ela será desvinculada. Não dá para desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-600/90"
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="px-7 pt-7 pb-5 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
            <Pencil className="h-6 w-6 text-primary" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold">
              Editar jogador
            </DialogTitle>
            <DialogDescription className="text-[15px]">
              {allowCoachSelect
                ? "Ajuste dados e coach responsável. O perfil detalhado continua na página do jogador."
                : "Ajuste dados e status. A atribuição de coach é feita por admin ou manager."}
            </DialogDescription>
          </DialogHeader>
        </div>
      </div>

      <Separator />

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={player.id} />

        <div className="px-7 py-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-[15px] font-medium">
                Nome completo <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="edit-name"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 text-[15px] bg-muted/40 border-border/60"
                  disabled={formDisabled}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-nickname"
                className="text-[15px] font-medium"
              >
                Nickname
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="edit-nickname"
                  name="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="pl-10 h-12 text-[15px] bg-muted/40 border-border/60"
                  disabled={formDisabled}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email" className="text-[15px] font-medium">
              E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 text-[15px] bg-muted/40 border-border/60"
                disabled={formDisabled}
              />
            </div>
          </div>

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
        </div>

        <Separator />

        <DialogFooter className="px-7 py-5 border-t-0 bg-muted/20 rounded-none flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="h-10 text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto"
            disabled={formDisabled}
            onClick={() => setDeleteOpen(true)}
          >
            Excluir jogador
          </Button>
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
                  {deleteOpen ? "Aguarde…" : "Salvando..."}
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </>
  );
}

export function EditPlayerModal({
  player,
  open,
  onOpenChange,
  coaches,
  grades,
  allowCoachSelect,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDialogOpenChange(value: boolean) {
    if (!value && isPending) return;
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {player ? (
          <EditPlayerModalInner
            key={player.id}
            player={player}
            coaches={coaches}
            grades={grades}
            allowCoachSelect={allowCoachSelect}
            isPending={isPending}
            startTransition={startTransition}
            onClose={() => handleDialogOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
