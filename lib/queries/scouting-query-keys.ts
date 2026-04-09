import { BaseQueryKeys } from "./query-keys";

class ScoutingKeys extends BaseQueryKeys {
  constructor() { super("scouting"); }
  list() { return this.key("list"); }
  detail(playerNick: string) { return this.key("detail", playerNick); }
}
export const scoutingKeys = new ScoutingKeys();
