# Documentação Técnica — Integração SharkScope
## Sistema CL Team | poker-grade.vercel.app

**Versão:** 1.1  
**Data:** Abril 2026  
**Stack:** Next.js (fullstack) + Prisma + Neon PostgreSQL + Vercel  
**Repositório:** poker-grade.vercel.app  

---

## 1. Visão Geral do Projeto

### 1.1 Contexto

O CL Team é um time profissional de poker com ~35 jogadores focados em MTT (Multi-Table Tournaments). O sistema **poker-grade** já existe e está em produção. Ele gerencia:

- Cadastro de jogadores com roles (Admin, Coach, Manager, Player, Viewer)
- Grades de torneios importadas da Lobbyze via JSON
- Importação de histórico de torneios via Excel (.xlsx, .xls, .csv)
- Revisão de torneios extra-play e suspeitos
- Targets com gatilhos de subida/descida de limite
- Histórico de limites (subidas e descidas de grade)
- Sistema de notificações interno

### 1.2 Objetivo da Integração

Adicionar inteligência de performance ao sistema existente usando a **API SharkScope PRO 5k** (5.000 buscas/mês). O objetivo não é criar um módulo separado, mas enriquecer as páginas e funcionalidades já existentes com dados reais de performance dos jogadores.

### 1.3 O que NÃO fazer

- Não criar uma página/seção isolada chamada "SharkScope"
- Não chamar a API do SharkScope a cada clique do usuário (esgota o budget)
- Não duplicar funcionalidades que a Lobbyze/importação já resolvem
- Não criar um sistema paralelo — integrar ao que já existe

---

## 2. Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js + React |
| Backend | Next.js API Routes (fullstack) |
| ORM | Prisma |
| Banco de dados | Neon PostgreSQL |
| Hospedagem | Vercel |
| Autenticação | Já implementada (sistema de roles existente) |
| API externa | SharkScope REST API v1.0.100 |

---

## 3. API SharkScope — Referência Técnica

### 3.1 Autenticação

**URL base:**
```
https://www.sharkscope.com/api/{SHARKSCOPE_APP_NAME}/
```

O `SHARKSCOPE_APP_NAME` é fornecido pelo SharkScope ao ativar o acesso de developer. Usar sempre via `process.env.SHARKSCOPE_APP_NAME`.

**Headers obrigatórios em toda requisição:**
```http
Accept: application/json
User-Agent: CLTeamApp/1.0
Username: {SHARKSCOPE_USERNAME}
Password: {hash_double_md5}
```

**Codificação da senha (Double-MD5):**

O `SHARKSCOPE_PASSWORD_HASH` no `.env` já contém o MD5 da senha original (pré-calculado). A função em runtime combina esse hash com a app key:

```
1. hash1 = SHARKSCOPE_PASSWORD_HASH (já está no .env como MD5 da senha)
2. combined = hash1 + SHARKSCOPE_APP_KEY
3. password_header = MD5(combined).toLowerCase()
```

```typescript
// lib/sharkscope.ts — implementação correta em Node.js
import crypto from 'crypto';

function encodeSharkScopePassword(): string {
  // SHARKSCOPE_PASSWORD_HASH = MD5 da senha original, já pré-calculado e salvo no .env
  const hash1 = process.env.SHARKSCOPE_PASSWORD_HASH!.toLowerCase();
  const combined = hash1 + process.env.SHARKSCOPE_APP_KEY!;
  return crypto.createHash('md5').update(combined).digest('hex').toLowerCase();
}
```

**Variáveis de ambiente necessárias (.env):**
```
SHARKSCOPE_APP_NAME=pendente_aguardando_sharkscope
SHARKSCOPE_USERNAME=carlosvribeiro0@gmail.com
SHARKSCOPE_APP_KEY=pendente_aguardando_sharkscope
SHARKSCOPE_PASSWORD_HASH=md5_da_senha_a_calcular
CRON_SECRET=string_aleatoria_segura
```

