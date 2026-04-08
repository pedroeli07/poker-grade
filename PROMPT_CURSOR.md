# Prompt Inicial — Cursor AI
## Projeto: Integração SharkScope no Sistema CL Team

---

Você é um desenvolvedor sênior Next.js trabalhando no sistema **poker-grade** (poker-grade.vercel.app), um sistema de gestão de time de poker profissional.

## ⚠️ Nota sobre credenciais SharkScope

As variáveis `SHARKSCOPE_APP_NAME` e `SHARKSCOPE_APP_KEY` ainda estão sendo obtidas junto ao SharkScope (aguardando resposta do suporte). Implemente todo o código usando `process.env.SHARKSCOPE_APP_NAME` e `process.env.SHARKSCOPE_APP_KEY` normalmente — elas serão preenchidas no `.env` assim que chegarem. O código deve funcionar assim que as variáveis forem adicionadas, sem nenhuma alteração.

---

## Contexto do sistema atual

O sistema já está em produção com as seguintes funcionalidades implementadas:
- Autenticação com roles: Admin, Coach, Manager, Player, Viewer
- Página `/dashboard/players` — lista de jogadores com botão "Novo Jogador" (formulário com campos: Nome Completo, Nickname único, E-mail, Coach Responsável, Grade principal, ABI alvo)
- Página `/dashboard/grades` — grades de torneios importadas da Lobbyze via JSON
- Página `/dashboard/imports` — importação de histórico de torneios via Excel (.xlsx, .xls, .csv) da plataforma Lobbyze
- Página `/dashboard/review` — conferência de torneios extra-play e suspeitos
- Página `/dashboard/targets` — targets com gatilhos de subida/descida de limite
- Página `/dashboard/history` — histórico de movimentações de limite
- Página `/dashboard/users` — gerenciamento de usuários e convites
- Sistema de notificações interno
- Stack: Next.js (fullstack com API Routes), Prisma, Neon PostgreSQL, hospedado na Vercel

## O que precisamos implementar

Integrar a **API SharkScope PRO** (REST API) ao sistema existente para enriquecer a gestão do time com dados de performance dos jogadores de poker. O budget é de **5.000 buscas por mês**.

## Princípios que devem guiar todo o desenvolvimento

1. **Não criar módulo separado** — o SharkScope deve enriquecer páginas existentes, não criar uma seção isolada
2. **Cache obrigatório no banco** — nunca chamar a API SharkScope em resposta a clique do usuário nas páginas principais; todo dado exibido vem do cache (Prisma + Neon)
3. **Cron job diário** — um job às 06h00 atualiza os dados de todos os jogadores e calcula alertas automaticamente
4. **Credenciais sempre no servidor** — nunca expor API key ou password do SharkScope no frontend; toda chamada passa por API Routes
5. **Respeitar roles existentes** — usar o sistema de autenticação/autorização já implementado

## Variáveis de ambiente necessárias (adicionar ao .env)

```
SHARKSCOPE_APP_NAME=pendente_aguardando_sharkscope
SHARKSCOPE_USERNAME=carlosvribeiro0@gmail.com
SHARKSCOPE_APP_KEY=pendente_aguardando_sharkscope
SHARKSCOPE_PASSWORD_HASH=md5_da_senha_a_calcular
CRON_SECRET=string_aleatoria_segura_para_proteger_o_cron
```

## Autenticação SharkScope — Double-MD5

A senha da API não é enviada em texto puro. O processo de codificação:

```typescript
import crypto from 'crypto';

function encodeSharkScopePassword(): string {
  // SHARKSCOPE_PASSWORD_HASH = MD5 da senha original (já pré-calculado e salvo no .env)
  const hash1 = process.env.SHARKSCOPE_PASSWORD_HASH!.toLowerCase();
  const combined = hash1 + process.env.SHARKSCOPE_APP_KEY!;
  return crypto.createHash('md5').update(combined).digest('hex').toLowerCase();
}
```

Headers obrigatórios em toda requisição:
```
Accept: application/json
User-Agent: CLTeamApp/1.0
Username: {SHARKSCOPE_USERNAME}
Password: {resultado do Double-MD5}
```

URL base:
```
https://www.sharkscope.com/api/{SHARKSCOPE_APP_NAME}/
```

