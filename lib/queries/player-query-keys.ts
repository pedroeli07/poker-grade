import { BaseQueryKeys } from "./query-keys";

class PlayerKeys extends BaseQueryKeys {
  constructor() { super("players"); }
  list() { return this.key("table"); }
}
export const playerKeys = new PlayerKeys();
