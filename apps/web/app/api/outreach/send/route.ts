import { z } from "zod";
import { sendWhatsAppMessage } from "@talentforge/twilio";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 20;

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

const BodySchema = z.object({
  applicationId: z.string().uuid(),
  message: z.string().min(20).max(1024),
  variantTag: z.enum(["A", "B"]).optional(),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const parse = BodySchema.safeParse(body);
  if (!parse.success) {
    return new Response(
      JSON.stringify({ error: "Invalid body", details: parse.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  const { applicationId, message, variantTag } = parse.data;

  // Load application + candidate phone + maybe-existing conversation.
  const { data: app, error } = await supabase
    .from("applications")
    .select(
      `id, job_id, candidate_id,
       candidates (id, phone_e164)`,
    )
    .eq("id", applicationId)
    .maybeSingle();
  if (error || !app || !app.candidates) {
    return new Response("Application not found", { status: 404 });
  }
  const phone = app.candidates.phone_e164;
  if (!phone) {
    return new Response("Candidate has no phone_e164", { status: 422 });
  }

  const admin = createAdminClient();

  // Ensure a conversation row exists.
  let conversationId: string;
  const { data: existingConv } = await admin
    .from("conversations")
    .select("id")
    .eq("tenant_id", DEMO_TENANT_ID)
    .eq("candidate_id", app.candidate_id)
    .maybeSingle();
  if (existingConv) {
    conversationId = existingConv.id;
  } else {
    const { data: convIns, error: convErr } = await admin
      .from("conversations")
      .insert({
        tenant_id: DEMO_TENANT_ID,
        candidate_id: app.candidate_id,
        job_id: app.job_id,
        channel: "whatsapp",
        state: "awaiting_reply",
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (convErr || !convIns) {
      return new Response(`Failed to create conversation: ${convErr?.message}`, {
        status: 500,
      });
    }
    conversationId = convIns.id;
  }

  // Send via Twilio (or simulate).
  const result = await sendWhatsAppMessage({ to: phone, body: message });

  // Persist outreach message.
  const { error: msgErr } = await admin.from("outreach_messages").insert({
    tenant_id: DEMO_TENANT_ID,
    conversation_id: conversationId,
    direction: "outbound",
    channel: "whatsapp",
    content: message,
    status: result.status === "sent" ? "sent" : "simulated",
    twilio_sid: result.sid,
  });
  if (msgErr) {
    return new Response(`Failed to persist message: ${msgErr.message}`, {
      status: 500,
    });
  }

  // Update application stage if it was not contacted yet.
  await admin
    .from("applications")
    .update({ stage: "contacted" })
    .eq("id", applicationId)
    .in("stage", ["new", "interested"]);

  // Light trace.
  await admin.from("agent_traces").insert({
    tenant_id: DEMO_TENANT_ID,
    agent: "outreach-send",
    ref_table: "outreach_messages",
    ref_id: conversationId,
    output: {
      variantTag: variantTag ?? null,
      status: result.status,
      to: result.to,
      sid: result.sid,
    } as unknown as never,
    status: "ok",
  });

  return Response.json({
    status: result.status,
    sid: result.sid,
    conversation_id: conversationId,
    error: result.error,
  });
}
