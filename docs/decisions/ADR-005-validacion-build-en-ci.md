# ADR-005 — Validación de build local delegada a GitHub Actions

**Fecha:** 2026-05-12
**Estado:** Aceptado (workaround temporal por entorno local saturado)

## Contexto
Durante Fase 1, `pnpm build` local fue terminado por SIGKILL (OOM) en el Mac del
usuario. Razones: ~16 GB de RAM pero 26 GB de swap usados (Chrome + apps abiertas) y
disco al 97-99% de capacidad. `pnpm typecheck` sí pasa, lo que descarta errores de TS.

## Decisión
- No bloquear el avance de fases por presión de memoria del entorno local.
- `pnpm typecheck` (rápido, ~10s) es la verificación local mínima antes de cada commit.
- `pnpm build` es validado de forma autoritativa por el workflow **`.github/workflows/ci.yml`**
  en GitHub Actions (VM con 7 GB RAM dedicada), que se ejecuta automáticamente en cada
  push a `main` y en cada PR.
- En **Fase 3** Vercel también buildea independientemente vía la integración nativa
  GitHub ↔ Vercel; si el build falla allí, no se promueve a producción.

## Consecuencias
- Loop de feedback más lento (~1-2 min por iteración vs ~40s local), pero confiable.
- Si el usuario quiere builds locales en el futuro: cerrar Chrome, liberar swap, o
  usar `NODE_OPTIONS=--max-old-space-size=2048` para limitar Next.js explícitamente.
- Alternativa rechazada: pedir al usuario reiniciar la Mac. Es disruptivo y solo
  oculta el problema subyacente (apps consumiendo memoria); el CI remoto resuelve
  esto de forma estructural.
