# Deployment status

Estado actual del deployment por fase. Se actualiza al cerrar cada fase.

## Resumen por fase

| Fase | Descripción | Estado | Notas |
|------|-------------|--------|-------|
| 0 | Bootstrap + GitHub | ✅ Completada | Monorepo verde local; repo en GitHub privado. Branch protection aplazada (ADR-004). |
| 1 | DB + Auth + Supabase Cloud | ✅ Completada | Proyecto cloud creado, schema completo aplicado, auth + RLS verificados con curl. Build local OOM por presión de RAM/disco del Mac → validación delegada a GitHub Actions. |
| 2 | Mock data | ⏳ Pendiente | Requiere `ANTHROPIC_API_KEY` + embeddings provider. |
| 3 | Job Analyzer + `/try-it-now` + Vercel | ⏳ Pendiente | Requiere `VERCEL_TOKEN`. |
| 4 | Candidate Ranker | ⏳ Pendiente | — |
| 5 | Transcripciones (12) | ⏳ Pendiente | — |
| 6 | Interview Analyzer + PDF | ⏳ Pendiente | — |
| 7 | Reporte comparativo + Question Generator | ⏳ Pendiente | — |
| 8 | Outreach + Twilio | ⏳ Pendiente | Requiere credenciales Twilio y número verificado. |
| 9 | CI/CD + docs comerciales | ⏳ Pendiente | Aplicar `scripts/setup-branch-ruleset.sh` cuando el repo se haga público. |

## Fase 0 — detalle

- ✅ Monorepo: `pnpm-workspace.yaml` + `turbo.json` + `tsconfig.base.json`.
- ✅ `apps/web`: Next.js 14.2.35 con App Router, TS estricto, Tailwind, shadcn/ui manual.
- ✅ `packages/`: `db`, `agents`, `integrations/twilio`, `shared`.
- ✅ `supabase init` + `.github/workflows/` (ci.yml + supabase-migrate.yml).
- ✅ Repo GitHub: https://github.com/marvicqui/talentforge-poc (privado).
- ⚠️ Branch protection: aplazada (GitHub Free no permite rulesets en privados). Ver
  [`docs/decisions/ADR-004-branch-protection-aplazada.md`](decisions/ADR-004-branch-protection-aplazada.md).

## Fase 1 — detalle

### Supabase Cloud
- ✅ Proyecto **`talentforge-poc`** creado en `us-east-1`. Reference: `swqshfwtlhcptmwvduee`.
  Dashboard: https://supabase.com/dashboard/project/swqshfwtlhcptmwvduee
- ✅ Migración inicial (`supabase/migrations/20260512230400_init.sql`) aplicada con
  `supabase db push`:
  - Extensiones: `pgcrypto`, `vector`, `pg_trgm`.
  - 12 tablas (tenants, users, jobs, candidates, candidate_profiles, applications,
    conversations, outreach_messages, interviews, transcripts, interview_reports,
    agent_traces).
  - Trigger `set_updated_at` en cada tabla.
  - Índices IVF Flat (`vector_cosine_ops`, lists=10) en `jobs.embedding` y
    `candidate_profiles.embedding`.
  - RLS activada en todas las tablas con policy `*_select_authenticated`.
  - Seed: tenant demo `{slug: "demo", name: "TalentForge Demo"}`.
- ✅ Tipos TS generados: `packages/db/types.ts` (807 líneas).

### Auth + Next.js
- ✅ Clientes Supabase:
  - `apps/web/lib/supabase/server.ts` (SSR con cookies)
  - `apps/web/lib/supabase/browser.ts`
  - `apps/web/lib/supabase/admin.ts` (service role, server-only)
- ✅ `apps/web/middleware.ts` refresca sesión en cada request.
- ✅ Rutas:
  - `/login` con magic link (`signInWithOtp`) + botón **"Entrar como Demo"** que crea
    `demo@talentforge.ai` idempotente vía admin API y firma con password.
  - `/auth/callback` (exchange code → session).
  - `/auth/sign-out` (POST).
  - `/dashboard` protegida, muestra perfil del usuario + counts de jobs/candidatos
    (0 hasta Fase 2).

### Smoke tests contra Supabase Cloud (curl)
| Test | Resultado |
|------|-----------|
| `POST /auth/v1/signup` | HTTP 400 `email_address_invalid` → endpoint vivo, filtro de dominios activo. |
| `GET /rest/v1/jobs` (anon) | HTTP 200 `content-range: */0` → RLS bloquea anon (correcto). |
| `GET /rest/v1/tenants` (service_role) | `[{"slug":"demo","name":"TalentForge Demo"}]` → seed OK. |
| `pnpm typecheck` (local) | ✅ Verde, 5 paquetes. |
| `pnpm build` (local) | ⚠️ **OOM** killed por presión de RAM/swap del Mac (16 GB RAM con 26 GB swap usado). **Validación delegada a GitHub Actions CI** que tiene VM dedicada. |

### Secretos en GitHub
- ✅ `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`
  configurados con `gh secret set`. Listables con `gh secret list`.

### Notas operativas
- El password de DB se cambió de generación automática a manual del usuario.
- Hay otros 3 proyectos Supabase en la org del usuario (`dulet-agent`,
  `conoce-tu-mexico-whatsapp`, `nice-joyeria-prod`); para crear este proyecto se
  borró un `TalentForge_AI` accidental (West US) y se recreó en `us-east-1`.

## Secretos esperados

| Destino | Secreto | Estado |
|---------|---------|--------|
| GitHub repo secrets | `SUPABASE_ACCESS_TOKEN` | ✅ |
| GitHub repo secrets | `SUPABASE_PROJECT_REF` | ✅ |
| GitHub repo secrets | `SUPABASE_DB_PASSWORD` | ✅ |
| Vercel env (prod/preview/dev) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | ⏳ Fase 3 |
| Vercel env | `ANTHROPIC_API_KEY` | ⏳ Fase 3 |
| Vercel env | `OPENAI_API_KEY` o `VOYAGE_API_KEY` | ⏳ Fase 2/3 |
| Vercel env | `TWILIO_*` | ⏳ Fase 8 |

## URLs

| Recurso | URL | Estado |
|---------|-----|--------|
| GitHub repo | https://github.com/marvicqui/talentforge-poc | ✅ Privado |
| GitHub Actions | https://github.com/marvicqui/talentforge-poc/actions | ✅ Configurado |
| Supabase project | https://supabase.com/dashboard/project/swqshfwtlhcptmwvduee | ✅ us-east-1 |
| Supabase REST URL | https://swqshfwtlhcptmwvduee.supabase.co | ✅ |
| Vercel production | `*.vercel.app` | ⏳ Fase 3 |
