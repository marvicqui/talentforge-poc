# TalentForge AI — PoC

[![CI](https://github.com/marvicqui/talentforge-poc/actions/workflows/ci.yml/badge.svg)](https://github.com/marvicqui/talentforge-poc/actions/workflows/ci.yml)
[![Supabase Migrate](https://github.com/marvicqui/talentforge-poc/actions/workflows/supabase-migrate.yml/badge.svg)](https://github.com/marvicqui/talentforge-poc/actions/workflows/supabase-migrate.yml)

Reclutamiento técnico potenciado por agentes de IA, hosteado en infraestructura
gratuita y listo para demos comerciales de 10-12 min.

**Producción**: https://talentforge-poc.vercel.app
**Demo público**: https://talentforge-poc.vercel.app/try-it-now (sin login)

> PoC end-to-end. Todas las fases 0-9 ✅ completadas. Ver
> [`docs/deployment-status.md`](docs/deployment-status.md) para el detalle.

## Qué demuestra

1. **Login del demo** — botón "Entrar como Demo" (sin registro).
2. **Dashboard** con 4 vacantes activas y 30 candidatos en distintas etapas.
3. **Ranking de candidatos por IA** con scoring explicable + evidencia por skill
   (Candidate Ranker — sanitización anti-bias activa).
4. **Match analysis** por candidato con strengths, gaps y cobertura técnica.
5. **Outreach por WhatsApp** generado por IA, 2 variantes A/B, aprobación
   humana antes de enviar. Modo real (Twilio Sandbox) o simulado.
6. **Entrevistas analizadas**: 12 transcripciones diarizadas + reportes con
   citas clickeables → segmento exacto de la transcripción.
7. **Reporte comparativo** side-by-side de los entrevistados de una vacante.
8. **Guía de entrevista** auto-generada para reclutador no técnico (PDF).
9. **`/try-it-now`** público: pega cualquier JD y vé el ICP en streaming.

## Los 5 agentes

| # | Agente | Output | Anti-bias |
|---|---|---|---|
| 1 | Job Analyzer | ICP (must/nice skills, idiomas, red flags) | n/a (sólo JD) |
| 2 | Candidate Ranker | overall_score + skill_breakdown + evidence | redacta nombre, género, universidad |
| 3 | Outreach Composer | 2 variantes A/B WhatsApp (≤1024 chars) | no usa género, edad, universidad |
| 4 | Interview Question Generator | Guía 45-60 min para reclutador no técnico | filtra preguntas sobre identidad |
| 5 | Interview Analyzer | Report con citas + timestamps, CEFR, scores | regla de evidencia obligatoria |

Modelo: **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) con prefill `{` para
garantizar JSON válido. Validación Zod estricta en cada output.

## Stack

- **Frontend + API**: Next.js 14 (App Router) + TypeScript estricto.
- **Backend**: API Routes Node runtime + Supabase Edge Functions.
- **DB**: Supabase Postgres con `pgvector` (1536-dim embeddings, IVF Flat).
- **Auth**: Supabase Auth con magic link + flujo "Entrar como Demo".
- **LLM**: Claude Haiku 4.5 vía `@anthropic-ai/sdk` v0.30+.
- **Embeddings**: OpenAI `text-embedding-3-small`.
- **Mensajería**: Twilio WhatsApp Sandbox.
- **Hosting**: Vercel Hobby + Supabase Free tier.
- **PDF**: `@react-pdf/renderer` en Next.js API routes.
- **CI/CD**: GitHub Actions + Vercel auto-deploy.

## Estructura del repo

```
apps/web/                          Next.js App Router
packages/
  agents/                          Prompts + Zod schemas + runners (5 agentes)
  db/                              Supabase migrations + types generados
  integrations/twilio/             WhatsApp client (real vs simulado)
  shared/                          Cross-package utilities (placeholder)
supabase/migrations/               20260512_init.sql
scripts/
  seed-demo.ts                     4 jobs + 30 candidatos + embeddings
  score-candidates.ts              Bulk ranking
  generate-transcripts.ts          12 entrevistas calibradas
  analyze-interviews.ts            12 reports
.github/workflows/
  ci.yml                           lint + typecheck + build + test
  supabase-migrate.yml             supabase db push en merge a main
docs/
  architecture.md, bias-mitigation.md, deployment.md,
  demo-script.md, roadmap-v2.md, deployment-status.md, decisions/
```

## Desarrollo local

Requisitos: Node 20+, pnpm 9+, GitHub CLI, Supabase CLI.

```bash
pnpm install
cp .env.example .env.local        # rellena las claves
pnpm dev                          # apps/web en http://localhost:3000
```

Scripts útiles:

```bash
pnpm seed                         # 4 jobs + 30 candidatos + embeddings
pnpm seed:reset                   # trunca y reseedea
pnpm score                        # bulk Candidate Ranker
pnpm transcripts                  # 12 transcripciones calibradas
pnpm analyze                      # 12 reports de entrevista
```

## Anti-bias por diseño

El Candidate Ranker y el Interview Analyzer **nunca reciben** el nombre, el
género, la universidad o el email del candidato. El wrapper de sanitización
([`packages/agents/sanitize.ts`](packages/agents/sanitize.ts)) los redacta a
`<CANDIDATE>` y `<UNIVERSITY>` antes de cualquier llamada al LLM. Cada score
viene con citas textuales para auditoría. Ver
[`docs/bias-mitigation.md`](docs/bias-mitigation.md).

## Costos

Demo completa de extremo a extremo: **<$0.50 USD** en Anthropic. Mantener
la PoC corriendo 30 días con 20 demos: **$10-15 USD**. Ver
[`docs/deployment.md`](docs/deployment.md).

## Demo script

[`docs/demo-script.md`](docs/demo-script.md) — guion de 10-12 min con timing
por sección, talking points y respuestas a las 4 objeciones más comunes.

## Roadmap v2 (post-PoC)

[`docs/roadmap-v2.md`](docs/roadmap-v2.md) — LinkedIn, Whisper, calendar,
billing, multi-tenancy, ATS integration y los diferenciadores que justifican
el premium.

## Seguridad

- `.env*` está en `.gitignore`. **Nunca se commitean secretos.**
- Secretos viven en `.env.local` (local), Vercel env vars (runtime),
  Supabase secrets y GitHub repo secrets.
- RLS activa en todas las tablas; service_role sólo para server actions y
  scripts admin.

## Licencia

Propietaria / demo interna.
