import type { UserColumnFilters } from "@/lib/types/user/index";
import { createFilterStore } from "@/lib/stores/create-filter-store";

export const useUsersStore = createFilterStore<UserColumnFilters>(
  {
    email: null,
    role: null,
    status: null,
  },
  "gestao-grades:users:filters"
);
