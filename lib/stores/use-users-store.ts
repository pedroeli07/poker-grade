import type { UserColumnFilters } from "@/lib/types";
import { createFilterStore } from "@/lib/stores/create-filter-store";

export const useUsersStore = createFilterStore<UserColumnFilters>({
  email: null,
  role: null,
  status: null,
});
