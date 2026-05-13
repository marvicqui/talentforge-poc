# ADR-004 — Branch protection aplazada hasta Fase 9

**Fecha:** 2026-05-12
**Estado:** Aceptado (workaround)

## Contexto
GitHub Free **no** permite branch protection rules ni rulesets en repos **privados** de
cuentas personales. Ambas APIs (`/branches/{branch}/protection` y `/rulesets`) responden
403 con "Upgrade to GitHub Pro or make this repository public".

## Decisión
- Dejar `main` sin protección durante Fases 0-8. El único colaborador es el dueño y la
  disciplina (siempre PRs) reemplaza al enforcement.
- En **Fase 9**, cuando el repo se publique (o si el usuario suscribe GitHub Pro $4/mes
  antes), aplicar el ruleset definido en `scripts/setup-branch-ruleset.sh`:
  - Bloquear deletion y force-push.
  - Requerir PR (0 approvals) con resolución de conversaciones.
- Mientras tanto, en el flujo local se aceptan commits directos a `main` para acelerar
  iteración de fases. El CI workflow (`.github/workflows/ci.yml`) corre igual y bloquea
  builds rotos vía status check.

## Consecuencias
- Riesgo: un push accidental podría romper `main`. Mitigación: yo (el agente) hago
  siempre PR o al menos verifico `pnpm typecheck && pnpm build` antes de push.
- Alternativa rechazada: hacer público el repo ya mismo — contradice ADR-003 (sin
  branding listo).