**Verificação de autenticação — conferir na resposta:**
```json
{
  "Response": {
    "success": "true",
    "UserInfo": {
      "loggedIn": "true",
      "RemainingSearches": 4850
    }
  }
}
```

### 3.2 Endpoints Prioritários

#### Resumo do jogador (1 busca)
```
GET /networks/{network}/players/{nick}
```
Retorna: ROI, lucro total, volume, recência, ABI médio, torneios recentes.

Com filtro de período:
```
GET /networks/{network}/players/{nick}?filter=Date:10D
```

#### Estatísticas específicas (1 busca)
```
GET /networks/{network}/players/{nick}/statistics/AvROI,Count,TotalProfit,AvStake,AvEntrants
```
Mais eficiente que o resumo quando só precisa de métricas.

#### Torneios concluídos (1 busca por 100 torneios)
```
GET /networks/{network}/players/{nick}/completedTournaments?order=Last,1~100&filter=Date:30D
```

#### Torneios ativos do jogador (1 busca, grátis se <3h)
```
GET /networks/{network}/players/{nick}/activeTournaments
```

#### Insights (1 busca, 0 se buscado há <1 min)
```
GET /networks/{network}/players/{nick}/insights
```
Retorna: previsões de performance, recomendações de lucratividade.

#### Consulta em Linguagem Natural — NLQ (1 busca)
```
GET /networks/{network}/players/{nick}?nlq={pergunta}&timezone=America/Sao_Paulo
```
Exemplos de perguntas:
- "Últimos 50 torneios PKO excluindo satélites"
- "Performance por dia da semana nos últimos 90 dias"
- "Torneios onde cheguei à mesa final sem reentrada"
- "Meses com melhor ROI em 2025"

#### Torneios ativos multi-jogador (1 por jogador, grátis se <3h)
```
GET /activeTournaments?network1={rede}&player1={nick1}&network2={rede}&player2={nick2}
```

#### Torneios concluídos em lote — POST (1 por jogador, max 10)
```
POST /networks/{network}/completedTournaments
Body: players={nick1,nick2,...}
```
Suporta até 2.000 jogadores. Padrão: últimos 4 dias (GG: 21 dias).

### 3.3 Redes Suportadas (códigos da API)

| Site | Código SharkScope |
|------|------------------|
| GGPoker / GG Network | `gg` |
| PokerStars | `pokerstars` |
| PokerStars.ES | `pokerstars` (região ES) |
| 888 Poker | `888` |
| Party Poker | `partypoker` |
| iPoker | `ipoker` |
| WPT Global | `wpt` |
| CoinPoker | `coinpoker` |

### 3.4 Sistema de Filtros

Filtros são passados via parâmetro `?filter=` com restrições separadas por `;`:

```
?filter=Date:30D;Type:B;Type!:SAT;Entrants:200~800
```

**Filtros mais usados:**

| Filtro | Sintaxe | Descrição |
|--------|---------|-----------|
| Período | `Date:30D` / `Date:10D` / `Date:3M` | Últimos N dias/semanas/meses |
| Field size | `Entrants:200~800` | Número de participantes |
| Buy-in | `StakePlusRake:USD22~109` | Faixa de buy-in |
| Bounty/PKO | `Type:B` | Torneios bounty |
| Excluir sats | `Type!:SAT` | Sem satélites |
| Excluir ST | `Type!:ST` | Sem super turbos |
| Reentrada | `ReEntries:0` | Sem reentradas |
| Mesa final | `Position:FT` | Chegou à FT |
| Dia da semana | `DayOfWeek:Su,Sa` | Fins de semana |
| Hora | `HourOfDay:18~23` | Período noturno |

**Filtros salvos (custo 0):**
```
POST /user/filters/{nomeFiltro}/save?type=Player&text=Date:30D;Type!:SAT;Type!:ST
```

### 3.5 Códigos de Erro Relevantes

