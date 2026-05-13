# Deployment status

Estado actual del deployment por fase. Se actualiza al cerrar cada fase.

## Resumen por fase

| Fase | Descripción | Estado | Notas |
|------|-------------|--------|-------|
| 0 | Bootstrap + GitHub | ✅ Completada | Monorepo verde local; repo en GitHub privado. Branch protection aplazada (ADR-004). |
| 1 | DB + Auth + Supabase Cloud | ✅ Completada | Proyecto cloud creado, schema completo aplicado, auth + RLS verificados con curl. Build local OOM por presión de RAM/disco del Mac → validación delegada a GitHub Actions. |
| 2 | Mock data | ✅ Completada | 4 jobs + 30 candidates + 30 profiles + 30 applications + embeddings OpenAI 1536d. Distribución de etapas alineada con sección 7.2 del prompt. |
| 3 | Job Analyzer + `/try-it-now` + Vercel | ✅ Completada | Producción en `talentforge-poc.vercel.app`; `/try-it-now` streamea ICP por SSE desde Claude Haiku 4.5. Auto-deploy GitHub pendiente (manual GitHub App install). |
| 4 | Candidate Ranker | ✅ Completada | 30/30 candidatos scoreados con Claude Haiku 4.5. Mean 71.7, distribución 7 strong_yes / 13 yes / 4 maybe / 6 no. Sanitización anti-bias activa. UI /jobs/[id] y /candidates/[id] funcionales. |
| 5 | Transcripciones (12) | ✅ Completada | 12/12 transcripciones diarizadas (23-49 min cada una) calibradas 1 strong_yes / 1 yes / 1 maybe_no por job. 11 mixed-language, 1 español puro. Avg ~16K chars (~2500 palabras). |
| 6 | Interview Analyzer + PDF | ✅ Completada | 12/12 reports con citas+timestamps. Vista `/interviews/[id]` con transcript clickeable + tabs. PDF en Next.js API route. ADR-006 documenta el cambio Edge Function → API route. |
| 7 | Reporte comparativo + Question Generator | ✅ Completada | Tab Reporte side-by-side por job. Interview Question Generator + página `/jobs/[id]/interview-guide` + PDF de guía. |
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

## Fase 2 — detalle

### Mock data
- ✅ **4 vacantes** en `public.jobs` con descripciones full (400-600 palabras),
  must/nice-to-have, oferta, proceso. Ver
  [`scripts/seed/jobs.ts`](../scripts/seed/jobs.ts).
- ✅ **30 candidatos** con perfiles coherentes en
  [`scripts/seed/candidates.ts`](../scripts/seed/candidates.ts) — nombres LATAM
  verosímiles, skills + years per skill, experience plausible, summary 250-350
  palabras.
- ✅ Distribución por vacante (8/7/8/7) y por etapa: 12 recommended (3 por job),
  5 scheduled, 4 interested, 4 new, 3 interviewed, 2 contacted. Alineada con
  sección 7.2 del prompt.
- ✅ CEFR mezclado por vacante según el spec (A2 hasta C2).
- ✅ Anti-bias: campos `gender` y `university` se guardan en DB sólo para
  realismo del demo, pero el wrapper del Candidate Ranker (Fase 4) los redactará
  antes de cualquier llamada al LLM (ver [`docs/bias-mitigation.md`](bias-mitigation.md)).

### Embeddings
- ✅ Provider: **OpenAI** (`text-embedding-3-small`, 1536 dim).
- ✅ Helper: [`scripts/seed/embeddings.ts`](../scripts/seed/embeddings.ts) con
  batch ≤96 inputs.
- ✅ Pre-computados para los 4 jobs (`jobs.embedding`) y los 30 perfiles
  (`candidate_profiles.embedding`). El score IVF Flat
  (`vector_cosine_ops`, lists=10) ya tiene data, listo para Fase 4.
- ⚠️ Costo del seed: ~70K tokens de embeddings ≈ $0.0014 USD.

### Comandos disponibles
- `pnpm seed` — idempotente: upsert por slug (jobs) o por email (candidates).
- `pnpm seed:reset` — wrapper de `pnpm seed -- --reset`; trunca primero.

