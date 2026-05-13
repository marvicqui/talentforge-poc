# ADR-003 — Repo privado por default

**Fecha:** 2026-05-12
**Estado:** Aceptado

## Contexto
El prompt sugiere "private hasta tener un dominio, luego public". Necesitamos elegir
visibilidad inicial.

## Decisión
Crear el repo en GitHub como **private** durante Fase 0. Cambiar a public es trivial
(`gh repo edit --visibility public`) cuando el dominio + branding estén listos.

## Consecuencias
- Los prospectos no descubren el repo por accidente mientras está en construcción.
- Vercel Hobby + GitHub Free integration funcionan con repos privados sin restricciones
  para nuestro volumen.
- Trade-off: no podemos usar la insignia "public repo" en marketing aún.
