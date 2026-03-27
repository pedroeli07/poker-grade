<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Regras do Agente

## Comportamento
- Responda de forma direta e concisa (máx 4 linhas)
- Sem introduções ou explicações desnecessárias
- Código funcional, não pseudo código
- Não filosofe, não explique demais

## Stack
- Next.js 16 (App Router)
- Prisma + PostgreSQL
- Tailwind CSS 4
- shadcn/ui (já instalado)
- Zustand para state
- xlsx para Excel
- Lucide React para ícones

## Regras de Código
- Não adicione comentários desnecessários
- Siga convenções existentes do projeto
- Use TypeScript
- Use Zod para validação
- Mantenha código simples e funcional

## Design
- Estilo SaaS premium (Linear, Notion, Vercel)
- Dark/Light mode
- Use componentes shadcn/ui existentes
- Tudo visual: cards, badges, cores de status

## Comandos Úteis
- `npm run dev` - Iniciar desenvolvimento
- `npm run lint` - Verificar código
- `npm run build` - Build de produção