### Workaround conocido
- `@supabase/realtime-js@2.105.4` falla en Node 20 por falta de `WebSocket`
  nativo. El seed pasa `transport: ws` explícito en `createClient(...)`.
  Vercel runtime (Node 22+) no necesita esto.

### Smoke tests contra cloud (REST + service_role)
| Test | Resultado |
|------|-----------|
| `GET /rest/v1/jobs?order=salary_max_usd.desc` | 4 jobs en orden esperado. |
| `GET /rest/v1/applications?select=stage` | Counter: recommended=12, scheduled=5, interested=4, new=4, interviewed=3, contacted=2. |
| Counts verificación interna (`pnpm seed`) | jobs:4, candidates:30, candidate_profiles:30, applications:30 ✓ |

## Fase 3 — detalle

### Job Analyzer Agent
- ✅ Prompt: [`packages/agents/prompts/job-analyzer.md`](../packages/agents/prompts/job-analyzer.md)
  (humano) + [`packages/agents/prompts/job-analyzer.ts`](../packages/agents/prompts/job-analyzer.ts)
  (runtime, inlined para sobrevivir bundling).
- ✅ Schema Zod: [`packages/agents/schemas/job-analyzer.ts`](../packages/agents/schemas/job-analyzer.ts)
  con `JobAnalyzerOutputSchema` (title, seniority, must/nice/soft skills, languages CEFR,
  years_experience_min, modality, red_flags_to_avoid, ideal_candidate_summary).
- ✅ Runner streaming: [`packages/agents/runners/job-analyzer.ts`](../packages/agents/runners/job-analyzer.ts)
  con prefill `{` para garantizar JSON válido y `client.messages.stream` de Anthropic SDK.

### Endpoint + UI
- ✅ [`POST /api/analyze-jd`](../apps/web/app/api/analyze-jd/route.ts) responde
  `text/event-stream`. Frames: `data: {"type":"delta","text":"..."}\n\n` y al final
  `data: {"type":"done","parsed":{...}}\n\n`.
- ✅ [`/try-it-now`](../apps/web/app/try-it-now/page.tsx) (pública) con textarea +
  sample JD pre-cargado, consumidor SSE en cliente, visualización del ICP con cards
  (must/nice/soft/red-flags) y CTA sticky con Calendly opcional.

### Vercel
- ✅ Proyecto: `mario-vicente-s-projects/talentforge-poc` (Hobby).
- ✅ Configuración aplicada vía API: `rootDirectory=apps/web`, `framework=nextjs`.
- ✅ 9 env vars (8 + NEXT_PUBLIC_APP_URL): `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`,
  `ANTHROPIC_MODEL`, `EMBEDDINGS_PROVIDER`, `OPENAI_API_KEY`, `DEMO_USER_EMAIL`,
  `NEXT_PUBLIC_APP_URL` — todas en production/preview/development.
- ✅ Producción: **https://talentforge-poc.vercel.app** (aliased) /
  https://talentforge-izfgpi1sh-mario-vicente-s-projects.vercel.app (técnica).
- ✅ Build remoto en Vercel: 46s (`pnpm install` + `turbo run build` + Next.js).

### Smoke tests en producción
| Test | Resultado |
|------|-----------|
| `GET /try-it-now` | 200, contiene "Pruébalo con tu propia vacante" |
| `POST /api/analyze-jd` (JD corta) | SSE válido: deltas + `done` con `parsed` Zod-validado. ICP correcto: title, seniority=senior, must-haves React/TS/Next.js, modality=remote, summary en español neutro. |

### Pendiente: Auto-deploy en push a `main`
- Vercel CLI intentó conectar el repo automáticamente y falló con
  `Failed to connect marvicqui/talentforge-poc to project` — la **Vercel GitHub App**
  necesita instalarse en el repo privado.
- **Fix manual** (5 min):
  1. Ir a https://github.com/apps/vercel → "Install".
  2. Seleccionar **Only select repositories** → `marvicqui/talentforge-poc`.
  3. Volver al dashboard Vercel del proyecto → Settings → Git → conectar repo.
- Una vez conectado: push a `main` → producción automática, PR → preview deploy.
- Mientras tanto: `pnpm dlx vercel@latest deploy --prod --yes` (manual desde local).

## Fase 4 — detalle

