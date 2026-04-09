import type { UsuariosColumnFilters } from "@/lib/types";
import { createFilterStore } from "./create-filter-store";

export const useUsuariosStore = createFilterStore<UsuariosColumnFilters>({
  email: null,
  role: null,
  status: null,
});
