export type LobbyzeItem = { item_id: number | string; item_text: string };

/** Item de filtro Lobbyze (mesma forma que `LobbyzeItem`). */
export type LobbyzeFilterItem = LobbyzeItem;

export interface LobbyzeFilter {
  id: number;
  name: string;
  site: LobbyzeFilterItem[];
  game2: LobbyzeFilterItem[];
  buy_in_min: number | null;
  buy_in_max: number | null;
  speed: LobbyzeFilterItem[];
  type: LobbyzeFilterItem[];
  players: LobbyzeFilterItem[];
  variant: LobbyzeFilterItem[];
  state: unknown;
  prize_pool_min: number | null;
  prize_pool_max: number | null;
  init_stacks_min: number | null;
  init_stacks_max: number | null;
  from_date: string | null;
  to_date: string | null;
  from_time: string | null;
  to_time: string | null;
  search: string;
  order: Record<string, number>;
  onlyNew: boolean;
  scheduled: unknown;
  maxLate: boolean;
  field: unknown;
  from_duration: unknown;
  priority: unknown;
  to_duration: unknown;
  limit: unknown;
  include_closed: boolean;
  timezone: number;
  exclude: string;
  flagged_only: unknown;
  auto_scheduled_only: unknown;
  show_exception: boolean;
  category: unknown;
  av_ability: unknown;
  currency: unknown;
  min_participants: number | null;
  week_day: LobbyzeFilterItem[] | null;
  auto_only: boolean;
  manual_only: boolean;
  deleted_filter_only: boolean;
  unchecked_filter_only: boolean;
  min_blind: number | null;
  max_blind: number | null;
  favorites: boolean;
}