### Candidate Ranker Agent
- ✅ [`sanitize.ts`](../packages/agents/sanitize.ts): redacta `full_name` (y sus partes),
  `university`, `gender` antes de cualquier llamada al LLM. Reemplaza con
  `<CANDIDATE>` / `<UNIVERSITY>`. Email reducido a hash legible para joinability.
- ✅ Prompt: [`candidate-ranker.md`](../packages/agents/prompts/candidate-ranker.md) +
  inline `.ts`. Contrato anti-bias explícito en el system prompt.
- ✅ Schema Zod: `overall_score (0-100)`, `skill_breakdown[]` con
  `{name, required_years, candidate_years, score, evidence}`, `match_reasoning`,
  `gaps[]`, `strengths[]`, `recommendation`.
- ✅ Runner: single-shot (no streaming) con prefill `{`, `max_tokens=4000`,
  validación Zod estricta. Coerce float→int para skill_breakdown numerics.

### Bulk scoring
- ✅ [`scripts/score-candidates.ts`](../scripts/score-candidates.ts):
  itera applications del tenant demo, llama al Ranker, persiste
  `match_score`/`match_breakdown`/`match_reasoning` y registra trace en
  `agent_traces`.
- ✅ Flags: `--only <slug>` y `--resume` (skip los que ya tienen score).
- ✅ Cobertura final: **30/30 candidatos** scoreados.

### Distribución de scores
| Bucket | Count |
|--------|-------|
| strong_yes (85+) | 7 |
| yes (70-84) | 13 |
| maybe (50-69) | 4 |
| no (0-49) | 6 |

Mean 71.7, min 38, max 94. La distribución cae naturalmente cerca de la
calibración del seed (3 recommended por job son los mejor scoreados).

### UI agregada
- ✅ [`/jobs/[id]`](../apps/web/app/(app)/jobs/[id]/page.tsx) con tabs
  URL-driven (`?tab=candidatos|icp|outreach|reporte`). Tab **Candidatos**
  funcional: tabla con score como progress bar, recomendación coloreada,
  filtro por etapa, link a perfil. ICP muestra raw JD; Outreach + Reporte
  comparativo son placeholders hasta Fase 7/8.
- ✅ [`/candidates/[id]`](../apps/web/app/(app)/candidates/[id]/page.tsx)
  con header (etapa, contacto, LinkedIn), Match Card (score + reasoning +
  gaps/strengths + tabla de cobertura por skill con evidencia), summary y
  experiencia. `?job=<id>` selecciona qué application mostrar si hay varias.
- ✅ `/dashboard` actualizado: 4 cards de jobs con métricas por etapa,
  enlace a `/jobs/[id]`, mejor score destacado, métrica "horas ahorradas"
  y CTA a `/try-it-now`.

### Costo estimado
~30 llamadas a Haiku 4.5 + reintentos ≈ $0.10 USD.

## Fase 5 — detalle

### Generador de transcripciones
- [`scripts/seed/transcript-generator.ts`](../scripts/seed/transcript-generator.ts):
  agente helper (vive en `scripts/` porque es código de seed, no producción).
  Toma `{job, candidate, calibration, targetMinutes}` y devuelve `segments[]`
  con `speaker | language | duration_seconds | text`. Post-process convierte a
  `start_ms/end_ms` absolutos.
- System prompt define 6 fases (intro, background, técnica core, caso práctico,
  STAR, cierre), calibración explícita (strong_yes / yes / maybe_no) y reglas
  de mezcla de idioma por CEFR del candidato.

### Orquestador
- [`scripts/generate-transcripts.ts`](../scripts/generate-transcripts.ts):
  para cada job, toma los 3 `recommended` ordenados por `match_score` desc y
  asigna calibración: top→strong_yes, mid→yes, bottom→maybe_no.
- Persiste:
  - `interviews` row con `status='completed'`, `scheduled_at` (escalonado
    8-30 días atrás), `duration_minutes` (de los timestamps).
  - `transcripts` row con `segments` jsonb, `raw_text` concatenado.
  - Vincula `interviews.transcript_id` ← `transcripts.id`.
- Idempotente: skip si ya hay transcript para `(candidate_id, job_id)` salvo
  `--force`.
- Comandos: `pnpm transcripts`, `--only <slug>`, `--force`.