| Código | Causa |
|--------|-------|
| 101002 | Senha inválida — verificar Double-MD5 |
| 102002 | Cota diária esgotada |
| 102007 | Zero buscas restantes no mês |
| 200004 | Jogador não encontrado ou opt-out |
| 201003 | Servidor ocupado — retry com backoff |

---

## 4. Banco de Dados — Alterações Necessárias no Schema Prisma

### 4.1 Tabelas a Adicionar

O schema atual tem a entidade `Player` com um campo único `nickname`. As seguintes tabelas precisam ser adicionadas:

#### PlayerNick
Suporte a múltiplos nicks por jogador (um por site de poker).

```prisma
model PlayerNick {
  id         String   @id @default(cuid())
  playerId   String
  nick       String
  network    String   // "gg" | "pokerstars" | "888" | "partypoker" | "ipoker" | "wpt" | "coinpoker"
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  
  player     Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)
  sharkCache SharkScopeCache[]
  
  @@unique([playerId, nick, network])
  @@index([playerId])
}
```

#### SharkScopeCache
Cache de respostas da API para evitar desperdício de buscas.

```prisma
model SharkScopeCache {
  id           String   @id @default(cuid())
  playerNickId String
  dataType     String   // "summary" | "stats_10d" | "stats_30d" | "stats_90d" | "insights"
  filterKey    String
  rawData      Json
  fetchedAt    DateTime @default(now())
  expiresAt    DateTime
  
  playerNick   PlayerNick @relation(fields: [playerNickId], references: [id], onDelete: Cascade)
  
  @@unique([playerNickId, dataType, filterKey])
  @@index([playerNickId, dataType])
  @@index([expiresAt])
}
```

#### AlertLog
Registro de alertas calculados pelo cron job.

```prisma
model AlertLog {
  id             String    @id @default(cuid())
  playerId       String
  alertType      String    // "roi_drop" | "reentry_high" | "abi_deviation" | "high_variance" | "low_volume"
  severity       String    // "red" | "yellow" | "green"
  metricValue    Float
  threshold      Float
  context        Json?
  triggeredAt    DateTime  @default(now())
  acknowledged   Boolean   @default(false)
  acknowledgedAt DateTime?
  acknowledgedBy String?
  
  player         Player    @relation(fields: [playerId], references: [id], onDelete: Cascade)
  
  @@index([playerId, severity])
  @@index([triggeredAt])
  @@index([acknowledged])
}
```

#### GradeApproval
Regras de grade aprovadas por jogador.

```prisma
model GradeApproval {
  id                String   @id @default(cuid())
  playerId          String   @unique
  minAbi            Float?
  maxAbi            Float?
  allowedNetworks   String[]
  maxReentryRatePct Float?   @default(25)
  minVolumeMensal   Int?
  validFrom         DateTime @default(now())
  notes             String?
  
  player            Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)
}
```

### 4.2 Relations a adicionar no model Player existente

```prisma
nicks          PlayerNick[]
alerts         AlertLog[]
gradeApproval  GradeApproval?
```

---

## 5. Cache — Estratégia

### 5.1 Função principal

Arquivo: `lib/sharkscope-cache.ts`

```typescript
export async function getOrFetchSharkScope(
  playerNickId: string,
  dataType: string,
  filterKey: string,
  fetchFn: () => Promise<any>,
  ttlHours: number = 24
) {
  const cached = await prisma.sharkScopeCache.findUnique({
    where: { playerNickId_dataType_filterKey: { playerNickId, dataType, filterKey } }
  });

  if (cached && cached.expiresAt > new Date()) {
    return cached.rawData;
  }

  const data = await fetchFn();
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);

  await prisma.sharkScopeCache.upsert({
    where: { playerNickId_dataType_filterKey: { playerNickId, dataType, filterKey } },
    update: { rawData: data as any, fetchedAt: new Date(), expiresAt },
    create: { playerNickId, dataType, filterKey, rawData: data as any, expiresAt }
  });

  return data;
}
```

### 5.2 TTL por tipo de dado

