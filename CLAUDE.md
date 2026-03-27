@AGENTS.md

# Sistema de Gestão de Grades de Poker

## 🎯 Contexto
Sistema para um time profissional de poker gerenciar:
- Controle de quais torneios cada jogador pode jogar
- Subida e descida de limites
- Monitoramento de desvios da grade
- Comunicação coach ↔ jogador

## ⚠️ Regra Principal
NÃO complique. MVP:
- Simples
- Funcional
- Bonito
- Rápido de usar

## 📁 Estrutura de Pastas
```
/app
  /dashboard        - Dashboard principal
  /players          - Lista de jogadores
  /players/[id]     - Perfil do jogador
  /players/[id]/grades - Gerenciamento de grades
  /upload           - Upload de grades (JSON)
  /monitoring       - Upload de Excel/CSV
  /suggestions      - Sugestões de torneios
/components         - Componentes reutilizáveis
/lib                - Utilitários, stores, types
/prisma             - Schema do banco
```

## 🔧 Stack
- Next.js 16 (App Router)
- Prisma + PostgreSQL
- Tailwind CSS
- shadcn/ui
- Zustand (state)
- xlsx (Excel parsing)
- Lucide React (ícones)

## 📦 Funcionalidades Principais

### 1. Upload de Grades (CORE)
- Upload JSON com filtros da grade
- Grade principal, acima, abaixo
- Explicação da grade (rich text + áudio)
- Política de reentradas
- Targets (metas do jogador)

### 2. Visualização do Jogador
- Grade atual, acima, abaixo
- Explicação clara da grade
- Targets com status visual (🟢🟡🔴)
- Regras claras para subir/descer

### 3. Sugestão de Torneios
- Jogador sugere torneo
- Coach aprova/ignora

### 4. Monitoramento
- Upload Excel/CSV
- Tabela: Played, Didn't Play, Extra Play
- Detecção de problemas

### 5. Tela do Coach
- Lista de torneios suspeitos
- Aprovar / Exceção / Fora da grade
- Dispara solicitação de explicação

### 6. Cadastro
- Player ↔ Coach
- Cada player tem um coach

## 🎨 UI/UX
- Estilo: Linear, Notion, Vercel Dashboard
- Moderno, limpo, minimalista
- Excelente tipografia
- Dark/Light mode
- Cards, badges, cores de status
- Tudo visual e autoexplicativo
