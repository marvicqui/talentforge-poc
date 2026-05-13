# Architecture

## Visión general

```
                ┌────────────────────────────┐
                │    Next.js 14 (Vercel)     │
                │    App Router + RSC        │
                └──────────┬─────────────────┘
                           │
       ┌───────────────────┼─────────────────────────┐
       ▼                   ▼                         ▼
┌──────────────┐   ┌────────────────┐      ┌──────────────────┐
│ Supabase     │   │ Anthropic API  │      │ Twilio WhatsApp  │
│ Postgres+    │   │ Claude Haiku   │      │ Sandbox          │
│ pgvector     │   │ 4.5            │      │                  │
│ Auth + RLS   │   │ (agentes)      │      │                  │
│ Edge Funcs   │   └────────────────┘      └──────────────────┘
└──────────────┘
```

## Componentes

### Frontend
- **Next.js 14 App Router**. Server Components por default; Client Components donde haya
  estado interactivo (formularios, streaming SSE).
- **TypeScript estricto**.
- **Tailwind + shadcn/ui** para componentes (modo claro).

### API + LLM
- **API Routes (Node runtime)** para endpoints internos: `/api/analyze-jd` (SSE),
  `/api/webhook/twilio`, etc.
- **Agentes** en `packages/agents/`. Cada agente tiene prompt en Markdown + schema Zod +
  runner que llama a Claude Haiku 4.5 en JSON mode estricto.
- **Sanitización anti-bias** en el wrapper del Candidate Ranker (oculta nombre, género,
  universidad antes de pasar el contexto al LLM).

### Datos
- **Supabase Postgres** con `pgvector`. RLS activa con policies simples para PoC.
- **Embeddings**: `text-embedding-3-small` (OpenAI, 1536 dim) o Voyage AI — configurable
  con `EMBEDDINGS_PROVIDER`.
- Índices IVF Flat en `candidate_profiles.embedding` y `jobs.embedding` con
  `vector_cosine_ops`.

### Mensajería
- **Twilio WhatsApp Sandbox** (`whatsapp:+14155238886`).
- Si el destinatario está en `TWILIO_SANDBOX_VERIFIED_NUMBERS` → envío real; si no →
  marca `status: 'simulated'` y el frontend muestra badge "modo demo".

### Edge Functions
- `supabase/functions/generate-interview-report/`: genera PDF con `@react-pdf/renderer`.

### CI/CD
- **Vercel GitHub Native Integration**: auto-deploy en push a `main` y previews en PRs.
- **GitHub Actions**:
  - `ci.yml`: lint + typecheck + build + tests en PRs y push a main.
  - `supabase-migrate.yml`: `supabase db push` en merge a main cuando cambian
    migraciones.

## Decisiones documentadas

Ver [`decisions/`](decisions/) — cada ADR son 5-10 líneas con contexto + decisión.
