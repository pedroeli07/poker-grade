# Gestão de Grades — Plataforma Web para Times de Poker

**Gestão de Grades** é uma aplicação **full-stack** (Next.js 16, React 19, Prisma, PostgreSQL) para organizações de poker profissional gerirem **grades de torneios**, **metas**, **monitoramento de volume e aderência**, **revisões coach–jogador** e integração com a API **SharkScope** (estatísticas agregadas, alertas e analytics), respeitando **quotas de API** através de cache e lógica de sincronização otimizada.

| Documento | Conteúdo |
|-----------|----------|
| **[`CLAUDE.md`](./CLAUDE.md)** | Domínio, modelo de dados, SharkScope, pastas, matriz de manutenção — **leitura obrigatória** para desenvolvimento sério. |
| **[`AGENTS.md`](./AGENTS.md)** | Convenções para assistentes de código e armadilhas do projeto. |
| **[`SharkScope_WS_API_PT.md`](./SharkScope_WS_API_PT.md)** | Referência da API SharkScope (português). |

---

## 1. Pré-requisitos de ambiente

| Requisito | Notas |
|-----------|--------|
| **Node.js** | Versão compatível com as `engines` do `package.json` (se definidas); em geral Node 20 LTS ou superior é seguro. |
| **npm** | Gestor usado no repo (`package-lock.json`); `pnpm`/`yarn` só se o time padronizar e atualizar lockfiles. |
| **PostgreSQL** | Base relacional; URL de conexão no formato aceite pelo Prisma (`postgresql://…`). |
| **Conta / credenciais SharkScope** | Para desenvolver sync e analytics reais (opcional em ambiente só UI se mockar dados). |
| **Redis Upstash (opcional)** | Rate limiting e caches edge se `UPSTASH_*` estiver definido. |

---

## 2. Instalação e primeiro arranque

Na raiz do repositório:

```bash
npm install
```

O `postinstall` executa **`prisma generate`** automaticamente (cliente Prisma).

Crie um ficheiro **`.env`** na raiz (nunca commitar). Variáveis mínimas típicas:

```env
# Obrigatório para a app e Prisma
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

# URL pública da app (redirects OAuth, links em emails)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# SharkScope — necessário para sync e chamadas à API
SHARKSCOPE_APP_NAME="..."
SHARKSCOPE_APP_KEY="..."
SHARKSCOPE_USERNAME="..."
SHARKSCOPE_PASSWORD_HASH="..."

# Protege o endpoint de cron (apenas o scheduler deve conhecer o segredo)
CRON_SECRET="..."

# Opcional: OAuth Google
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...

# Opcional: email (OTP, recuperação) — ver implementação com nodemailer
# GMAIL_USER=...
# GMAIL_APP_PASSWORD=...

# Opcional: Redis Upstash
# UPSTASH_REDIS_REST_URL=...
# UPSTASH_REDIS_REST_TOKEN=...

# Opcional: tuning SharkScope (ver CLAUDE.md)
# SHARKSCOPE_SITE_MAX_PAGES=5
# SHARKSCOPE_SYNC_SITE_NICKS=0
# SHARKSCOPE_ANALYTICS_SITE_FALLBACK_NICKS=0
```

Aplicar o schema à base (escolha **uma** estratégia alinhada ao time):

```bash
# Desenvolvimento rápido (sem histórico formal de migrações)
npx prisma db push

# Ou fluxo com migrações versionadas
npx prisma migrate dev
```

Arrancar o servidor de desenvolvimento:

```bash
npm run dev
```

