# Plano detalhado — Notas de adversários (Poker MTT)

Documento de produto e UX/UI para implementação da funcionalidade **Notas de adversários**: base de conhecimento coletiva, rastreável e com consolidação automática **não autoritativa**. Este plano prioriza **praticidade no dia a dia**, **navegação clara** e **interface moderna e profissional**, reutilizando padrões já existentes no projeto.

---

## 1. Objetivo e princípios

| Princípio | Implicação na prática |
|-----------|------------------------|
| Cada nota é um **evento** | Sempre uma nova linha no histórico; nunca “acrescentar” observação editando a nota de outro ou fundindo texto |
| **Conflitos são válidos** | UI mostra opiniões divergentes lado a lado; o consolidado é **sugestão**, com rótulo explícito |
| **Rastreabilidade** | Autor + data/hora em toda nota; edições sensíveis podem gerar auditoria |
| **Soft delete** | Exclusão lógica; lista pode filtrar “incluir removidas” só para staff |

---

## 2. Alinhamento técnico com o projeto (obrigatório na implementação)

### 2.1 Logos dos sites de poker

O projeto já centraliza redes, labels e caminhos de ícones em [`lib/constants/poker-networks.ts`](../lib/constants/poker-networks.ts) (`POKER_NETWORKS_UI`). Os assets ficam em [`public/`](../public/) (ex.: `gg-poker-logo.png`, `poker-stars-logo.png`, `888-poker-logo.png`, etc.).

**Regra de UX:** em **qualquer** lugar onde a rede (site) do adversário apareça, exibir:

1. **Logo** — via `POKER_NETWORKS_UI.find((n) => n.value === network)?.icon`, no mesmo espírito de [`components/meus-torneios/site-cell.tsx`](../components/meus-torneios/site-cell.tsx) e [`components/sharkscope/analytics/site-network-table-cell.tsx`](../components/sharkscope/analytics/site-network-table-cell.tsx): imagem `22×22px` (ou escala proporcional), `rounded`, `object-contain`, com **fallback** (inicial do nome da rede em círculo muted) se a rede for desconhecida ou sem ícone.

2. **Nome legível** — label da rede ao lado do logo, truncável (`truncate`) em listas densas.

**Onde aplicar obrigatoriamente:**

- Cabeçalho da ficha do adversário (hero).
- Linhas de tabela (listagem de adversários com notas recentes).
- Filtros e chips de rede selecionados.
- Modais de criação/edição de nota (selector de rede com **mesma** apresentação logo + texto).
- Timeline de notas (pelo menos no **primeiro bloco** ou no meta da nota se a rede for redundante ao contexto da página).

Isso garante **reconhecimento visual instantâneo** (mesmo padrão de “Meus torneios” e SharkScope) e consistência de marca.

### 2.2 Relação com SharkScope / `ScoutingAnalysis`

A tabela `ScoutingAnalysis` guarda análises pontuais com dados NLQ; **não** substitui o modelo de múltiplas notas. A nova feature pode **linkar opcionalmente** a uma análise para contexto, mas o núcleo são entidades próprias (`OpponentNote`, etc.). Evitar duplicar “nota única” dentro de scouting.

---

## 3. Arquitetura de informação e navegação

### 3.1 Entrada na funcionalidade

**Admin / staff (COACH, MANAGER, ADMIN):**

- Item no menu lateral (sidebar) agrupado com áreas operacionais — sugestão de label: **“Adversários”** ou **“Notas de adversários”**, ícone coerente com o design system (ex.: `Users`, `NotebookPen` ou `Fingerprint` — escolher um e manter).

**Jogador (PLAYER):**

- Entrada sob área do jogador — ex.: **“Adversários”** no mesmo grupo que “Minha grade”, “Histórico”, ou atalho contextual quando vier de um fluxo futuro (mesa / torneio). Evitar mais de **dois cliques** desde o dashboard para “listar adversários com notas”.

### 3.2 Hierarquia de páginas

```
Lista de adversários (cards ou tabela)
    └── Ficha do adversário [rede + nick]
            ├── Painel superior: identidade + consolidado + resumo coach (opcional)
            ├── Lista/timeline de notas (ordem: mais recente primeiro)
            └── Ações: nova nota, filtros, (staff) resumo manual
```

