import { LobbyzeFilterItem } from "@/lib/types";
import { normText } from "@/lib/utils";

export function toggleByText(
  list: LobbyzeFilterItem[],
  opt: LobbyzeFilterItem,
  on: boolean
): LobbyzeFilterItem[] {
  const t = normText(opt.item_text);
  if (on) {
    if (list.some((x) => normText(x.item_text) === t)) return list;
    return [...list, opt];
  }
  return list.filter((x) => normText(x.item_text) !== t);
}
  