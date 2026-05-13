# TalentForge AI — PoC

[![CI](https://github.com/marvicqui/talentforge-poc/actions/workflows/ci.yml/badge.svg)](https://github.com/marvicqui/talentforge-poc/actions/workflows/ci.yml)
[![Supabase Migrate](https://github.com/marvicqui/talentforge-poc/actions/workflows/supabase-migrate.yml/badge.svg)](https://github.com/marvicqui/talentforge-poc/actions/workflows/supabase-migrate.yml)

PoC para demos comerciales de reclutamiento técnico potenciado por agentes de IA.
Stack: Next.js 14 (App Router) · Supabase (Postgres + pgvector + Auth + Edge Functions) ·
Claude Haiku 4.5 (`@anthropic-ai/sdk` + `@langchain/anthropic`) · Twilio WhatsApp Sandbox ·
Vercel Hobby.

> Estado actual: **Fase 0 — Bootstrap completado**. Ver
> [`docs/deployment-status.md`](docs/deployment-status.md) para el detalle por fase.

## Qué demuestra

1. Login del demo (cuenta `demo@talentforge.ai`).
2. Dashboard con **4 vacantes** y **30 candidatos** en distintas etapas.
3. ICP generado por IA + candidatos rankeados con scoring explicable y evidencia.
4. Match analysis por candidato.
5. Outreach generado y enviable por WhatsApp (Twilio Sandbox; modo simulado por default).
6. Entrevistas con transcripción + reporte (CEFR, scores técnicos por skill, soft skills,
   banderas rojas, recomendación).
7. Reporte comparativo side-by-side de 3 entrevistados.
8. **`/try-it-now`** público: pega una JD real y ve el ICP en streaming.

## Estructura

```
apps/web/              # Next.js 14 App Router
packages/db/           # Supabase migrations + types
packages/agents/       # Prompts, Zod schemas, runners
packages/integrations/twilio/
packages/shared/
supabase/              # config.toml, migrations/, functions/
scripts/               # seed-demo, reset-demo, generate-types
docs/                  # architecture, demo-script, decisions/, deployment-status
```

## Desarrollo local

Requisitos: Node 20+, pnpm 9+, GitHub CLI, Supabase CLI (`brew install supabase/tap/supabase`).

```bash
pnpm install
cp .env.example .env.local   # rellena las claves
pnpm dev                     # apps/web en http://localhost:3000
```

## Roadmap por fases

Ver [`prompt-claude-code-recruiting-poc-v2.md`](prompt-claude-code-recruiting-poc-v2.md) y
[`docs/deployment-status.md`](docs/deployment-status.md). Fases:

- **0 — Bootstrap + GitHub** ← actual
- 1 — DB + Auth + Supabase Cloud
- 2 — Mock data (4 jobs + 30 candidatos)
- 3 — Job Analyzer + `/try-it-now` + primer deploy Vercel
- 4 — Candidate Ranker
- 5 — 12 transcripciones de entrevista
- 6 — Interview Analyzer + PDF
- 7 — Reporte comparativo + Question Generator
- 8 — Outreach Composer + Twilio
- 9 — CI/CD + docs comerciales

## Seguridad

- `.env*` está en `.gitignore`. **Nunca se commitean secretos.**
- Secretos viven en: `.env.local` (local), Vercel env vars, Supabase secrets, GitHub repo
  secrets. Ver [`docs/deployment.md`](docs/deployment.md).

## Licencia

Propietaria / demo interna.
