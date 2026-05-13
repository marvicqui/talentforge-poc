/**
 * Twilio inbound WhatsApp webhook.
 *
 * Twilio posts form-encoded data: From (e.g. "whatsapp:+5219211234567"),
 * Body, MessageSid, etc. We look up the candidate by phone and append the
 * inbound message to their conversation, updating its state to "open".
 *
 * Signature validation is intentionally skipped for this PoC. In production
 * we'd validate with Twilio's `X-Twilio-Signature` header.
 */
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

function normalize(from: string): string {
  return from.startsWith("whatsapp:") ? from.slice("whatsapp:".length) : from;
}

export async function POST(request: Request) {
  const form = await request.formData();
  const fromRaw = String(form.get("From") ?? "");
  const body = String(form.get("Body") ?? "");
  const sid = String(form.get("MessageSid") ?? "");
  if (!fromRaw || !body) {
    return new Response("Missing From or Body", { status: 400 });
  }
  const from = normalize(fromRaw);

  const admin = createAdminClient();

  const { data: cand } = await admin
    .from("candidates")
    .select("id")
    .eq("tenant_id", DEMO_TENANT_ID)
    .eq("phone_e164", from)
    .maybeSingle();
  if (!cand) {
    // Unknown candidate — log and acknowledge so Twilio doesn't retry.
    console.warn("[twilio webhook] unknown sender", from);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response/>',
      { status: 200, headers: { "Content-Type": "text/xml" } },
    );
  }

  // Find or create conversation.
  let conversationId: string;
  const { data: existing } = await admin
    .from("conversations")
    .select("id")
    .eq("tenant_id", DEMO_TENANT_ID)
    .eq("candidate_id", cand.id)
    .maybeSingle();
  if (existing) {
    conversationId = existing.id;
  } else {
    const { data: ins, error } = await admin
      .from("conversations")
      .insert({
        tenant_id: DEMO_TENANT_ID,
        candidate_id: cand.id,
        channel: "whatsapp",
        state: "open",
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !ins) {
      return new Response("Failed to create conversation", { status: 500 });
    }
    conversationId = ins.id;
  }

  // Insert inbound message.
  await admin.from("outreach_messages").insert({
    tenant_id: DEMO_TENANT_ID,
    conversation_id: conversationId,
    direction: "inbound",
    channel: "whatsapp",
    content: body,
    status: "received",
    twilio_sid: sid || null,
  });

  // Update conversation state.
  await admin
    .from("conversations")
    .update({ state: "open", last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><Response/>',
    { status: 200, headers: { "Content-Type": "text/xml" } },
  );
}
