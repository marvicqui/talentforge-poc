# Prompt para Claude Code: TalentForge AI — PoC con Mock Data y Deploy Autónomo

Es una **PoC para demos comerciales** que tú (Claude Code) vas a deployar end-to-end en infraestructura gratuita. Yo (el usuario) te voy a dar los tokens y credenciales cuando me los pidas. **No avances de fase sin haber completado el deployment de la anterior.**

---

## 1. Tu rol

Actúa como **Staff Engineer / Solutions Architect / DevOps** con experiencia en:

- Next.js 14 (App Router), TypeScript estricto, deployment en Vercel.
- Supabase (Postgres + Auth + Storage + Edge Functions con Deno).
- LangChain con Anthropic (`@langchain/anthropic`), modelo `claude-haiku-4-5-20251001`.
- Twilio API (REST + WhatsApp Sandbox).
- GitHub Actions, Vercel CLI, Supabase CLI, GitHub CLI (`gh`).
- Diseño de demos B2B: UX pulido, datos creíbles, narrativa clara.

Toma decisiones de arquitecto cuando algo sea ambiguo. Documenta cada decisión no obvia en `docs/decisions/ADR-NNN-titulo.md` (5-10 líneas máximo).

---

## 2. Objetivo de esta PoC

Una aplicación web pública, hosteada gratis, que demuestre a un prospecto en una llamada de 10-15 min:

1. Login del demo (cuenta `demo@talentforge.ai` pre-cargada).
2. Dashboard con 4 vacantes activas y 30 candidatos en distintas etapas del pipeline.
3. Abrir una vacante, ver candidatos rankeados con scoring explicable.
4. Abrir el perfil de un candidato, ver match analysis generado por IA.
5. Generar y "enviar" un mensaje de outreach por Twilio (sandbox WhatsApp).
6. Abrir una entrevista completada, ver transcripción y reporte de scoring (nivel CEFR, scores técnicos por skill, soft skills, banderas rojas, recomendación final).
7. Ver reporte comparativo entre los 3 entrevistados de una misma vacante.
8. **Botón "Probar con tu propia vacante"**: el prospecto pega una JD real y ve el ICP en streaming. Esto cierra ventas.

LinkedIn, video real, n8n, calendar, billing y multi-tenancy estricta quedan **explícitamente fuera de scope** (van a `docs/roadmap-v2.md`).

---

## 3. Deployment: tu responsabilidad end-to-end

**Tú haces todo el deployment**. No le digas al usuario "ahora ve a Vercel y haz X". Tú ejecutas los comandos. Usas estas herramientas instaladas o las instalas si faltan:

- `gh` (GitHub CLI) — repo creation, secrets, PRs.
- `supabase` (Supabase CLI) — project creation, migrations, secrets, functions deploy.
- `vercel` (Vercel CLI) — link, env vars, deploys.
- `git` — commits y push.

**Reglas de oro de seguridad** (no negociables):

1. **Nunca commitees secretos.** Todo va a `.env.local` (gitignored), Vercel env vars, Supabase secrets, o GitHub repo secrets.
2. **Verifica** que `.gitignore` incluye `.env*` antes de cada commit.
3. Cada token que recibes lo guardas únicamente en el destino correcto (no lo escribes en archivos del repo, ni en outputs de logs).
4. Si un comando expone un secreto en stdout, redactalo antes de mostrarlo.
5. **Confirma el deploy con un curl o un test E2E mínimo** después de cada paso de deployment (no asumas que funcionó porque el comando no falló).

---

## 4. Información que vas a pedirme — por fase, no todo de golpe

Pide los tokens **en el momento que los necesitas**, con un mensaje claro indicando exactamente dónde generarlo. Formato sugerido:

```
🔑 Necesito que me proporciones:

1. <NOMBRE_DEL_TOKEN>
   ↳ Dónde generarlo: <URL exacta>
   ↳ Scopes/permisos necesarios: <lista>
   ↳ Para qué lo voy a usar: <breve>

Pégalos en este chat. Cuando los reciba continúo.
```

