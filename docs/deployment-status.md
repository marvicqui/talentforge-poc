# Deployment status

Estado actual del deployment por fase. Se actualiza al cerrar cada fase.

## Resumen por fase

| Fase | Descripción | Estado | Notas |
|------|-------------|--------|-------|
| 0 | Bootstrap + GitHub | ✅ Completada | Monorepo verde local; repo en GitHub privado y empujado. Branch protection aplazada (ver ADR-004). |
| 1 | DB + Auth + Supabase Cloud | ⏳ Pendiente | Requiere `SUPABASE_ACCESS_TOKEN`. |
| 2 | Mock data | ⏳ Pendiente | Requiere `ANTHROPIC_API_KEY` + embeddings provider. |
| 3 | Job Analyzer + `/try-it-now` + Vercel | ⏳ Pendiente | Requiere `VERCEL_TOKEN`. |
| 4 | Candidate Ranker | ⏳ Pendiente | — |
| 5 | Transcripciones (12) | ⏳ Pendiente | — |
| 6 | Interview Analyzer + PDF | ⏳ Pendiente | — |
| 7 | Reporte comparativo + Question Generator | ⏳ Pendiente | — |
| 8 | Outreach + Twilio | ⏳ Pendiente | Requiere credenciales Twilio y número verificado en sandbox. |
| 9 | CI/CD + docs comerciales | ⏳ Pendiente | Aplicar `scripts/setup-branch-ruleset.sh` cuando el repo pase a público. |

## Fase 0 — detalle

- ✅ `node v20.19.5`, `pnpm 9.15.0` (instalado vía corepack, sin sudo), `gh 2.89.0`,
  `supabase 2.98.2`, `git 2.53.0`.
- ✅ Monorepo: `pnpm-workspace.yaml` + `turbo.json` + `tsconfig.base.json`.
- ✅ `apps/web`: Next.js 14.2.35 con App Router, TS estricto, Tailwind, shadcn/ui
  manual (`components.json` + `lib/utils.ts` + CSS vars). Landing en `/`.
- ✅ `packages/`: `db`, `agents` (prompts/, schemas/), `integrations/twilio`, `shared`.
- ✅ `supabase init` corrido; `config.toml` con `project_id = "talentforge-poc"`.
- ✅ `.github/workflows/`: `ci.yml` (lint+typecheck+build+test) y
  `supabase-migrate.yml` (push a main, paths filtrados a `supabase/migrations/**`).
- ✅ Local: `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`
  todos verdes.
- ✅ Repo GitHub: **https://github.com/marvicqui/talentforge-poc** (privado).
- ⚠️ Branch protection **no aplicada**: GitHub Free no permite rulesets en repos
  privados (403 "Upgrade to GitHub Pro"). Ver
  [`docs/decisions/ADR-004-branch-protection-aplazada.md`](decisions/ADR-004-branch-protection-aplazada.md).
  Script de aplicación: `scripts/setup-branch-ruleset.sh` (correr al hacer público o
  al pagar Pro).

## Secretos esperados

| Destino | Secreto | Estado |
|---------|---------|--------|
| GitHub repo secrets | `SUPABASE_ACCESS_TOKEN` | ⏳ Fase 1 |
| GitHub repo secrets | `SUPABASE_PROJECT_REF` | ⏳ Fase 1 |
| GitHub repo secrets | `SUPABASE_DB_PASSWORD` | ⏳ Fase 1 |
| Vercel env (prod/preview/dev) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | ⏳ Fase 3 |
| Vercel env | `ANTHROPIC_API_KEY` | ⏳ Fase 3 |
| Vercel env | `OPENAI_API_KEY` o `VOYAGE_API_KEY` | ⏳ Fase 2/3 |
| Vercel env | `TWILIO_*` | ⏳ Fase 8 |

## URLs

| Recurso | URL | Estado |
|---------|-----|--------|
| GitHub repo | https://github.com/marvicqui/talentforge-poc | ✅ Privado |
| GitHub Actions | https://github.com/marvicqui/talentforge-poc/actions | ✅ Configurado |
| Vercel production | `*.vercel.app` | ⏳ Fase 3 |
| Supabase project | dashboard.supabase.com | ⏳ Fase 1 |
