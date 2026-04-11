import type { GradesColumnKey } from "@/lib/types";

/** Filtros compactos na visualização em cards (id DOM, chave de filtro, rótulo). */
export const GRADES_LIST_CARD_FILTER_COLUMNS = [
  ["g-name", "name", "Nome"],
  ["g-desc", "description", "Descrição"],
  ["g-rules", "rules", "Regras"],
  ["g-players", "players", "Jogadores"],
] as const satisfies readonly (readonly [string, GradesColumnKey, string])[];

/** Cabeçalhos da tabela (largura Tailwind, id DOM, chave de filtro, rótulo). */
export const GRADES_LIST_TABLE_HEAD_COLUMNS = [
  ["w-[18%]", "g-name-t", "name", "Nome"],
  ["w-[40%]", "g-desc-t", "description", "Descrição"],
  ["w-[10%]", "g-rules-t", "rules", "Regras"],
  ["w-[12%]", "g-players-t", "players", "Jogadores"],
] as const satisfies readonly (readonly [string, string, GradesColumnKey, string])[];
