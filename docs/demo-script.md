# Demo script — TalentForge AI (10-12 min)

Guion para presentaciones comerciales. Objetivo: cerrar una segunda
conversación de descubrimiento de 30 min con el prospecto.

> **URL pública**: https://talentforge-poc.vercel.app
> **Cuenta demo**: clic en "Entrar como Demo (sin registro)" en `/login`.

## Setup antes de la llamada (1 min, antes de compartir pantalla)

- Abre `https://talentforge-poc.vercel.app/login`.
- Click en **Entrar como Demo**. Deberías caer en `/dashboard`.
- Abre 2 pestañas más, listas para usar:
  - `/jobs/<job_id>` de la vacante de AI/ML.
  - `/try-it-now` (no necesita login).
- Asegurate de tener tu WhatsApp visible si vas a hacer el envío real.

---

## 1 · Hook (0:00 - 1:00)

> "Para un Senior Engineer en LATAM, el promedio para contratar es 60-80 días.
> El recruiter no técnico se quema escribiendo outreach a candidatos que no
> califican y pasando entrevistas que no entiende. Te voy a mostrar cómo
> reducimos eso a una fracción del tiempo sin perder defendibilidad ante
> auditoría ni compliance."

**Mostrar**: Dashboard con la métrica grande "Horas ahorradas".

---

## 2 · Dashboard (1:00 - 2:30)

> "En esta cuenta demo tenemos 4 vacantes activas y 30 candidatos en distintas
> etapas. Ya hicimos screening por IA: 7 son 'strong yes', 13 'yes', 4 'maybe',
> 6 'no'. Esto se hace con un agente que tiene contrato anti-bias explícito —
> ahora te muestro."

**Mostrar**: las 4 cards de vacantes + métricas por etapa. Comentar el mejor
match de cada job.

---

## 3 · Vacante → Candidatos rankeados (2:30 - 5:00)

Entra a una vacante (sugerido: **AI/ML Engineer @ Lumina Labs**, mucha
variedad de skills).

> "El recruiter abre la vacante y ve 8 candidatos ordenados por match. Los
> verdes son strong yes, ámbar maybe, rojos descartables. Pero la diferencia
> está en abrir uno."

Click en el top candidato (**Mariana Castillo Vargas**).

> "Acá se ve el score 94 y, abajo, **la cobertura por skill con evidencia
> textual**. Esto cierra la pregunta más común de cliente: '¿cómo defendemos
> este score si nos auditan?'. Cada decisión es trazable a una experiencia
> concreta."

**Mostrar**: tabla de skills con score + evidencia.

> "Y mostrale a tu equipo el contrato anti-bias: el agente **no recibe** el
> nombre, el género, ni la universidad. Los datos de identidad existen en la
> base sólo para que el recruiter sepa a quién llamar."

(Tener `docs/bias-mitigation.md` abierto opcional).

---

## 4 · Outreach (5:00 - 6:30) — opcional con envío real

Volver a la vacante. Tab **Outreach**.

> "El recruiter no decide qué escribir. La IA genera 2 variantes — una
> directa, una consultiva — calibradas a este candidato en español neutro.
> La aprobación humana es obligatoria; nada sale sin un ✓."

Click en **Generar mensajes**. Esperar las 2 variantes (5-8 seg).

> "Char count, personalización explícita, edición libre. Y si el número está
> en sandbox de Twilio se envía real; si no, queda como simulado pero el
> recruiter ya tiene el guion."

Si tu número personal está verificado: **clic en Enviar A**. Mostrar el
WhatsApp recibiéndolo en vivo. *(Esto cierra ventas.)*

---

## 5 · Entrevista → Reporte (6:30 - 9:00)

> "Después de la entrevista, sube grabación o pega transcript — en la PoC
> tenemos 12 entrevistas pre-cargadas. Abro una."

Navegar a `/interviews/<id>` (sugerido la del strong_yes).

> "Split: transcripción a la izquierda, reporte estructurado a la derecha.
> 5 tabs: resumen, inglés evaluado, técnico por skill, soft skills, red
> flags. Y cada score viene con **citas textuales clickeables** que te
> llevan al segmento exacto donde el candidato dijo eso."

**Clic en una cita** del tab Técnico → resalta el segmento en amarillo.

> "Esto es lo que hace que el reporte sea **defendible** ante un comité de
> hire. No es 'la IA dijo que era bueno'; es 'aquí está exactamente lo que
> dijo'."

Click en **Descargar PDF** y mostrar el documento.

---

## 6 · Reporte comparativo (9:00 - 10:30)

Volver a la vacante. Tab **Reporte comparativo**.

> "Cuando tenés 3 finalistas, esto es lo que ahorra una hora de la reunión
> de hiring committee. Side-by-side: recomendación, inglés, scores por
> skill (en la unión de skills evaluadas), soft skills, top fortalezas y
> red flags."

**Mostrar**: la tabla. Resaltar que los 3 fueron 'recommended' por
screening pero la entrevista revela diferencias.

---

## 7 · Try-it-now (10:30 - 12:00) — cierre

Compartir el link directo: `https://talentforge-poc.vercel.app/try-it-now`.

> "Antes de cerrar te muestro algo que vas a poder probar después. Pega
> *tu propia* JD aquí…"

Pegar (o usar el sample). Click **Analizar con IA**.

Mientras streamea:

> "Esto es el primer agente, el Job Analyzer. Genera el ICP: skills must vs
> nice, idiomas, red flags. Es la misma pieza que arranca el pipeline. Te
> dejo el link para que lo pruebes con vacantes reales tuyas."

Cuando termina:

> "¿Querés ver candidatos rankeados para esa JD? Agendemos 30 min la
> próxima semana."

---

## Cierre

- Compartir el link de `/try-it-now`.
- Si tienen sales tools: enviar Calendly post-llamada.
- Tag interno: registrar qué vacante usaron en `/try-it-now` (lo veremos
  en analytics v2).

## Talking points por objeción común

| Objeción | Respuesta corta |
|---|---|
| "¿Cómo evitan sesgo?" | Wrapper sanitiza nombre/género/universidad **antes** del LLM. Evidencia textual y trazas auditables. Ver `docs/bias-mitigation.md`. |
| "¿Y si el LLM alucina?" | Cada score tiene quote del candidato + Zod schema strict + reintento automático. |
| "¿Quién es el dueño de la data?" | Tu cuenta Supabase, tu region, tus backups. Nada se entrena con tu data. |
| "¿Cuánto cuesta?" | Modelo: por vacante activa + por reporte de entrevista. Sin costos por candidato analizado. Cerramos la cifra en la llamada de descubrimiento. |
