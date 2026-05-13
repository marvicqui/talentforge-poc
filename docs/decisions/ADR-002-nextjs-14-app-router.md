# ADR-002 — Next.js 14 con App Router

**Fecha:** 2026-05-12
**Estado:** Aceptado

## Contexto
Necesitamos un framework con SSR, streaming (para SSE en `/try-it-now`) y deploy fácil
en Vercel.

## Decisión
Next.js 14.2 con App Router + React Server Components. TypeScript estricto. Tailwind
3.4 + shadcn/ui configurado manualmente (sin correr `npx shadcn init` interactivo).

## Consecuencias
- App Router habilita streaming nativo para SSE del Job Analyzer.
- shadcn/ui manual = control total sobre los componentes; los agrego on-demand en cada
  fase con `npx shadcn@latest add <component>`.
- Alternativa rechazada: Next.js 15 — todavía con churn en algunas APIs y compatibilidad
  React 19. Para una PoC priorizamos estabilidad.
