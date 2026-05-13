# Roadmap v2 (post-PoC)

Lo que **no** entra en la PoC pero sí va al upsell del v2. Estimaciones rough.

| Item | Esfuerzo | Notas |
|------|----------|-------|
| Integración real LinkedIn (Recruiter API o scraping) | 4-6 sem | Cumplir ToS; usar partner API si presupuesto. |
| Upload + análisis de video/audio real (Whisper + speaker diarization) | 3-4 sem | Costo Whisper + storage Supabase upgrade. |
| n8n para orquestación de workflows (calendario, recordatorios) | 2-3 sem | Self-hosted o n8n Cloud. |
| Google Calendar / MS Graph para scheduling | 2 sem | OAuth + sync de slots. |
| WhatsApp Business Cloud API directo (Meta) | 2-3 sem | Verificación de negocio + templates aprobados. |
| Multi-tenancy estricta (RLS hardened, audit log por tenant) | 3 sem | Cambia el modelo de datos en varias tablas. |
| Stripe billing + plans + uso por seat/tenant | 3-4 sem | Webhooks + portal de cliente. |
| OAuth Google/Microsoft para login de equipo | 1-2 sem | — |
| Tests E2E exhaustivos (Playwright) | 2 sem | Cobertura golden paths. |
| Telemetría producto (PostHog, Mixpanel) | 1 sem | Eventos clave + funnels. |

## Diferenciadores que justifican el v2

- **ATS-integration**: enviar candidatos rankeados directo a Greenhouse, Lever, Workable.
- **Inbox unificado**: WhatsApp + Email + LinkedIn en un solo hilo.
- **Calibración por feedback**: cuando un recruiter sobre-escribe un score, ajustar el
  ranker (fine-tuning o eval-driven prompt updates).