| dataType | TTL | Motivo |
|----------|-----|--------|
| stats_10d | 24h | Atualizado pelo cron diário |
| stats_30d | 24h | Atualizado pelo cron diário |
| stats_90d | 48h | Muda menos — economia de buscas |
| insights | 6h | Mais dinâmico |
| summary | 24h | Padrão |

---

## 6. Cron Job Diário

**Arquivo:** `app/api/cron/daily-sync/route.ts`  
**Horário:** 06h00 todos os dias  
**Configuração:** `vercel.json`

```json
{
  "crons": [{ "path": "/api/cron/daily-sync", "schedule": "0 6 * * *" }]
}
```

**Fluxo do cron:**
1. Verificar `Authorization: Bearer {CRON_SECRET}`
2. Buscar todos os `PlayerNick` com `isActive: true`
3. Para cada nick → chamar `/networks/{network}/players/{nick}?filter=Date:10D` → salvar como `stats_10d`
4. Para cada nick → chamar estatísticas 30d → salvar como `stats_30d`
5. Calcular alertas com base nos dados obtidos
6. Logar `RemainingSearches` da resposta para monitorar budget

**Regras de alerta do cron:**

| Condição | alertType | severity |
|----------|-----------|----------|
| ROI 10d < -40% | roi_drop | red |
| ROI 10d < -20% | roi_drop | yellow |
| AvEntrants > 1200 (30d) | high_variance | yellow |

---

## 7. API Routes

### 7.1 SharkScope (proxy com cache)

```
GET  /api/sharkscope/player?nickId={id}&dataType={type}&filter={filter}
POST /api/sharkscope/nlq  Body: { playerNickId, question, timezone }
```

A rota NLQ **não usa cache** — é busca ao vivo, debita 1 busca do budget.

### 7.2 Nicks do jogador

```
GET    /api/players/{playerId}/nicks
POST   /api/players/{playerId}/nicks          Body: { nick, network }
PUT    /api/players/{playerId}/nicks/{id}     Body: { nick, network, isActive }
DELETE /api/players/{playerId}/nicks/{id}
```

### 7.3 Alertas

```
GET  /api/alerts?severity={red|yellow}&acknowledged={false}
POST /api/alerts/{id}/acknowledge
GET  /api/alerts/player/{playerId}
```

### 7.4 Cron (protegida)

```
GET /api/cron/daily-sync
```

Proteger com `CRON_SECRET` — verificar header `Authorization: Bearer {CRON_SECRET}`.

---

## 8. Alterações nas Páginas Existentes

### 8.1 Página: /admin/jogadores (lista de jogadores)

**Adicionar:** coluna "Performance 10d" na tabela existente.

| Campo | Descrição |
|-------|-----------|
| ROI 10d | Valor numérico com cor semafórica |
| Semáforo | 🔴 ROI < -40% \| 🟡 ROI < -20% \| ✅ normal |
| Torneios 10d | Volume no período |

Dados vêm do cache (não chamada em tempo real). Se cache vazio para um jogador (nick não cadastrado), exibir "—" cinza.

### 8.2 Página: /admin/jogadores/{id} (perfil do jogador)

**Adicionar seção "Performance SharkScope"** abaixo das informações existentes:

- Tabs: **10d / 30d / 90d** (apenas esses três — correspondem exatamente aos dataTypes do cache: `stats_10d`, `stats_30d`, `stats_90d`)
- Cards de métricas: ROI, Lucro Total, Volume, ABI médio, Field Size médio
- Semáforo de alertas ativos do jogador
- Lista de nicks cadastrados com rede (com botão para adicionar/remover)
- Botão "Consultar agora" (força refresh do cache, debita 1 busca)
- Campo NLQ: "Pergunte ao SharkScope sobre este jogador" (debita 1 busca)

### 8.3 Página: /admin/dashboard (Overview)

**Substituir card "Aderência de Grade" vazio** por dados reais:

- Número de jogadores com alerta vermelho ativo
- Número de jogadores com alerta amarelo ativo
- Link "Ver alertas" → página de alertas