## Schema Prisma — Novas tabelas a adicionar

Adicione ao schema existente **sem remover nada**:

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

No model `Player` existente, adicionar as relations:
```prisma
nicks          PlayerNick[]
alerts         AlertLog[]
gradeApproval  GradeApproval?
```

## Lógica de cache — implementar em lib/sharkscope-cache.ts

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

## Cron job — implementar em app/api/cron/daily-sync/route.ts

```typescript
// Proteger com CRON_SECRET
// Configurar no vercel.json:
// { "crons": [{ "path": "/api/cron/daily-sync", "schedule": "0 6 * * *" }] }
```

O cron deve:
1. Buscar todos os PlayerNick ativos
2. Para cada nick: buscar `/networks/{network}/players/{nick}?filter=Date:10D` e salvar em cache como `stats_10d`
3. Para cada nick: buscar `/networks/{network}/players/{nick}/statistics/AvROI,Count,TotalProfit,AvStake,AvEntrants?filter=Date:30D` e salvar como `stats_30d`
4. Calcular alertas:
   - ROI 10d < -40% → `AlertLog` severity "red", alertType "roi_drop"
   - ROI 10d < -20% → `AlertLog` severity "yellow", alertType "roi_drop"
   - AvEntrants > 1200 (30d) → `AlertLog` severity "yellow", alertType "high_variance"
5. Logar `RemainingSearches` retornado pela API para monitorar budget

## API Routes a criar

### /api/players/[id]/nicks/route.ts
- GET: listar nicks do jogador
- POST: adicionar nick (body: `{ nick, network }`)

### /api/players/[id]/nicks/[nickId]/route.ts
- PUT: atualizar (body: `{ nick, network, isActive }`)
- DELETE: remover nick

### /api/sharkscope/player/route.ts
- GET: proxy para SharkScope com cache
- Query params: `nickId`, `dataType`, `filter`
- Verificar autenticação do usuário (role Admin/Coach/Manager)
- Usar `getOrFetchSharkScope`

### /api/sharkscope/nlq/route.ts
- POST: consulta em linguagem natural
- Body: `{ playerNickId, question, timezone }`
- NLQ não usa cache — é busca ao vivo
- URL SharkScope: `GET /networks/{network}/players/{nick}?nlq={question}&timezone={tz}`

### /api/alerts/route.ts
- GET: listar alertas (query: `severity`, `acknowledged`, `playerId`)

### /api/alerts/[id]/acknowledge/route.ts
- POST: marcar alerta como reconhecido

## Alterações nas páginas existentes

### /dashboard/players — adicionar coluna "Performance 10d"
- Coluna nova na tabela: ROI nos últimos 10 dias com cor semafórica
- 🔴 ROI < -40% | 🟡 ROI < -20% | ✅ normal / sem dado
- Dados vêm do cache; se não houver cache, exibir "—"
- Não fazer chamada SharkScope ao carregar a página

### /dashboard/players/[id] — adicionar seção SharkScope
Abaixo das informações existentes do jogador, adicionar seção com:
- Lista de nicks cadastrados: tabela com nick, rede, status (ativo/inativo), botões editar/remover
- Botão "Adicionar nick" → formulário inline com campo nick + select de rede
- Tabs de performance: **10d / 30d / 90d** (apenas esses três — correspondem aos dataTypes do cache)
- Cards de métricas por período: ROI, Lucro Total, Volume (qtd torneios), ABI médio
- Lista de alertas ativos do jogador
- Campo de NLQ: input + botão "Perguntar ao SharkScope" (consome 1 busca)

### /dashboard/players — modal "Novo Jogador"
O modal atual tem um único campo "Nickname" usado para identificação interna. **Manter esse campo exatamente como está** — ele não cria `PlayerNick` automaticamente. Os nicks por rede de poker são adicionados pelo usuário na ficha individual do jogador (`/dashboard/players/[id]`) após o cadastro, usando o formulário "Adicionar nick".

### /dashboard (Overview) — atualizar card "Aderência de Grade"
Substituir conteúdo vazio por:
- Número de jogadores com alerta vermelho
- Número de jogadores com alerta amarelo
- Link "Ver todos os alertas"

## Novas páginas a criar

