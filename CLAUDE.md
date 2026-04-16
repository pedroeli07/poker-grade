@AGENTS.md

# Sistema de Gestão de Grades de Poker — Documentação de Produto e Arquitetura

Este documento destina-se a **desenvolvedores e maintainers** que precisam entender o domínio, o modelo de dados, a organização do código e os fluxos críticos (em especial **SharkScope** e **grades**). Complementa o [`README.md`](./README.md) (setup operacional) e o [`AGENTS.md`](./AGENTS.md) (convenções para assistentes de código).

---

## 1. Visão do produto

### 1.1 Problema que resolve

Times profissionais de poker precisam alinhar **quais torneios cada jogador pode jogar** (a “grade”), acompanhar **subida e descida de limites**, **monitorar desvios** (jogou fora da grade, volume extra) e manter **comunicação estruturada coach ↔ jogador** (metas, explicações, revisões). O sistema centraliza isso numa aplicação web única, com papéis distintos e histórico auditável.

### 1.2 Princípio de produto (MVP)

Documentado também no repositório como regra cultural: **não complique sem necessidade**. Priorizar interface **simples, funcional, visualmente cuidada e rápida no dia a dia**. Funcionalidades avançadas só entram quando sustentam o fluxo principal (grade + visibilidade + coach).

### 1.3 Papéis (`UserRole` no Prisma)

| Papel | Uso típico |
|-------|------------|
| `ADMIN` | Configuração global, utilizadores, visão ampla. |
| `MANAGER` | Gestão operacional sem necessidade de ser coach de linha. |
| `COACH` | Jogadores atribuídos, grades, targets, revisões. |
| `PLAYER` | Ver a própria grade, metas, sugestões; interagir dentro dos limites. |
| `VIEWER` | Leitura (auditoria, convidado). |

Um `AuthUser` liga-se a um `Player` **ou** a um `Coach` (relação 1:1 opcional), consoante o papel. Senhas usam **Argon2id** no fluxo de auth da aplicação (ver `lib/auth`).

---

## 2. Domínio e regras de negócio (detalhado)

### 2.1 Grades (`GradeProfile`, `GradeRule`, `PlayerGradeAssignment`)

- **`GradeProfile`**: perfil nomeado de grade (ex.: faixa de stakes, tipo de jogo). Pode guardar `rawFiltersJson` proveniente de import **Lobbyze** (JSON de filtros).
- **`GradeRule`**: regra atómica dentro do perfil — sites, buy-in, velocidade, tipo de torneio, variantes (PKO, etc.), janelas de horário, dias da semana, exclusões por texto, `timezone` em minutos (ex.: BRT −180). Suporta flags `autoOnly` / `manualOnly` para automação vs curadoria.
- **`PlayerGradeAssignment`**: liga jogador a um `GradeProfile` com **`GradeType`**: `MAIN` (grade atual), `ABOVE` (próximo degrau), `BELOW` (degrau abaixo). A constraint única `[playerId, gradeType, isActive]` garante **no máximo uma grade ativa por tipo** por jogador. `removedAt` e `isActive` permitem histórico sem apagar linhas.

**Regra de negócio implícita**: a “grade ativa” do jogador é o conjunto de regras do `MAIN` ativo; `ABOVE`/`BELOW` servem para comunicar limites adjacentes (subir/descer).

### 2.2 Targets (`PlayerTarget`)

Metas por jogador (`NUMERIC` ou `TEXT`), com `greenThreshold` / `yellowThreshold` mapeados para `TargetStatus` (`ON_TRACK`, `ATTENTION`, `OFF_TRACK`). Podem associar-se a `LimitAction` (upgrade / maintain / downgrade) para alinhar decisões de limite às metas. A UI usa indicadores visuais (ver guidelines de produto).

### 2.3 Monitoramento e importações (`TournamentImport`, `PlayedTournament`)

- Importações **Excel/CSV/JSON** geram `TournamentImport` com contagens agregadas (`matchedInGrade`, `suspect`, `outOfGrade`).
- Cada linha vira `PlayedTournament`: data, site, buy-in, nome do torneio, `scheduling` (ex.: “Played”, “Extra play”), `matchStatus` (`IN_GRADE`, `SUSPECT`, `OUT_OF_GRADE`), ligação opcional a `GradeRule` via `matchedRuleId`.