### Resultados
| Job | Strong yes | Yes | Maybe / no |
|-----|------------|-----|------------|
| AI/ML — Lumina | Mariana Castillo Vargas (94) | Diego Salazar Mendoza (82) | Camila Fernández Aguirre (78) |
| Azure — Cresta | Felipe Cuevas Larraín (92) | Patricia Velasco Ortiz (88) | Roberto Núñez Acevedo (76) |
| DevOps — Volcán | Joaquín Iribarren Suárez (94) | Sofía Bermúdez Lara (88) | Tomás Errázuriz Donoso (82) |
| Full-Stack — Brújula | Daniela Espinosa Mancilla (92) | Laura Buitrago Marín (82) | Pedro Granados Salazar (82) |

- 12/12 generadas, 0 fallos.
- Duración media: ~38 min equivalentes. Min 23, max 49.
- Idiomas: 11 mixed (es+en), 1 puro español (Elena Romero A2 no fue elegida
  porque no es recommended; los strong_yes/yes/maybe-no caen en C1/C2 mayormente).
- Costo: ~$0.30 USD en Anthropic.

### Próximo paso
Fase 6 (Interview Analyzer) consume estas transcripciones y produce el report
con `english_level`, `technical_score`, `softskill_score`, `red_flags`,
`strengths`, citas con timestamps, y `recommendation`.

## Fase 6 — detalle

### Interview Analyzer Agent
- ✅ [`prompts/interview-analyzer.md`](../packages/agents/prompts/interview-analyzer.md) +
  inline `.ts`. Contrato explícito: cada score numérico requiere ≥1
  cita textual del candidato con `start_ms`. Anti-bias reforzado.
- ✅ Schema Zod ([`schemas/interview-analyzer.ts`](../packages/agents/schemas/interview-analyzer.ts)):
  `english_level (CEFR)`, `english_breakdown` (grammar/fluency/vocabulary/
  pronunciation con score + quotes), `technical_score[]` (hasta 6 skills),
  `softskill_score` (4 dimensiones), `red_flags[]`, `strengths[]`, `summary`,
  `recommendation`. `evidence_quote` nullish para tolerar `null` explícito del
  modelo.
- ✅ Runner: single-shot, max_tokens 6500 (subido tras truncamientos).

### Bulk analyzer
- ✅ [`scripts/analyze-interviews.ts`](../scripts/analyze-interviews.ts) con
  `--force` y `--only <slug>`. Idempotente: skip si ya hay report.
- ✅ Workaround Postgrest: hay dos FK entre `interviews` y `transcripts`
  (transcripts.interview_id ↔ interviews.transcript_id) lo que hace ambigua
  la embedding; se hacen dos queries.
- ✅ 12/12 reports generados (2 reintentos por max_tokens / nullable quote).

### Resultados
| Métrica | Valor |
|---------|-------|
| Reports | 12/12 |
| English levels | B2: 10, C1: 2 |
| Recommendations | strong_yes: 9, yes: 2, maybe: 1 |

Nota de calibración: el Analyzer fue más optimista que la calibración del
seed (3 strong_yes esperados, 3 yes, 3 maybe_no). El contenido textual del
report sí diverge correctamente (red_flags, technical_score por skill), pero
la `recommendation` final converge. Iteración futura: endurecer el prompt o
usar Sonnet para casos críticos.

### UI agregada
- ✅ [`/interviews/[id]`](../apps/web/app/(app)/interviews/[id]/page.tsx) con
  layout split (izquierda transcript, derecha report).
  Cliente: [`interview-report-view.tsx`](../apps/web/app/(app)/interviews/[id]/interview-report-view.tsx)
  con 5 tabs (Resumen, English, Técnico, Soft, Red flags) y **citas
  clickeables** que hacen scroll + highlight del segmento exacto en la
  transcripción.

### PDF
- Decisión: ADR-006 — PDF en Next.js API route, no Supabase Edge Function.
- Implementación:
  - [`lib/pdf/interview-report-document.tsx`](../apps/web/lib/pdf/interview-report-document.tsx)
    con componentes `@react-pdf/renderer` (Document/Page/View/Text).
  - [`/api/interview-report/[id]/pdf/route.ts`](../apps/web/app/api/interview-report/[id]/pdf/route.ts)
    Node runtime, auth-protegido, devuelve `application/pdf`.
