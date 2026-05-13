# Bias mitigation

La PoC debe demostrar que el scoring es **defendible** ante un cliente que pregunte
"¿cómo evitan sesgos?". Reglas que se aplican:

## Features prohibidas en el scoring

El Candidate Ranker **no** recibe los siguientes campos. Existen en la DB sólo para
realismo del demo (nombre que aparezca en la UI, foto placeholder), pero son
**sanitizados** por el wrapper antes de enviarse al LLM:

- Nombre completo y nombre de pila.
- Género (inferido o explícito).
- Edad / fecha de nacimiento.
- Foto.
- Universidad de egreso.
- Apellidos paternos/maternos.

## Features permitidas

- Años de experiencia por skill.
- Empresas previas (para reconocer dominio: fintech, e-commerce, healthtech).
- Stack técnico y nivel de seniority declarado.
- Modalidad (remoto/híbrido/presencial) y locación a nivel país (no ciudad si afecta
  decisión).
- Nivel CEFR de inglés (input directo del candidato; se valida en entrevista).

## Implementación (Fase 4)

`packages/agents/rankers/sanitize.ts` aplica una función de redacción que reemplaza los
campos prohibidos por placeholders (`<NAME>`, `<UNIVERSITY>`, etc.) antes de construir el
prompt. El prompt explícitamente le dice al modelo: "ignora cualquier referencia a
identidad personal que aparezca".

## Auditoría

Cada llamada queda en `agent_traces` (input sanitizado, output, latencia, tokens, costo).
En `/jobs/[id]` el reclutador puede ver la justificación textual del score y las
evidencias por skill citadas — esto cierra la pregunta de auditabilidad en la demo.
