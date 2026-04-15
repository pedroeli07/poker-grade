# Guia de Refatoração - Clean Code & Arquitetura

## Visão Geral

Este documento estabelece as diretrizes para refatoração de componentes React/Next.js no projeto, com foco em **separação de responsabilidades**, **redução de duplicação** e **clean code**.

## Princípios Fundamentais

### 1. TSX = apenas UI/UX

**Regra:** Arquivos `.tsx` devem conter exclusivamente código relacionado à renderização e interação visual.

**O que NÃO deve estar em arquivos TSX:**
- Lógica de negócio pura
- Constantes de configuração (labels, cores, ícones)
- Funções utilitárias de formatação
- Cálculos complexos
- Acesso direto a dados

**O que DEVE estar em arquivos TSX:**
- JSX/TSX (render)
- Componentes React
- Hooks de estado (useState, useReducer)
- Handlers de eventos (onClick, onChange)
- Referências a funções definidas em arquivos `.ts`

### 2. Arquivos .ts - Lógica de Negócio

Todo código que não seja estritamente UI deve residir em arquivos `.ts` organizados por domínio:

```
lib/utils/        → Funções puras e utilitários
lib/constants/    → Configurações estáticas
hooks/            → Lógica de estado e副作用
lib/queries/      → Acesso a dados
lib/types/        → Tipos e interfaces
lib/validations/   → Validações
lib/schemas/       → Schemas
```

## Estrutura de Arquivos

### Exemplo: Componente de Card

**ANTES (incorreto)** - `target-card.tsx`:
```tsx
export function TargetCard({ target }: { target: TargetListRow }) {
  const cfg = STATUS_CONFIG[target.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = cfg.icon;
  
  const progressPercent = target.numericValue > 0
    ? Math.min(100, Math.round((target.numericCurrent / target.numericValue) * 100))
    : 0;
  
  const progressColor = target.status === "ON_TRACK" 
    ? "bg-emerald-500" 
    : target.status === "ATTENTION" 
      ? "bg-amber-500" 
      : "bg-red-500";

  return <div className={progressColor}>{/* UI */}</div>;
}
```

**DEPOIS (correto)** - `target-card.tsx`:
```tsx
import { getTargetCardData } from "@/lib/utils/target-utils";

export function TargetCard({ target }: { target: TargetListRow }) {
  const data = getTargetCardData(target);

  return <div className={data.progressColor}>{/* UI */}</div>;
}
```

**DEPOIS (correto)** - `lib/utils/target-utils.ts`:
```ts
export interface TargetCardData {
  progressColor: string;
  progressPercent: number;
  statusConfig: TargetStatusConfig;
}

export const getTargetCardData = (target: TargetListRow): TargetCardData => {
  const statusConfig = getTargetStatusConfig(target.status);
  const progressPercent = calculateProgress(target);
  const progressColor = getProgressColorByStatus(target.status);

  return { progressColor, progressPercent, statusConfig };
};

const calculateProgress = (t: TargetListRow): number => {
  if (t.numericCurrent == null || t.numericValue == null || t.numericValue <= 0) return 0;
  return Math.min(100, Math.round((t.numericCurrent / t.numericValue) * 100));
};

const getProgressColorByStatus = (status: string): string => {
  switch (status) {
    case "ON_TRACK": return "bg-emerald-500";
    case "ATTENTION": return "bg-amber-500";
    default: return "bg-red-500";
  }
};
```

## Padrões de Refatoração

### Padrão 1: Função de Mapeamento (Mapper)

Quando um componente faz vários cálculos a partir de uma mesma prop, criar uma função que retorna um objeto com todos os dados necessários.

```ts
// lib/utils/xxx-utils.ts
export const getXyzData = (input: InputType): XyzData => {
  // lógica de transformação
  return { campo1, campo2, campo3 };
};
```

```tsx
// components/xxx/xyz-component.tsx
import { getXyzData } from "@/lib/utils/xxx-utils";

export function XyzComponent({ input }: { input: InputType }) {
  const data = getXyzData(input);
  // usar data.campo1, data.campo2, etc.
}
```

