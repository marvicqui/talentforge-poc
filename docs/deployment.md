# Deployment

Documenta el setup de infraestructura gratuita. Detalle por proveedor.

## Supabase Cloud (Free tier)

- 500 MB DB, 50K MAU, 1 GB storage, 5 GB bandwidth. Suficiente para la PoC.
- Crear proyecto: `supabase projects create` (requiere `SUPABASE_ACCESS_TOKEN`).
- Link: `supabase link --project-ref <ref>`.
- Migrar: `supabase db push`.
- Tipos TS: `supabase gen types typescript --linked > packages/db/types.ts`.

## Vercel (Hobby)

- 100 GB bandwidth/mes, serverless ilimitado, preview deploys ilimitados.
- Setup en Fase 3:
  1. `vercel login` o `vercel --token <token>`.
  2. `vercel link` desde la raíz (selecciona scope personal o team).
  3. `vercel env add` para cada variable en production/preview/development.
  4. `vercel deploy --prod` para el primer push.
- Después de la primera vez, los deploys son automáticos via la integración nativa
  Vercel ↔ GitHub: push a `main` → producción, PR → preview.

## Anthropic API

- $5 USD iniciales gratis. Recarga manual desde `console.anthropic.com`.
- Modelo: `claude-haiku-4-5-20251001`.
- Costo estimado por demo completa con Haiku: <$0.50 USD.

## Twilio WhatsApp Sandbox

- $15 USD crédito de trial. WhatsApp Sandbox sin costo extra.
- Activar Sandbox:
  1. Console → Messaging → Try it out → Send a WhatsApp message.
  2. Anota la palabra clave (por ejemplo `join brave-tiger`).
  3. Desde tu WhatsApp envía `join <palabra-clave>` a `+1 415 523 8886`.
  4. Agrega tu número a `TWILIO_SANDBOX_VERIFIED_NUMBERS` en formato E.164.
- Webhook inbound: configura en Console → Sandbox Settings → "When a message comes in" =
  `https://<tu-dominio>.vercel.app/api/webhook/twilio`.

## OpenAI / Voyage (embeddings)

- OpenAI: mínimo de recarga $5 USD. Modelo `text-embedding-3-small` (1536 dim).
- Voyage: free tier de 50M tokens. Modelo `voyage-3` o `voyage-3-lite`.
- Elegir con `EMBEDDINGS_PROVIDER=openai|voyage` en env.

## Costo total estimado

PoC durante 30 días con ~20 demos: **$10–15 USD**.
