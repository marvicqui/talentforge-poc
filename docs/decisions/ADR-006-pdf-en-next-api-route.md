# ADR-006 — PDF del reporte: Next.js API route en vez de Supabase Edge Function

**Fecha:** 2026-05-13
**Estado:** Aceptado

## Contexto
El prompt original sugiere implementar la generación de PDF como
**Supabase Edge Function** (`supabase/functions/generate-interview-report/`).
Edge Functions corren en **Deno**. `@react-pdf/renderer` es una librería
Node-first: usa APIs como streams de Node, polyfills de DOM y un PDF renderer
basado en `react-reconciler` que en Deno requeriría import maps y shims
adicionales.

Probarlo en Deno gastaría tiempo significativo de la PoC para resolver
diferencias de runtime, sin que el cliente perciba diferencia.

## Decisión
Implementar el PDF en **Next.js API route**:
- Ruta: `GET /api/interview-report/[id]/pdf`.
- Runtime: `"nodejs"` con `maxDuration = 30`.
- Bundler: Next.js trata `@react-pdf/renderer` como external (configurado en
  `apps/web/next.config.mjs` con `serverComponentsExternalPackages`).
- Auth: la ruta exige sesión Supabase válida; el reporte sale sólo si la
  entrevista existe en el tenant demo.

## Consecuencias
- Single deployment surface (Vercel) — no hay que coordinar `supabase functions deploy`.
- Bundling: `@react-pdf/renderer` puede ser pesado (1-3 MB compilado). Lo dejo external
  para no inflar el bundle del cliente.
- Trade-off: si el PDF se vuelve un recurso compartido entre apps no-Vercel,
  habrá que migrarlo a Edge Function en v2.
