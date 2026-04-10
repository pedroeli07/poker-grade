"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { syncSharkScopeManualAction } from "@/app/dashboard/sharkscope/actions";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

export function SyncSharkScopeButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSync() {
    startTransition(async () => {
      const res = await syncSharkScopeManualAction();
      if (res.success) {
        toast.success("Sincronização concluída", `Nicks processados: ${res.processed} | Erros: ${res.errors}`);
        router.refresh();
      } else {
        toast.error("Erro na sincronização", res.error);
      }
    });
  }

  return (
    <Button
      variant="outline"
      onClick={onSync}
      disabled={isPending}
      className="gap-2 shrink-0"
    >
      <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Sincronizando..." : "Sincronizar SharkScope"}
    </Button>
  );
}