**Regra**: o sistema compara o histórico importado às regras da grade para destacar **suspeitos** e **fora da grade**, base para a **revisão** pelo coach.

### 2.4 Revisão de grades (`GradeReviewItem`)

Liga um `PlayedTournament` a um fluxo de revisão: `ReviewStatus` (`PENDING`, `APPROVED`, `EXCEPTION`, `REJECTED`), justificativa do jogador, notas do revisor, flag `isInfraction`. É o núcleo da “fila” de torneios duvidosos na UI do coach.

### 2.5 Histórico de limites (`LimitChangeHistory`)

Regista decisões `UPGRADE` / `MAINTAIN` / `DOWNGRADE` com nomes de grade origem/destino, motivo e quem decidiu — útil para relatórios e auditoria.

### 2.6 SharkScope — conceito de `playerGroup` e `PlayerNick`

- Campo **`Player.playerGroup`**: string com o nome do **Player Group** na SharkScope (agrupamento de contas do jogador no ecossistema SharkScope). É a chave para estatísticas **agregadas por grupo**, não por rede individual.
- Para cada jogador com grupo, o backend mantém um **`PlayerNick`** sintético: `network = "PlayerGroup"`, `nick = playerGroup`. Esse registo existe para **anexar caches** (`SharkScopeCache`) à mesma chave lógica que a API usa (`networks/PlayerGroup/players/{nome do grupo}/...`).

**Regra de UI e integridade**: **não apresentar** esse registo como “conta de poker” nas listagens de nicks — filtrar `network !== "PlayerGroup"` onde se listam contas reais (mesas). Erro comum: confundir com nick de site.

- **Nicks reais**: `PlayerNick` com `network` num conjunto fechado de chaves de app (`gg`, `pokerstars`, … — ver `lib/constants/poker-networks` e schema). Cada nick pode ter múltiplas linhas em `SharkScopeCache`.

### 2.7 Cache SharkScope (`SharkScopeCache`)

Chave composta: **`playerNickId` + `dataType` + `filterKey`**. `rawData` é JSON bruto ou payload enriquecido (ex.: breakdown por site). `expiresAt` define TTL; funções em `lib/sharkscope-cache.ts` fazem **get-or-fetch** com refresh forçado no botão “Sincronizar”.

**Tipos de `dataType` relevantes** (não exhaustivo; ver código):

- `stats_lifetime`, `stats_10d`, `stats_30d`, `stats_90d` — estatísticas agregadas (ou **sintéticas** calculadas localmente após otimização de custo API).
- `group_site_breakdown_30d`, `group_site_breakdown_90d` — agregados por rede a partir de `completedTournaments` (payloads versionados; v3 pode incluir lista de torneios para recomputação local).

**Replicação**: jogadores que partilham o mesmo `playerGroup` replicam caches do “nick primário” do grupo para os restantes (`replicateSharkScopeCachesToPlayerNick`), evitando N chamadas à API para o mesmo grupo.

### 2.8 Alertas (`AlertLog`)

Eventos com `alertType` (ex.: `roi_drop`, `reentry_high`, `high_variance`, `early_finish`, `late_finish`, `group_not_found`), `severity`, `metricValue`, `threshold`, `context` JSON. Muitos são **gerados na sincronização diária / manual** quando métricas ultrapassam limiares (ver `lib/sharkscope/run-daily-sync.ts`). `group_not_found` limpa ou cria consoante a API devolver grupo inexistente ou opt-out.

### 2.9 Aprovação de grade (`GradeApproval`)

Parâmetros por jogador: faixas de ABI, redes permitidas, taxa máxima de reentrada, volume mínimo — usados em regras de negócio e validações cruzadas com imports e SharkScope.

### 2.10 Scouting (`ScoutingAnalysis`)

Análises guardadas (nick + rede), dados brutos e respostas NLQ opcionais — fluxo separado do sync diário; ver rotas `app/api/sharkscope/*` e páginas em `dashboard/sharkscope/scouting`.

### 2.11 Notificações e auditoria

- **`Notification`**: inbox por `AuthUser`, tipos em `NotificationType` (grade, import, revisão, etc.).
- **`AuditLog`**: trilha genérica `action` / `entity` / `entityId` / `details` JSON.