**Deep linking:** URL estável por adversário, ex. `/admin/adversarios/[network]/[nickSlug]` ou query `?network=&nick=` — facilita compartilhar link interno no Discord/WhatsApp do time.

**Breadcrumbs:** `Início > Adversários > [Logo+Rede] Nickname` — breadcrumbs clicáveis; último segmento não link.

### 3.3 Navegação secundária na ficha

- Tabs ou âncoras apenas se a ficha crescer (ex.: “Notas” | “Resumo” | “Atividade”). Para MVP, **uma página com scroll** com seções bem separadas costuma ser mais simples e rápida.

---

## 4. Telas e componentes UX (detalhado)

### 4.1 Lista de adversários

**Objetivo:** visão rápida do que o time já registrou.

**Layout:**

- **Toolbar:** busca por nick (debounce), filtro por **rede** (dropdown com **logo + label** por opção), ordenação (última nota, mais notas, A–Z).
- **Conteúdo:** alternativa A — **tabela** densa para power users; alternativa B — **cards** em grid para leitura rápida. Recomendação: **tabela no admin**, **cards opcionais no jogador** ou toggle “compacto / confortável”.

**Colunas sugeridas (tabela):**

| Coluna | Conteúdo |
|--------|----------|
| Adversário | **Logo rede** + nome da rede + nick em destaque |
| Consolidado | Chips: classificação predominante, estilo predominante, **badge de confiança** (baixa/média/alta) |
| Notas | Número total (não deletadas) |
| Última atividade | Data relativa (“há 2 d”) + tooltip com data absoluta |

**Estados vazios:**

- Sem resultados de busca: ilustração leve ou ícone + “Nenhum adversário encontrado” + limpar filtros.
- Base vazia: CTA primário **“Registrar primeiro adversário”** abrindo fluxo de nota (que implicitamente cria o contexto).

### 4.2 Hero da ficha do adversário

Bloco visual forte no topo (gradiente sutil ou borda, alinhado ao restante do app — ver modais com header em gradiente no projeto).

**Conteúdo obrigatório:**

- **Logo da rede** (grande: 32–40px) + label + nick em tipografia hierárquica (nick `text-xl`/`text-2xl` semibold).
- **Chip de rede** repetindo logo mini se o layout for largo (opcional).
- Ações: **“Nova nota”** (primário), menu secundário (exportar PDF futuro, etc.).

**Painel “Consolidado automático”** (card abaixo ou à direita em desktop):

- Título: **“Sugestão automática”** (sempre com ícone de informação/tooltip: *“Calculado a partir de todas as notas ativas; não substitui observações individuais.”*).
- Campos: classificação predominante, estilo predominante.
- **Confiança:** escala visual (ex.: 3 níveis com texto “Baixa / Média / Alta”) + número de notas usadas.
- **Empate:** se houver empate na moda, mostrar **“Empate: Fish 3 · Reg 3”** em vez de esconder o conflito.

**Painel “Resumo do time”** (opcional, só staff):

- Editável por COACH/ADMIN/MANAGER conforme política definida.
- Visualmente **distinto** do consolidado (ex.: borda sólida vs tracejada no automático) para não confundir “validado pelo staff” com “estatística”.

### 4.3 Timeline de notas

**Ordem:** `createdAt` descendente (mais recente no topo).

**Cada cartão de nota:**

- **Cabeçalho:** avatar/iniciais do autor + nome + **data** (absoluta + relativa).
- **Corpo:** texto livre com quebras preservadas; limite de altura com “expandir” se muito longo.
- **Meta:** chips para classificação/estilo **daquela** nota (se existirem).
- **Ações:** editar / excluir (soft) conforme permissão; ícone “…” em mobile.

**Conflitos visuais:** não usar cor “de erro” para divergência — usar **neutro** ou **accent** informativo. Duas notas seguidas com classificações opostas devem parecer **normais**, não alerta.

### 4.4 Modal / drawer “Nova nota”

- Campos: rede (select com **logo+label**), nick (texto), corpo (textarea com contador de caracteres), classificação e estilo (selects ou pill toggles).
- **Validação inline** clara; botão primário “Publicar nota”.
- Após sucesso: fechar e **inserir a nota no topo** da timeline com animação leve (optimistic UI opcional).

### 4.5 Edição de nota

