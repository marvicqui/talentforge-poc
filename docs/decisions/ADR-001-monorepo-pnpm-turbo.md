# ADR-001 — Monorepo con pnpm workspaces + Turbo

**Fecha:** 2026-05-12
**Estado:** Aceptado

## Contexto
La PoC tiene 1 app (`apps/web`) y 4 paquetes internos (`db`, `agents`, `twilio`, `shared`).
Necesitamos compartir tipos TS y schemas entre la app y los paquetes sin publicar a npm.

## Decisión
Usar `pnpm` workspaces + `turbo` para orquestar `dev`/`build`/`lint`/`typecheck`/`test`.
Versiones: pnpm 9.15, turbo 2.3.

## Consecuencias
- `pnpm install` instala una sola vez, los paquetes son linkeados por nombre
  (`@talentforge/*`).
- Turbo cachea outputs de build/typecheck por paquete; CI corre más rápido.
- Alternativa rechazada: Nx — overkill para 4 paquetes. Plain npm workspaces — sin
  caching incremental.
