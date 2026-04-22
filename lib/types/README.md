# `lib/types`

## Por que existe `index.ts` (barrel)

Centenas de arquivos importam `@/lib/types`. Remover o barrel quebraria o repositório; ele existe por **compatibilidade e DX**. O custo em “tokens” para IAs é **abrir o barrel inteiro** — por isso ele foi **enxugado** (vários módulos pequenos de auth/sessão viraram um `auth.ts`).

## Como importar (menos ruído)

| Situação | Preferir |
|----------|------------|
| Trabalho só em jogador | `import type { … } from "@/lib/types/jogador"` |
| Tipos de tabela genéricos | `import type { … } from "@/lib/types/primitives"` ou `lib/table-sort` para ordenação |
| Sessão / JWT / senha / Google | `import type { … } from "@/lib/types/auth"` |
| Precisa de muitos tipos de áreas diferentes | `@/lib/types` (barrel) |

Evite abrir `index.ts` só para “descobrir” um tipo: use **busca pelo nome do símbolo** ou o **módulo de domínio** acima.

## Conteúdo útil

- **`primitives.ts`:** `Result`, paginação, re-export de `SortDir` / `TableSortState` (fonte em `lib/table-sort.ts`), contadores de torneio, etc.
- **`auth.ts`:** `AppSession`, JWT, OAuth Google, força de senha.
- **Pastas por domínio:** `player/`, `grade/`, `sharkscope/`, …