- Mesmo formulário, pré-preenchido; mostrar **“Última edição em …”** se aplicável.
- Para staff editando nota de outro: microcopy **“Você está editando a nota de [Autor]”** para transparência.

---

## 5. UI visual — diretrizes modernas e profissionais

### 5.1 Sistema visual (consistência)

- Reutilizar **tokens** do projeto: `bg-card`, `border`, `text-muted-foreground`, `rounded-xl`, sombras suaves já usadas em cards admin.
- **Espaçamento:** seções com `space-y-6` ou `gap-4`; timeline com `border-l` + bullet ou cards empilhados com `gap-3`.
- **Tipografia:** títulos com hierarquia clara; corpo de nota com `leading-relaxed` para leitura longa.

### 5.2 Microinterações

- Hover em linhas da tabela: `hover:bg-muted/50`.
- Botões com estados loading (spinner no botão, não bloquear página inteira salvo primeira carga).
- Toasts de sucesso/erro alinhados a [`APP_TOASTER_PROPS`](../lib/constants/session-rbac.ts).

### 5.3 Acessibilidade

- Logos com `alt` vazio apenas se o nome da rede estiver no texto adjacente; caso contrário `alt` descritivo.
- Contraste de chips e badges verificado (modo escuro se existir).
- Foco visível em modais; `aria-label` nos botões de ícone.

### 5.4 Responsividade

- **Mobile:** hero empilhado; timeline full-width; FAB ou botão fixo inferior para “Nova nota” se fizer sentido.
- Tabela da lista: em telas estreitas, **card por adversário** com mesmos dados essenciais (logo + nick + 1 linha de consolidado).

---

## 6. Regras de negócio resumidas (implementação)

- Uma linha no banco = **uma observação**; conteúdo livre obrigatório; campos estruturados opcionais (enums no Prisma recomendado).
- Edição: autor edita a própria; **staff** pode editar qualquer uma (definir MANAGER/VIEWER na matriz final do produto).
- Exclusão: **soft delete**; autor + staff conforme política.
- Consolidação: **moda** sobre notas ativas; empates explícitos; confiança por faixas de contagem.

---

## 7. Matriz de permissões (a fechar com o time)

| Ação | PLAYER | COACH | ADMIN | MANAGER | VIEWER |
|------|--------|-------|-------|---------|--------|
| Ver notas | a definir (ex.: time inteiro) | sim | sim | sim | leitura? |
| Criar nota | sim | sim | sim | sim | não |
| Editar | própria | qualquer | qualquer | ? | não |
| Soft delete | própria | qualquer | qualquer | ? | não |
| Resumo manual | não | sim | sim | sim | não |

---

## 8. Fases de entrega sugeridas

| Fase | Escopo | UX |
|------|--------|-----|
| **MVP 1** | Modelo + API + lista + ficha + timeline + nova nota | Logos em todos os pontos de rede; consolidado com tooltip |
| **MVP 2** | Resumo manual staff + filtros avançados + auditoria | Distinção visual consolidado vs resumo |
| **MVP 3** | Atalhos desde contexto (ex.: scouting) + polish mobile | Paridade visual com restante app |

---

## 9. Checklist de qualidade antes de release

- [ ] Toda exibição de **rede** usa `POKER_NETWORKS_UI` + fallback consistente.
- [ ] Texto explicando que o **consolidado é sugestão** visível na ficha.
- [ ] Conflitos **não** são tratados como erro; empates mostrados.
- [ ] Empty states e erros de rede tratados com mensagens acionáveis.
- [ ] Performance: lista paginada ou virtualizada se > 100 adversários/notas.

---

## 10. Referências de código no repositório

- Logos e redes: [`lib/constants/poker-networks.ts`](../lib/constants/poker-networks.ts)
- Célula de site (padrão de logo): [`components/meus-torneios/site-cell.tsx`](../components/meus-torneios/site-cell.tsx)
- SharkScope tabela de rede: [`components/sharkscope/analytics/site-network-table-cell.tsx`](../components/sharkscope/analytics/site-network-table-cell.tsx)
- Papéis de sessão: [`lib/constants/session-rbac.ts`](../lib/constants/session-rbac.ts)

---

*Documento gerado para orientar implementação alinhada à experiência do produto “Gestão de Grades”. Ajustar rotas finais (`/admin/...`, `/jogador/...`) conforme estrutura de pastas em `app/` no momento do desenvolvimento.*
