import { BaseQueryKeys } from "./query-keys";

class ReviewKeys extends BaseQueryKeys {
  constructor() { super("review"); }
  pending() { return this.key("pending"); }
}
export const reviewKeys = new ReviewKeys();
