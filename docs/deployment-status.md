# Deployment status

Estado actual del deployment por fase. Se actualiza al cerrar cada fase.

| Fase | Descripción | Estado | Notas |
|------|-------------|--------|-------|
| 0 | Bootstrap + GitHub | ✅ Completada | Monorepo pnpm + Turbo, Next.js 14 en `apps/web`, repo GitHub privado, branch protection en `main`. |
| 1 | DB + Auth + Supabase Cloud | ⏳ Pendiente | Requiere `SUPABASE_ACCESS_TOKEN`. |
| 2 | Mock data | ⏳ Pendiente | Requiere `ANTHROPIC_API_KEY` + embeddings provider. |
| 3 | Job Analyzer + `/try-it-now` + Vercel | ⏳ Pendiente | Requiere `VERCEL_TOKEN`. |
| 4 | Candidate Ranker | ⏳ Pendiente | — |
| 5 | Transcripciones (12) | ⏳ Pendiente | — |
| 6 | Interview Analyzer + PDF | ⏳ Pendiente | — |
| 7 | Reporte comparativo + Question Generator | ⏳ Pendiente | — |
| 8 | Outreach + Twilio | ⏳ Pendiente | Requiere `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, número verificado en sandbox. |
| 9 | CI/CD + docs comerciales | ⏳ Pendiente | — |

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
| GitHub repo | _se rellena en Fase 0_ | ⏳ |
| Vercel production | `*.vercel.app` | ⏳ Fase 3 |
| Supabase project | dashboard.supabase.com | ⏳ Fase 1 |