**Adicionar card "Alertas SharkScope":**
- Lista dos últimos 5 alertas não reconhecidos
- Botão reconhecer alerta direto da home

### 8.4 Página: /admin/jogadores (modal Novo Jogador)

**Não alterar o modal.** O campo "Nickname" existente é para identificação interna do sistema e deve permanecer como está. Nenhum `PlayerNick` é criado automaticamente ao cadastrar um jogador.

Os nicks por rede de poker são adicionados manualmente pelo usuário na ficha individual (`/admin/jogadores/[id]`) após o cadastro, usando o formulário "Adicionar nick" que exige nick + rede obrigatoriamente.

### 8.5 Nova página: /admin/sharkscope/alertas

Página de alertas consolidados do time:

- Filtros: período, severidade, tipo de alerta, jogador
- Tabela: jogador | alerta | valor | threshold | data | ações
- Botão "Reconhecer" por alerta
- Exportar alertas do período (CSV)

### 8.6 Nova página: /admin/sharkscope/analises

Painel de análise por eixo (consome cache — sem buscas adicionais):

**Abas:**
- Por site: tabela GG / PS / 888 / Party / iPoker / WPT / CoinPoker — ROI e lucro do time
- Por tier: Low ($5-22) / Mid ($22-109) / High ($109+)
- Por modalidade: PKO vs Vanilla, Turbo vs Regular
- Ranking interno: quem está melhor no período selecionado

**Filtro de período:** 7d / 30d / 90d — aplicado sobre dados do cache

### 8.7 Nova página: /admin/sharkscope/avaliacao

Pesquisa avulsa de nick (para contratações):

- Campo: nick de poker + select de rede
- Botão "Pesquisar" (debita 1 busca)
- Resultado: perfil completo com ROI, curva de lucro, tendência
- Comparação: nick pesquisado vs média do time (usando dados do cache)
- Campo NLQ: pergunta livre sobre o nick pesquisado
- Botão "Salvar análise" → registra no banco sem criar jogador

---

## 9. Budget de Buscas — Estimativa Mensal

| Operação | Frequência | Custo/mês |
|----------|-----------|-----------|
| Cron diário (35 jogadores × 2 nicks × 1 busca) | Diário | ~2.100 |
| Perfil individual (abertura de ficha) | ~5/dia | ~150 |
| Scouting manual | ~20/mês | ~20 |
| NLQ (consultas livres) | ~50/mês | ~50 |
| Insights (1x/semana por jogador ativo) | Semanal | ~140 |
| **Total estimado** | | **~2.460 / 5.000** |
| **Margem de segurança** | | **~2.540 livres** |

---

## 10. Segurança

### 10.1 Credenciais SharkScope

- **Nunca** expor `SHARKSCOPE_APP_KEY` ou o password hash no frontend
- Toda chamada à API SharkScope passa obrigatoriamente por uma API Route do Next.js
- O frontend só chama `/api/sharkscope/*` — nunca `sharkscope.com` diretamente

### 10.2 Proteção do Cron

```typescript
// /api/cron/daily-sync
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ... lógica do cron
}
```

### 10.3 Controle de acesso por role

Páginas SharkScope devem respeitar o sistema de roles existente:

| Rota | Roles com acesso |
|------|----------------|
| /admin/sharkscope/alertas | Admin, Manager, Coach |
| /admin/sharkscope/analises | Admin, Manager, Coach |
| /admin/sharkscope/avaliacao | Admin, Manager |
| Perfil do jogador (seção SharkScope) | Admin, Manager, Coach |
| Coluna ROI na lista de jogadores | Admin, Manager, Coach |

---

## 11. Mapeamento entre Lobbyze e SharkScope

O sistema já importa grades da Lobbyze (JSON). O JSON das grades contém:

```json
{
  "name": "PKO $14-$30 regular",
  "site": [{ "item_id": 2, "item_text": "GG Network" }],
  "buy_in_min": 14,
  "buy_in_max": 30,
  "variant": [{ "item_id": "Knockout", "item_text": "Knockout" }],
  "min_participants": 150
}
```