---

## 3. Stack técnica

| Camada | Escolha |
|--------|---------|
| Framework | **Next.js 16** (App Router). **Atenção**: APIs e convenções podem diferir de versões antigas — consultar `node_modules/next/dist/docs/` antes de assumir padrões de tutoriais. |
| Base de dados | **PostgreSQL** via **Prisma 7** (`@prisma/adapter-pg` disponível). |
| UI | **React 19**, **Tailwind CSS 4**, **shadcn/ui** (Radix), **Lucide**. |
| Estado cliente | **Zustand** onde necessário; **TanStack Query** presente nas dependências. |
| Validação | **Zod** em rotas e formulários. |
| Auth | Sessões com **jose**; OAuth Google opcional; OTP email para registo/recuperação. |
| Logging | **pino** (`lib/logger`). |
| Rate limit / cache edge | **Upstash Redis** opcional (`UPSTASH_*` em `lib/constants/env.ts`). |
| Testes | **Vitest** (`npm run test`); **Playwright** E2E (`npm run test:e2e`). |

---

## 4. Estrutura de pastas (guia de navegação)

```
app/
  (auth)/…                    # fluxos de login, registo, recuperação (layout por segmento)
  dashboard/                  # área autenticada principal
    page.tsx                  # home do dashboard
    players/                  # listagem; [id]/ perfil, grades, etc.
    grades/                   # perfis de grade; [id]/ detalhe
    minha-grade/              # visão jogador
    monitoring/               # monitoramento / imports de performance
    sharkscope/               # analytics, alertas, scouting, group-compare, …
    imports/                  # histórico de importações; [id]/ detalhe
    review/                   # revisão coach
    targets/                  # metas
    history/                  # histórico (limites, etc.)
    notifications/            # centro de notificações
    profile/                  # perfil do utilizador
    users/                    # gestão de utilizadores (papéis elevados)
  api/
    auth/                     # login, logout, registo, Google, OTP, reset
    cron/daily-sync/          # job agendado SharkScope — exige CRON_SECRET
    sharkscope/sync/          # sync manual com sessão + AbortSignal (cancelar)
    sharkscope/…              # nlq, player, scouting, …
    alerts/                   # listar/reconhecer alertas
    players/…/nicks/          # CRUD nicks por jogador

components/                   # UI: shadcn base + compostos (ex.: players/, sharkscope/)
hooks/                        # lógica de UI (ex.: hooks/players/use-players-table-page.ts)
lib/
  auth/                       # sessão, guards, password policy
  data/                       # funções server-side para páginas (players-table, analytics, …)
  queries/db/                 # queries Prisma reutilizáveis por feature
  sharkscope/                 # run-daily-sync, aggregate, sync de grupos, scripts auxiliares
  sharkscope-cache.ts
  constants/                  # env, redes de poker, filtros SharkScope
  utils/                      # helpers (app.ts: extractStat, sharkScopeGet, …)
  types/                      # tipos partilhados
  logger, prisma, etc.

prisma/schema.prisma          # modelo canónico — sempre alinhar UI e migrations ao schema
scripts/                      # utilitários CLI (sync nicks, import CSV, …)
SharkScope_WS_API_PT.md       # documentação da API SharkScope (PT) — referência de endpoints e custos
```

**Modularização**: regra prática — **páginas** em `app/` devem permanecer finas; **dados** e regras em `lib/data` e `lib/queries`; **efeitos colaterais** (sync, email) em rotas API ou server actions; **SharkScope** concentrado em `lib/sharkscope/*` para não duplicar lógica de quota e parsing.

---

## 5. Integração SharkScope (arquitetura e custo)

### 5.1 Documentação externa

O ficheiro **`SharkScope_WS_API_PT.md`** descreve endpoints, filtros e **modelo de custo** (ex.: `completedTournaments` costuma custar **1 busca por até 100 torneios** retornados). O plano comercial limita “buscas”; por isso o código foi otimizado para **reduzir chamadas HTTP redundantes**.

### 5.2 Fluxos de execução