### Padrão 2: Loop sobre Configuração

Quando houver repetição de elementos similares (cards, badges, etc.), usar loop sobre array de configuração.

**ANTES:**
```tsx
<Card className="border-emerald-500">
  <IconTrendingUp /> <span>No Caminho</span>
</Card>
<Card className="border-amber-500">
  <IconAlert /> <span>Atenção</span>
</Card>
<Card className="border-red-500">
  <IconXCircle /> <span>Fora da Meta</span>
</Card>
```

**DEPOIS:**
```ts
// lib/utils/status-utils.ts
const STATUS_ORDER = ["ON_TRACK", "ATTENTION", "OFF_TRACK"] as const;

export const getStatusCardsData = (summary) => 
  STATUS_ORDER.map(status => ({
    status,
    config: STATUS_CONFIG[status],
    count: summary[status],
  }));
```

```tsx
// components/status-cards.tsx
import { getStatusCardsData } from "@/lib/utils/status-utils";

export function StatusCards({ summary }) {
  const cards = getStatusCardsData(summary);
  
  return cards.map(({ status, config, count }) => (
    <Card key={status} className={config.bgClass}>
      <config.icon /> <span>{config.label}</span>
    </Card>
  ));
}
```

### Padrão 3: Extrair Constantes de UI

Cores, labels, ícones que são estáticos vão para constantes.

```ts
// lib/constants/target-status.ts
export const TARGET_STATUS_CONFIG = {
  ON_TRACK: {
    label: "No Caminho Certo",
    icon: CheckCircle2,
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  },
  // ...
} as const;
```

### Padrão 4: Hook para Lógica Reutilizável

Quando lógica envolve estado (useState, useEffect, useMemo), criar hook.

```ts
// hooks/use-target-sorting.ts
export const useTargetSorting = (items: TargetListRow[]) => {
  const [sort, setSort] = useState<SortState>(null);
  
  const sorted = useMemo(() => {
    if (!sort) return items;
    return [...items].sort((a, b) => compare(a, b, sort));
  }, [items, sort]);

  return { sorted, setSort, toggleSort };
};
```

## Checklist de Refatoração

Para cada arquivo `.tsx` a ser refatorado:

- [ ] Identificar imports de `lib/constants` (exceto tipos)
- [ ] Identificar funções utilitárias inline
- [ ] Identificar lógica de cálculo (Math, switch, if/else)
- [ ] Mover para arquivo `.ts` apropriado
- [ ] Criar função mapper que retorna objeto com dados
- [ ] Atualizar componente para usar a função mapper
- [ ] Verificar se build passa
- [ ] Verificar se lint passa

## Organização de Arquivos

### lib/utils/
Funções puras de transformação, formatação, cálculo.

- `target-utils.ts` - dados de targets (status, progresso, summary)
- `player-utils.ts` - dados de jogadores
- `format-utils.ts` - formatação de strings, datas, números

### lib/constants/
Configurações estáticas (não dependem de props/state).

- `target-status.ts` - config de status de targets
- `grade-display.ts` - config de display de grades
- `ui-colors.ts` - paleta de cores da aplicação

### hooks/
Lógica que envolve estado React.

- `use-target-list-page.ts` - estado e lógica da página de targets
- `use-player-filters.ts` - filtros de jogador

## Exceptions

 Alguns casos justifies manter lógica no componente:

1. **Handlers de eventos simples** - `onClick={() => setOpen(true)}`
2. **Computed properties simples** - `const isActive = activeTab === "current"`
3. **Refs e refs de elementos DOM** - `useRef`, `useImperativeHandle`

## Priorização

Para refatorar todas as pastas de componentes, seguir ordem:

1. `components/targets/` 
2. `components/players/`
3. `components/grades/`
4. `components/sharkscope/`
5. Demais componentes

## Referências

- Clean Code (Robert C. Martin)
- React hooks best practices
- Project AGENTS.md - Convenções e contexto do repositório
- Project CLAUDE.md - Regras de negócio e arquitetura

Evitar ao maximo repetiçao de código, buscar por padroes e reutilizar código.