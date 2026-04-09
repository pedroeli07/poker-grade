import { BaseQueryKeys } from "./query-keys";

class AnalyticsKeys extends BaseQueryKeys {
  constructor() { super("analytics"); }
  sharkscope(playerNick: string) { return this.key("sharkscope", playerNick); }
}
export const analyticsKeys = new AnalyticsKeys();