Abrir **[http://localhost:3000](http://localhost:3000)**. O primeiro utilizador administrativo pode depender de fluxo de **convite** (`AllowedEmail`) — confirmar com o responsável pelo deploy.

---

## 3. Scripts npm (referência)

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor Next.js em modo desenvolvimento (hot reload). |
| `npm run build` | Compilação de produção (valida tipos e otimiza bundles). |
| `npm run start` | Servidor Node após `build` (produção local ou container). |
| `npm run lint` | ESLint sobre o projeto. |
| `npm run test` | **Vitest** — testes unitários/integrados (`vitest run`). |
| `npm run test:watch` | Vitest em modo watch. |
| `npm run test:e2e` | **Playwright** — testes end-to-end. |
| `npm run sync:nicks` | Script auxiliar `scripts/sync-sharkscope-group-nicks.ts` (manutenção de nicks; ver código antes de usar em produção). |
| `npm run import:tournaments-csv` | Script `scripts/import-player-group-tournaments-csv.ts` para importação pontual de CSV. |

---

## 4. Variáveis de ambiente (inventário expandido)

Todas as leituras centralizadas ou referenciadas em **`lib/constants/env.ts`**. Tabela de apoio:

| Variável | Finalidade |
|----------|------------|
| `DATABASE_URL` | Ligação PostgreSQL para Prisma. |
| `NEXT_PUBLIC_APP_URL` | Base URL pública (links, OAuth callback). |
| `NODE_ENV` | `development` / `production` (definido pelo runtime). |
| `LOG_LEVEL` | Nível mínimo de logs **pino** (se suportado pelo logger). |
| `SHARKSCOPE_APP_NAME`, `SHARKSCOPE_APP_KEY` | Identificação da aplicação na API SharkScope. |
| `SHARKSCOPE_USERNAME`, `SHARKSCOPE_PASSWORD_HASH` | Autenticação Basic-style conforme documentação SharkScope. |
| `SHARKSCOPE_NLQ_TIMEZONE` | Timezone para funcionalidades NLQ (default `America/Sao_Paulo`). |
| `CRON_SECRET` | Segredo partilhado com o agendador (Vercel Cron, GitHub Actions, etc.) para **`/api/cron/daily-sync`**. |
| `SHARKSCOPE_SITE_MAX_PAGES` | Máximo de páginas (cada uma até ~100 torneios) por grupo no fetch `completedTournaments` — impacto direto no **custo em buscas**. |
| `SHARKSCOPE_SYNC_SITE_NICKS` | Se verdadeiro, ativa sync **por nick e por rede** (caro; normalmente desligado). |
| `SHARKSCOPE_ANALYTICS_SITE_FALLBACK_NICKS` | Fallback de analytics para caches legados por nick quando não há breakdown de grupo. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth Google para login. |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Envio de email (OTP, notificações conforme implementação). |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Cliente Redis HTTP (rate limit, etc.). |
| `VERCEL_URL` | Opcional em deploy Vercel (URLs internas). |

**Segurança**: não commitar `.env`; em CI/CD usar secrets do provedor; rodar `git-secrets` ou revisar diffs antes de push.

---

## 5. Arquitetura em uma página

- **Frontend**: rotas em `app/` (App Router), componentes em `components/`, estado local e filtros em `hooks/`.
- **Backend embutido**: **Route Handlers** `app/api/**/route.ts`, **Server Components** e **Server Actions** onde aplicável.
- **Dados**: Prisma Client (`lib/prisma.ts`), queries reutilizáveis em `lib/queries/db`, agregações de páginas em `lib/data/*`.
- **Integração SharkScope**: isolada em `lib/sharkscope/*`, com persistência em `sharkscope_cache` e orquestração em `run-daily-sync.ts`.
- **Documentação de API externa**: `SharkScope_WS_API_PT.md`.

**Comparação com a pesquisa manual no site SharkScope:** os KPIs em cache (por exemplo `stats_10d` com `Date:10D`) vêm da mesma família de endpoints `statistics` documentada no `CLAUDE.md`. Pequenas diferenças face ao que vês no browser (décimas de ponto percentual) são normais: **instante** dos dados (sync vs. página aberta noutro momento), **arredondamento** na UI, ou **filtros** no site (stake, tipos de torneio) que não estão no `filter` da nossa chamada quando usamos só `Date:10D`.

Fluxos críticos estão descritos em profundidade no **[`CLAUDE.md`](./CLAUDE.md)** (grades, revisão, alertas, replicação de cache).

---

## 6. Testes e qualidade

- Correr **`npm run lint`** antes de abrir PR.
- Correr **`npm run test`** para regressões em lógica coberta por Vitest.
- **`npm run build`** deve passar localmente (apanha erros de tipo e de build Next.js).
- E2E com Playwright quando alterar fluxos críticos de UI (`npm run test:e2e`).

---

## 7. Deploy (orientação genérica)

1. Provisionar PostgreSQL gerido e definir `DATABASE_URL`.
2. Executar migrações (`prisma migrate deploy` em produção).
3. Definir todas as variáveis de ambiente no painel do host.
4. Configurar **cron** para invocar **`GET /api/cron/daily-sync`** com header **`Authorization: Bearer <CRON_SECRET>`**. Query opcional **`?force=1`** força refresh do cache (ver `app/api/cron/daily-sync/route.ts`). Sem `CRON_SECRET` no ambiente, a rota responde **503**.
5. Garantir que `NEXT_PUBLIC_APP_URL` reflete o domínio público.

---

## 8. Suporte e contribuição interna

- **Modelo de dados**: `prisma/schema.prisma` é a fonte de verdade; qualquer alteração de domínio passa por migração e revisão de impacto em caches SharkScope.
- **Alterações na API SharkScope**: ler `CLAUDE.md` secção 5 e `SharkScope_WS_API_PT.md` para custos e filtros.
- Dúvidas de produto: alinhar com o owner do time (regras de grade, limites de alertas, papéis).

---

*Repositório privado de equipa — ajustar secção de licença e contactos conforme política interna.*