**Mapeamento de IDs Lobbyze → código SharkScope:**

| Lobbyze item_id | Lobbyze item_text | Código SharkScope |
|----------------|------------------|------------------|
| 2 | GG Network | `gg` |
| 3 | PartyPoker | `partypoker` |
| 10 | PokerStars.ES | `pokerstars` |
| 335 | WPT Global | `wpt` |
| 6 | iPoker | `ipoker` |
| 406 | Coin Poker | `coinpoker` |
| 1 | PokerStars | `pokerstars` |
| 5 | 888poker | `888` |

**Mapeamento de variant Lobbyze → filtro SharkScope:**

| Lobbyze variant | Filtro SharkScope |
|----------------|------------------|
| Knockout | `Type:B` |
| Regular | `Type!:B` |

---

## 12. Sequência de Implementação (Sprints)

### Sprint 1 — Fundação (Semana 1-2)
**Objetivo:** suporte a múltiplos nicks + autenticação SharkScope + cache

1. Migration Prisma: adicionar `PlayerNick`, `SharkScopeCache`, `AlertLog`, `GradeApproval`
2. API Routes CRUD de nicks: `/api/players/{id}/nicks`
3. UI na ficha do jogador: seção de nicks cadastrados (listar, adicionar, remover)
4. `lib/sharkscope.ts`: função de autenticação com Double-MD5
5. `lib/sharkscope-cache.ts`: função `getOrFetchSharkScope`
6. API Route proxy: `/api/sharkscope/player`

**Entrega:** sistema consegue buscar dados de qualquer jogador via nick cadastrado, com cache funcional.

### Sprint 2 — Alertas e Dashboard (Semana 3-4)
**Objetivo:** visibilidade imediata de quem precisa de atenção

1. `vercel.json`: configurar cron job diário 06h00
2. `/api/cron/daily-sync`: implementar varredura completa
3. Motor de alertas: calcular ROI 10d, reentry rate, volume
4. Coluna "Performance 10d" na página `/admin/jogadores`
5. Card de alertas no Dashboard principal
6. Página `/admin/sharkscope/alertas`

**Entrega:** todo dia, ao abrir o sistema, já aparece quem está com ROI baixo — sem clicar em nada.

### Sprint 3 — Perfil e Análise (Semana 5-7)
**Objetivo:** profundidade analítica por jogador e por grupo

1. Seção SharkScope na ficha individual do jogador (tabs 10d/30d/90d)
2. Campo NLQ na ficha do jogador
3. Página `/admin/sharkscope/analises` (por site, tier, modalidade)
4. Filtros de período reutilizando dados do cache

**Entrega:** análise completa por qualquer eixo sem gasto adicional de buscas.

### Sprint 4 — Scouting (Semana 8-10)
**Objetivo:** inteligência para contratações

1. Página `/admin/sharkscope/avaliacao`
2. Comparativo candidato vs média do time
3. Histórico de análises de scouting salvas
4. Relatório mensal automático (agregação de cache)

**Entrega:** sistema completo — gestão diária + análise estratégica + scouting.

---

## 13. Glossário

| Termo | Significado |
|-------|-------------|
| Nick | Apelido/username do jogador em um site de poker |
| Network | Site/plataforma de poker (GGPoker, PokerStars, etc.) |
| ROI | Return on Investment — lucro / buy-in total investido × 100 |
| ABI | Average Buy-In — buy-in médio dos torneios jogados |
| PKO | Progressive Knockout — formato bounty progressivo |
| MTT | Multi-Table Tournament — torneio multi-mesa |
| Grade | Conjunto de torneios aprovados para o jogador jogar |
| Reentry rate | Taxa de reentradas = (inscrições / torneios) - 1 |
| Cache TTL | Time to Live — tempo de validade do dado em cache |
| NLQ | Natural Language Query — consulta em linguagem natural |
| Cron job | Tarefa agendada que roda automaticamente em horário definido |