1. **Cron** (`app/api/cron/daily-sync/route.ts`): **`GET`** com **`Authorization: Bearer <CRON_SECRET>`**; query **`?force=1`** opcional. Sem `CRON_SECRET` no env, resposta **503**. Delega em `runDailySyncSharkScope`.
2. **Manual** (`app/api/sharkscope/sync/route.ts`): utilizador autenticado; mesma lógica de sync com possibilidade de **cancelamento** (`AbortSignal`).

### 5.3 Estratégia atual (resumo técnico)

- O sync diário/manual **não** pede `statistics` **lifetime** por grupo (poupa buscas). Usa `statistics` com filtros `Date:10D` / `Date:30D` / `Date:90D` conforme `syncMode` em `run-daily-sync.ts`. Alerta `high_variance` usa `AvEntrants` em **30d**, não lifetime.
- **Uma** sequência paginada de **`completedTournaments`** com filtro **90d** (não repetir 30d na API — a janela 90d contém 30d e 10d).
- **Agregação local** em `completed-tournaments-aggregate.ts`: extrai `TournamentRow` (`@date`, `@flags`, stake, prize, rede, etc.), filtra por recorte temporal, recalcula ROI, FP/FT, breakdowns por tipo (bounty/satellite/vanilla) **sem** novas chamadas filtradas à API para cada período.
- Breakdown **por site** gravado em `group_site_breakdown_*` com payloads versionados; 30d pode ser derivado localmente do conjunto 90d para poupar páginas.
- **`SHARKSCOPE_SITE_MAX_PAGES`**: teto opcional de páginas (×100 torneios) por grupo no `completedTournaments`; por omissão o sync pagina até a API esgotar o período (teto interno alto). Defina um valor **menor** para cortar custo em buscas.
- Opcional **`SHARKSCOPE_SYNC_SITE_NICKS`**: se ativado, sincroniza estatísticas por **nick × rede** (muito mais caro; desligado por defeito).

### 5.4 Ficheiros que qualquer alteração em quota deve rever

- `lib/sharkscope/run-daily-sync.ts` — orquestração, alertas, escrita em cache.
- `lib/sharkscope/group-site-breakdown-sync.ts` — paginação e gravação de breakdowns.
- `lib/sharkscope/completed-tournaments-aggregate.ts` — parsing e matemática de agregados.
- `lib/utils/app.ts` — `sharkScopeGet`, `extractStat`, headers.
- `lib/data/sharkscope-analytics.ts` — leitura do cache para gráficos e rankings.

---

## 6. Onde alterar o quê (matriz de manutenção)

| Objetivo | Onde começar |
|----------|----------------|
| Nova coluna na tabela de jogadores | `lib/data/players-table.ts`, tipos em `lib/types`, hook `hooks/players/use-players-table-page.ts`, componente `app/dashboard/players/`. |
| Métricas / gráficos SharkScope | `lib/data/sharkscope-analytics.ts`, cache tags `sharkscope-analytics`, componentes em `app/dashboard/sharkscope/analytics/`. |
| Alterar limiares de alertas | `lib/sharkscope/run-daily-sync.ts` + tipos em `AlertLog`. |
| Novo tipo de cache SharkScope | `dataType` / `filterKey` em Prisma + leitores em `lib/data/*`; evitar chaves ad hoc sem documentar. |
| Regras de grade (filtros) | `GradeRule`, import Lobbyze, páginas `dashboard/grades/`. |
| Auth / papéis | `lib/auth/`, rotas `app/api/auth/`, layouts que verificam sessão. |
| Email / OTP | `lib/` (env `GMAIL_*`), rotas de auth. |

---

## 7. UI/UX (diretrizes)

Referência visual: produtos **Linear**, **Notion**, **Vercel Dashboard** — **tipografia clara**, **modo escuro/claro**, **cards**, **badges de estado**, **feedback imediato** (toasts, estados de carregamento). O utilizador final deve perceber **status** (grade, metas, alertas) **sem ler texto longo**.

---

## 8. Scripts auxiliares no repositório

- `npm run sync:nicks` — script `scripts/sync-sharkscope-group-nicks.ts` (manutenção de nicks; não confundir com o sync diário principal).
- `npm run import:tournaments-csv` — importação auxiliar de CSV de torneios.

Consultar `package.json` para a lista atualizada.

---

*Última orientação*: antes de migrações destrutivas ou mudanças no modelo de cache SharkScope, alinhar com o time o impacto em **dados históricos** e em **quotas** da API.
