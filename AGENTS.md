<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS — Convenções, contexto do repositório e armadilhas

Este ficheiro orienta **assistentes de IA** e **desenvolvedores** sobre como trabalhar neste codebase sem regressões de domínio, segurança ou performance. **Não substitui** o [`CLAUDE.md`](./CLAUDE.md) (domínio e arquitetura detalhada) nem o [`README.md`](./README.md) (setup e envs).

---

## 1. Propósito do projeto (resumo)

Sistema web para **gestão de grades de torneios**, **metas**, **monitoramento**, **revisões** e **integração SharkScope**. O código mistura **UI** (Next.js App Router), **persistência** (Prisma/PostgreSQL), **jobs** (cron de sync) e **regras de negócio** (grades, alertas, aprovações). Qualquer alteração deve respeitar o **modelo de dados** em `prisma/schema.prisma` e as **regras** descritas no `CLAUDE.md`.

---

## 2. Comportamento esperado ao implementar

1. **Precisão sobre o domínio**: não inventar entidades; usar nomes e relações do Prisma (`Player`, `PlayerGradeAssignment`, `SharkScopeCache`, etc.).
2. **Alterações mínimas**: implementar só o pedido; evitar refactors amplos não solicitados.
3. **TypeScript estrito**: tipos explícitos em APIs públicas; alinhar com `lib/types` e padrões existentes.
4. **Validação**: entradas de API e formulários com **Zod** onde o projeto já o faz; seguir o mesmo estilo de schemas.
5. **Comentários**: apenas quando o “porquê” não for óbvio (regra de negócio, quota API, workaround SharkScope). Evitar ruído.
6. **Segredos**: nunca sugerir commit de `.env`; usar variáveis de ambiente e referências a `lib/constants/env.ts`.

---

## 3. Stack e versões

| Tecnologia | Uso |
|------------|-----|
| **Next.js 16** | App Router, Route Handlers, Server Components. |
| **React 19** | UI; componentes cliente quando necessário (`"use client"`). |
| **Prisma 7** | ORM; PostgreSQL. |
| **Tailwind CSS 4** | Estilos utilitários. |
| **shadcn/ui + Radix** | Componentes acessíveis; não introduzir outra lib de UI sem necessidade. |
| **Zustand** | Estado global cliente (poucos stores; preferir estado local quando bastar). |
| **Zod** | Validação. |
| **xlsx** | Parsing Excel em imports. |
| **Lucide** | Ícones. |
| **jose** | JWT/sessões. |
| **pino** | Logging estruturado (`lib/logger`). |
| **Vitest / Playwright** | Testes (`npm run test`, `npm run test:e2e`). |

---

## 4. Estrutura lógica: onde colocar código novo

| Tipo de mudança | Local preferido |
|-----------------|-----------------|
| Página ou layout | `app/dashboard/...` ou `app/(auth)/...` |
| Componente reutilizável | `components/` (subpastas por domínio: `players/`, `sharkscope/`, …) |
| Hook de UI com regras de tabela/filtros | `hooks/<domínio>/` |
| Carregamento de dados para páginas (server) | `lib/data/<nome>.ts` |
| Queries Prisma partilhadas | `lib/queries/db/` |
| Integração SharkScope (sync, parse, agregação) | `lib/sharkscope/*.ts` |
| Constantes e env | `lib/constants/` |
| Tipos partilhados | `lib/types/` |

Evitar **lógica de negócio pesada** dentro de componentes de apresentação; preferir funções puras em `lib/` ou hooks dedicados.

---

## 5. Integração SharkScope — regras que não podem ser ignoradas

1. **`PlayerGroup` não é nick de mesa**  
   Registos `PlayerNick` com `network === "PlayerGroup"` representam o **nome do grupo SharkScope** para cache e rotas de API. **Filtrar** essas linhas em UI de “contas de poker” e modais de edição de nicks, para não confundir o utilizador.

2. **Quota de “buscas”**  
   A API SharkScope cobra por tipo de operação (ver `SharkScope_WS_API_PT.md`). **Não** adicionar chamadas redundantes a `statistics` ou `completedTournaments` sem rever `run-daily-sync.ts` e `completed-tournaments-aggregate.ts`. O projeto já consolida períodos e usa cache.

3. **Cache**  
   Dados mostrados em dashboards vêm de `SharkScopeCache` (por `playerNickId`, `dataType`, `filterKey`). **Não** chamar a API SharkScope em cada render de página; usar `lib/data/*` e padrões `unstable_cache` onde já existirem.

4. **Cron vs sync manual**  
   - Cron: `app/api/cron/daily-sync` — **CRON_SECRET**.  
   - Manual: `app/api/sharkscope/sync` — sessão autenticada, cancelamento.  
   Não misturar autenticação entre estes dois.

5. **`extractStat` e formatos JSON**  
   Métricas vêm de nós `Statistic` na resposta SharkScope; funções em `lib/utils/app.ts` e `lib/sharkscope-stat-scan.ts`. Se simular ou gravar dados sintéticos, manter formato compatível com `extractStat`.

---

## 6. Autenticação e autorização

- Sessões e verificação de papel em **`lib/auth/`**; rotas em **`app/api/auth/`**.
- Antes de expor dados de outro jogador ou acções de coach, **confirmar** o padrão existente (session + role + `coachId`).
- Não assumir middleware Next.js global; este repo pode usar **layouts** e **guards** em server components — seguir ficheiros existentes.

---

## 7. Base de dados e migrações

- Alterações de schema: editar **`prisma/schema.prisma`**, gerar migração, documentar breaking changes em PR.
- `onDelete`, unicidades e índices são parte da regra de negócio (ex.: `PlayerGradeAssignment` uma grade ativa por tipo).
- **Não** apagar colunas em produção sem plano de migração de dados.

---

## 8. UI/UX

- Estética **SaaS premium**: espaçamento consistente, tipografia legível, **dark/light**.
- Usar **componentes shadcn** já presentes; novos componentes devem parecer nativos (variantes, `cn()`).
- Estados de **loading**, **erro** e **vazio** devem ser tratados como noutras páginas do projeto.

---

## 9. Testes e qualidade

- Correr **`npm run lint`** após alterações substanciais.
- Adicionar testes Vitest para **lógica pura** (parse, agregações, limites) quando o risco de regressão for alto.
- **`npm run build`** deve passar antes de merge.

---

## 10. Documentação a consultar antes de grandes mudanças

| Ficheiro | Quando ler |
|----------|------------|
| [`CLAUDE.md`](./CLAUDE.md) | Regras de negócio, SharkScope, matriz “onde mexer”. |
| [`README.md`](./README.md) | Setup, envs, scripts, deploy. |
| [`SharkScope_WS_API_PT.md`](./SharkScope_WS_API_PT.md) | Endpoints, filtros, custos. |
| `prisma/schema.prisma` | Verdade do modelo de dados. |

---

## 11. Comandos rápidos

```bash
npm run dev      # desenvolvimento
npm run lint     # ESLint
npm run build    # build produção
npm run test     # Vitest
```

---

*Manter este ficheiro alinhado com mudanças arquiteturais relevantes (nova integração, novo módulo crítico).*