### /dashboard/sharkscope/alerts
Listagem de todos os alertas do time:
- Filtros: severidade, tipo, jogador, período, reconhecido/não reconhecido
- Tabela: jogador | tipo de alerta | valor | limite | data | ações
- Botão "Reconhecer" por linha
- Botão "Reconhecer todos"

### /dashboard/sharkscope/analytics
Painel de análise por eixo (usa dados do cache — sem buscas adicionais):
- Selector de período: 7d / 30d / 90d
- Aba "Por site": tabela com GG, PokerStars, 888, Party, iPoker, WPT, CoinPoker — ROI e lucro do time em cada
- Aba "Por tier": Low ($5-22) / Mid ($22-109) / High ($109+) — ROI, lucro, volume
- Aba "Por modalidade": PKO vs Vanilla — comparativo de performance
- Aba "Ranking": jogadores ordenados por ROI no período

### /dashboard/sharkscope/scouting
Pesquisa avulsa para scouting de contratações:
- Input: nick + select de rede + botão "Pesquisar" (consome 1 busca)
- Resultado: ROI, lucro, ABI médio, field size médio, recência, tendência
- Comparativo: nick pesquisado vs média do time
- Campo NLQ sobre o nick (consome 1 busca)
- Botão "Salvar análise de scouting" → salva em banco para consulta futura

## Redes de poker suportadas — usar este mapeamento

```typescript
export const POKER_NETWORKS = {
  gg: { label: 'GGPoker', sharkscopeCode: 'gg' },
  pokerstars: { label: 'PokerStars', sharkscopeCode: 'pokerstars' },
  '888': { label: '888 Poker', sharkscopeCode: '888' },
  partypoker: { label: 'Party Poker', sharkscopeCode: 'partypoker' },
  ipoker: { label: 'iPoker', sharkscopeCode: 'ipoker' },
  wpt: { label: 'WPT Global', sharkscopeCode: 'wpt' },
  coinpoker: { label: 'CoinPoker', sharkscopeCode: 'coinpoker' },
} as const;

// Mapeamento dos IDs da Lobbyze para os códigos SharkScope
export const LOBBYZE_TO_SHARKSCOPE: Record<number, string> = {
  2: 'gg',        // GG Network
  3: 'partypoker',
  10: 'pokerstars', // PokerStars.ES
  335: 'wpt',     // WPT Global
  6: 'ipoker',
  406: 'coinpoker',
  1: 'pokerstars',
  5: '888',
};
```

## Regras de acesso por role

```typescript
// Usar o sistema de roles existente
const SHARKSCOPE_ALLOWED_ROLES = ['ADMIN', 'MANAGER', 'COACH'];
const SCOUTING_ALLOWED_ROLES = ['ADMIN', 'MANAGER'];
```

## Ordem de implementação — começar pelo Sprint 1

**Implementar agora (Sprint 1):**
1. Migration Prisma com as 4 novas tabelas acima
2. Adicionar relations no model Player
3. `lib/sharkscope.ts` — função de autenticação e chamada base à API
4. `lib/sharkscope-cache.ts` — função `getOrFetchSharkScope`
5. API Routes CRUD de nicks (`/api/players/[id]/nicks`)
6. UI na ficha do jogador: seção de nicks (listar + adicionar + remover)
7. API Route proxy: `/api/sharkscope/player`

**Não implementar agora (deixar para sprints seguintes):**
- Cron job, alertas, páginas de analytics e scouting

## Padrões de código do projeto

Observe o código existente e mantenha:
- Consistência com os patterns já usados (componentes, hooks, tipos)
- Usar Prisma Client do projeto (não criar nova instância)
- Usar a autenticação/session já implementada para verificar roles
- Manter o design system visual já adotado (cores, tipografia, componentes)
- Respostas de API em JSON com padrão consistente ao que já existe
- TypeScript em tudo — sem `any` desnecessário

## Quando tiver dúvida

Se houver alguma ambiguidade sobre como o código existente está estruturado (como a autenticação funciona, como o Prisma Client é instanciado, como os componentes são organizados), pergunte antes de assumir. Prefira ler arquivos existentes como referência do que criar patterns novos.

---

**Começe pelo Sprint 1. Primeira tarefa: gere a migration Prisma com as 4 novas tabelas e mostre o schema.prisma atualizado.**
