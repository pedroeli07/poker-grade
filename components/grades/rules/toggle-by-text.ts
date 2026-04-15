import type { LobbyzeFilterItem } from "@/lib/types";
import { normText } from "@/lib/utils";

/**
 * Liga/desliga um item na lista por texto normalizado (evita duplicados ao ativar).
 * Não é um componente React — só utilitário partilhado com `multi-toggle-row`.
 */
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
