# Roadmap v2 (post-PoC)

Lo que **no** está en la PoC pero sí va al upsell del v2.

## Pricing principle

La PoC demuestra valor con datos mock. El v2 lo integra con los **datos reales del cliente** (su ATS, su LinkedIn, sus llamadas). Cada item del v2 se vende como add-on porque destraba un caso de uso adicional.

## Integraciones de fuentes de candidatos

| Feature | Esfuerzo | Valor para cliente | Notas |
|---|---|---|---|
| LinkedIn Recruiter API | 4 sem | Cargar candidatos sin escrapeo | Costo de licencia LinkedIn por reclutador. |
| GreenHouse / Lever sync | 2 sem cada uno | El cliente sigue trabajando en su ATS | Webhook bidireccional. |
| Importar CVs en bulk (PDF/Doc) | 1 sem | Onboarding más rápido | Usar Claude para parsear estructura. |

## Análisis de entrevistas reales

| Feature | Esfuerzo | Notas |
|---|---|---|
| Upload de video/audio + Whisper diarization | 3 sem | Tres componentes: storage Supabase, Whisper API, speaker diarization. |
| Integración Zoom / Google Meet / Teams | 2-3 sem cada | OAuth + ingesta de grabaciones cloud. |
| Transcripción en tiempo real (streaming) | 4 sem | Útil para guía de entrevista live (Fase 7 ya tiene la guía estática). |

## Comunicación multicanal

| Feature | Esfuerzo | Notas |
|---|---|---|
| WhatsApp Business Cloud API (Meta directo) | 2 sem | Reemplaza Twilio Sandbox; templates aprobados. |
| Email outbound + threading (Postmark / Resend) | 1 sem | Inbox unificado WhatsApp+Email. |
| LinkedIn InMail (vía Sales Navigator) | 3 sem | Si el cliente paga LinkedIn Sales. |
| Inbox unificado para recruiter | 2 sem | Todos los canales en un thread por candidato. |

## Agendamiento

| Feature | Esfuerzo | Notas |
|---|---|---|
| Google Calendar OAuth + agendar entrevista | 1.5 sem | El candidato elige slot vía link en el primer mensaje. |
| MS Graph (Outlook Calendar) | 1.5 sem | Para clientes Microsoft. |
| Buffer de slots + recordatorios automáticos | 1 sem | Reduce no-shows. |

## Plataforma

| Feature | Esfuerzo | Notas |
|---|---|---|
| Multi-tenancy hardened | 3 sem | RLS robusto, audit log por tenant, billing por tenant. |
| OAuth Google / Microsoft para login del equipo | 1.5 sem | Magic link queda como fallback. |
| Roles + permisos (admin, recruiter, hiring manager) | 2 sem | Hoy todos son "owner" del tenant. |
| Audit log con evidencia (quién vio qué, cuándo) | 1.5 sem | Crítico para clientes en regulado. |
| Webhooks salientes (cliente recibe eventos) | 1 sem | Integración con BI / Slack del cliente. |

## Monetización

| Feature | Esfuerzo | Notas |
|---|---|---|
| Stripe + planes + portal del cliente | 3 sem | Plans: Starter (1 vacante), Pro (5), Team (sin límite). |
| Uso por seat (recruiter activo) | 1 sem | Métrica clave. |
| Free trial 14 días con tarjeta | 1 sem | Reduce fricción top of funnel. |

## Calidad / data flywheel

| Feature | Esfuerzo | Notas |
|---|---|---|
| Re-ranking por feedback del recruiter | 2-3 sem | Si el recruiter sobre-escribe un score, ajustar prompt vía eval-driven. |
| A/B testing del Outreach Composer | 1 sem | Métrica: reply rate por variante. |
| Eval framework abierto al cliente | 2 sem | Golden sets propios del cliente. |
| Calibración de Interview Analyzer (más crítico) | 1 sem | Issue actual: 9 strong_yes / 12. |

## Productividad recruiter

| Feature | Esfuerzo | Notas |
|---|---|---|
| Tests E2E con Playwright | 2 sem | Hoy sólo tenemos CI lint+typecheck+build. |
| Telemetría producto (PostHog / Mixpanel) | 1 sem | Eventos, funnels, retención. |
| Dashboard de uso por cliente | 2 sem | Self-serve usage report. |

## Diferenciadores que justifican premium

- **ATS integration nativa** (Greenhouse, Lever, Workable). El cliente sigue trabajando en su ATS.
- **Inbox unificado** WhatsApp + Email + LinkedIn por candidato.
- **Calibración con feedback**: el sistema mejora con uso. Vendible como "se entrena con tus pares de hires y rejects".
- **Defendibilidad ante auditoría**: trazas + evidencia textual + flag anti-bias. Crítico para legal en LATAM (Ley Federal Anti-Discriminación en MX, Ley de Trabajo Decente en CO).
- **Multi-tenancy + data residency**: tu Supabase, tu region, tus backups.

## Estimación de roadmap

Si ejecutamos secuencial: ~10-12 meses para sacar todos los items grandes. Si ejecutamos en paralelo con 4-5 ingenieros: ~5-6 meses. Recomendación: priorizar primero **ATS integration** + **Whisper real** + **Multi-tenancy** porque son los que más ventas destraban.