Esta es la secuencia esperada por fase:

### Antes de Fase 0
- **GitHub Personal Access Token** (classic o fine-grained).
  - URL: https://github.com/settings/tokens
  - Scopes: `repo`, `workflow`, `admin:repo_hook` (classic) o equivalente fine-grained con permisos de Contents, Workflows, Secrets, Administration (para crear repo y secrets).
  - Alternativa: si `gh auth status` muestra que ya estoy autenticado, no me pidas token.
- **Nombre del repo** (default sugerido: `talentforge-poc`).
- **Visibilidad** (default sugerido: private hasta tener un dominio, luego public).

### Antes de Fase 1
- **Supabase Access Token**.
  - URL: https://supabase.com/dashboard/account/tokens
  - Para qué: crear proyecto, correr migraciones, configurar secrets.
- **Región del proyecto Supabase** (sugiere `us-east-1` por proximidad a México y mejor latencia LATAM, default).
- **Password de DB** (sugiere generar uno fuerte automáticamente y mostrármelo una sola vez para que lo guarde en 1Password).

### Antes de Fase 2
- **Anthropic API key** (https://console.anthropic.com/settings/keys).
- **Embedding provider key**: OpenAI (https://platform.openai.com/api-keys) **o** Voyage AI (https://dash.voyageai.com/api-keys). Pregúntame cuál prefiero. Sugerencia: Voyage si quiero free tier de 50M tokens.

### Antes de Fase 3 (primer deploy a Vercel)
- **Vercel Token** (https://vercel.com/account/tokens).
- **Vercel Team/Scope slug**: si tengo equipo Vercel, dame el slug; si no, usa mi personal scope. Detéctalo con `vercel teams list`.
- **Dominio**: déjalo en `*.vercel.app` por default. Pregúntame si quiero conectar uno custom (luego puedo agregarlo).

### Antes de Fase 8 (Twilio)
- **Twilio Account SID** y **Auth Token** (https://console.twilio.com).
- **Mi número personal de WhatsApp en formato E.164** (ej. `+5219211234567`), para que lo agregue a `TWILIO_SANDBOX_VERIFIED_NUMBERS` y pueda probar envíos reales.
- Confírmame que ya envié `join <palabra-clave>` desde mi WhatsApp al número del sandbox de Twilio (instrúyeme cómo hacerlo si no).

### Antes de Fase 9 (CI/CD)
- **Confirmar que todos los secretos anteriores están en GitHub repo secrets** (los configuras tú con `gh secret set`).
- **Calendly URL de ventas** (opcional, default: dejarlo vacío).

**Modo "simulación de deploy"**: si por alguna razón yo no tengo a la mano un token específico cuando me lo pides, te lo digo y tú pausas esa parte concreta del deployment pero **sigues codificando localmente**. Marca la sección en `docs/deployment-status.md` como "pendiente: token X" y avísame al final de la fase. Nunca bloquees el desarrollo por un token faltante.

---

## 5. Stack tecnológico (versiones exactas)

- **Frontend + API**: Next.js 14+ (App Router) + TypeScript 5.4+. Tailwind CSS + shadcn/ui.
- **Backend**: Next.js API Routes (Node runtime) + Supabase Edge Functions (Deno).
- **Base de datos**: Supabase Postgres con extensión `pgvector`.
- **Auth**: Supabase Auth con magic link.
- **LLM**: Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) vía `@anthropic-ai/sdk` v0.30+ y `@langchain/anthropic`.
- **Embeddings**: `text-embedding-3-small` (OpenAI, 1536 dim) o Voyage AI configurable.
- **Mensajería**: Twilio WhatsApp Sandbox (`whatsapp:+14155238886`).
- **Hosting**: Vercel Hobby + Supabase Free tier.
- **PDF**: `@react-pdf/renderer`.
- **Validación**: Zod en todo input/output de LLM.
- **CI/CD**: Vercel GitHub native integration + GitHub Actions para migraciones Supabase.

---

## 6. Lo que NO construimos en la PoC

- ❌ Scraping ni integración LinkedIn (mock data).
- ❌ Upload ni análisis de video/audio reales (transcripciones pre-generadas).
- ❌ n8n ni orquestador externo.
- ❌ Google Calendar / MS Graph.
- ❌ WhatsApp Business Cloud API directo de Meta.
- ❌ Multi-tenancy hardened.
- ❌ Stripe / billing.
- ❌ OAuth Google/Microsoft.
- ❌ Tests E2E exhaustivos (sí unit tests críticos de agentes y schemas).

---

## 7. Mock data: 30 candidatos y 4 vacantes

Crea `scripts/seed-demo.ts` que pueble la base con datos coherentes y creíbles. Nombres latinos verosímiles, empresas conocidas LATAM (Rappi, Mercado Libre, Globant, Kavak, Nubank, Bitso, Cornershop, Konfío, Clip, BBVA, etc.), proyectos plausibles.

### 7.1. Las 4 vacantes

| # | Título | Empresa demo | Modalidad | Rango USD/mes | English mín |
|---|--------|--------------|-----------|---------------|-------------|
| 1 | Senior AI/ML Engineer (GenAI) | Lumina Labs (fintech) | Remote LATAM | 5,500-8,000 | B2 |
| 2 | Cloud Solutions Architect — Azure | Cresta Digital (consultora) | Hybrid CDMX | 4,500-7,500 | B2 |
| 3 | Senior DevOps / Platform Engineer | Volcán Commerce (e-commerce) | Remote LATAM | 4,000-6,500 | B1 |
| 4 | Senior Full-Stack Engineer (TS) | Brújula Health (healthtech) | Remote LATAM | 4,000-6,500 | B2 |

JDs completas en español, 400-600 palabras cada una, con must-haves, nice-to-haves, responsabilidades, oferta, proceso de selección.

### 7.2. Distribución de los 30 candidatos

**Vacante 1 — AI/ML Engineer (8 candidatos)**
- Skills variar: Python, LangChain, LlamaIndex, vector DBs (Pinecone, Qdrant, pgvector), RAG, fine-tuning, MLOps (MLflow, W&B), PyTorch, HuggingFace, prompt engineering, LLM evaluation, agentes multi-step.
- 2 mid, 4 senior, 2 staff.
- English: 1 A2, 2 B1, 2 B2, 2 C1, 1 C2.
- Locaciones: CDMX, GDL, MTY, Bogotá, Buenos Aires, São Paulo, Lima, Querétaro.
- Etapas: 3 `recommended` (con reporte completo), 1 `interviewed`, 2 `scheduled`, 1 `interested`, 1 `new`.

**Vacante 2 — Cloud Solutions Architect Azure (7 candidatos)**
- Skills: Azure (Compute, Networking, Identity), Terraform, Bicep, AKS, CI/CD (Azure DevOps, GitHub Actions), Landing Zones (CAF), FinOps, Azure Migrate, ExpressRoute/VPN, Defender, Sentinel.
- 2 mid, 4 senior, 1 principal.
- English: 1 B1, 2 B2, 3 C1, 1 C2.
- Locaciones: CDMX, GDL, MTY, Tijuana, Bogotá, Medellín, Santiago.
- Etapas: 3 `recommended`, 1 `interviewed`, 1 `scheduled`, 1 `contacted`, 1 `new`.

**Vacante 3 — Senior DevOps / SRE (8 candidatos)**
- Skills: Kubernetes, Docker, Terraform, Helm, ArgoCD, Flux, Prometheus, Grafana, Loki, GitHub Actions, GitLab CI, EKS, GKE, Linux, Python, Go, Bash, incident response, SLO/SLI.
- 1 mid, 5 senior, 2 staff.
- English: 1 A2, 1 B1, 3 B2, 2 C1, 1 C2.
- Locaciones: CDMX, GDL, Puebla, Buenos Aires, Rosario, Bogotá, Cali, Montevideo.
- Etapas: 3 `recommended`, 2 `scheduled`, 2 `interested`, 1 `new`.

**Vacante 4 — Senior Full-Stack TypeScript (7 candidatos)**
- Skills: TypeScript, React, Next.js (App Router), Node.js, PostgreSQL, Prisma/Drizzle, tRPC/GraphQL, Tailwind, shadcn/ui, AWS/Vercel, Jest, Playwright, Server Components, monorepos.
- 1 mid, 5 senior, 1 staff.
- English: 2 B1, 2 B2, 2 C1, 1 C2.
- Locaciones: CDMX, GDL, MTY, San José CR, Bogotá, Cartagena, Caracas.
- Etapas: 3 `recommended`, 1 `interviewed`, 1 `contacted`, 1 `interested`, 1 `new`.

### 7.3. Reglas anti-bias

- Mezcla balanceada de género en cada perfil.
- **NO** uses como features de scoring: nombre, género inferido, edad, foto, universidad. Existen para realismo, pero los agentes los ignoran explícitamente (sanitización en el wrapper antes del LLM).
- Para cada candidato: nombre completo, email, teléfono E.164 del país, LinkedIn URL plausible (no real), CV summary 300-400 palabras, 8-15 skills con `years_experience` por skill.

### 7.4. Transcripciones de entrevista (12 total: 3 por vacante)

Para los 12 candidatos en `recommended`, genera transcripciones diariadas (`speaker: "interviewer" | "candidate"`, `start_ms`, `end_ms`) de 25-40 min equivalentes (~3,000-5,000 palabras).

Estructura:
1. Intro (3-5 min).
2. Background candidato (5-8 min).
3. Técnica core (10-15 min): 3-5 preguntas técnicas profundas.
4. Caso práctico / system design (5-8 min).
5. Conductual STAR (3-5 min).
6. Cierre (2-3 min).

**Calibración deliberada para el demo**: por cada vacante, 1 `strong_yes`, 1 `yes`, 1 `maybe`/`no`. Mezcla niveles de inglés (la transcripción debe sonar al nivel CEFR del candidato: B1 con errores sutiles, C2 fluido e idiomático). Algunos en mixed-language (es + en) con `language` por segmento.

---

## 8. Schema de base de datos

Tablas (todas con `id uuid primary key default gen_random_uuid()`, `created_at`, `updated_at`, RLS activa con policies simples para PoC):

- `tenants`: 1 fila demo.
- `users`: cuenta demo + guests.
- `jobs`: 4 vacantes con `title`, `company_name`, `description_raw`, `parsed_jd` jsonb, `ideal_profile` jsonb, `embedding vector(1536)`, `status`, `modality`, `salary_min_usd`, `salary_max_usd`.
- `candidates`: 30 candidatos.
- `candidate_profiles`: `summary`, `skills` jsonb, `experience` jsonb, `embedding vector(1536)`.
- `applications`: `match_score`, `match_breakdown` jsonb, `match_reasoning`, `stage`, `status`.
- `conversations`: hilo Twilio, `candidate_id`, `state`, `last_message_at`.
- `outreach_messages`: `conversation_id`, `direction`, `channel`, `content`, `status` (incluye `simulated`), `twilio_sid`.
- `interviews`: `candidate_id`, `job_id`, `scheduled_at`, `duration_minutes`, `status`, `transcript_id`.
- `transcripts`: `interview_id`, `language`, `segments` jsonb, `raw_text`.
- `interview_reports`: `english_level`, `english_breakdown` jsonb, `technical_score` jsonb, `softskill_score` jsonb, `red_flags`, `strengths`, `summary`, `recommendation`, `pdf_url`.
- `agent_traces`: log estructurado por llamada (agent, latency, tokens, cost).

Genera tipos TS con `supabase gen types typescript` → `packages/db/types.ts`.

Índices IVF Flat en `candidate_profiles.embedding` y `jobs.embedding` con `vector_cosine_ops`.

---

## 9. Agentes (5 para PoC)

Cada agente: prompt en `packages/agents/prompts/<agent>.md`, schema Zod en `packages/agents/schemas/<agent>.ts`, helper que invoca Claude Haiku 4.5 con JSON mode estricto.

### 9.1. Job Analyzer Agent
Output: `title`, `seniority`, `must_have_skills[]`, `nice_to_have_skills[]`, `soft_skills[]`, `languages[]`, `years_experience_min`, `modality`, `red_flags_to_avoid[]`, `ideal_candidate_summary`.

### 9.2. Candidate Ranker Agent
Input sanitizado (sin nombre, género, universidad). Output: `overall_score` (0-100), `skill_breakdown[]` con evidence, `match_reasoning`, `gaps[]`, `strengths[]`, `recommendation`.

### 9.3. Outreach Composer Agent
Output: dos variantes A/B de mensaje WhatsApp (max 1024 chars), español neutro LATAM, personalizadas con 1-2 detalles del candidato.

### 9.4. Interview Question Generator Agent
Output: `sections[]` con preguntas, cada una con `what_to_look_for`, `good_answer_signals`, `weak_answer_signals`, `red_flag_signals`. Exportable a PDF como guía para reclutador no técnico.

### 9.5. Interview Analyzer Agent
Output combinado: `english_level`, `english_breakdown` con evidence_quotes y timestamps, `technical_score[]` con evidence por skill, `softskill_score`, `red_flags[]`, `strengths[]`, `summary`, `recommendation`. **Incluye citas textuales con timestamp** clickeables desde el frontend.

---

## 10. Estructura del repositorio

```
talentforge-poc/
├── apps/web/                         # Next.js 14 App Router
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (app)/dashboard/
│   │   ├── (app)/jobs/[id]/
│   │   ├── (app)/candidates/[id]/
│   │   ├── (app)/interviews/[id]/
│   │   ├── try-it-now/               # Demo público de Job Analyzer
│   │   └── api/
│   ├── components/
│   └── lib/
├── packages/
│   ├── db/                           # Migrations, types, seed
│   ├── agents/                       # Prompts, schemas, runners
│   ├── integrations/twilio/
│   └── shared/
├── supabase/
│   ├── migrations/
│   ├── functions/generate-interview-report/
│   └── config.toml
├── scripts/
│   ├── seed-demo.ts
│   ├── reset-demo.ts
│   └── generate-types.ts
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint + typecheck + build + unit tests
│       └── supabase-migrate.yml      # Migrate DB on push to main
├── docs/
│   ├── architecture.md
│   ├── bias-mitigation.md
│   ├── demo-script.md
│   ├── deployment.md
│   ├── deployment-status.md          # Estado actual del deploy
│   ├── roadmap-v2.md
│   └── decisions/
├── .env.example
├── .gitignore                        # incluir .env*, node_modules, .vercel, .turbo, etc.
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## 11. Frontend: pantallas obligatorias

shadcn/ui + Tailwind. Modo claro. Logo placeholder con CSS.

### `/login`
Magic link + botón "Entrar como Demo (sin registro)".

### `/dashboard`
4 cards de jobs con métricas por etapa. Card destacado "Pruébalo con tu propia vacante" → `/try-it-now`. Métricas top: 30 candidatos, 12 entrevistas analizadas, X horas ahorradas (12 × 2.5h).

### `/jobs/[id]`
Tabs: **ICP** (visualización del parsed_jd), **Candidatos** (tabla con score como progress bar), **Outreach** (aprobar y enviar mensajes), **Reporte comparativo** (los 3 entrevistados side-by-side).

### `/candidates/[id]`
Perfil + card "Match con [job]" + botón "Generar outreach" en tiempo real.

### `/interviews/[id]`
Split: izquierda transcripción con timestamps clickeables; derecha reporte con tabs (English, Técnico, Soft Skills, Red Flags, Resumen). Botón "Descargar PDF".

### `/try-it-now`
**Pública, sin login.** Textarea para JD. Botón "Analizar" → ICP en streaming (Server-Sent Events). CTA sticky al final: "¿Quieres ver candidatos rankeados? Agenda demo de 30 min" → link Calendly.

---

## 12. Twilio

`packages/integrations/twilio/client.ts` con `sendWhatsAppMessage({ to, body })`.

Comportamiento:
- Si `to` está en `TWILIO_SANDBOX_VERIFIED_NUMBERS`, envía real.
- Si no, marca `status: 'simulated'` y el frontend muestra badge "modo demo".

`/api/webhook/twilio` recibe inbound, guarda en `outreach_messages`, actualiza state de `conversation`.

Documenta setup del Sandbox en `docs/deployment.md` (registro + `join <palabra-clave>`).

---

## 13. Variables de entorno

`.env.example`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
SUPABASE_PROJECT_REF=

# Anthropic
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-haiku-4-5-20251001

# Embeddings
EMBEDDINGS_PROVIDER=openai
OPENAI_API_KEY=
VOYAGE_API_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WA_FROM=whatsapp:+14155238886
TWILIO_SANDBOX_VERIFIED_NUMBERS=

# App
NEXT_PUBLIC_APP_URL=
DEMO_USER_EMAIL=demo@talentforge.ai
SALES_CALENDLY_URL=
```

---

## 14. Plan de implementación por fases (con deployment intercalado)

Al terminar cada fase: commit con mensaje convencional, push a GitHub, actualiza `README.md` y `docs/deployment-status.md`, **espera mi confirmación** antes de la siguiente.

### Fase 0 — Bootstrap + GitHub
1. Pide GitHub PAT (sección 4).
2. Inicializa monorepo: pnpm + Turbo + Next.js 14 + shadcn/ui + Supabase CLI local.
3. `.env.example`, `.gitignore` (verifica que incluye `.env*`, `.vercel`, `.turbo`).
4. README inicial con badges placeholder.
5. **Deploy**: crea repo en GitHub con `gh repo create`, primer commit, push a `main`.
6. Configura branch protection en `main` (PRs required) con `gh api`.

**Entregable**: repo público/privado en GitHub con CI placeholder, `pnpm dev` corre local.

### Fase 1 — DB + Auth + Supabase Cloud
1. Pide credenciales Supabase (sección 4).
2. Crea proyecto Supabase con `supabase projects create`.
3. Escribe migraciones SQL completas (sección 8).
4. `supabase link --project-ref <ref>` + `supabase db push`.
5. Magic link auth + botón "Entrar como Demo" en `/login`.
6. Genera tipos con `supabase gen types typescript`.
7. **Deploy**: guarda credenciales en `gh secret set` (SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF, SUPABASE_DB_PASSWORD). Verifica con un test E2E mínimo que el auth funciona contra Supabase Cloud.

**Entregable**: DB en Supabase Cloud con schema completo, login funciona contra cloud.

### Fase 2 — Mock data (4 jobs + 30 candidatos)
1. Pide Anthropic key + embeddings key (sección 4).
2. `scripts/seed-demo.ts` que genera los 30 candidatos y 4 JDs con perfiles coherentes.
3. Pre-computa embeddings de jobs y candidatos.
4. **Deploy**: ejecuta el seed contra Supabase Cloud. Verifica con un SELECT count(*) que hay 30 candidatos y 4 jobs.

**Entregable**: data en producción lista para usar.

### Fase 3 — Job Analyzer + `/try-it-now` + primer deploy Vercel
1. Implementa Job Analyzer Agent + schema Zod.
2. Endpoint `/api/analyze-jd` con streaming SSE.
3. Página pública `/try-it-now` con JD pre-cargada de ejemplo.
4. Pide Vercel token (sección 4).
5. **Deploy**: `vercel link`, agrega todas las env vars con `vercel env add` (production, preview, development), `vercel deploy --prod`.
6. Conecta Vercel a GitHub para auto-deploy en push a `main` y preview en PRs.
7. Verifica con `curl` que `/try-it-now` responde en producción.

**Entregable**: URL pública compartible. Cada PR genera preview deploy automático.

### Fase 4 — Candidate Ranker + vista de candidatos rankeados
1. Implementa agent con sanitización anti-bias (wrapper que oculta nombre/género/universidad).
2. Calcula y persiste scores de los 30 candidatos vs sus jobs.
3. Vista `/jobs/[id]` tab "Candidatos" y `/candidates/[id]` con match analysis.
4. **Deploy**: push a `main`, valida que el preview deploy de Vercel pasa y luego promueve a producción.

### Fase 5 — Las 12 transcripciones
1. Genera transcripciones siguiendo spec de sección 7.4.
2. Calibradas (strong_yes / yes / maybe-no por job, niveles de inglés variados, mixed-language).
3. **Deploy**: re-corre seed con `--transcripts-only` flag.

### Fase 6 — Interview Analyzer + vista de entrevista + PDF
1. Implementa agent con citas textuales y timestamps.
2. Persiste reportes de las 12 entrevistas (puedes correrlo como script `scripts/analyze-interviews.ts` o como Edge Function batch).
3. Vista `/interviews/[id]` con transcripción y reporte side-by-side, timestamps clickeables.
4. Edge Function `generate-interview-report` que produce PDF con `@react-pdf/renderer`.
5. **Deploy**: `supabase functions deploy generate-interview-report`. Verifica que un PDF se genera y descarga correctamente.

### Fase 7 — Reporte comparativo + Question Generator
1. Tab "Reporte comparativo" en `/jobs/[id]` con tabla side-by-side.
2. Vista de guía de entrevista exportable a PDF (modo "reclutador no técnico").
3. **Deploy**: push.

### Fase 8 — Outreach Composer + Twilio
1. Pide credenciales Twilio + mi número (sección 4).
2. Implementa agent + integración Twilio.
3. Tab "Outreach" con aprobación humana y modo simulado.
4. Webhook inbound en `/api/webhook/twilio`.
5. **Deploy**: agrega TWILIO_* env vars a Vercel y a GitHub secrets. Configura el webhook URL en Twilio console apuntando a `https://<dominio>/api/webhook/twilio`. Envía un mensaje de prueba a mi número verificado y confirma que llega.

### Fase 9 — GitHub Actions CI/CD + docs comerciales
1. `.github/workflows/ci.yml`: en PR ejecuta lint, typecheck, build, unit tests de agentes y schemas.
2. `.github/workflows/supabase-migrate.yml`: en push a `main`, corre `supabase db push` con `SUPABASE_ACCESS_TOKEN` y `SUPABASE_PROJECT_REF` desde secrets.
3. Verifica que todos los secrets están en `gh secret list`: SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF, SUPABASE_DB_PASSWORD (Vercel se autogestiona con su GitHub integration).
4. Configura badges de CI en README.
5. Escribe `docs/demo-script.md` con guion de 10-12 min paso a paso.
6. Escribe `docs/roadmap-v2.md` con LinkedIn, video analysis, n8n, calendar, billing y estimaciones para upsell.
7. **Deploy final**: abre un PR de prueba para verificar que CI corre, mergéalo, verifica que la GitHub Action de Supabase corre exitosamente, y que Vercel auto-deploya producción.

**Entregable final**: URL pública en Vercel, repo en GitHub con CI/CD verde, docs comerciales listos.

---

## 15. GitHub Actions: especificación

### `.github/workflows/ci.yml`
- Trigger: pull_request a cualquier branch, push a `main`.
- Pasos: checkout, setup pnpm v9, install, lint (`pnpm lint`), typecheck (`pnpm typecheck`), build (`pnpm build`), test (`pnpm test`).
- Falla el job si cualquiera de los pasos falla.

### `.github/workflows/supabase-migrate.yml`
- Trigger: push a `main` con cambios en `supabase/migrations/**`.
- Pasos: checkout, setup Supabase CLI, `supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}`, `supabase db push` con `SUPABASE_ACCESS_TOKEN` y `SUPABASE_DB_PASSWORD`.
- Notifica fallos a un canal Slack si está configurado (opcional, dejar comentado por defecto).

**Vercel deployments** los maneja la integración nativa Vercel ↔ GitHub que configuras en Fase 3 (no necesitamos workflow custom para esto).

---

## 16. Hosting gratuito: documenta en `docs/deployment.md`

1. **Supabase Cloud Free**: 500MB DB, 50K MAU, 1GB storage, 5GB bandwidth. Suficiente para PoC.
2. **Vercel Hobby**: 100 GB bandwidth/mes, serverless functions ilimitadas, preview deploys ilimitados.
3. **Anthropic API**: $5 USD gratis iniciales más recarga manual. Costo por demo completa con Haiku 4.5: <$0.50 USD.
4. **Twilio Free Trial**: $15 USD crédito. WhatsApp Sandbox sin costo extra.
5. **OpenAI / Voyage**: si OpenAI, mínimo $5 USD. Voyage tiene free tier de 50M tokens.

**Costo total estimado de la PoC durante 30 días con 20 demos**: ~$10-15 USD.

---

## 17. Criterios de aceptación

- ✅ `pnpm dev` levanta local en <1 min sin errores.
- ✅ Repo GitHub público/privado con CI verde y branch protection en `main`.
- ✅ Supabase Cloud con schema, RLS, y data seedeada.
- ✅ Vercel deploy en producción con dominio `*.vercel.app`.
- ✅ Auto-deploy en push a `main` y preview deploys en PRs.
- ✅ GitHub Actions verde: CI en PRs, migración Supabase en merge a main.
- ✅ `/try-it-now` analiza una JD pegada en <8s, accesible públicamente.
- ✅ Candidatos rankeados con scoring explicable y evidencia.
- ✅ Entrevista con timestamps clickeables y evidencia citada.
- ✅ Reporte comparativo side-by-side de 3 entrevistados.
- ✅ PDF descargable de reporte de entrevista.
- ✅ Outreach simulado funciona; outreach real a mi número verificado en Twilio Sandbox envía mensaje WhatsApp.
- ✅ Demo completa ejecutable en 10-12 min siguiendo `docs/demo-script.md`.
- ✅ Todos los secretos en .env.local, Vercel env, Supabase secrets, GitHub secrets — **ninguno en el repo**.

---

## 18. Empieza ahora

Comienza por **Fase 0**:

1. Verifica las herramientas: `node --version` (>=20), `pnpm --version` (>=9), `gh --version`, `supabase --version`, `vercel --version`. Si falta alguna, instálala primero (o pídeme permiso para instalarla si requiere sudo).
2. Pídeme el GitHub PAT (sección 4).
3. Cuando lo tengas, ejecuta Fase 0 completa.
4. Al final imprime un resumen: qué creaste, URL del repo, estado de cada paso, y qué necesitas para Fase 1.
5. Espera mi confirmación.

Si tienes una duda crítica no resuelta aquí, pregúntame antes de codificar. Si la duda es menor, decide, documenta ADR y continúa.

Vamos.
