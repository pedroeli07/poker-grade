"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, Mail } from "lucide-react";
import { UserRole } from "@prisma/client";
import { addAllowedInvite } from "./actions";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

const INVITE_ROLES: { value: UserRole; label: string }[] = [
  { value: UserRole.VIEWER, label: "Viewer" },
  { value: UserRole.PLAYER, label: "Player" },
  { value: UserRole.COACH, label: "Coach" },
  { value: UserRole.MANAGER, label: "Manager" },
  { value: UserRole.ADMIN, label: "Admin" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UsuariosInviteModal({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.VIEWER);

  function reset() {
    setEmail("");
    setRole(UserRole.VIEWER);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("email", email.trim());
    fd.set("role", role);

    startTransition(async () => {
      const res = await addAllowedInvite(fd);
      if ("error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Convite adicionado. O usuário poderá criar conta em /register.");
      reset();
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-primary" />
            Convidar usuário
          </DialogTitle>
          <DialogDescription>
            O e-mail passa a poder criar conta na página de registro, já com o
            cargo definido abaixo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="invite-email">E-mail</Label>
            <Input
              id="invite-email"
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@exemplo.com"
              maxLength={320}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label>Cargo após o cadastro</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as UserRole)}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Cargo" />
              </SelectTrigger>
              <SelectContent>
                {INVITE_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 glow-primary"
              disabled={pending || !email.trim()}
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Adicionar convite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
