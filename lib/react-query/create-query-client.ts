import { QueryClient } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants/query-result";
/** Tempo em cache após desmontagem (TanStack Query v5 default ≈ 5 min). */
const GC_TIME_MS = 5 * 60 * 1000;

/**
 * Defaults globais: evitam `staleTime: 0` implícito em novas queries e alinham
 * refetch ao resto do app (30s). Queries podem sobrescrever por `useQuery`.
 */
export function createBrowserQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME,
        gcTime: GC_TIME_MS,
      },
    },
  });
}