- `next.config.mjs` agrega `serverComponentsExternalPackages: ["@react-pdf/renderer"]`
  para evitar tree-shake problemático.

### Costos
- 12 análisis con Claude Haiku 4.5 ≈ $0.20 USD.

## Fase 7 — detalle

### Interview Question Generator Agent (5to agente oficial)
- ✅ Prompt: [`question-generator.md`](../packages/agents/prompts/question-generator.md) + `.ts`.
- ✅ Schema Zod: 5 secciones (intro_rapport, background_experience,
  technical_core, practical_case, behavioral_star). Cada pregunta lleva
  `intent`, `time_minutes`, `what_to_look_for`, `good_answer_signals`,
  `weak_answer_signals`, `red_flag_signals`. Diseñado para reclutador no
  técnico.
- ✅ Runner: single-shot, max_tokens 6500.

### Persistencia
- `jobs.ideal_profile` jsonb almacena
  `{interview_guide, interview_guide_generated_at}`.
- Server action [`regenerateGuide`](../apps/web/app/(app)/jobs/[id]/interview-guide/actions.ts)
  con auth check → llama al agente → upsert vía admin client.

### UI
- ✅ Página [`/jobs/[id]/interview-guide`](../apps/web/app/(app)/jobs/[id]/interview-guide/page.tsx)
  con botón Generar / Regenerar; renderiza secciones, preguntas con tiempo
  estimado y las 4 columnas de señales (buscar / sólida / débil / red flag),
  caso práctico + sub-prompts.
- ✅ Botón "Descargar PDF" →
  [`/api/interview-guide/[id]/pdf`](../apps/web/app/api/interview-guide/[id]/pdf/route.ts)
  con [`InterviewGuideDocument`](../apps/web/lib/pdf/interview-guide-document.tsx)
  (`@react-pdf/renderer`).
- ✅ Tab **Reporte comparativo** en `/jobs/[id]?tab=reporte`: tabla side-by-side
  con todos los entrevistados que tienen reporte. Métricas: recomendación,
  inglés evaluado, seniority, **score por skill (unión de skills evaluadas)**,
  scores de soft skills, top 3 fortalezas y top 3 red flags. Cada nombre
  linkea al detalle de entrevista.
- ✅ Link "Guía de entrevista →" en el header de `/jobs/[id]`.

### Costos
- ~$0.02 USD por guía. Generación on-demand (no se precomputa para los 4
  jobs por default; el usuario hace click cuando lo necesita).

## Secretos esperados

| Destino | Secreto | Estado |
|---------|---------|--------|
| GitHub repo secrets | `SUPABASE_ACCESS_TOKEN` | ✅ |
| GitHub repo secrets | `SUPABASE_PROJECT_REF` | ✅ |
| GitHub repo secrets | `SUPABASE_DB_PASSWORD` | ✅ |
| GitHub repo secrets | `ANTHROPIC_API_KEY` | ⚠️ Pendiente — clasificador de seguridad bloqueó `gh secret set -b`; corre `echo '<key>' \| gh secret set ANTHROPIC_API_KEY` manualmente. No es bloqueante hasta Fase 9 (sólo necesario en Vercel env). |
| GitHub repo secrets | `OPENAI_API_KEY` | ⚠️ Pendiente — mismo motivo. No bloqueante. |
| Vercel env (prod/preview/dev) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | ⏳ Fase 3 |
| Vercel env | `ANTHROPIC_API_KEY` | ⏳ Fase 3 |
| Vercel env | `OPENAI_API_KEY` | ⏳ Fase 3 |
| Vercel env | `TWILIO_*` | ⏳ Fase 8 |

## URLs

| Recurso | URL | Estado |
|---------|-----|--------|
| GitHub repo | https://github.com/marvicqui/talentforge-poc | ✅ Privado |
| GitHub Actions | https://github.com/marvicqui/talentforge-poc/actions | ✅ Configurado |
| Supabase project | https://supabase.com/dashboard/project/swqshfwtlhcptmwvduee | ✅ us-east-1 |
| Supabase REST URL | https://swqshfwtlhcptmwvduee.supabase.co | ✅ |
| Vercel production | `*.vercel.app` | ⏳ Fase 3 |
