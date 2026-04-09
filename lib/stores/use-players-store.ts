import type { PlayersTableColumnFilters } from "@/lib/types";
import { createFilterStore } from "./create-filter-store";

export const usePlayersStore = createFilterStore<PlayersTableColumnFilters>({
  name: null,
  nickname: null,
  playerGroup: null,
  coach: null,
  grade: null,
  abi: null,
  status: null,
});
