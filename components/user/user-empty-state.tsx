import { useState, useEffect, memo } from "react";
import { getUserPermissions } from "@/lib/queries/db/user";
import { Users } from "lucide-react";

const UserEmptyState = memo(function UserEmptyState({ hasFilters }: { hasFilters: boolean }) {
    const [canManage, setCanManage] = useState(false);
    const [loaded, setLoaded] = useState(false);
  
    useEffect(() => {
      getUserPermissions().then((p) => {
        setCanManage(p.canManage);
        setLoaded(true);
      });
    }, []);
  
    if (!loaded) return null;
  
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium text-muted-foreground">
          Nenhum registro encontrado
        </p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {hasFilters
            ? "Ajuste os filtros ou a busca."
            : canManage
            ? "Adicione um convite para autorizar um novo cadastro."
            : "NÃ£o hÃ¡ usuÃ¡rios ou convites listados no momento."}
        </p>
      </div>
    );
  });
  
  UserEmptyState.displayName = "UserEmptyState";
  
  export default UserEmptyState;
  