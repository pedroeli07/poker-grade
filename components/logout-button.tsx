"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "@/lib/toast";

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-muted-foreground"
      onClick={async () => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin",
          });
          toast.success("Sessão encerrada");
          router.push("/login");
          router.refresh();
        } catch {
          toast.error("Falha ao sair");
        }
      }}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sair
    </Button>
  );
}
