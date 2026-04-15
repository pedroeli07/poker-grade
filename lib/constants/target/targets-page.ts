import type { ColKey } from "@/lib/types";

/** Chave localStorage do modo de visualização (cards / tabela). */
export { TARGETS_LS_VIEW } from "@/lib/constants/metadata";

/** Colunas dos filtros compactos na visão em cards. */
export const TARGETS_CARD_FILTER_COLUMNS: [string, ColKey, string][] = [
  ["t-name", "name", "Meta"],
  ["t-cat", "category", "Categoria"],
  ["t-type", "targetType", "Tipo"],
  ["t-player", "player", "Jogador"],
  ["t-status", "status", "Status"],
];

/** Cabeçalho da tabela: [largura Tailwind, id DOM, chave de filtro, rótulo]. */
export const TARGETS_TABLE_HEAD_COLUMNS: [string, string, ColKey, string][] = [
  ["w-[30%]", "t-name-t", "name", "Meta"],
  ["w-[25%]", "t-player-t", "player", "Jogador"],
  ["w-[25%]", "t-progr-t", "targetType", "Progresso"],
  ["w-[20%]", "t-status-t", "status", "Status"],
];
